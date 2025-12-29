import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole, getDashboardPath } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, roles, schoolId, isLoading } = useAuth();
  const location = useLocation();
  const [schoolIsActive, setSchoolIsActive] = useState(true);
  const [checkingSchool, setCheckingSchool] = useState(true);

  // Check school status if user is school admin/teacher
  useEffect(() => {
    const checkSchoolStatus = async () => {
      if (!user || !schoolId || roles.includes('super_admin')) {
        setCheckingSchool(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('schools')
          .select('is_active')
          .eq('id', schoolId)
          .single();

        if (error) {
          console.error('Error checking school status:', error);
          setSchoolIsActive(false);
        } else {
          setSchoolIsActive(data?.is_active ?? false);
        }
      } catch (error) {
        console.error('Error checking school status:', error);
        setSchoolIsActive(false);
      } finally {
        setCheckingSchool(false);
      }
    };

    checkSchoolStatus();
  }, [user, schoolId, roles]);

  if (isLoading || checkingSchool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, saving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if school admin/teacher but school is inactive
  if (schoolId && !schoolIsActive && !roles.includes('super_admin')) {
    return <Navigate to="/school-inactive" replace />;
  }

  // If roles are specified, check if user has at least one
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => roles.includes(role));
    
    if (!hasAllowedRole) {
      // Redirect to their appropriate dashboard
      return <Navigate to={getDashboardPath(roles)} replace />;
    }
  }

  return <>{children}</>;
}
