// pages/SubscriptionVerify.tsx

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { subscriptionService } from "@/services/subscriptionService";
import { useAuth } from "@/hooks/useAuth";
import { confetti } from "@/lib/confetti";

type VerificationStatus = 'verifying' | 'success' | 'failed' | 'already_verified';

export default function SubscriptionVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('failed');
        setMessage('Payment reference not found');
        return;
      }

      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify the payment
      const result = await subscriptionService.verifyPayment(reference);

      setSubscription(result);
      setStatus('success');
      setMessage('Your subscription has been activated successfully!');

      // Trigger confetti animation
      confetti();

    } catch (error: any) {
      console.error('Payment verification error:', error);
      
      // Check if already verified
      if (error.message?.includes('already verified') || error.message?.includes('already processed')) {
        setStatus('already_verified');
        setMessage('This payment has already been processed.');
      } else {
        setStatus('failed');
        setMessage(error.message || 'Payment verification failed. Please contact support.');
      }
    }
  };

  const handleContinue = () => {
    // Redirect based on user role
    if (user) {
      // For now, redirect to school admin dashboard
      // You can enhance this to check user's role and redirect accordingly
      navigate('/school-admin/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleRetry = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl">Verifying Payment</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment...
              </CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 relative">
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle2 className="h-16 w-16 text-success opacity-75" />
                </div>
                <CheckCircle2 className="h-16 w-16 text-success relative" />
              </div>
              <CardTitle className="text-2xl text-success">Payment Successful!</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </>
          )}

          {status === 'already_verified' && (
            <>
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-2xl">Already Verified</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto mb-4">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">Payment Failed</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && subscription && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground">
                  {subscription.plan?.display_name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="font-medium text-foreground capitalize">
                  {subscription.billing_cycle || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Billing Date</span>
                <span className="font-medium text-foreground">
                  {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          )}

          {(status === 'success' || status === 'already_verified') && (
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleContinue}
            >
              Continue to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {status === 'failed' && (
            <div className="space-y-2">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleRetry}
              >
                Try Again
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = 'mailto:support@edumanage.com'}
              >
                Contact Support
              </Button>
            </div>
          )}

          {status === 'verifying' && (
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-progress-bar"></div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                This may take a few seconds...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}