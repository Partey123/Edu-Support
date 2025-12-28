import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type ProcessingStatus = 'initializing' | 'processing' | 'verifying' | 'completing' | 'success' | 'error';

interface PaymentProcessingProps {
  isOpen: boolean;
  status: ProcessingStatus;
  message?: string;
  errorMessage?: string;
  onClose?: () => void;
}

const statusMessages: Record<ProcessingStatus, string> = {
  initializing: 'Initializing payment...',
  processing: 'Processing your payment...',
  verifying: 'Verifying payment...',
  completing: 'Completing your subscription...',
  success: 'Payment successful!',
  error: 'Payment failed',
};

const statusDescriptions: Record<ProcessingStatus, string> = {
  initializing: 'Setting up your payment with Paystack',
  processing: 'Please enter your payment details on Paystack',
  verifying: 'We are verifying your payment details',
  completing: 'Activating your subscription and dashboard access',
  success: 'Your school has been activated successfully!',
  error: 'There was an issue processing your payment',
};

export function PaymentProcessing({
  isOpen,
  status,
  message,
  errorMessage,
  onClose,
}: PaymentProcessingProps) {
  const isLoading = ['initializing', 'processing', 'verifying', 'completing'].includes(status);
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onInteractOutside={isLoading ? () => {} : undefined}>
        <div className="flex flex-col items-center justify-center py-8 px-4">
          {/* Icon */}
          {isLoading && (
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          )}
          {isSuccess && (
            <CheckCircle2 className="h-16 w-16 text-success mb-6 animate-in fade-in duration-500" />
          )}
          {isError && (
            <AlertCircle className="h-16 w-16 text-destructive mb-6 animate-in fade-in duration-500" />
          )}

          {/* Status Message */}
          <h2 className="text-xl font-semibold text-center mb-2">
            {message || statusMessages[status]}
          </h2>

          {/* Description */}
          <p className="text-center text-muted-foreground mb-4 text-sm">
            {errorMessage || statusDescriptions[status]}
          </p>

          {/* Additional Info for Loading States */}
          {isLoading && (
            <div className="w-full space-y-2 mb-4">
              <p className="text-xs text-center text-muted-foreground">
                Please don't close this page
              </p>
              
              {/* Progress Indicator */}
              <div className="flex gap-2 justify-center">
                <div
                  className={`h-1 w-1 rounded-full transition-colors ${
                    ['initializing', 'processing', 'verifying', 'completing'].includes(status)
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
                <div
                  className={`h-1 w-1 rounded-full transition-colors ${
                    ['processing', 'verifying', 'completing'].includes(status)
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
                <div
                  className={`h-1 w-1 rounded-full transition-colors ${
                    ['verifying', 'completing'].includes(status) ? 'bg-primary' : 'bg-muted'
                  }`}
                />
                <div
                  className={`h-1 w-1 rounded-full transition-colors ${
                    status === 'completing' ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Steps for Processing State */}
          {status === 'processing' && (
            <div className="w-full space-y-3 mb-4">
              <div className="text-xs space-y-2">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Open the Paystack payment modal
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-muted" />
                  Enter your card or mobile money details
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-muted" />
                  Complete the payment
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="w-full space-y-2 mb-4">
              <p className="text-sm text-center text-success font-medium">
                ✓ Subscription activated successfully
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          {/* Error Message with Details */}
          {isError && (
            <div className="w-full space-y-2 mb-4">
              <p className="text-sm text-center text-destructive font-medium">
                ✗ {errorMessage || 'Payment could not be processed'}
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Please try again or contact support
              </p>
            </div>
          )}

          {/* Loading Animation Text */}
          {isLoading && (
            <div className="text-xs text-muted-foreground text-center animate-pulse">
              {status === 'initializing' && 'Connecting to Paystack...'}
              {status === 'processing' && 'Waiting for payment confirmation...'}
              {status === 'verifying' && 'Verifying transaction...'}
              {status === 'completing' && 'Setting up your dashboard...'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
