import React from 'react';
import { useFormattedTimeRemaining, useSubscriptionStatusDisplay } from '@/hooks/useSubscriptionTimer';
import type { TimeRemaining } from '@/services/subscriptionTimerService';

interface SubscriptionTimerDisplayProps {
  timeRemaining: TimeRemaining;
  status: 'active' | 'expiring_soon' | 'expired' | 'terminated';
  endDate: Date | null;
  isTerminated: boolean;
  isLoading?: boolean;
}

/**
 * Large subscription timer display for School Details page
 * Shows days, hours, minutes, seconds with progress bar
 */
export const SubscriptionTimerDisplay: React.FC<SubscriptionTimerDisplayProps> = ({
  timeRemaining,
  status,
  endDate,
  isTerminated,
  isLoading = false,
}) => {
  const formattedTime = useFormattedTimeRemaining(timeRemaining);
  const statusDisplay = useSubscriptionStatusDisplay(status);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-blue-200 rounded w-1/4"></div>
          <div className="h-8 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isTerminated) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <div className="text-gray-600 font-semibold mb-2">Subscription Status</div>
          <div className={`inline-block px-4 py-2 rounded-full font-semibold ${statusDisplay.color}`}>
            {statusDisplay.label}
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentage for progress bar (0-100)
  const maxDays = 365;
  const currentDays = timeRemaining.days + timeRemaining.hours / 24;
  const percentage = Math.min((currentDays / maxDays) * 100, 100);

  // Determine progress bar color based on status
  const progressBarColor =
    status === 'active'
      ? 'bg-green-600'
      : status === 'expiring_soon'
        ? 'bg-yellow-600'
        : 'bg-red-600';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.color}`}>
            {statusDisplay.label}
          </div>
        </div>

        {/* Timer Display */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{timeRemaining.days}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Days</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{timeRemaining.hours}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Hours</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{timeRemaining.minutes}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Minutes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{timeRemaining.seconds}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Seconds</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Time Remaining</span>
            <span className="text-gray-900 font-semibold">{formattedTime}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${progressBarColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* End Date Info */}
        {endDate && (
          <div className="bg-white rounded p-3 border border-gray-200 text-sm">
            <div className="text-gray-600">End Date</div>
            <div className="text-gray-900 font-semibold">{endDate.toLocaleDateString()}</div>
          </div>
        )}

        {/* Warning Messages */}
        {status === 'expiring_soon' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <div className="text-yellow-800">
              <strong>⚠️ Expiring Soon:</strong> Your subscription will expire in {formattedTime}. Consider extending it.
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
            <div className="text-red-800">
              <strong>❌ Subscription Expired:</strong> Your subscription has ended. Please renew to continue accessing services.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
