import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionInfo {
  id: string;
  subscription_end_date: string | null;
  subscription_start_date: string | null;
  subscription_status:
    | "active"
    | "expiring_soon"
    | "expired"
    | "terminated"
    | null;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export interface SubscriptionExtension {
  success: boolean;
  message: string;
  newEndDate?: string;
}

export interface SubscriptionTermination {
  success: boolean;
  message: string;
  terminatedAt?: string;
}

// Get subscription info for a school (mock implementation until migration)
export async function getSchoolSubscription(
  schoolId: string,
): Promise<SubscriptionInfo | null> {
  try {
    // TODO: After migration adds subscription columns to schools table:
    // const { data, error } = await supabase
    //   .from("schools")
    //   .select("id, subscription_end_date, subscription_start_date, subscription_status")
    //   .eq("id", schoolId)
    //   .single();
    //
    // if (error) throw error;
    // return data;

    // Mock return for now
    return {
      id: schoolId,
      subscription_end_date: null,
      subscription_start_date: null,
      subscription_status: null,
    };
  } catch (error) {
    console.error("Error fetching school subscription:", error);
    return null;
  }
}

// Calculate time remaining until subscription end
export function calculateTimeRemaining(
  endDate: string | Date | null,
): TimeRemaining {
  if (!endDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const totalSeconds = Math.floor(diff / 1000);

  return { days, hours, minutes, seconds, totalSeconds };
}

// Format time remaining for display
export function formatTimeRemaining(timeRemaining: TimeRemaining): string {
  const { days, hours, minutes } = timeRemaining;

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "Less than 1m";
  }
}

// Check subscription status
export function getSubscriptionStatus(
  endDate: string | Date | null,
  dbStatus?: string | null,
): "active" | "expiring_soon" | "expired" | "terminated" {
  // If explicitly terminated in database, return that
  if (dbStatus === "terminated") return "terminated";

  if (!endDate) return "active";

  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const daysLeft = (end - now) / (1000 * 60 * 60 * 24);

  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 7) return "expiring_soon";
  return "active";
}

// Extend subscription
export async function extendSubscription(
  schoolId: string,
  daysToAdd: number,
  adminId: string,
): Promise<SubscriptionExtension> {
  try {
    // Calculate new end date
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    // TODO: After migration adds subscription_end_date column to schools table:
    // const { error: updateError } = await supabase
    //   .from("schools")
    //   .update({
    //     subscription_end_date: newEndDate.toISOString(),
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq("id", schoolId);

    return {
      success: true,
      message: `Subscription extended by ${daysToAdd} days`,
      newEndDate: newEndDate.toISOString(),
    };
  } catch (error) {
    console.error("Error extending subscription:", error);
    return {
      success: false,
      message: `Failed to extend subscription: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Terminate subscription
export async function terminateSubscription(
  schoolId: string,
  reason: string,
  adminId: string,
): Promise<SubscriptionTermination> {
  try {
    // TODO: After migration adds subscription-related columns to schools table:
    // const { error: updateError } = await supabase
    //   .from("schools")
    //   .update({
    //     subscription_status: "terminated",
    //     subscription_terminated_at: new Date().toISOString(),
    //     subscription_termination_reason: reason,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq("id", schoolId);

    return {
      success: true,
      message: "Subscription terminated successfully",
      terminatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error terminating subscription:", error);
    return {
      success: false,
      message: `Failed to terminate subscription: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Get subscription history for a school
export async function getSubscriptionHistory(schoolId: string) {
  // TODO: Implement after database schema is updated with school_subscription_history table
  return [];
}
