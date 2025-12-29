// pages/SchoolActivation.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Key, CreditCard, CheckCircle2, Building2, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { subscriptionService } from "@/services/subscriptionService";
import type { SubscriptionPlan } from "@/types/subscription";

export default function SchoolActivation() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"code" | "subscribe">("code");
  const [activationCode, setActivationCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState<{ id: string; name: string } | null>(null);
  const [checkingSchool, setCheckingSchool] = useState(true);

  useEffect(() => {
    checkSchoolStatus();
    loadPlans();
  }, [user]);

  const checkSchoolStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setCheckingSchool(true);

      // Check if user has a school and if it's already activated
      const { data: membership, error: membershipError } = await supabase
        .from('school_memberships')
        .select(`
          school_id,
          role,
          schools (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('role', 'school_admin')
        .eq('is_active', true)
        .maybeSingle();

      if (membershipError) throw membershipError;

      if (!membership) {
        // No school found - redirect to signup
        toast({
          title: "Setup Required",
          description: "Please complete your school registration first.",
          variant: "destructive",
        });
        navigate('/signup');
        return;
      }

      setSchoolInfo({
        id: membership.school_id,
        name: membership.schools.name,
      });

      // Check if school already has an active subscription
      const subscription = await subscriptionService.getSchoolSubscription(membership.school_id);
      
      if (subscription && subscription.status === 'active') {
        // Already activated - redirect to dashboard
        toast({
          title: "Already Activated",
          description: "Your school is already activated!",
        });
        navigate('/school-admin/dashboard');
        return;
      }

    } catch (error: any) {
      console.error('Error checking school status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check school status",
        variant: "destructive",
      });
    } finally {
      setCheckingSchool(false);
    }
  };

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleActivationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationCode.trim() || !schoolInfo) {
      toast({
        title: "Invalid Code",
        description: "Please enter an activation code",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      // Validate activation code
      const { data: codeData, error: codeError } = await supabase
        .from('school_activation_codes')
        .select('*')
        .eq('code', activationCode.trim().toUpperCase())
        .eq('is_used', false)
        .maybeSingle();

      if (codeError || !codeData) {
        throw new Error('Invalid or expired activation code');
      }

      // Check if code is expired
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        throw new Error('This activation code has expired');
      }

      // Get the plan
      const plan = await subscriptionService.getPlan(codeData.plan_id);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Calculate subscription period
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1); // 1 year activation

      // Create subscription
      const { data: subscription, error: subError } = await supabase
        .from('school_subscriptions')
        .insert({
          school_id: schoolInfo.id,
          plan_id: codeData.plan_id,
          status: 'active',
          billing_cycle: 'yearly',
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          auto_renew: false,
        })
        .select()
        .single();

      if (subError) throw subError;

      // IMPORTANT: Set school as active (same as manual admin activation)
      const { error: schoolUpdateError } = await supabase
        .from('schools')
        .update({ is_active: true })
        .eq('id', schoolInfo.id);

      if (schoolUpdateError) throw schoolUpdateError;

      // Mark code as used
      await supabase
        .from('school_activation_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          used_by_school_id: schoolInfo.id,
        })
        .eq('id', codeData.id);

      // Log event
      await supabase.from('subscription_events').insert({
        school_id: schoolInfo.id,
        subscription_id: subscription.id,
        event_type: 'subscription_created',
        description: 'School activated with activation code',
        event_data: { activation_code: activationCode },
      });

      toast({
        title: "Success!",
        description: `Your school has been activated with ${plan.display_name} plan!`,
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/school-admin/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Activation error:', error);
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate school. Please check your code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubscribeToPlan = (planId: string, billingCycle: 'monthly' | 'annual') => {
    const plan = plans.find(p => p.id === planId);
    navigate(`/subscription/checkout?plan=${planId}&cycle=${billingCycle}`, {
      state: { plan, billingCycle },
    });
  };

  if (checkingSchool) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking school status...</p>
        </div>
      </div>
    );
  }

  if (!schoolInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{schoolInfo.name}</h2>
                <p className="text-xs text-muted-foreground">Activation Required</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Almost There!
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to EduSupport! 🎉
            </h1>
            <p className="text-lg text-muted-foreground">
              Your school has been created. Now let's activate it!
            </p>
          </div>

          {/* Activation Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Activate Your School</CardTitle>
              <CardDescription>
                Choose how you want to activate your school account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "code" | "subscribe")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="code" className="gap-2">
                    <Key className="h-4 w-4" />
                    Activation Code
                  </TabsTrigger>
                  <TabsTrigger value="subscribe" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Subscribe to Plan
                  </TabsTrigger>
                </TabsList>

                {/* Activation Code Tab */}
                <TabsContent value="code" className="space-y-6">
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      If you have an activation code from our sales team or a promotional offer, enter it below to activate your school.
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleActivationCodeSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="activation-code">Activation Code</Label>
                      <Input
                        id="activation-code"
                        type="text"
                        placeholder="e.g., SCHOOL-XXXX-XXXX"
                        value={activationCode}
                        onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                        className="font-mono text-lg"
                        disabled={isValidating}
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the activation code provided to you
                      </p>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isValidating || !activationCode.trim()}
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Activate School
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Don't have a code?
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => setActiveTab("subscribe")}
                  >
                    View Subscription Plans
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </TabsContent>

                {/* Subscribe Tab */}
                <TabsContent value="subscribe" className="space-y-6">
                  <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription>
                      Choose a plan that fits your school's needs. All plans include a 14-day free trial!
                    </AlertDescription>
                  </Alert>

                  {loadingPlans ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading plans...</p>
                    </div>
                  ) : plans.length === 0 ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No plans available at the moment. Please contact support.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {plans.map((plan) => (
                        <Card key={plan.id} className="relative hover:shadow-lg transition-shadow">
                          {plan.name === 'pro' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-primary text-primary-foreground">
                                Most Popular
                              </Badge>
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-3xl font-bold text-foreground">
                                  GHS {plan.price_yearly.toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground">/year</span>
                              </div>
                              {plan.price_monthly && (
                                <p className="text-xs text-muted-foreground">
                                  or GHS {plan.price_monthly.toLocaleString()}/month
                                </p>
                              )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>
                                  {plan.max_students ? `${plan.max_students.toLocaleString()} students` : 'Unlimited students'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>
                                  {plan.max_teachers ? `${plan.max_teachers} teachers` : 'Unlimited teachers'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>14-day free trial</span>
                              </div>
                            </div>

                            <Button
                              className="w-full"
                              variant={plan.name === 'pro' ? 'default' : 'outline'}
                              onClick={() => handleSubscribeToPlan(plan.id, 'annual')}
                            >
                              Choose {plan.display_name}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Need help choosing? Contact our sales team
                    </p>
                    <Button variant="link" asChild>
                      <a href="mailto:sales@edusupport.gh">sales@edusupport.gh</a>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need assistance? Contact our support team at{" "}
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href="mailto:support@edusupport.gh">support@edusupport.gh</a>
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}