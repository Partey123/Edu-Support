import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { reference } = await req.json();

    // Validate required input
    if (!reference || typeof reference !== "string") {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Payment reference is required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Get Paystack secret key from environment
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({
          status: false,
          message: "Payment system not configured. Please contact support.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    console.log("Verify Payment - Processing request:", { reference });

    // Call Paystack Payment Verification API
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${
        encodeURIComponent(reference)
      }`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Paystack API error response:", responseData);
      return new Response(
        JSON.stringify({
          status: false,
          message: responseData?.message ||
            "Failed to verify payment with Paystack",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        },
      );
    }

    if (!responseData.status) {
      console.error("Paystack API returned non-success status:", responseData);
      return new Response(
        JSON.stringify({
          status: false,
          message: responseData.message || "Payment verification failed",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    console.log("Paystack Payment Verified Successfully:", {
      reference: responseData.data.reference,
      status: responseData.data.status,
    });

    // Return success response
    return new Response(
      JSON.stringify({
        status: true,
        message: "Payment verified successfully",
        data: {
          id: responseData.data.id,
          status: responseData.data.status,
          reference: responseData.data.reference,
          amount: responseData.data.amount,
          customer: responseData.data.customer,
          paid_at: responseData.data.paid_at,
          channel: responseData.data.channel,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Payment Verification Error:", errorMessage);

    return new Response(
      JSON.stringify({
        status: false,
        message: errorMessage || "Failed to verify payment",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
