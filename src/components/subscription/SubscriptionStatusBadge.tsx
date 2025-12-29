import React from 'react';
import { useSubscriptionStatusDisplay } from '@/hooks/useSubscriptionTimer';

interface SubscriptionStatusBadgeProps {
  status: 'active' | 'expiring_soon' | 'expired' | 'terminated';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Status badge for subscription display
 * Shows colored badge with icon and label
 */
export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const statusDisplay = useSubscriptionStatusDisplay(status);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className={`inline-block rounded-full font-semibold ${statusDisplay.color} ${sizeClasses[size]}`}>
      {statusDisplay.label}
    </div>
  );
};
