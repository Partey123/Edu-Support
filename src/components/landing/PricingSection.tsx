// components/landing/PricingSection.tsx

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { subscriptionService } from "@/services/subscriptionService";
import type { SubscriptionPlan } from "@/types/subscription";
import { Skeleton } from "@/components/ui/skeleton";

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = (monthlyPrice: number | null, annualPrice: number) => {
    if (!monthlyPrice) return null;
    const yearlyFromMonthly = monthlyPrice * 12;
    const savings = yearlyFromMonthly - annualPrice;
    const savingsPercent = Math.round((savings / yearlyFromMonthly) * 100);
    return { amount: savings, percent: savingsPercent };
  };

  const getFeaturesList = (features: any): string[] => {
    const featureLabels: Record<string, string> = {
      attendance_tracking: 'Attendance tracking',
      grade_management: 'Grade management',
      video_classes: 'Live video classes',
      exam_proctoring: 'Exam proctoring',
      advanced_analytics: 'Advanced analytics',
      custom_reports: 'Custom reports',
      parent_portal: 'Parent portal access',
      fee_management: 'Fee management',
      sms_notifications: 'SMS notifications',
      api_access: 'API access',
      email_support: 'Email support',
      priority_support: 'Priority support',
      dedicated_support: 'Dedicated support',
      training_sessions: 'Training sessions',
      white_label: 'White label branding',
    };

    return Object.entries(features)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => featureLabels[key] || key)
      .slice(0, 8); // Show top 8 features
  };

  const getLimitText = (plan: SubscriptionPlan): string => {
    if (!plan.max_students && !plan.max_teachers) {
      return 'Unlimited students & teachers';
    } else if (!plan.max_students) {
      return 'Unlimited students';
    } else {
      return `Up to ${plan.max_students.toLocaleString()} students`;
    }
  };

  const isPopularPlan = (planName: string) => {
    return planName === 'pro'; // Mark Pro as most popular
  };

  if (loading) {
    return (
      <section id="pricing" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[600px] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Pricing
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the plan that fits your school. Start managing your institution today.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-full border border-border">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-semibold rounded">
                Save up to 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const savings = plan.price_monthly ? calculateSavings(plan.price_monthly, plan.price_yearly) : null;
            const displayPrice = billingPeriod === 'monthly' 
              ? plan.price_monthly 
              : plan.price_yearly;
            const isCustom = plan.price_monthly === null && billingPeriod === 'monthly';
            const isPopular = isPopularPlan(plan.name);
            const features = getFeaturesList(plan.features);

            return (
              <div
                key={plan.id}
                className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                  isPopular
                    ? "bg-primary text-primary-foreground border-primary shadow-glow scale-105"
                    : "bg-card border-border hover:border-primary/30 hover:shadow-lg"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                {billingPeriod === 'annual' && savings && (
                  <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold ${
                    isPopular ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-success/20 text-success'
                  }`}>
                    Save {savings.percent}%
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-1 ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.display_name}
                  </h3>
                  <p className={`text-sm ${isPopular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline mb-1">
                    {isCustom ? (
                      <span className={`text-3xl font-bold ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className={`text-3xl font-bold ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                          GHS {displayPrice?.toLocaleString()}
                        </span>
                        <span className={`text-sm ml-1 ${isPopular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          /{billingPeriod === 'monthly' ? 'month' : 'year'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {billingPeriod === 'annual' && savings && (
                    <p className={`text-sm ${isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      Save GHS {savings.amount.toLocaleString()} per year
                    </p>
                  )}

                  {billingPeriod === 'annual' && plan.name === 'enterprise' && (
                    <p className={`text-xs mt-1 ${isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      (5-Year Plan)
                    </p>
                  )}

                  {billingPeriod === 'monthly' && plan.price_monthly && (
                    <p className={`text-sm ${isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      Billed monthly
                    </p>
                  )}
                </div>

                <div className={`mb-6 pb-6 border-b ${isPopular ? "border-primary-foreground/20" : "border-border"}`}>
                  <p className={`text-sm font-medium ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                    {getLimitText(plan)}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isPopular ? "bg-primary-foreground/20" : "bg-primary/10"
                      }`}>
                        <Check className={`h-3 w-3 ${isPopular ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <span className={`text-sm ${isPopular ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? "heroGold" : "outline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link 
                    to={`/subscription/checkout?plan=${plan.id}&cycle=${billingPeriod}`}
                    state={{ plan, billingCycle: billingPeriod }}
                  >
                    {plan.name === 'enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include full access to features. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}