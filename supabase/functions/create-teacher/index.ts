import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CreateTeacherRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string | null;
  subjects?: string[];
  created_by_user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests FIRST
  if (req.method === "OPTIONS") {
    console.log("✓ OPTIONS preflight request received");
    return new Response("OK", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("✓ Environment variables present");

    // Create admin client with SERVICE ROLE KEY
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body (ONLY ONCE!)
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      subjects,
      created_by_user_id,
    }: CreateTeacherRequest = await req.json();

    console.log("👤 Creating teacher account for:", email);

    // Validate input
    if (
      !first_name || !last_name || !email || !password || !created_by_user_id
    ) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: first_name, last_name, email, password, and created_by_user_id are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate password length
    if (password.length < 6) {
      console.error("❌ Password too short");
      return new Response(
        JSON.stringify({
          error: "Password must be at least 6 characters long",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify the admin user exists
    console.log(
      "🔐 Verifying admin user:",
      created_by_user_id.substring(0, 10) + "...",
    );
    const { data: adminUser, error: adminCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("id", created_by_user_id)
      .maybeSingle();

    if (adminCheckError || !adminUser) {
      console.error("❌ Admin user not found in profiles");
      return new Response(
        JSON.stringify({
          error: "Admin user not found or invalid",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get school_id from school_memberships
    console.log("🔐 Getting school membership...");
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("school_memberships")
      .select("school_id, role")
      .eq("user_id", created_by_user_id)
      .eq("is_active", true)
      .maybeSingle();

    if (membershipError || !membership) {
      console.error("❌ Admin user has no active school membership");
      return new Response(
        JSON.stringify({
          error: "Admin user not associated with a school",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const school_id = membership.school_id;
    console.log("✅ Admin verified. School ID:", school_id);

    // Verify admin has school_admin role
    if (membership.role !== "school_admin") {
      console.error(
        "❌ User is not a school_admin. Current role:",
        membership.role,
      );
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Only school admins can create teachers",
          current_role: membership.role,
          details: "You must have the school_admin role to perform this action",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ User verified as school_admin");

    // Step 1: Create auth account for the teacher using SERVICE ROLE
    console.log("🔐 Creating auth account with service role...");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name,
          last_name,
          phone: phone || null,
          school_id,
        },
      });

    if (authError) {
      console.error("❌ Auth creation error:", authError.message);

      let errorMessage = "Failed to create teacher account";
      if (
        authError.message.includes("already") ||
        authError.message.includes("User already registered")
      ) {
        errorMessage =
          "This email is already registered. Please use a different email.";
      }

      return new Response(
        JSON.stringify({ error: errorMessage, details: authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ Auth account created:", authData.user.id);

    try {
      // Step 2: Create teacher record (NO email or subjects columns!)
      console.log("👨‍🏫 Creating teacher record...");
      const { data: teacherData, error: teacherError } = await supabaseAdmin
        .from("teachers")
        .insert({
          user_id: authData.user.id,
          school_id,
          first_name,
          last_name,
          phone: phone || null,
          status: "active",
          hire_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (teacherError) {
        console.error("❌ Teacher creation error:", teacherError.message);
        throw teacherError;
      }

      console.log("✅ Teacher record created:", teacherData.id);

      // Step 3: Create school membership with teacher role
      // NOTE: Profile is automatically created by handle_new_user() trigger
      // when the auth user is inserted. The trigger extracts data from
      // raw_user_meta_data and creates the profile entry.
      console.log("🎭 Creating school membership with teacher role...");
      const { error: membershipError } = await supabaseAdmin
        .from("school_memberships")
        .insert({
          user_id: authData.user.id,
          school_id,
          role: "teacher",
          is_active: true,
          created_by: created_by_user_id,
        });

      if (membershipError) {
        console.error("❌ Membership creation error:", membershipError.message);
        throw membershipError;
      }

      console.log("✅ School membership created");

      // Step 4: Optionally assign subjects if provided
      if (subjects && subjects.length > 0) {
        console.log("📚 Assigning subjects to teacher...");
        const teacherSubjects = subjects.map((subject_id) => ({
          school_id,
          teacher_id: teacherData.id,
          subject_id,
          created_by: created_by_user_id,
        }));

        const { error: subjectsError } = await supabaseAdmin
          .from("teacher_subjects")
          .insert(teacherSubjects);

        if (subjectsError) {
          console.warn("⚠️ Failed to assign subjects:", subjectsError.message);
          // Don't throw - subjects assignment is optional
        } else {
          console.log("✅ Subjects assigned");
        }
      }
      console.log("🎉 Teacher account created successfully!");

      return new Response(
        JSON.stringify({
          success: true,
          message: "Teacher account created successfully",
          teacher_id: teacherData.id,
          user_id: authData.user.id,
          email,
          school_id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (dbError) {
      // Rollback: Delete the auth account if database operations fail
      console.error("❌ Database operation failed, rolling back...");
      console.error("Error:", dbError);

      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log("✅ Auth account deleted (rollback successful)");
      } catch (deleteError) {
        console.error("❌ Rollback failed:", deleteError);
      }

      const errorMessage = dbError instanceof Error
        ? dbError.message
        : "Database operation failed";
      return new Response(
        JSON.stringify({
          error: "Failed to create teacher record",
          details: errorMessage,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
