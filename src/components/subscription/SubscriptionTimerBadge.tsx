import React from 'react';
import { useFormattedTimeRemaining, useSubscriptionStatusDisplay } from '@/hooks/useSubscriptionTimer';
import type { TimeRemaining } from '@/services/subscriptionTimerService';

interface SubscriptionTimerBadgeProps {
  timeRemaining: TimeRemaining;
  status: 'active' | 'expiring_soon' | 'expired' | 'terminated';
  isTerminated: boolean;
  isLoading?: boolean;
}

/**
 * Compact subscription timer badge for Dashboard table
 * Shows "⏰ 45d 3h 22m" in a badge
 */
export const SubscriptionTimerBadge: React.FC<SubscriptionTimerBadgeProps> = ({
  timeRemaining,
  status,
  isTerminated,
  isLoading = false,
}) => {
  const formattedTime = useFormattedTimeRemaining(timeRemaining);
  const statusDisplay = useSubscriptionStatusDisplay(status);

  if (isLoading) {
    return <div className="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm animate-pulse w-32 h-6" />;
  }

  if (isTerminated) {
    return (
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.color}`}>
        {statusDisplay.label}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.color}`}>
        <span>⏰ {formattedTime}</span>
      </div>
      {status === 'expiring_soon' && (
        <span className="text-xs text-yellow-700 font-semibold">⚠️ Expiring Soon</span>
      )}
      {status === 'expired' && (
        <span className="text-xs text-red-700 font-semibold">❌ Expired</span>
      )}
    </div>
  );
};
