import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { VideoStreamContextType, MediaDeviceInfo } from '../types/virtual-class';
import { useMediaDevices } from '../hooks/useMediaDevices';

/**
 * Context for managing video streams and media devices
 * Handles device selection and stream management
 */
const VideoStreamContext = createContext<VideoStreamContextType | null>(null);

interface VideoStreamProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for video stream context
 */
export const VideoStreamProvider: React.FC<VideoStreamProviderProps> = ({ children }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<number, MediaStream>>(new Map());
  const [selectedDevice, setSelectedDevice] = useState<{
    audioInput?: string;
    videoInput?: string;
    audioOutput?: string;
  }>({});

  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);

  const mediaDevices = useMediaDevices();

  /**
   * Enumerate available media devices
   */
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const formattedDevices: MediaDeviceInfo[] = devices.map((device) => ({
          deviceId: device.deviceId,
          kind: device.kind as 'audioinput' | 'videoinput' | 'audiooutput',
          label: device.label || `${device.kind} (${device.deviceId.slice(0, 5)})`,
          groupId: device.groupId,
        }));

        setAvailableDevices(formattedDevices);

        // Set default devices
        const defaultAudioInput = formattedDevices.find((d) => d.kind === 'audioinput');
        const defaultVideoInput = formattedDevices.find((d) => d.kind === 'videoinput');
        const defaultAudioOutput = formattedDevices.find((d) => d.kind === 'audiooutput');

        setSelectedDevice({
          audioInput: defaultAudioInput?.deviceId,
          videoInput: defaultVideoInput?.deviceId,
          audioOutput: defaultAudioOutput?.deviceId,
        });

        console.log('✅ Available devices enumerated:', formattedDevices);
      } catch (error) {
        console.error('❌ Failed to enumerate devices:', error);
      }
    };

    enumerateDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, []);

  /**
   * Set audio input device
   */
  const setAudioInput = useCallback((deviceId: string) => {
    setSelectedDevice((prev) => ({
      ...prev,
      audioInput: deviceId,
    }));

    console.log(`🎙️ Audio input device changed: ${deviceId}`);
  }, []);

  /**
   * Set video input device
   */
  const setVideoInput = useCallback((deviceId: string) => {
    setSelectedDevice((prev) => ({
      ...prev,
      videoInput: deviceId,
    }));

    console.log(`📹 Video input device changed: ${deviceId}`);
  }, []);

  /**
   * Set audio output device
   */
  const setAudioOutput = useCallback((deviceId: string) => {
    setSelectedDevice((prev) => ({
      ...prev,
      audioOutput: deviceId,
    }));

    console.log(`🔊 Audio output device changed: ${deviceId}`);
  }, []);

  /**
   * Get available devices by kind
   */
  const getAvailableDevices = useCallback((): MediaDeviceInfo[] => {
    return availableDevices;
  }, [availableDevices]);

  /**
   * Add remote stream
   */
  const addRemoteStream = useCallback((uid: number, stream: MediaStream) => {
    setRemoteStreams((prev) => {
      const updated = new Map(prev);
      updated.set(uid, stream);
      return updated;
    });

    console.log(`✅ Remote stream added: ${uid}`);
  }, []);

  /**
   * Remove remote stream
   */
  const removeRemoteStream = useCallback((uid: number) => {
    setRemoteStreams((prev) => {
      const updated = new Map(prev);
      updated.delete(uid);
      return updated;
    });

    console.log(`✅ Remote stream removed: ${uid}`);
  }, []);

  /**
   * Set local stream
   */
  const updateLocalStream = useCallback((stream: MediaStream | null) => {
    setLocalStream(stream);

    if (stream) {
      console.log('✅ Local stream set');
    } else {
      console.log('✅ Local stream cleared');
    }
  }, []);

  /**
   * Get audio input devices
   */
  const getAudioInputDevices = useCallback((): MediaDeviceInfo[] => {
    return availableDevices.filter((d) => d.kind === 'audioinput');
  }, [availableDevices]);

  /**
   * Get video input devices
   */
  const getVideoInputDevices = useCallback((): MediaDeviceInfo[] => {
    return availableDevices.filter((d) => d.kind === 'videoinput');
  }, [availableDevices]);

  /**
   * Get audio output devices
   */
  const getAudioOutputDevices = useCallback((): MediaDeviceInfo[] => {
    return availableDevices.filter((d) => d.kind === 'audiooutput');
  }, [availableDevices]);

  const value: VideoStreamContextType = {
    localStream,
    remoteStreams,
    selectedDevice,
    setAudioInput,
    setVideoInput,
    setAudioOutput,
    getAvailableDevices,
  };

  return (
    <VideoStreamContext.Provider value={value}>
      {children}
    </VideoStreamContext.Provider>
  );
};

/**
 * Hook to use video stream context
 */
export const useVideoStream = (): VideoStreamContextType => {
  const context = useContext(VideoStreamContext);

  if (!context) {
    throw new Error('useVideoStream must be used within VideoStreamProvider');
  }

  return context;
};

/**
 * Hook to manage device selection
 */
export const useMediaDeviceSelection = () => {
  const { getAvailableDevices, selectedDevice, setAudioInput, setVideoInput, setAudioOutput } =
    useVideoStream();

  const getAudioInputDevices = useCallback((): MediaDeviceInfo[] => {
    return getAvailableDevices().filter((d) => d.kind === 'audioinput');
  }, [getAvailableDevices]);

  const getVideoInputDevices = useCallback((): MediaDeviceInfo[] => {
    return getAvailableDevices().filter((d) => d.kind === 'videoinput');
  }, [getAvailableDevices]);

  const getAudioOutputDevices = useCallback((): MediaDeviceInfo[] => {
    return getAvailableDevices().filter((d) => d.kind === 'audiooutput');
  }, [getAvailableDevices]);

  return {
    selectedDevice,
    setAudioInput,
    setVideoInput,
    setAudioOutput,
    getAudioInputDevices,
    getVideoInputDevices,
    getAudioOutputDevices,
  };
};

export default VideoStreamContext;
