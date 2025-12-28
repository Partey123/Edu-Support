import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('✓ OPTIONS preflight request received')
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    console.log('========== TEST AUTH FUNCTION ==========')
    
    const authHeader = req.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('❌ No auth header')
      return new Response(
        JSON.stringify({ error: 'No auth header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Auth header format check:')
    console.log('  Starts with "Bearer ":', authHeader.startsWith('Bearer '))
    console.log('  Header length:', authHeader.length)
    console.log('  First 50 chars:', authHeader.substring(0, 50) + '...')
    
    const dbUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    console.log('Environment check:')
    console.log('  SUPABASE_URL:', !!dbUrl)
    console.log('  SUPABASE_ANON_KEY:', !!anonKey)
    
    if (!dbUrl || !anonKey) {
      return new Response(
        JSON.stringify({ error: 'Missing env vars' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Creating Supabase client with user JWT...')
    const supabaseClient = createClient(dbUrl, anonKey, {
      global: {
        headers: { authorization: authHeader }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('Calling getUser()...')
    const { data: { user }, error } = await supabaseClient.auth.getUser()
    
    console.log('getUser() result:')
    console.log('  User:', user ? { id: user.id, email: user.email } : null)
    console.log('  Error:', error ? { message: error.message, name: error.name } : null)
    
    if (error || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get user',
          details: error?.message || 'No user found'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✓ User verification successful')
    
    // Now try to query the profile
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ 
          success: true,
          user_id: user.id,
          email: user.email,
          message: 'Auth works but cannot check profile (missing service role key)'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Creating admin client to check profile...')
    const adminClient = createClient(dbUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    console.log('Querying profile for user:', user.id)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('school_id, email, first_name, last_name')
      .eq('id', user.id)
      .maybeSingle()
    
    console.log('Profile query result:')
    console.log('  Profile found:', !!profile)
    console.log('  School ID:', profile?.school_id)
    console.log('  Error:', profileError?.message)
    
    // Check user roles
    console.log('Querying user_roles for user:', user.id)
    const { data: roles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
    
    console.log('User roles query result:')
    console.log('  Role found:', !!roles)
    console.log('  Role:', roles?.role)
    console.log('  Error:', rolesError?.message)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email
        },
        profile: profile ? {
          school_id: profile.school_id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name
        } : null,
        role: roles ? {
          role: roles.role
        } : null,
        diagnostics: {
          profile_exists: !!profile,
          has_school_id: !!profile?.school_id,
          has_role: !!roles,
          role_is_school_admin: roles?.role === 'school_admin'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
