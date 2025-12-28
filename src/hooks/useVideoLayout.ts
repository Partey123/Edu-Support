import { useMemo } from "react";

interface VideoLayoutConfig {
  totalParticipants: number; // Including local user
  screenWidth: number;
}

interface VideoLayoutResult {
  gridColumns: number;
  gridRows: number;
  videoWidth: string;
  videoHeight: string;
  isMobile: boolean;
  isTablet: boolean;
  containerClassName: string;
}

/**
 * Calculate responsive video grid layout
 * Automatically adjusts based on number of participants and screen size
 */
export function useVideoLayout(config: VideoLayoutConfig): VideoLayoutResult {
  const isMobile = config.screenWidth < 768;
  const isTablet = config.screenWidth < 1024;

  const layout = useMemo(() => {
    let gridColumns = 1;
    let gridRows = 1;

    const participantCount = Math.max(1, config.totalParticipants);

    // Mobile layout (< 768px)
    if (isMobile) {
      if (participantCount === 1) {
        gridColumns = 1;
        gridRows = 1;
      } else if (participantCount <= 2) {
        gridColumns = 1;
        gridRows = 2;
      } else if (participantCount <= 4) {
        gridColumns = 2;
        gridRows = 2;
      } else {
        gridColumns = 2;
        gridRows = Math.ceil(participantCount / 2);
      }
    } // Tablet layout (768px - 1024px)
    else if (isTablet) {
      if (participantCount === 1) {
        gridColumns = 1;
        gridRows = 1;
      } else if (participantCount <= 2) {
        gridColumns = 2;
        gridRows = 1;
      } else if (participantCount <= 4) {
        gridColumns = 2;
        gridRows = 2;
      } else if (participantCount <= 6) {
        gridColumns = 3;
        gridRows = 2;
      } else {
        gridColumns = 3;
        gridRows = Math.ceil(participantCount / 3);
      }
    } // Desktop layout (> 1024px)
    else {
      if (participantCount === 1) {
        gridColumns = 1;
        gridRows = 1;
      } else if (participantCount <= 2) {
        gridColumns = 2;
        gridRows = 1;
      } else if (participantCount <= 4) {
        gridColumns = 2;
        gridRows = 2;
      } else if (participantCount <= 9) {
        gridColumns = 3;
        gridRows = 3;
      } else {
        gridColumns = 4;
        gridRows = Math.ceil(participantCount / 4);
      }
    }

    // Calculate video dimensions
    const videoWidth = `calc(100% / ${gridColumns})`;
    const videoHeight = `calc(100% / ${gridRows})`;

    // Generate Tailwind class for grid
    const gridColsMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
    };

    const containerClassName = `grid ${
      gridColsMap[gridColumns] || "grid-cols-2"
    } gap-2 w-full h-full auto-rows-max`;

    return {
      gridColumns,
      gridRows,
      videoWidth,
      videoHeight,
      isMobile,
      isTablet,
      containerClassName,
    };
  }, [config.totalParticipants, config.screenWidth, isMobile, isTablet]);

  return layout;
}

export default useVideoLayout;
