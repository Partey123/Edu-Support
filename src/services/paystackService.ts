// services/paystackService.ts
// Paystack Payment Service
// Coordinates with backend Edge Functions for secure payment handling

import { supabase } from "@/integrations/supabase/client";
import { PAYSTACK_PUBLIC_KEY } from "@/lib/paystack";

/**
 * Paystack Payment Initialization Response
 * Returned from Paystack API via Edge Function
 */
interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Paystack Payment Verification Response
 * Returned from Paystack API via Edge Function
 */
interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    customer: {
      email: string;
      customer_code: string;
    };
    paid_at: string;
    channel: string;
  };
}

/**
 * Paystack Service Class
 * Manages payment initialization and verification
 * Uses Supabase Edge Functions to keep secret key secure on backend
 */
class PaystackService {
  private readonly publicKey: string;

  constructor() {
    // Get Paystack public key (for frontend popup only)
    // Production Key: pk_live_14a6578f3c80b77a102fa28c1362ed5b445fd479
    this.publicKey = PAYSTACK_PUBLIC_KEY;

    console.log(
      "PaystackService initialized with public key:",
      this.publicKey.substring(0, 10) + "...",
    );
  }

  /**
   * Generate a unique reference for the transaction
   * Format: EDU_{timestamp}_{randomNumber}
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `EDU_${timestamp}_${random}`;
  }

  /**
   * Initialize a payment transaction via Supabase Edge Function
   *
   * The Edge Function handles:
   * - Secret key is kept secure on Supabase backend
   * - Payment initialization with Paystack API
   * - Unique reference generation
   * - Amount conversion from cedis to pesewas
   * - Callback URL construction
   * - Metadata attachment
   *
   * @param email - Customer email address
   * @param amount - Amount in cedis (GHS)
   * @param metadata - Optional metadata (school_id, plan_id, etc.)
   * @returns Promise with authorization_url, access_code, and reference
   * @throws Error if initialization fails
   */
  async initializePayment(
    email: string,
    amount: number,
    metadata?: Record<string, any>,
  ): Promise<PaystackInitializeResponse> {
    try {
      console.log("PaystackService: Initializing payment via Edge Function", {
        email,
        amount,
        hasMetadata: !!metadata,
      });

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "initialize-payment",
        {
          body: {
            email,
            amount, // Edge function handles cedis to pesewas conversion
            metadata,
          },
        },
      );

      if (error) {
        console.error("PaystackService: Edge function error:", error);
        throw new Error(error.message || "Failed to initialize payment");
      }

      if (!data || !data.status) {
        console.error(
          "PaystackService: Invalid response from Edge Function:",
          data,
        );
        throw new Error(
          data?.message || "Payment initialization failed",
        );
      }

      console.log("PaystackService: Payment initialized successfully", {
        reference: data.data.reference,
      });

      return data as PaystackInitializeResponse;
    } catch (error) {
      console.error("PaystackService: Payment initialization error:", error);
      throw error;
    }
  }

  /**
   * Verify a payment transaction via Supabase Edge Function
   *
   * The Edge Function handles:
   * - Secret key is kept secure on Supabase backend
   * - Payment verification with Paystack API
   * - Transaction status lookup by reference
   *
   * @param reference - Payment reference from Paystack
   * @returns Promise with payment status and transaction details
   * @throws Error if verification fails
   */
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      console.log("PaystackService: Verifying payment", { reference });

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "verify-payment",
        {
          body: { reference },
        },
      );

      if (error) {
        console.error("PaystackService: Edge function error:", error);
        throw new Error(error.message || "Failed to verify payment");
      }

      if (!data || !data.status) {
        console.error(
          "PaystackService: Invalid response from Edge Function:",
          data,
        );
        throw new Error(data?.message || "Payment verification failed");
      }

      console.log("PaystackService: Payment verified successfully", {
        reference: data.data.reference,
        status: data.data.status,
      });

      return data as PaystackVerifyResponse;
    } catch (error) {
      console.error("PaystackService: Payment verification error:", error);
      throw error;
    }
  }

  /**
   * Open Paystack inline payment popup
   * Uses the Paystack Inline JS SDK loaded in the page
   *
   * This is an alternative method to redirect-based payments.
   * However, for subscription payments, the Edge Function + authorization_url method is preferred.
   *
   * @param email - Customer email address
   * @param amount - Amount in pesewas (already converted from cedis)
   * @param onSuccess - Callback when payment succeeds
   * @param onClose - Callback when modal is closed
   */
  openPaystackPopup(
    email: string,
    amount: number,
    onSuccess: (reference: string) => void,
    onClose: () => void,
  ): void {
    // Check if PaystackPop is loaded
    if (typeof (window as any).PaystackPop === "undefined") {
      console.error("PaystackService: Paystack Inline JS not loaded");
      alert("Payment system not ready. Please refresh the page.");
      onClose();
      return;
    }

    console.log("PaystackService: Opening Paystack popup", { email, amount });

    const reference = this.generateReference();

    const handler = (window as any).PaystackPop.setup({
      key: this.publicKey,
      email,
      amount: amount, // Should already be in pesewas
      currency: "GHS",
      ref: reference,
      callback: function (response: any) {
        console.log("PaystackService: Payment successful callback", {
          reference: response.reference,
        });
        onSuccess(response.reference);
      },
      onClose: function () {
        console.log("PaystackService: Payment modal closed by user");
        onClose();
      },
    });

    handler.openIframe();
  }

  /**
   * Get the public key (for display/debugging purposes only)
   */
  getPublicKey(): string {
    return this.publicKey;
  }
}

export const paystackService = new PaystackService();
