import { useEffect, useRef, useState } from "react";
import { useAgoraSession } from "@/hooks/useAgoraSession";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Mic, MicOff, Video, VideoOff, X, Share2, StopCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AgoraService from "@/services/agoraService";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface VideoStreamProps {
  classId: string;
  className: string;
  onClose: () => void;
  teacherId: string;
  sessionId?: string;
}

export function VideoStream({
  classId,
  className,
  onClose,
  teacherId,
  sessionId,
}: VideoStreamProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      user: "System",
      message: "Class session started",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Generate unique channel name and UID
  const channelName = `class-${classId}-${Date.now()}`;
  const teacherUID = parseInt(teacherId) || 1001;

  const { joinChannel, leaveChannel, isJoined, isLoading, remoteUsers } =
    useAgoraSession({
      classId,
      channelName,
      uid: teacherUID,
      role: "publisher", // Teacher is always publisher
    });

  // Join channel on mount
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 2;

    const initializeStream = async () => {
      if (!mounted) return;
      if (retryCount >= MAX_RETRIES) {
        console.error("🛑 Max retries reached. Stopping initialization.");
        setError("Failed to initialize stream after multiple attempts.");
        return;
      }

      try {
        console.log(`🔄 Initializing stream (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await joinChannel(sessionId);
        console.log("✅ Stream initialized successfully");
        setError(null);
      } catch (err) {
        retryCount++;
        const message = err instanceof Error ? err.message : "Stream initialization failed";
        console.error(`❌ Stream initialization error (attempt ${retryCount}):`, err);

        if (retryCount >= MAX_RETRIES) {
          setError(`Failed to start stream: ${message}`);
          console.error("🚨 Giving up on stream initialization");
        }
      }
    };

    initializeStream();

    return () => {
      mounted = false;
      if (isJoined) {
        leaveChannel().catch((err) => {
          console.error("Cleanup error:", err);
        });
      }
    };
  }, [classId, sessionId]);

  // Publish local tracks after joining
  useEffect(() => {
    const publishTracks = async () => {
      if (!isJoined || isPublishing) return;

      try {
        setIsPublishing(true);
        console.log("📹 Publishing local video and audio...");

        const agora = AgoraService;

        // Publish video to the div with id "local-video-element"
        await agora.publishLocalVideo("local-video-element");
        console.log("✅ Local video published");

        // Publish audio
        await agora.publishLocalAudio();
        console.log("✅ Local audio published");

        toast({
          title: "Stream started",
          description: "Your camera and microphone are now active.",
        });
      } catch (err) {
        console.error("❌ Failed to publish tracks:", err);
        const message = err instanceof Error ? err.message : "Failed to start camera/audio";
        setError(message);
        toast({
          title: "Camera Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsPublishing(false);
      }
    };

    publishTracks();
  }, [isJoined]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle audio toggle
  const handleToggleAudio = async () => {
    try {
      const agora = AgoraService;
      if (isAudioEnabled) {
        await agora.muteLocalAudio();
      } else {
        await agora.unmuteLocalAudio();
      }
      setIsAudioEnabled(!isAudioEnabled);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to toggle audio";
      setError(message);
    }
  };

  // Handle video toggle
  const handleToggleVideo = async () => {
    try {
      const agora = AgoraService;
      if (isVideoEnabled) {
        await agora.disableLocalVideo();
      } else {
        await agora.enableLocalVideo();
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to toggle video";
      setError(message);
    }
  };

  // Handle screen share
  const handleToggleScreenShare = async () => {
    try {
      // TODO: Implement screen sharing in AgoraService
      toast({
        title: "Coming soon",
        description: "Screen sharing feature is in development.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to toggle screen share";
      setError(message);
    }
  };

  // Handle send chat message
  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      message: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput("");
  };

  // Handle leave
  const handleLeaveStream = async () => {
    try {
      await leaveChannel();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to leave stream";
      setError(message);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <Card className="w-full max-w-md bg-card shadow-xl border-border">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
                  <X className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Connection Error</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 md:px-6 md:py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">{className}</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {isJoined ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  LIVE - {remoteUsers.length + 1} participant{remoteUsers.length !== 0 ? 's' : ''}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Connecting...
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-6xl mx-auto w-full p-2 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4">
          
          {/* Left: Video Section (60-70%) */}
          <div className="flex-1 min-w-0 flex flex-col gap-3 md:gap-4 lg:min-h-0">
            {/* Primary Video Container */}
            <div className="flex-1 min-h-0 bg-black rounded-xl overflow-hidden shadow-xl relative group">
              <div
                ref={videoContainerRef}
                id="local-video-element"
                className="w-full h-full bg-gradient-to-br from-primary/20 to-black flex items-center justify-center relative"
              >
                {(isLoading || isPublishing) ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary" />
                    <p className="text-foreground text-sm md:text-base font-medium">
                      {isLoading ? "Connecting to session..." : "Initializing camera..."}
                    </p>
                  </div>
                ) : !isVideoEnabled ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <VideoOff className="h-8 w-8 md:h-10 md:w-10 text-primary/60" />
                    </div>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">Camera is off</p>
                  </div>
                ) : null}

                {/* Stream Badge */}
                {isJoined && (
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                    <div className="bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-2 text-xs md:text-sm font-semibold shadow-lg">
                      <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></span>
                      LIVE
                    </div>
                  </div>
                )}

                {/* Participants Count */}
                {isJoined && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                    <div className="bg-card/90 text-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm border border-border">
                      👥 {remoteUsers.length + 1}
                    </div>
                  </div>
                )}

                {/* Remote Users Grid */}
                {remoteUsers.length > 0 && (
                  <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex flex-wrap gap-2 justify-end z-20 max-w-xs">
                    {remoteUsers.map((user) => (
                      <div
                        key={user.uid}
                        className="w-20 h-20 md:w-24 md:h-24 bg-card rounded-lg border border-border shadow-lg overflow-hidden"
                      >
                        <div
                          id={`remote-user-${user.uid}`}
                          className="w-full h-full bg-gradient-to-br from-primary/20 to-background flex items-center justify-center text-muted-foreground"
                        >
                          <span className="text-xs">User {user.uid}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Controls Below Video */}
            <div className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                {/* Microphone Button */}
                <Button
                  onClick={handleToggleAudio}
                  disabled={!isJoined}
                  className={`flex-1 min-w-[90px] md:flex-none gap-2 font-medium text-sm transition-all ${
                    isAudioEnabled
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  }`}
                >
                  {isAudioEnabled ? (
                    <>
                      <Mic className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden md:inline">Mute</span>
                    </>
                  ) : (
                    <>
                      <MicOff className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden md:inline">Unmute</span>
                    </>
                  )}
                </Button>

                {/* Camera Button */}
                <Button
                  onClick={handleToggleVideo}
                  disabled={!isJoined}
                  className={`flex-1 min-w-[90px] md:flex-none gap-2 font-medium text-sm transition-all ${
                    isVideoEnabled
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  }`}
                >
                  {isVideoEnabled ? (
                    <>
                      <Video className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden md:inline">Video</span>
                    </>
                  ) : (
                    <>
                      <VideoOff className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden md:inline">Camera</span>
                    </>
                  )}
                </Button>

                {/* Screen Share Button */}
                <Button
                  onClick={handleToggleScreenShare}
                  disabled={!isJoined}
                  variant="outline"
                  className="flex-1 min-w-[90px] md:flex-none gap-2 font-medium text-sm"
                >
                  <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden md:inline">Share</span>
                </Button>

                {/* Divider */}
                <div className="hidden md:block w-px h-6 bg-border"></div>

                {/* End Call Button */}
                <Button
                  onClick={handleLeaveStream}
                  className="flex-1 md:flex-none gap-2 font-medium text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground md:ml-auto"
                >
                  <StopCircle className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden md:inline">End</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Controls & Chat Panel (30-40%) */}
          <div className="w-full lg:w-80 h-96 lg:h-auto lg:min-h-0 flex flex-col gap-3 md:gap-4 bg-card rounded-xl border border-border overflow-hidden shadow-lg">
            
            {/* Chat Header */}
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Class Chat</h3>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 space-y-3 scroll-smooth">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-primary text-xs">{msg.user}</span>
                    <span className="text-muted-foreground text-xs">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-foreground text-sm mt-1">{msg.message}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendChat();
                    }
                  }}
                  placeholder="Type message..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}