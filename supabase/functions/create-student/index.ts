import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateStudentRequest {
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: 'Male' | 'Female' | null
  class_id: string | null
  admission_number: string | null
  admission_date: string | null
  parent_name: string | null
  parent_phone: string | null
  parent_email: string | null
  address: string | null
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // TEMPORARY DEBUG CODE
    const authHeader = req.headers.get('authorization')
    console.log('========== CREATE-STUDENT FUNCTION DEBUG ==========')
    console.log('Authorization header present:', !!authHeader)
    console.log('Authorization header length:', authHeader?.length)
    console.log('Authorization header starts with Bearer:', authHeader?.startsWith('Bearer '))
    
    if (!authHeader) {
      console.error('❌ NO AUTH HEADER RECEIVED')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✓ Auth header received')

    // Check environment variables
    const dbUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment variables check:')
    console.log('  SUPABASE_URL:', !!dbUrl)
    console.log('  SUPABASE_ANON_KEY:', !!anonKey)
    console.log('  SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey)
    
    if (!dbUrl || !anonKey || !serviceRoleKey) {
      console.error('❌ Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✓ All environment variables present')

    // Create admin client (service role bypasses RLS)
    const supabaseAdmin = createClient(dbUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the JWT token and get user ID
    console.log('Attempting to verify user token...')
    const jwt = authHeader.replace('Bearer ', '')
    console.log('JWT token (first 50 chars):', jwt.substring(0, 50) + '...')
    
    // Use admin client to verify the token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt)
    
    if (userError || !user) {
      console.error('❌ User verification error:', userError)
      console.error('User object:', user)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired token',
          details: userError?.message || 'No user found'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✓ Token verified')
    console.log('Authenticated user ID:', user.id)
    console.log('User email:', user.email)

    // Get the school_id from the user's profile (using service role to bypass RLS)
    console.log('Querying profiles table...')
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData || !profileData.school_id) {
      console.error('Profile query error:', profileError)
      return new Response(
        JSON.stringify({ 
          error: 'User does not have an associated school',
          details: profileError?.message || 'No school_id found in profile',
          user_id: user.id
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const school_id = profileData.school_id
    console.log('School ID from profile:', school_id)

    // Verify user is actually an admin (check user_roles table using service role)
    console.log('Verifying admin role...')
    const { data: userRoleData, error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRoleError || !userRoleData || userRoleData.role !== 'school_admin') {
      console.error('Role verification failed:', userRoleError)
      console.error('User role:', userRoleData?.role)
      return new Response(
        JSON.stringify({ 
          error: 'User is not a school admin',
          details: 'Only school admins can create students',
          current_role: userRoleData?.role
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User verified as school_admin')

    // Parse request body
    const { first_name, last_name, date_of_birth, gender, class_id, admission_number, admission_date, parent_name, parent_phone, parent_email, address }: CreateStudentRequest = await req.json()

    console.log('Creating student account for:', first_name, last_name)

    // Validate input
    if (!first_name || !last_name) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: first_name and last_name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Create student record in database with inherited school_id
    console.log('Creating student record')
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        school_id, // Use the school_id from the admin
        first_name,
        last_name,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        class_id: class_id || null,
        admission_number: admission_number || null,
        admission_date: admission_date || null,
        parent_name: parent_name || null,
        parent_phone: parent_phone || null,
        parent_email: parent_email || null,
        address: address || null,
        status: 'active',
      })
      .select()
      .single()

    if (studentError) {
      console.error('Student creation error:', studentError)
      
      return new Response(
        JSON.stringify({ error: 'Failed to create student record', details: studentError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✓ Student created with ID:', studentData.id)
    console.log('Student account created successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Student account created successfully',
        student_id: studentData.id,
        first_name,
        last_name,
        school_id, // Return the inherited school_id
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
