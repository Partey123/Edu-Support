import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  schoolName: string
  schoolAddress: string
  schoolPhone: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, firstName, lastName, schoolName, schoolAddress, schoolPhone }: SignupRequest = await req.json()

    console.log('Starting signup process for:', email)

    // Validate input
    if (!email || !password || !schoolName) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, and schoolName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check environment variables
    const dbUrl = Deno.env.get('DB_URL')
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')
    
    console.log('DB_URL exists:', !!dbUrl)
    console.log('SERVICE_ROLE_KEY exists:', !!serviceRoleKey)
    
    if (!dbUrl || !serviceRoleKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      dbUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Step 1: Create the school first (using admin client to bypass RLS)
    console.log('Creating school:', schoolName)
    const { data: schoolData, error: schoolError } = await supabaseAdmin
      .from('schools')
      .insert({
        name: schoolName,
        address: schoolAddress,
        phone: schoolPhone,
      })
      .select()
      .single()

    if (schoolError) {
      console.error('School creation error:', schoolError)
      return new Response(
        JSON.stringify({ error: 'Failed to create school', details: schoolError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('School created with ID:', schoolData.id)

    // Step 2: Create the user with school_id in metadata
    console.log('Creating user account')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        school_id: schoolData.id,
      }
    })

    if (authError) {
      console.error('User creation error:', authError)
      // Rollback: delete the school we just created
      await supabaseAdmin.from('schools').delete().eq('id', schoolData.id)
      
      let errorMessage = 'Failed to create user account'
      if (authError.message.includes('already')) {
        errorMessage = 'This email is already registered. Please sign in instead.'
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage, details: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created with ID:', authData.user.id)

    // Step 3: Create profile directly (don't rely on trigger)
    console.log('Creating profile')
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
      })

    if (profileInsertError) {
      console.error('Profile creation error:', profileInsertError)
      // Non-critical, continue
    }

    // Step 4: Assign school_admin role via school_memberships
    console.log('Creating school_memberships record')
    const { error: membershipError } = await supabaseAdmin
      .from('school_memberships')
      .insert({
        user_id: authData.user.id,
        school_id: schoolData.id,
        role: 'school_admin',
        created_by: authData.user.id,
      })

    if (membershipError) {
      console.error('School membership creation error:', membershipError)
      // Non-critical, continue
    }

    console.log('Signup completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account created successfully',
        userId: authData.user.id,
        schoolId: schoolData.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})