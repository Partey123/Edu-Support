import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type SchoolMembership = Database['public']['Tables']['school_memberships']['Row'];

export type AppRole = 'super_admin' | 'school_admin' | 'teacher' | 'parent';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isSuperAdmin: boolean;
  schoolRole: string | null;
  schoolId: string | null;
  roles: AppRole[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  getPrimaryRole: () => AppRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schoolMembership, setSchoolMembership] = useState<SchoolMembership | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and role
  const fetchProfile = async (userId: string, retries = 1) => {
    try {
      // Get profile with super admin flag
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfile(null);
        setSchoolMembership(null);
        setRoles([]);
        return;
      }

      if (!profileData) {
        // Profile doesn't exist yet - might be new user, retry once only
        if (retries > 0) {
          console.log('Profile not found, retrying...');
          await new Promise(resolve => setTimeout(resolve, 500));
          return fetchProfile(userId, retries - 1);
        }
        setProfile(null);
        setSchoolMembership(null);
        setRoles([]);
        return;
      }

      setProfile(profileData);

      // If super admin, set role and skip school membership check
      if (profileData?.is_super_admin) {
        setRoles(['super_admin']);
        setSchoolMembership(null);
        return;
      }

      // If not super admin, get school membership(s)
      const { data: membershipData, error: membershipError } = await supabase
        .from('school_memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        setSchoolMembership(null);
        setRoles([]);
        return;
      }

      if (membershipData && membershipData.length > 0) {
        // Set the most recent active membership
        setSchoolMembership(membershipData[0]);
        
        // Extract all roles from memberships
        const userRoles = membershipData.map(m => m.role as AppRole);
        setRoles(userRoles);
      } else {
        console.log('No active school memberships found for user:', userId);
        setSchoolMembership(null);
        setRoles([]);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
      setSchoolMembership(null);
      setRoles([]);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Set hard timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 2000);

    // Set up auth state listener - this handles everything
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile non-blocking
          fetchProfile(session.user.id).catch(err => {
            console.error('Error fetching profile:', err);
          });
        } else {
          setProfile(null);
          setSchoolMembership(null);
          setRoles([]);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setSchoolMembership(null);
          setRoles([]);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error as Error };
    }

    if (data.user) {
      // Fetch profile non-blocking, don't wait for it
      fetchProfile(data.user.id).catch(err => {
        console.error('Error fetching profile after sign in:', err);
      });
    }

    return { error: null };
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });

    // If signup was successful and we have a session, set it immediately
    if (data?.session) {
      setSession(data.session);
      setUser(data.user);
      
      if (data.user) {
        await fetchProfile(data.user.id);
      }
    }

    return {
      error: error as Error | null,
      data: data ? { user: data.user, session: data.session } : null
    };
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSchoolMembership(null);
    setSession(null);
    setRoles([]);
  };

  // Refresh profile (useful after updates)
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: AppRole) => roles.includes(role);

  // Get primary role with super admin priority
  const getPrimaryRole = (): AppRole | null => {
    const priority: AppRole[] = ['super_admin', 'school_admin', 'teacher', 'parent'];
    for (const role of priority) {
      if (roles.includes(role)) return role;
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isSuperAdmin: profile?.is_super_admin ?? false,
    schoolRole: schoolMembership?.role ?? null,
    schoolId: schoolMembership?.school_id ?? null,
    roles,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    hasRole,
    getPrimaryRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for role checking
export function useRequireRole(requiredRole: 'super_admin' | 'school_admin' | 'teacher' | 'parent') {
  const { isSuperAdmin, schoolRole, isLoading } = useAuth();

  const hasAccess =
    requiredRole === 'super_admin'
      ? isSuperAdmin
      : schoolRole === requiredRole || isSuperAdmin; // Super admins can access everything

  return { hasAccess, isLoading };
}

// Hook to redirect authenticated users to their dashboard
export function useAuthRedirect() {
  const { user, roles, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && roles.length > 0) {
      const dashboardPath = getDashboardPath(roles);
      navigate(dashboardPath, { replace: true });
    }
  }, [user, roles, isLoading, navigate]);
}

export function getDashboardPath(roles: AppRole[]): string {
  if (roles.includes('super_admin')) return '/super-admin/dashboard';
  if (roles.includes('school_admin')) return '/school-admin/dashboard';
  if (roles.includes('teacher')) return '/teacher/dashboard';
  if (roles.includes('parent')) return '/parent/dashboard';
  // If user has no roles, redirect to a setup page or home
  return '/';
}