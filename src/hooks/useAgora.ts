import { useCallback, useEffect, useRef, useState } from "react";
import AgoraService from "@/services/agoraService";
import type { AgoraServiceConfig } from "@/services/agoraService";
import type { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

interface UseAgoraState {
  initialized: boolean;
  error: string | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  connectionState: string;
}

export function useAgora(config?: Partial<AgoraServiceConfig>) {
  const [state, setState] = useState<UseAgoraState>({
    initialized: false,
    error: null,
    remoteUsers: [],
    connectionState: "DISCONNECTED",
  });

  const sdkRef = useRef<typeof AgoraService | null>(null);

  useEffect(() => {
    const initializeAgora = async () => {
      try {
        sdkRef.current = AgoraService;
        await sdkRef.current.initialize(config);

        setState((prev) => ({
          ...prev,
          initialized: true,
        }));

        console.log("✅ Agora hook initialized");
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        console.error("❌ Agora initialization failed:", error);
      }
    };

    initializeAgora();

    return () => {
      // Cleanup is handled by the service singleton
    };
  }, [config]);

  // Listen for user-joined event
  useEffect(() => {
    if (!sdkRef.current) return;

    const handleUserJoined = () => {
      const remoteUsers = sdkRef.current?.getRemoteUsers() || [];
      setState((prev) => ({
        ...prev,
        remoteUsers,
      }));
    };

    sdkRef.current.on("user-joined", handleUserJoined);
    sdkRef.current.on("user-left", handleUserJoined);
    sdkRef.current.on("user-published", handleUserJoined);
    sdkRef.current.on("user-unpublished", handleUserJoined);

    return () => {
      if (sdkRef.current) {
        sdkRef.current.off("user-joined", handleUserJoined);
        sdkRef.current.off("user-left", handleUserJoined);
        sdkRef.current.off("user-published", handleUserJoined);
        sdkRef.current.off("user-unpublished", handleUserJoined);
      }
    };
  }, []);

  // Listen for connection state changes
  useEffect(() => {
    if (!sdkRef.current) return;

    const handleConnectionStateChange = ({ curState }: any) => {
      setState((prev) => ({
        ...prev,
        connectionState: curState,
      }));
    };

    sdkRef.current.on("connection-state-change", handleConnectionStateChange);

    return () => {
      if (sdkRef.current) {
        sdkRef.current.off(
          "connection-state-change",
          handleConnectionStateChange,
        );
      }
    };
  }, []);

  const publish = useCallback(async (elementId: string) => {
    try {
      if (!sdkRef.current) throw new Error("Agora not initialized");
      await sdkRef.current.publishLocalVideo(elementId);
      await sdkRef.current.publishLocalAudio();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const unpublish = useCallback(async () => {
    try {
      if (!sdkRef.current) throw new Error("Agora not initialized");
      await sdkRef.current.unpublishLocalVideo();
      await sdkRef.current.unpublishLocalAudio();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const muteAudio = useCallback(async () => {
    try {
      if (!sdkRef.current) throw new Error("Agora not initialized");
      await sdkRef.current.muteLocalAudio();
    } catch (error) {
      console.error("Failed to mute audio:", error);
      throw error;
    }
  }, []);

  const unmuteAudio = useCallback(async () => {
    try {
      if (!sdkRef.current) throw new Error("Agora not initialized");
      await sdkRef.current.unmuteLocalAudio();
    } catch (error) {
      console.error("Failed to unmute audio:", error);
      throw error;
    }
  }, []);

  const disableVideo = useCallback(async () => {
    try {
      if (!sdkRef.current) throw new Error("Agora not initialized");
      await sdkRef.current.disableLocalVideo();
    } catch (error) {
      console.error("Failed to disable video:", error);
      throw error;
    }
  }, []);

  const enableVideo = useCallback(async () => {
    try {
      if (!sdkRef.current) throw new Error("Agora not initialized");
      await sdkRef.current.enableLocalVideo();
    } catch (error) {
      console.error("Failed to enable video:", error);
      throw error;
    }
  }, []);

  return {
    ...state,
    sdk: sdkRef.current,
    publish,
    unpublish,
    muteAudio,
    unmuteAudio,
    disableVideo,
    enableVideo,
  };
}

export default useAgora;
