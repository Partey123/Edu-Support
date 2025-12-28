// pages/SubscriptionCheckout.tsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Building2, Mail, CheckCircle2, ArrowLeft, Shield, AlertCircle } from "lucide-react";
import { subscriptionService } from "@/services/subscriptionService";
import { paystackService } from "@/services/paystackService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PaymentProcessing } from "@/components/subscription/PaymentProcessing";
import { OrderSummary } from "@/components/subscription/OrderSummary";
import { EmbeddedSignupForm } from "@/components/subscription/EmbeddedSignupForm";
import type { SubscriptionPlan, BillingCycle } from "@/types/subscription";

export default function SubscriptionCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'initializing' | 'processing' | 'verifying' | 'completing' | 'success' | 'error'>('initializing');
  const [processingError, setProcessingError] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupError, setSignupError] = useState<string>('');
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    loadCheckoutData();
  }, [user]);

  // Handle post-signup auth state synchronization
  useEffect(() => {
    // When user becomes available after signup, show ready message
    if (justSignedUp && user && schoolId && plan) {
      console.log('User authenticated after signup, ready to proceed to payment');
      setJustSignedUp(false);
      
      toast({
        title: "Ready!",
        description: "Your account is set up. You can now proceed to payment.",
      });
    }
  }, [user, justSignedUp, schoolId, plan, toast]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get plan from URL or location state
      const planId = searchParams.get('plan');
      const cycle = searchParams.get('cycle') as BillingCycle;
      
      if (!planId) {
        toast({
          title: "Error",
          description: "No plan selected",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Load plan details
      const planData = location.state?.plan || await subscriptionService.getPlan(planId);
      if (!planData) {
        throw new Error('Plan not found');
      }

      setPlan(planData);
      if (cycle) {
        setBillingCycle(cycle);
      }

      // Check if user is authenticated
      if (!user) {
        // Store the current checkout URL to return after login
        const returnUrl = `${window.location.pathname}${window.location.search}`;
        sessionStorage.setItem('checkoutReturnUrl', returnUrl);
        setError('Please log in or sign up to continue with your subscription.');
        return;
      }

      // Get user's school from school_memberships
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
        .eq('is_active', true)
        .maybeSingle();

      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        throw membershipError;
      }

      if (!membership) {
        // User doesn't have a school yet
        console.log('No school membership found for user');
        setError('no_school');
        return;
      }

      // Verify user is school admin
      if (membership.role !== 'school_admin') {
        setError('only_admin');
        return;
      }

      setSchoolId(membership.school_id);
      setSchoolName(membership.schools.name);
      console.log('School loaded:', { schoolId: membership.school_id, schoolName: membership.schools.name });

    } catch (error: any) {
      console.error('Error loading checkout data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load checkout information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      console.log('=== SUBSCRIPTION PAYMENT INITIATION ===');
      
      // Check auth state first - directly from Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Authentication check:', {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id,
      });

      if (!sessionData.session || !sessionData.session.user) {
        toast({
          title: "Authentication Required",
          description: "Please wait while we verify your account...",
          variant: "destructive",
        });
        
        // Wait and retry once
        await new Promise(resolve => setTimeout(resolve, 2000));
        const { data: retrySession } = await supabase.auth.getSession();
        
        if (!retrySession.session) {
          throw new Error('No active session. Please refresh and try again.');
        }
      }

      // Validate plan is selected
      if (!plan) {
        toast({
          title: "Error",
          description: "Plan information is missing. Please select a plan.",
          variant: "destructive",
        });
        return;
      }

      // Validate school information - fetch fresh if not in state
      let finalSchoolId = schoolId;
      let finalSchoolName = schoolName;

      if (!finalSchoolId) {
        console.log('School ID not in state, fetching from database...');
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
          .eq('user_id', sessionData.session!.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (membershipError || !membership) {
          throw new Error('School information not found. Please make sure you are a school administrator.');
        }

        if (membership.role !== 'school_admin') {
          throw new Error('Only school administrators can subscribe to plans.');
        }

        finalSchoolId = membership.school_id;
        finalSchoolName = membership.schools.name;
        console.log('School fetched:', { finalSchoolId, finalSchoolName });
      }

      console.log('Validation passed:', { 
        planId: plan.id,
        planName: plan.display_name,
        schoolId: finalSchoolId,
        schoolName: finalSchoolName,
        billingCycle,
        email: sessionData.session!.user.email,
      });

      setProcessing(true);
      setProcessingError('');
      setProcessingStatus('initializing');

      // Calculate amount in cedis (GHS)
      const amount = billingCycle === 'monthly' 
        ? plan.price_monthly 
        : plan.price_yearly;

      if (amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      console.log('Payment details:', {
        amount,
        currency: 'GHS',
        amountInPesewas: Math.round(amount * 100),
      });

      console.log('Calling initialize-payment Edge Function...');

      // Initialize payment via Supabase Edge Function
      // The Edge Function handles:
      // - Secure secret key storage
      // - Amount conversion from cedis to pesewas
      // - Paystack API communication
      // - Authorization URL generation
      const { data: paystackData, error: paystackError } = await supabase.functions.invoke(
        'initialize-payment', 
        {
          body: {
            email: sessionData.session!.user.email,
            amount, // In cedis - Edge Function converts to pesewas
            metadata: {
              school_id: finalSchoolId,
              plan_id: plan.id,
              billing_cycle: billingCycle,
              school_name: finalSchoolName,
            },
          },
        }
      );

      if (paystackError) {
        console.error('Edge Function error:', paystackError);
        throw new Error(paystackError.message || 'Failed to initialize payment');
      }

      if (!paystackData || !paystackData.status) {
        console.error('Invalid response from Edge Function:', paystackData);
        throw new Error(paystackData?.message || 'Failed to initialize payment');
      }

      console.log('Payment initialized successfully:', {
        reference: paystackData.data.reference,
        accessCode: paystackData.data.access_code,
      });

      // Redirect to Paystack payment page
      if (paystackData.data?.authorization_url) {
        console.log('Redirecting to Paystack:', paystackData.data.authorization_url);
        // Store reference for verification later
        sessionStorage.setItem('paystack_reference', paystackData.data.reference);
        window.location.href = paystackData.data.authorization_url;
      } else {
        throw new Error('No authorization URL received from payment provider');
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setProcessingStatus('error');
      setProcessingError(error.message || 'Failed to initiate payment');
      setProcessing(false);
      
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleSignupSuccess = async (newSchoolId: string, newSchoolName: string) => {
    try {
      setSchoolId(newSchoolId);
      setSchoolName(newSchoolName);
      setShowSignupForm(false);
      setError('');
      setJustSignedUp(true); // Mark that user just signed up
      
      toast({
        title: "Account Created!",
        description: "Your school account has been created. Please wait while we prepare your payment...",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process signup';
      setSignupError(message);
    }
  };

  const handleSignupError = (errorMessage: string) => {
    setSignupError(errorMessage);
    toast({
      title: "Signup Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleLoginRedirect = () => {
    // Save current URL and plan info to return after login
    const returnUrl = `${window.location.pathname}${window.location.search}`;
    sessionStorage.setItem('checkoutReturnUrl', returnUrl);
    sessionStorage.setItem('checkoutPlan', JSON.stringify({ plan, billingCycle }));
    navigate('/login', {
      state: {
        returnTo: returnUrl,
        fromCheckout: true
      }
    });
  };

  const calculateAmount = () => {
    if (!plan) return 0;
    return billingCycle === 'monthly' ? (plan.price_monthly || 0) : plan.price_yearly;
  };

  const calculateSavings = () => {
    if (!plan || !plan.price_monthly) return null;
    const monthlyTotal = plan.price_monthly * 12;
    const savings = monthlyTotal - plan.price_yearly;
    const percent = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percent };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show signup form embedded in checkout
  if (error && !user && plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Signup Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Your School Account</CardTitle>
                  <CardDescription>
                    Sign up now to subscribe to {plan.display_name} and start managing your school
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {signupError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{signupError}</AlertDescription>
                    </Alert>
                  )}
                  <EmbeddedSignupForm
                    onSignupSuccess={handleSignupSuccess}
                    onError={handleSignupError}
                    isLoading={processing}
                  />

                  <div className="mt-6 pt-6 border-t text-center">
                    <p className="text-sm text-muted-foreground mb-3">Already have an account?</p>
                    <Button
                      variant="outline"
                      onClick={handleLoginRedirect}
                      className="w-full"
                    >
                      Log In Instead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <OrderSummary
                  plan={plan}
                  billingCycle={billingCycle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only school admins can subscribe
  if (error === 'only_admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Admin Access Required</CardTitle>
                <CardDescription>
                  Only school administrators can manage subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert variant="destructive">
                  <AlertDescription>
                    Please contact your school administrator to upgrade your subscription plan.
                  </AlertDescription>
                </Alert>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  Go to Homepage
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // No school found - shouldn't happen after signup
  if (error === 'no_school') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>School Setup Incomplete</CardTitle>
                <CardDescription>
                  Your school account setup is not complete
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertDescription>
                    It looks like your school wasn't properly set up during registration. Please try signing up again or contact support.
                  </AlertDescription>
                </Alert>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setShowSignupForm(true)}
                >
                  Try Setup Again
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  Go to Homepage
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  // After signup - show checkout with embedded form still visible if needed
  if (schoolId && !user && !showSignupForm) {
    // User just signed up, but auth hasn't synced yet
    // Show the checkout form with their school info
    const amount = calculateAmount();
    const savings = calculateSavings();

    return (
      <>
        <PaymentProcessing
          isOpen={processing}
          status={processingStatus}
          errorMessage={processingError}
        />
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Secure Checkout</span>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Payment Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Plan Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Subscription Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">School</span>
                      <span className="text-sm font-medium text-foreground">{schoolName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <span className="text-sm font-medium text-foreground">{plan?.display_name}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Billing</span>
                      <span className="text-sm font-medium text-foreground capitalize">{billingCycle}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Button */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Complete Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-foreground mb-2">
                        <CheckCircle2 className="inline h-4 w-4 mr-2 text-success" />
                        Account created successfully!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Now complete your payment to activate your school
                      </p>
                    </div>

                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => handleSubscribe()}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Your payment is secured by Paystack. We support card payments, mobile money (MTN, Vodafone), and bank transfers.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <OrderSummary
                    plan={plan!}
                    billingCycle={billingCycle}
                    schoolName={schoolName}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const amount = calculateAmount();
  const savings = calculateSavings();

  return (
    <>
      <PaymentProcessing
        isOpen={processing}
        status={processingStatus}
        errorMessage={processingError}
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Subscription</h1>
            <p className="text-muted-foreground">You're almost there! Review and confirm your subscription.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-3 space-y-6">
              {/* Plan Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Selected Plan
                  </CardTitle>
                  <CardDescription>Review your plan details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{plan.display_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      GHS {amount.toLocaleString()}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Plan Features */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3">What's included:</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {Object.entries(plan.features).filter(([_, value]) => value).slice(0, 8).map(([key, _]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Limits */}
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {plan.max_students ? plan.max_students.toLocaleString() : '∞'}
                      </p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {plan.max_teachers ? plan.max_teachers.toLocaleString() : '∞'}
                      </p>
                      <p className="text-xs text-muted-foreground">Teachers</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {plan.max_video_participants}
                      </p>
                      <p className="text-xs text-muted-foreground">Video Participants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Cycle Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing Cycle
                  </CardTitle>
                  <CardDescription>Choose how you'd like to be billed</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={billingCycle} onValueChange={(value) => setBillingCycle(value as BillingCycle)}>
                    {/* Monthly Option */}
                    {plan.price_monthly && (
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">Monthly</p>
                              <p className="text-sm text-muted-foreground">Billed every month</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">GHS {plan.price_monthly.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">per month</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    )}

                    {/* Annual Option */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors relative">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">Annual</p>
                              {savings && (
                                <Badge className="bg-success/20 text-success hover:bg-success/30">
                                  Save {savings.percent}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">Billed once per year</p>
                            {savings && (
                              <p className="text-xs text-success mt-1">
                                Save GHS {savings.amount.toLocaleString()} per year
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">GHS {plan.price_yearly.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">per year</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium text-foreground">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">School</span>
                    <span className="text-sm font-medium text-foreground">{schoolName}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium text-foreground">{plan.display_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Billing</span>
                        <span className="font-medium text-foreground capitalize">{billingCycle}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Total</span>
                        <span className="text-2xl font-bold text-foreground">
                          GHS {amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Billed {billingCycle === 'monthly' ? 'monthly' : 'annually'}
                      </p>
                    </div>

                    <Separator />

                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleSubscribe}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Your payment is secured by Paystack. We support card payments, mobile money (MTN, Vodafone), and bank transfers.
                      </AlertDescription>
                    </Alert>

                    <div className="text-center text-xs text-muted-foreground space-y-1">
                      <p>By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
                      <p>You can cancel your subscription at any time.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}