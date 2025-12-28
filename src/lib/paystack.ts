// lib/paystack.ts
// Paystack Payment Integration Utilities

/**
 * Paystack Payload Configuration Interface
 * Defines the structure for Paystack payment initialization
 */
export interface PaystackPayload {
  email: string; // Customer email address
  amount: number; // Amount in pesewas (multiply cedis by 100)
  metadata?: {
    order_id?: string;
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: any;
  };
  callback_url?: string; // URL to redirect after payment
  onSuccess?: (reference: string) => void;
  onCancel?: () => void;
}

/**
 * Global Paystack window type declaration
 * Extends Window interface to include PaystackPop
 */
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackPopConfig) => PaystackHandler;
    };
  }
}

/**
 * Paystack Pop Configuration Interface
 */
interface PaystackPopConfig {
  key: string; // Public key
  email: string;
  amount: number; // In pesewas
  currency: string;
  ref: string;
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

/**
 * Paystack Handler returned from setup
 */
interface PaystackHandler {
  openIframe: () => void;
}

/**
 * Paystack Response from callback
 */
interface PaystackResponse {
  reference: string;
  [key: string]: any;
}

/**
 * Paystack Public Key
 * Type: Live/Production key
 * Currency: Ghana Cedi (GHS)
 */
export const PAYSTACK_PUBLIC_KEY =
  "pk_live_14a6578f3c80b77a102fa28c1362ed5b445fd479";

/**
 * Initialize a Paystack payment using the Inline.js SDK
 * Loads the Paystack Pop SDK dynamically and sets up payment handler
 *
 * @param payload - Payment configuration payload
 * @throws Error if Paystack SDK fails to load or if initialization fails
 */
export async function initializePayment(
  payload: PaystackPayload,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Load Paystack SDK script if not already loaded
    if (typeof window.PaystackPop === "undefined") {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;

      script.onload = () => {
        // SDK loaded, initialize payment
        setupPayment(payload, resolve, reject);
      };

      script.onerror = () => {
        const error = new Error("Failed to load Paystack SDK");
        reject(error);
        if (payload.onCancel) {
          payload.onCancel();
        }
      };

      document.body.appendChild(script);
    } else {
      // SDK already loaded, initialize payment directly
      setupPayment(payload, resolve, reject);
    }
  });
}

/**
 * Setup and open the Paystack payment modal
 * Internal helper function
 */
function setupPayment(
  payload: PaystackPayload,
  resolve: () => void,
  reject: (error: Error) => void,
): void {
  try {
    if (!window.PaystackPop) {
      throw new Error("PaystackPop is not available");
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: payload.email,
      amount: payload.amount, // Should be in pesewas
      currency: "GHS",
      ref: generateReference(),
      callback: (response: PaystackResponse) => {
        if (payload.onSuccess) {
          payload.onSuccess(response.reference);
        }
        resolve();
      },
      onClose: () => {
        if (payload.onCancel) {
          payload.onCancel();
        }
        reject(new Error("Payment modal closed by user"));
      },
    });

    // Open the payment modal
    handler.openIframe();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    reject(err);
    if (payload.onCancel) {
      payload.onCancel();
    }
  }
}

/**
 * Generate a unique reference for each transaction
 * Format: EDU_{timestamp}_{randomNumber}
 */
export function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `EDU_${timestamp}_${random}`;
}

/**
 * Convert amount from cedis to pesewas
 * @param cedis - Amount in Ghana cedis (GHS)
 * @returns Amount in pesewas (GHS * 100)
 */
export function convertToPesewas(cedis: number): number {
  return Math.round(cedis * 100);
}
