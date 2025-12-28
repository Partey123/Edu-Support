import { useCallback, useState } from "react";
import VideoSessionService from "../services/videoSessionService";

interface RecordingState {
  isRecording: boolean;
  isStarting: boolean;
  error: string | null;
  recordingDuration: number; // in seconds
  recordingId: string | null;
}

export interface RecordingConfig {
  resolution?: string;
  bitrate?: number; // Kbps
  frameRate?: number;
  audioOnly?: boolean;
  fileFormat?: "mp4" | "webm";
}

/**
 * Hook to manage session recording for replay and archival
 * Only available for teachers/instructors
 */
export function useRecording(videoSessionService: VideoSessionService | null) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isStarting: false,
    error: null,
    recordingDuration: 0,
    recordingId: null,
  });

  const [durationInterval, setDurationInterval] = useState<
    ReturnType<typeof setInterval> | null
  >(
    null,
  );

  /**
   * Start recording the session
   */
  const startRecording = useCallback(
    async (sessionId: string, config?: RecordingConfig) => {
      if (!videoSessionService) {
        setState((prev) => ({
          ...prev,
          error: "Video session service not initialized",
        }));
        console.error("❌ Video session service not initialized");
        return false;
      }

      try {
        setState((prev) => ({ ...prev, isStarting: true, error: null }));

        // Start recording via service
        const success = await videoSessionService.recordSession(
          sessionId,
          config || {},
        );

        if (success) {
          setState((prev) => ({
            ...prev,
            isRecording: true,
            isStarting: false,
            recordingDuration: 0,
            recordingId: sessionId,
          }));

          // Start duration timer
          const interval = setInterval(() => {
            setState((prev) => ({
              ...prev,
              recordingDuration: prev.recordingDuration + 1,
            }));
          }, 1000);

          setDurationInterval(interval);
          console.log("✅ Recording started");
          return true;
        } else {
          throw new Error("Failed to start recording");
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
        console.error("❌ Recording failed:", error);
        return false;
      }
    },
    [videoSessionService],
  );

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async () => {
    if (!videoSessionService || !state.recordingId) {
      setState((prev) => ({
        ...prev,
        error: "Recording not in progress",
      }));
      return false;
    }

    try {
      setState((prev) => ({ ...prev, isStarting: true, error: null }));

      // Might need to call service to finalize recording
      // For now, just clear the interval
      if (durationInterval !== null) {
        clearInterval(durationInterval);
        setDurationInterval(null);
      }

      setState((prev) => ({
        ...prev,
        isRecording: false,
        isStarting: false,
      }));

      console.log("✅ Recording stopped");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isStarting: false,
      }));
      console.error("❌ Stop recording failed:", error);
      return false;
    }
  }, [videoSessionService, state.recordingId, durationInterval]);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(async () => {
    if (!state.isRecording) {
      console.warn("⚠️ Recording is not active");
      return false;
    }

    // Pause implementation would go here
    // For now, just clear the duration timer
    if (durationInterval !== null) {
      clearInterval(durationInterval);
      setDurationInterval(null);
    }

    console.log("✅ Recording paused");
    return true;
  }, [state.isRecording, durationInterval]);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(async () => {
    if (state.isRecording) {
      // Resume implementation would go here
      // Restart the duration timer
      const interval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          recordingDuration: prev.recordingDuration + 1,
        }));
      }, 1000);

      setDurationInterval(interval);
      console.log("✅ Recording resumed");
      return true;
    }

    return false;
  }, [state.isRecording]);

  /**
   * Get formatted recording duration
   */
  const getFormattedDuration = useCallback((): string => {
    const hours = Math.floor(state.recordingDuration / 3600);
    const minutes = Math.floor((state.recordingDuration % 3600) / 60);
    const seconds = state.recordingDuration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, [state.recordingDuration]);

  // Cleanup interval on unmount
  const cleanup = useCallback(() => {
    if (durationInterval !== null) {
      clearInterval(durationInterval);
      setDurationInterval(null);
    }
  }, [durationInterval]);

  return {
    isRecording: state.isRecording,
    isStarting: state.isStarting,
    error: state.error,
    recordingDuration: state.recordingDuration,
    recordingId: state.recordingId,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getFormattedDuration,
    cleanup,
  };
}

export default useRecording;
