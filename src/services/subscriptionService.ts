// services/subscriptionService.ts

import { supabase } from "@/integrations/supabase/client";
import { paystackService } from "./paystackService";
import type {
  BillingCycle,
  InitiateSubscriptionResponse,
  SchoolSubscription,
  SubscriptionPayment,
  SubscriptionPlan,
  SubscriptionPlanName,
} from "@/types/subscription";

class SubscriptionService {
  /**
   * Get all active subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Type cast through unknown to handle complex type differences
    return (data as unknown as SubscriptionPlan[]) || [];
  }

  /**
   * Get a specific plan by ID
   */
  async getPlan(planId: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!data) return null;

    // Type cast through unknown to handle complex type differences
    return (data as unknown as SubscriptionPlan);
  }

  /**
   * Get school's current subscription
   * NOTE: This requires school_subscriptions table to be added to Supabase
   */
  async getSchoolSubscription(
    schoolId: string,
  ): Promise<SchoolSubscription | null> {
    // Placeholder implementation - table not yet in Supabase
    console.warn(
      "getSchoolSubscription: school_subscriptions table not configured",
    );
    return null;
  }

  /**
   * Initialize a new subscription
   * NOTE: Simplified version - actual payment recording is done via Paystack webhooks
   */
  async initiateSubscription(params: {
    schoolId: string;
    planId: string;
    billingCycle: BillingCycle;
    email: string;
    schoolName: string;
  }): Promise<InitiateSubscriptionResponse> {
    const { schoolId, planId, billingCycle, email, schoolName } = params;

    // Get plan details
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error("Plan not found");

    // Calculate amount
    const amount = billingCycle === "monthly"
      ? plan.price_monthly
      : plan.price_yearly;

    if (amount === 0) {
      throw new Error("Cannot initiate payment for free plan");
    }

    // Initialize Paystack transaction
    const paystackResponse = await paystackService.initializePayment(
      email,
      amount,
      {
        school_id: schoolId,
        plan_id: planId,
        billing_cycle: billingCycle,
        school_name: schoolName,
      },
    );

    if (!paystackResponse.status) {
      throw new Error("Failed to initialize payment");
    }

    return {
      success: true,
      payment_id: "",
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
    };
  }

  /**
   * Verify payment and activate subscription
   * NOTE: This requires subscription_payments table to be added to Supabase
   */
  async verifyPayment(reference: string) {
    // Verify with Paystack
    const verification = await paystackService.verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    // Placeholder - actual subscription activation would happen here
    console.log("Payment verified for reference:", reference);
    return {
      success: true,
      message: "Payment verified successfully",
    };
  }

  /**
   * Cancel subscription
   * NOTE: This requires school_subscriptions table to be added to Supabase
   */
  async cancelSubscription(
    subscriptionId: string,
    reason?: string,
    cancelImmediately = false,
  ) {
    console.warn(
      "cancelSubscription: school_subscriptions table not configured",
    );
    // Placeholder - implement when table is available
  }

  /**
   * Update usage counts for a school subscription
   * NOTE: This requires school_subscriptions table to be added to Supabase
   */
  async updateUsageCounts(schoolId: string) {
    console.warn(
      "updateUsageCounts: school_subscriptions table not configured",
    );
    // Placeholder - implement when table is available
  }

  /**
   * Log subscription event
   * NOTE: This requires subscription_events table to be added to Supabase
   */
  private async logEvent(params: {
    school_id: string;
    subscription_id?: string;
    payment_id?: string;
    event_type: string;
    description?: string;
    event_data?: Record<string, any>;
  }) {
    console.log("Event logged:", params.event_type);
    // Placeholder - implement when subscription_events table is available
  }

  /**
   * Helper functions to count resources
   */
  private async countStudents(schoolId: string): Promise<number> {
    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .is("deleted_at", null);
    return count || 0;
  }

  private async countTeachers(schoolId: string): Promise<number> {
    const { count } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .is("deleted_at", null);
    return count || 0;
  }

  private async countClasses(schoolId: string): Promise<number> {
    const { count } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .is("deleted_at", null);
    return count || 0;
  }

  /**
   * ✅ FIXED: Check if school has reached resource limit for their plan
   * This method was called by useSubscription hook but didn't exist
   */
  async checkLimit(
    schoolId: string,
    resource: "student" | "teacher" | "class",
  ): Promise<boolean> {
    try {
      const subscription = await this.getSchoolSubscription(schoolId);

      if (!subscription?.plan) {
        console.warn(
          `No subscription for school ${schoolId}, allowing by default`,
        );
        return true;
      }

      const limitMap: Record<string, string> = {
        student: "max_students",
        teacher: "max_teachers",
        class: "max_classes",
      };

      const limitField = limitMap[resource];
      const maxLimit = (subscription.plan as any)[limitField] as number || 999;

      const { count, error } = await supabase
        .from(`${resource}s`)
        .select("id", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .is("deleted_at", null);

      if (error) {
        console.error(`Error counting ${resource}s:`, error);
        return true;
      }

      const currentCount = count || 0;
      const canAdd = currentCount < maxLimit;

      console.log(
        `Limit check: ${resource} ${currentCount}/${maxLimit} - ${
          canAdd ? "✅ Can add" : "❌ At limit"
        }`,
      );

      return canAdd;
    } catch (error) {
      console.error(`Error checking ${resource} limit:`, error);
      return true;
    }
  }
}

// Export a single instance
export const subscriptionService = new SubscriptionService();
