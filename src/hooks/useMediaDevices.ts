import { useCallback, useEffect, useState } from "react";

interface MediaDeviceState {
  hasCamera: boolean;
  hasMicrophone: boolean;
  cameraPermission: PermissionStatus | "prompt" | "denied" | "granted";
  micPermission: PermissionStatus | "prompt" | "denied" | "granted";
  isLoading: boolean;
  error: string | null;
  cameraLabel: string;
  micLabel: string;
}

/**
 * Hook to check device availability and request permissions for camera/mic
 */
export function useMediaDevices() {
  const [state, setState] = useState<MediaDeviceState>({
    hasCamera: false,
    hasMicrophone: false,
    cameraPermission: "prompt",
    micPermission: "prompt",
    isLoading: true,
    error: null,
    cameraLabel: "Default Camera",
    micLabel: "Default Microphone",
  });

  // Check device availability
  useEffect(() => {
    const checkDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const cameras = devices.filter((device) =>
          device.kind === "videoinput"
        );
        const mics = devices.filter((device) => device.kind === "audioinput");

        setState((prev) => ({
          ...prev,
          hasCamera: cameras.length > 0,
          hasMicrophone: mics.length > 0,
          cameraLabel: cameras[0]?.label || "Default Camera",
          micLabel: mics[0]?.label || "Default Microphone",
          isLoading: false,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        console.error("❌ Failed to enumerate devices:", error);
      }
    };

    checkDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", checkDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", checkDevices);
    };
  }, []);

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      // Stop the stream after getting permission
      stream.getTracks().forEach((track) => track.stop());

      setState((prev) => ({
        ...prev,
        cameraPermission: "granted",
        isLoading: false,
      }));

      console.log("✅ Camera permission granted");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);

      const permission = errorMessage.includes("NotAllowedError") ||
          errorMessage.includes("Permission denied")
        ? "denied"
        : "prompt";

      setState((prev) => ({
        ...prev,
        cameraPermission: permission,
        error: errorMessage,
        isLoading: false,
      }));

      console.error("❌ Camera permission failed:", error);
      return false;
    }
  }, []);

  // Request microphone permission
  const requestMicPermission = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Stop the stream after getting permission
      stream.getTracks().forEach((track) => track.stop());

      setState((prev) => ({
        ...prev,
        micPermission: "granted",
        isLoading: false,
      }));

      console.log("✅ Microphone permission granted");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);

      const permission = errorMessage.includes("NotAllowedError") ||
          errorMessage.includes("Permission denied")
        ? "denied"
        : "prompt";

      setState((prev) => ({
        ...prev,
        micPermission: permission,
        error: errorMessage,
        isLoading: false,
      }));

      console.error("❌ Microphone permission failed:", error);
      return false;
    }
  }, []);

  // Request both permissions
  const requestAllPermissions = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Stop the stream after getting permissions
      stream.getTracks().forEach((track) => track.stop());

      setState((prev) => ({
        ...prev,
        cameraPermission: "granted",
        micPermission: "granted",
        isLoading: false,
      }));

      console.log("✅ All permissions granted");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      console.error("❌ Permission request failed:", error);
      return false;
    }
  }, []);

  return {
    ...state,
    requestCameraPermission,
    requestMicPermission,
    requestAllPermissions,
  };
}

export default useMediaDevices;
