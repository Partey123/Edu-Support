// hooks/useSubscription.tsx

import { useState, useEffect } from 'react';
import { subscriptionService } from '@/services/subscriptionService';
import type { SchoolSubscription, SubscriptionPlan } from '@/types/subscription';

interface UseSubscriptionResult {
  subscription: SchoolSubscription | null;
  plan: SubscriptionPlan | null;
  loading: boolean;
  error: Error | null;
  isActive: boolean;
  isPastDue: boolean;
  isCancelled: boolean;
  daysUntilRenewal: number | null;
  canAccessFeature: (feature: string) => boolean;
  hasReachedLimit: (resource: 'student' | 'teacher' | 'class') => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useSubscription(schoolId?: string): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<SchoolSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSubscription = async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await subscriptionService.getSchoolSubscription(schoolId);
      
      if (data) {
        setSubscription(data);
        setPlan(data.plan || null);
      } else {
        setSubscription(null);
        setPlan(null);
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [schoolId]);

  // Helper: Check if subscription is active
  const isActive = subscription?.status === 'active';

  // Helper: Check if subscription is past due
  const isPastDue = subscription?.status === 'past_due';

  // Helper: Check if subscription is cancelled
  const isCancelled = subscription?.status === 'cancelled';

  // Helper: Calculate days until renewal
  const daysUntilRenewal = subscription?.current_period_end
    ? Math.ceil(
        (new Date(subscription.current_period_end).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Helper: Check if can access a feature
  const canAccessFeature = (feature: string): boolean => {
    if (!plan?.features) return false;
    return plan.features[feature as keyof typeof plan.features] === true;
  };

  // Helper: Check if reached a limit
  const hasReachedLimit = async (resource: 'student' | 'teacher' | 'class'): Promise<boolean> => {
    if (!schoolId) return false;
    
    try {
      const canAdd = await subscriptionService.checkLimit(schoolId, resource);
      return !canAdd;
    } catch (error) {
      console.error('Error checking limit:', error);
      return false;
    }
  };

  // Refresh subscription data
  const refresh = async () => {
    await loadSubscription();
  };

  return {
    subscription,
    plan,
    loading,
    error,
    isActive,
    isPastDue,
    isCancelled,
    daysUntilRenewal,
    canAccessFeature,
    hasReachedLimit,
    refresh,
  };
}