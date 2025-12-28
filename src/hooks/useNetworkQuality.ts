import { useCallback, useEffect, useState } from "react";

export interface NetworkStats {
  rtt: number; // Round trip time in ms
  videoSendBitrate: number; // Kbps
  videoRecvBitrate: number; // Kbps
  audioSendBitrate: number; // Kbps
  audioRecvBitrate: number; // Kbps
  videoSendFrameRate: number;
  videoRecvFrameRate: number;
  videoResolutionSend: string;
  videoResolutionRecv: string;
  connectionState: "connected" | "disconnected" | "reconnecting" | "unknown";
  audioLevel: number; // 0-100
  videoDegradation: "none" | "minor" | "severe";
}

export type NetworkQuality =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "veryPoor"
  | "unknown";

interface NetworkQualityState {
  quality: NetworkQuality;
  stats: Partial<NetworkStats>;
  isMonitoring: boolean;
  error: string | null;
}

/**
 * Hook to monitor network quality during video streaming
 * Requires passing stats from Agora SDK
 */
export function useNetworkQuality() {
  const [state, setState] = useState<NetworkQualityState>({
    quality: "unknown",
    stats: {},
    isMonitoring: false,
    error: null,
  });

  /**
   * Calculate quality based on network metrics
   */
  const calculateQuality = useCallback(
    (stats: Partial<NetworkStats>): NetworkQuality => {
      if (!stats || Object.keys(stats).length === 0) {
        return "unknown";
      }

      const {
        videoSendBitrate = 0,
        videoRecvBitrate = 0,
        videoRecvFrameRate = 0,
        rtt = 0,
        videoDegradation = "none",
      } = stats;

      // Degradation is the most important indicator
      if (videoDegradation === "severe") {
        return "veryPoor";
      }
      if (videoDegradation === "minor") {
        return "poor";
      }

      // High latency is bad
      if (rtt > 800) return "veryPoor";
      if (rtt > 400) return "poor";
      if (rtt > 200) return "fair";

      // Low frame rate is bad
      if (videoRecvFrameRate < 10) return "veryPoor";
      if (videoRecvFrameRate < 15) return "poor";
      if (videoRecvFrameRate < 20) return "fair";

      // Combined bitrate check (assuming both send and recv)
      const totalBitrate = videoSendBitrate + videoRecvBitrate;

      if (totalBitrate < 500) return "veryPoor";
      if (totalBitrate < 1000) return "poor";
      if (totalBitrate < 2000) return "fair";
      if (totalBitrate < 5000) return "good";
      return "excellent";
    },
    [],
  );

  /**
   * Update network stats from Agora SDK
   */
  const updateStats = useCallback((newStats: Partial<NetworkStats>) => {
    setState((prev) => {
      const quality = calculateQuality(newStats);
      return {
        ...prev,
        stats: newStats,
        quality,
        isMonitoring: true,
      };
    });
  }, [calculateQuality]);

  /**
   * Start monitoring network stats (typically called from Agora hook)
   */
  const startMonitoring = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isMonitoring: true,
      error: null,
    }));
  }, []);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isMonitoring: false,
      stats: {},
      quality: "unknown",
    }));
  }, []);

  /**
   * Get quality as percentage (for UI indicators)
   */
  const getQualityPercentage = useCallback((): number => {
    const qualityMap: Record<NetworkQuality, number> = {
      excellent: 100,
      good: 80,
      fair: 60,
      poor: 40,
      veryPoor: 20,
      unknown: 50,
    };
    return qualityMap[state.quality];
  }, [state.quality]);

  /**
   * Get quality as color (for UI visualization)
   */
  const getQualityColor = useCallback((): string => {
    const colorMap: Record<NetworkQuality, string> = {
      excellent: "#10b981", // green
      good: "#3b82f6", // blue
      fair: "#f59e0b", // amber
      poor: "#ef4444", // red
      veryPoor: "#7f1d1d", // dark red
      unknown: "#6b7280", // gray
    };
    return colorMap[state.quality];
  }, [state.quality]);

  /**
   * Get quality label
   */
  const getQualityLabel = useCallback((): string => {
    const labelMap: Record<NetworkQuality, string> = {
      excellent: "Excellent Connection",
      good: "Good Connection",
      fair: "Fair Connection",
      poor: "Poor Connection",
      veryPoor: "Very Poor Connection",
      unknown: "Checking Network...",
    };
    return labelMap[state.quality];
  }, [state.quality]);

  return {
    quality: state.quality,
    stats: state.stats,
    isMonitoring: state.isMonitoring,
    error: state.error,
    updateStats,
    startMonitoring,
    stopMonitoring,
    getQualityPercentage,
    getQualityColor,
    getQualityLabel,
  };
}

export default useNetworkQuality;
