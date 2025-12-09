import { Video, VideoOff, Mic, MicOff, Phone, MonitorUp, MessageSquare, Users, Settings, Hand, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";

const participants = [
  { id: 1, name: "John Kofi", role: "Host", avatar: "JK", isSpeaking: true },
  { id: 2, name: "Sarah Mensah", role: "Student", avatar: "SM", isSpeaking: false },
  { id: 3, name: "Kwame Asante", role: "Student", avatar: "KA", isSpeaking: false },
  { id: 4, name: "Ama Darko", role: "Student", avatar: "AD", isSpeaking: false },
  { id: 5, name: "Peter Osei", role: "Student", avatar: "PO", isSpeaking: false },
  { id: 6, name: "Grace Amponsah", role: "Student", avatar: "GA", isSpeaking: false },
];

const VirtualClass = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Virtual Classroom</h1>
            <p className="text-sm text-muted-foreground">Mathematics - Grade 10A • Live Session</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              Live
            </span>
            <span className="text-sm text-muted-foreground">01:24:35</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          {/* Video Grid */}
          <div className="flex-1 glass-card rounded-xl p-4 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-full auto-rows-fr">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={cn(
                    "relative rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden min-h-[120px] sm:min-h-[150px]",
                    index === 0 && "sm:col-span-2 lg:col-span-2 sm:row-span-2",
                    participant.isSpeaking && "ring-2 ring-primary"
                  )}
                >
                  {/* Simulated video background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
                  
                  {/* Avatar placeholder */}
                  <div className={cn(
                    "relative z-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold",
                    index === 0 ? "w-20 h-20 sm:w-24 sm:h-24 text-2xl" : "w-12 h-12 sm:w-16 sm:h-16 text-lg"
                  )}>
                    {participant.avatar}
                  </div>
                  
                  {/* Name overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-foreground bg-background/70 backdrop-blur-sm px-2 py-1 rounded-lg truncate">
                      {participant.name}
                      {participant.role === "Host" && (
                        <span className="ml-1 text-primary">(Host)</span>
                      )}
                    </span>
                    {participant.isSpeaking && (
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Mic className="w-3 h-3 text-primary" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel - Chat/Participants */}
          {(showChat || showParticipants) && (
            <div className="w-full lg:w-80 glass-card rounded-xl p-4 flex flex-col max-h-[300px] lg:max-h-none">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={showChat ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setShowChat(true); setShowParticipants(false); }}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant={showParticipants ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setShowParticipants(true); setShowChat(false); }}
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-2" />
                  People ({participants.length})
                </Button>
              </div>

              {showChat && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs shrink-0">SM</div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">Sarah Mensah</p>
                        <p className="text-sm text-muted-foreground">Can you explain the quadratic formula again?</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs shrink-0">JK</div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">John Kofi <span className="text-primary">(Host)</span></p>
                        <p className="text-sm text-muted-foreground">Sure! The quadratic formula is x = (-b ± √(b²-4ac)) / 2a</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 h-10 px-4 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button size="sm" className="px-4">Send</Button>
                  </div>
                </div>
              )}

              {showParticipants && (
                <div className="flex-1 overflow-y-auto space-y-2">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm">
                          {participant.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{participant.name}</p>
                          <p className="text-xs text-muted-foreground">{participant.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="glass-card rounded-xl p-3 sm:p-4 mt-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hidden sm:flex"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              <MonitorUp className="w-5 h-5" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hidden sm:flex"
            >
              <Hand className="w-5 h-5" />
            </Button>
            
            <Button
              variant={showChat ? "default" : "secondary"}
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
              onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            
            <Button
              variant={showParticipants ? "default" : "secondary"}
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
              onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
            >
              <Users className="w-5 h-5" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hidden sm:flex"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <div className="h-8 w-px bg-border mx-1 sm:mx-2 hidden sm:block" />
            
            <Button
              variant="destructive"
              className="h-10 sm:h-12 px-4 sm:px-6 rounded-full"
            >
              <Phone className="w-5 h-5 rotate-[135deg] mr-0 sm:mr-2" />
              <span className="hidden sm:inline">End Class</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VirtualClass;
