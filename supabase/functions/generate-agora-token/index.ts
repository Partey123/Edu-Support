import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { RtcRole, RtcTokenBuilder } from "npm:agora-access-token@2.0.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log("🚀 Edge Function invoked");

  try {
    // 1. Check for authorization header
    const authHeader = req.headers.get("authorization");
    console.log("📋 Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("❌ Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const agoraAppId = Deno.env.get("AGORA_APP_ID");
    const agoraAppCertificate = Deno.env.get("AGORA_APP_CERTIFICATE");

    console.log("🔍 Environment check:");
    console.log("  - SUPABASE_URL:", !!supabaseUrl);
    console.log("  - SUPABASE_ANON_KEY:", !!supabaseAnonKey);
    console.log("  - AGORA_APP_ID:", !!agoraAppId);
    console.log("  - AGORA_APP_CERTIFICATE:", !!agoraAppCertificate);

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error - Missing Supabase config",
          details: {
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!agoraAppId || !agoraAppCertificate) {
      console.error("❌ Missing Agora credentials");
      return new Response(
        JSON.stringify({ 
          error: "Agora credentials not configured",
          details: {
            hasAppId: !!agoraAppId,
            hasCertificate: !!agoraAppCertificate
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Create Supabase client
    console.log("🔐 Creating Supabase client...");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // 4. Verify user authentication
    console.log("👤 Verifying user authentication...");
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError) {
      console.error("❌ Authentication error:", authError.message);
      console.error("   Error details:", JSON.stringify(authError, null, 2));
      return new Response(
        JSON.stringify({ 
          error: "Invalid JWT",
          details: authError.message
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!user) {
      console.error("❌ No user returned from auth");
      return new Response(
        JSON.stringify({ error: "Invalid JWT - No user" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`✅ Authenticated user: ${user.id} (${user.email})`);

    // 5. Parse request body
    const body = await req.json();
    const { channelName, uid, role, expireTime } = body;
    
    console.log("📦 Request body:", { channelName, uid, role, expireTime });

    if (!channelName || uid === undefined) {
      console.error("❌ Missing required parameters");
      return new Response(
        JSON.stringify({ error: "Missing channelName or uid" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 6. Generate Agora RTC token
    console.log("🎫 Generating Agora token...");
    const roleNum = role === 1 || role === "publisher"
      ? RtcRole.PUBLISHER
      : RtcRole.SUBSCRIBER;
    
    const expirationTime = expireTime || 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      agoraAppId,
      agoraAppCertificate,
      channelName,
      uid,
      roleNum,
      privilegeExpiredTs,
    );

    console.log(`✅ Token generated successfully`);
    console.log(`   Channel: ${channelName}`);
    console.log(`   UID: ${uid}`);
    console.log(`   Role: ${roleNum === RtcRole.PUBLISHER ? "PUBLISHER" : "SUBSCRIBER"}`);

    // 7. Return token
    return new Response(
      JSON.stringify({
        token,
        expiresIn: expirationTime,
        uid: uid,
        channelName: channelName,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    console.error("   Stack:", error instanceof Error ? error.stack : "N/A");
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});