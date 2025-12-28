// components/checkout/PaymentProcessor.ts
// Payment Processing Handler for Paystack Integration

import { convertToPesewas, initializePayment } from "@/lib/paystack";

/**
 * Payment Processor Configuration
 */
interface ProcessPaymentOptions {
  email: string;
  orderNumber: string;
  totalAmount: number; // In cedis
  customerName: string;
  orders: any[]; // Array of order objects (legacy parameter)
  onSuccess?: (reference: string) => void;
  onCancel?: () => void;
  showLoading?: () => void;
  hideLoading?: () => void;
}

/**
 * Process payment through Paystack
 * Handles:
 * - Loading state management
 * - Safety timeout (10 seconds)
 * - Paystack script loading
 * - Payment initialization
 * - Success and cancel callbacks
 * - Error handling with toast notifications
 *
 * @param options - Payment processing configuration
 * @throws Error if payment processing fails
 */
export async function processPayment(
  options: ProcessPaymentOptions,
): Promise<void> {
  const {
    email,
    orderNumber,
    totalAmount,
    customerName,
    orders,
    onSuccess,
    onCancel,
    showLoading,
    hideLoading,
  } = options;

  // Show loading state if provided
  if (showLoading) {
    showLoading();
  }

  // Safety timeout - hide loading state after 10 seconds
  const safetyTimeout = setTimeout(() => {
    if (hideLoading) {
      hideLoading();
    }
  }, 10000);

  try {
    // Check if Paystack script is already loaded in DOM
    const isScriptLoaded = () => {
      return (
        document.querySelector('script[src*="js.paystack.co"]') !== null ||
        typeof (window as any).PaystackPop !== "undefined"
      );
    };

    // If script not loaded, load it first
    if (!isScriptLoaded()) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;

        script.onload = () => {
          resolve();
        };

        script.onerror = () => {
          reject(new Error("Failed to load Paystack SDK"));
        };

        document.body.appendChild(script);
      });
    }

    // Convert amount from cedis to pesewas
    const amountInPesewas = convertToPesewas(totalAmount);

    // Prepare metadata with order information
    const metadata = {
      order_id: orderNumber,
      customer_name: customerName,
      orders: orders,
    };

    // Prepare callback URL
    const origin = window.location.origin;
    const callbackUrl = `${origin}/order-success/${orderNumber}`;

    // Initialize payment
    await initializePayment({
      email,
      amount: amountInPesewas,
      metadata,
      callback_url: callbackUrl,
      onSuccess: (reference: string) => {
        // Clear safety timeout
        clearTimeout(safetyTimeout);

        // Hide loading state
        if (hideLoading) {
          hideLoading();
        }

        // Call success callback
        if (onSuccess) {
          onSuccess(reference);
        }
      },
      onCancel: () => {
        // Clear safety timeout
        clearTimeout(safetyTimeout);

        // Hide loading state
        if (hideLoading) {
          hideLoading();
        }

        // Call cancel callback
        if (onCancel) {
          onCancel();
        }
      },
    });
  } catch (error) {
    // Clear safety timeout
    clearTimeout(safetyTimeout);

    // Hide loading state
    if (hideLoading) {
      hideLoading();
    }

    // Determine error message
    const errorMessage = error instanceof Error
      ? error.message
      : "Payment processing failed";

    // Call cancel callback with error
    if (onCancel) {
      onCancel();
    }

    throw error;
  }
}

/**
 * Create a payment processor instance with pre-configured options
 * Useful for binding common configuration across the application
 */
export class PaymentProcessor {
  constructor(private defaultOptions?: Partial<ProcessPaymentOptions>) {}

  /**
   * Process payment with merged options
   */
  async process(options: ProcessPaymentOptions): Promise<void> {
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
    } as ProcessPaymentOptions;

    return processPayment(mergedOptions);
  }
}

/**
 * Create a default payment processor instance
 */
export const defaultPaymentProcessor = new PaymentProcessor();
