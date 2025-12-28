// types/subscription.ts

export type SubscriptionPlanName = 'starter' | 'pro' | 'pro_plus' | 'enterprise';

export type SubscriptionStatus = 
  | 'active' 
  | 'past_due' 
  | 'cancelled' 
  | 'suspended' 
  | 'expired';

export type BillingCycle = 'monthly' | 'yearly';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'success' 
  | 'failed' 
  | 'abandoned' 
  | 'refunded';

export type SubscriptionEventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'payment_initiated'
  | 'payment_successful'
  | 'payment_failed'
  | 'subscription_renewed'
  | 'subscription_cancelled'
  | 'subscription_suspended'
  | 'subscription_reactivated'
  | 'limit_reached'
  | 'limit_exceeded';

export interface SubscriptionFeatures {
  attendance_tracking: boolean;
  grade_management: boolean;
  video_classes: boolean;
  exam_proctoring: boolean;
  advanced_analytics: boolean;
  api_access: boolean;
  custom_reports: boolean;
  parent_portal: boolean;
  fee_management: boolean;
  sms_notifications: boolean;
  email_support: boolean;
  priority_support: boolean;
  dedicated_support?: boolean;
  training_sessions?: boolean;
  white_label?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: SubscriptionPlanName;
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_students: number | null;
  max_teachers: number | null;
  max_classes: number | null;
  max_video_participants: number;
  features: SubscriptionFeatures;
  paystack_plan_code: string | null;
  is_active: boolean;
  is_visible: boolean;
  sort_order: number;
  trial_days: number;
  billing_description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface SchoolSubscription {
  id: string;
  school_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  paystack_subscription_code: string | null;
  paystack_customer_code: string | null;
  paystack_email_token: string | null;
  current_student_count: number;
  current_teacher_count: number;
  current_class_count: number;
  auto_renew: boolean;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancellation_feedback: string | null;
  cancel_at_period_end: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  // Relations
  plan?: SubscriptionPlan;
}

export interface SubscriptionPayment {
  id: string;
  school_id: string;
  subscription_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  paystack_reference: string;
  paystack_transaction_id: string | null;
  paystack_access_code: string | null;
  status: PaymentStatus;
  payment_method: string | null;
  paid_at: string | null;
  expires_at: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  receipt_url: string | null;
  period_start: string | null;
  period_end: string | null;
  metadata: Record<string, any>;
  failure_reason: string | null;
  failure_code: string | null;
  created_at: string;
  updated_at: string;
  recorded_by: string | null;
  // Relations
  plan?: SubscriptionPlan;
  subscription?: SchoolSubscription;
}

export interface SubscriptionEvent {
  id: string;
  school_id: string;
  subscription_id: string | null;
  payment_id: string | null;
  event_type: SubscriptionEventType;
  event_data: Record<string, any>;
  description: string | null;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// API Request/Response types
export interface InitiateSubscriptionRequest {
  school_id: string;
  plan_id: string;
  billing_cycle: BillingCycle;
  email: string;
}

export interface InitiateSubscriptionResponse {
  success: boolean;
  payment_id: string;
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  subscription?: SchoolSubscription;
  payment?: SubscriptionPayment;
  message: string;
}

export interface CancelSubscriptionRequest {
  subscription_id: string;
  reason?: string;
  feedback?: string;
  cancel_immediately?: boolean;
}

export interface UpdatePlanRequest {
  subscription_id: string;
  new_plan_id: string;
  billing_cycle?: BillingCycle;
}

// UI Helper types
export interface PlanComparison {
  plan: SubscriptionPlan;
  currentPlan?: SubscriptionPlan;
  isUpgrade: boolean;
  isDowngrade: boolean;
  priceDifference: number;
  featuresDifference: {
    added: string[];
    removed: string[];
  };
}

export interface SubscriptionSummary {
  subscription: SchoolSubscription;
  plan: SubscriptionPlan;
  daysUntilRenewal: number;
  isTrialExpiringSoon: boolean;
  trialDaysRemaining: number | null;
  usagePercentage: {
    students: number | null;
    teachers: number | null;
    classes: number | null;
  };
  canUpgrade: boolean;
  canDowngrade: boolean;
}

// Paystack webhook types
export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    customer: {
      id: number;
      customer_code: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
  };
}