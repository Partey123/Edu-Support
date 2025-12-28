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
    const { email, amount, metadata } = await req.json();

    // Validate required inputs
    if (!email || amount === undefined || amount === null) {
      console.error("Missing required fields:", { email, amount });
      return new Response(
        JSON.stringify({
          status: false,
          message: "Email and amount are required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Validate email format
    if (!email.includes("@")) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Invalid email address",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Validate amount is a number
    if (typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Amount must be a positive number",
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

    // Generate unique reference for this transaction
    const reference = `EDU_${Date.now()}_${
      Math.floor(Math.random() * 1000000)
    }`;

    console.log("Initialize Payment - Processing request:", {
      email,
      amount,
      reference,
      metadata: metadata?.school_id,
    });

    // Convert amount from cedis to pesewas (multiply by 100)
    const amountInPesewas = Math.round(amount * 100);

    if (amountInPesewas <= 0) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Invalid amount",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Get callback URL from request origin
    const origin = req.headers.get("origin") || "https://eduplanner.app";
    const callbackUrl = `${origin}/subscription/verify`;

    // Prepare request body for Paystack API
    const paystackPayload = {
      email,
      amount: amountInPesewas, // In pesewas
      reference,
      currency: "GHS",
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: "Payment Type",
            variable_name: "payment_type",
            value: "subscription",
          },
        ],
      },
    };

    console.log("Calling Paystack API with:", {
      email,
      amountInPesewas,
      reference,
      callbackUrl,
    });

    // Call Paystack Payment Initialization API
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackPayload),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Paystack API error response:", responseData);
      throw new Error(
        responseData?.message || "Failed to initialize payment with Paystack",
      );
    }

    if (!responseData.status) {
      console.error("Paystack API returned non-success status:", responseData);
      throw new Error(responseData.message || "Payment initialization failed");
    }

    console.log("Paystack Payment Initialized Successfully:", {
      reference: responseData.data.reference,
      access_code: responseData.data.access_code,
    });

    // Return success response
    return new Response(
      JSON.stringify({
        status: true,
        message: "Payment initialized successfully",
        data: {
          authorization_url: responseData.data.authorization_url,
          access_code: responseData.data.access_code,
          reference: responseData.data.reference,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Payment Initialization Error:", errorMessage);

    return new Response(
      JSON.stringify({
        status: false,
        message: errorMessage || "Failed to initialize payment",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
