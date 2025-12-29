import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  calculateTimeRemaining,
  getSchoolSubscription,
  getSubscriptionStatus,
  type SubscriptionInfo,
  type TimeRemaining,
} from "@/services/subscriptionTimerService";

export interface UseSubscriptionTimerReturn {
  timeRemaining: TimeRemaining;
  subscriptionStatus: "active" | "expiring_soon" | "expired" | "terminated";
  endDate: Date | null;
  startDate: Date | null;
  isLoading: boolean;
  error: Error | null;
  isTerminated: boolean;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for subscription timer with real-time countdown
 * Updates client-side every 1 second, refreshes from server every 5 minutes
 */
export const useSubscriptionTimer = (
  schoolId: string,
): UseSubscriptionTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "active" | "expiring_soon" | "expired" | "terminated"
  >("active");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);

  // Fetch subscription data from server (5-minute cache)
  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription", schoolId],
    queryFn: () => getSchoolSubscription(schoolId),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Update subscription state when data changes
  useEffect(() => {
    if (subscription) {
      // Update end date
      if (subscription.subscription_end_date) {
        setEndDate(new Date(subscription.subscription_end_date));
      } else {
        setEndDate(null);
      }

      // Update start date
      if (subscription.subscription_start_date) {
        setStartDate(new Date(subscription.subscription_start_date));
      } else {
        setStartDate(null);
      }

      // Update termination status
      setIsTerminated(subscription.subscription_status === "terminated");

      // Calculate initial status
      const status = getSubscriptionStatus(
        subscription.subscription_end_date,
        subscription.subscription_status,
      );
      setSubscriptionStatus(status);

      // Calculate initial time remaining
      const remaining = calculateTimeRemaining(
        subscription.subscription_end_date,
      );
      setTimeRemaining(remaining);
    }
  }, [subscription]);

  // Client-side 1-second timer update
  useEffect(() => {
    if (!endDate || isTerminated) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(endDate.toISOString());
      setTimeRemaining(remaining);

      // Update status based on time remaining
      const status = getSubscriptionStatus(endDate.toISOString(), null);
      setSubscriptionStatus(status);

      // If expired, clear interval
      if (remaining.totalSeconds <= 0) {
        setSubscriptionStatus("expired");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, isTerminated]);

  const handleRefetch = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    timeRemaining,
    subscriptionStatus,
    endDate,
    startDate,
    isLoading,
    error: error instanceof Error ? error : null,
    isTerminated,
    refetch: handleRefetch,
  };
};

/**
 * Hook to format time remaining as a readable string
 */
export const useFormattedTimeRemaining = (
  timeRemaining: TimeRemaining,
): string => {
  if (timeRemaining.totalSeconds === 0) {
    return "No time remaining";
  }

  const parts = [];

  if (timeRemaining.days > 0) {
    parts.push(`${timeRemaining.days}d`);
  }
  if (timeRemaining.hours > 0) {
    parts.push(`${timeRemaining.hours}h`);
  }
  if (timeRemaining.minutes > 0) {
    parts.push(`${timeRemaining.minutes}m`);
  }
  if (timeRemaining.seconds > 0 || parts.length === 0) {
    parts.push(`${timeRemaining.seconds}s`);
  }

  return parts.join(" ");
};

/**
 * Hook to get status color and label
 */
export const useSubscriptionStatusDisplay = (status: string) => {
  const statusConfig = {
    active: {
      color: "bg-green-100 text-green-800",
      label: "🟢 Active",
      badgeColor: "bg-green-600",
    },
    expiring_soon: {
      color: "bg-yellow-100 text-yellow-800",
      label: "⚠️ Expiring Soon",
      badgeColor: "bg-yellow-600",
    },
    expired: {
      color: "bg-red-100 text-red-800",
      label: "❌ Expired",
      badgeColor: "bg-red-600",
    },
    terminated: {
      color: "bg-gray-100 text-gray-800",
      label: "⚫ Terminated",
      badgeColor: "bg-gray-600",
    },
  };

  return statusConfig[status as keyof typeof statusConfig] ||
    statusConfig.active;
};
