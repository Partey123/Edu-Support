import { useCallback, useState } from "react";
import { AgoraService } from "../services/agoraService";

interface ScreenShareState {
  isSharing: boolean;
  isStarting: boolean;
  error: string | null;
  screenResolution: string;
}

/**
 * Hook to manage screen sharing in Agora video sessions
 * Only available for teachers/presenters
 */
export function useScreenShare(
  agoraService: any | null,
) {
  const [state, setState] = useState<ScreenShareState>({
    isSharing: false,
    isStarting: false,
    error: null,
    screenResolution: "1920x1080",
  });

  /**
   * Start screen sharing
   */
  const startScreenShare = useCallback(async (elementId: string) => {
    if (!agoraService) {
      setState((prev) => ({
        ...prev,
        error: "Agora service not initialized",
      }));
      console.error("❌ Agora service not initialized");
      return false;
    }

    try {
      setState((prev) => ({ ...prev, isStarting: true, error: null }));

      // Call service method
      const success = await agoraService.enableScreenShare(elementId);

      if (success) {
        setState((prev) => ({
          ...prev,
          isSharing: true,
          isStarting: false,
        }));
        console.log("✅ Screen sharing started");
        return true;
      } else {
        throw new Error("Failed to enable screen share");
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isStarting: false,
      }));
      console.error("❌ Screen share failed:", error);
      return false;
    }
  }, [agoraService]);

  /**
   * Stop screen sharing
   */
  const stopScreenShare = useCallback(async () => {
    if (!agoraService) {
      setState((prev) => ({
        ...prev,
        error: "Agora service not initialized",
      }));
      return false;
    }

    try {
      setState((prev) => ({ ...prev, isStarting: true, error: null }));

      const success = await agoraService.disableScreenShare();

      if (success) {
        setState((prev) => ({
          ...prev,
          isSharing: false,
          isStarting: false,
        }));
        console.log("✅ Screen sharing stopped");
        return true;
      } else {
        throw new Error("Failed to disable screen share");
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isStarting: false,
      }));
      console.error("❌ Stop screen share failed:", error);
      return false;
    }
  }, [agoraService]);

  /**
   * Toggle screen sharing
   */
  const toggleScreenShare = useCallback(
    async (elementId: string) => {
      if (state.isSharing) {
        return stopScreenShare();
      } else {
        return startScreenShare(elementId);
      }
    },
    [state.isSharing, startScreenShare, stopScreenShare],
  );

  return {
    isSharing: state.isSharing,
    isStarting: state.isStarting,
    error: state.error,
    screenResolution: state.screenResolution,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
  };
}

export default useScreenShare;
