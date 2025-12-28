import { useCallback, useEffect, useRef, useState } from "react";
import TokenService from "@/services/tokenService";
import VideoSessionService from "@/services/videoSessionService";
import AgoraService from "@/services/agoraService";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

interface UseAgoraSessionState {
  sessionId: string | null;
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  activeParticipants: number;
  connectionQuality: "good" | "poor" | "offline";
}

interface UseAgoraSessionOptions {
  classId: string;
  channelName: string;
  uid: number;
  role: "publisher" | "subscriber";
}

export function useAgoraSession(options: UseAgoraSessionOptions) {
  const [state, setState] = useState<UseAgoraSessionState>({
    sessionId: null,
    isJoined: false,
    isLoading: false,
    error: null,
    remoteUsers: [],
    activeParticipants: 0,
    connectionQuality: "good",
  });

  const sessionRef = useRef<any>(null);
  const tokenRef = useRef<{ token: string; expiresAt: Date } | null>(null);
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request token and join channel
  const joinChannel = useCallback(async (sessionId?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const agora = AgoraService;

      // 1. Initialize Agora service first
      console.log("🔄 Initializing Agora service...");
      await agora.initialize();
      console.log("✅ Agora service initialized");

      // 2. Get Agora token
      const tokenResponse = await TokenService.generateToken({
        channelName: options.channelName,
        uid: options.uid,
        role: options.role,
      });

      tokenRef.current = {
        token: tokenResponse.token,
        expiresAt: tokenResponse.expiresAt,
      };

      // 3. Join Agora channel
      await agora.joinChannel(
        options.channelName,
        tokenResponse.token,
        options.uid,
      );

      // Create or get video session
      let session = sessionId
        ? await VideoSessionService.getSessionById(sessionId)
        : await VideoSessionService.getActiveSessionForClass(options.classId);

      if (!session && options.role === "publisher") {
        // Create new session if teacher
        session = await VideoSessionService.createVideoSession({
          classId: options.classId,
          teacherId: options.uid.toString(),
          agoraChannelName: options.channelName,
        });
      }

      sessionRef.current = session;

      // Add participant if student
      if (options.role === "subscriber" && session) {
        await VideoSessionService.addParticipant({
          sessionId: session.id,
          studentId: options.uid.toString(),
        });
      }

      // Setup token refresh interval
      setupTokenRefresh();

      // Setup event listeners
      setupEventListeners(agora);

      setState((prev) => ({
        ...prev,
        sessionId: session?.id || null,
        isJoined: true,
        isLoading: false,
      }));

      console.log("✅ Joined session:", session?.id);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      console.error("❌ Failed to join session:", error);
      throw error;
    }
  }, [options]);

  // Leave channel and end session
  const leaveChannel = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Cleanup token refresh
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }

      // Leave Agora channel
      const agora = AgoraService;
      await agora.leaveChannel();

      // Update database
      if (sessionRef.current) {
        if (options.role === "subscriber") {
          await VideoSessionService.removeParticipant(
            sessionRef.current.id,
            options.uid.toString(),
          );
        } else if (options.role === "publisher") {
          await VideoSessionService.endVideoSession(sessionRef.current.id);
        }
      }

      setState({
        sessionId: null,
        isJoined: false,
        isLoading: false,
        error: null,
        remoteUsers: [],
        activeParticipants: 0,
        connectionQuality: "good",
      });

      console.log("✅ Left session");
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      console.error("❌ Failed to leave session:", error);
    }
  }, [options]);

  // Setup token refresh before expiry
  const setupTokenRefresh = () => {
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
    }

    tokenRefreshIntervalRef.current = setInterval(async () => {
      if (TokenService.isTokenExpiringSoon(options.channelName, options.uid)) {
        try {
          const newToken = await TokenService.refreshToken(
            options.channelName,
            options.uid,
            options.role,
          );

          const agora = AgoraService;
          if (agora) {
            // Renew token in Agora SDK
            await (agora as any).renewToken(newToken);
            console.log("♻️ Token refreshed");
          }
        } catch (error) {
          console.error("❌ Failed to refresh token:", error);
        }
      }
    }, 30000); // Check every 30 seconds
  };

  // Setup event listeners
  const setupEventListeners = (agora: typeof AgoraService) => {
    const handleUserJoined = () => {
      const remoteUsers = agora.getRemoteUsers();
      setState((prev) => ({
        ...prev,
        remoteUsers,
        activeParticipants: remoteUsers.length + 1, // +1 for local user
      }));
    };

    const handleConnectionStateChange = ({ curState }: any) => {
      const quality = curState === "CONNECTED"
        ? "good"
        : curState === "DISCONNECTED"
        ? "offline"
        : "poor";

      setState((prev) => ({
        ...prev,
        connectionQuality: quality,
      }));
    };

    agora.on("user-joined", handleUserJoined);
    agora.on("user-left", handleUserJoined);
    agora.on("user-published", handleUserJoined);
    agora.on("user-unpublished", handleUserJoined);
    agora.on("connection-state-change", handleConnectionStateChange);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    joinChannel,
    leaveChannel,
  };
}

export default useAgoraSession;
