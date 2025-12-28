// src/hooks/useSuperAdminData.ts
// Custom hooks to fetch super admin dashboard data directly from Supabase

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OverviewStats {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
}

export interface SchoolWithStats {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  studentCount: number;
  teacherCount: number;
  classCount: number;
}

// Hook to fetch overview stats
export function useSuperAdminOverview() {
  return useQuery({
    queryKey: ['super-admin-overview'],
    queryFn: async (): Promise<OverviewStats> => {
      // Get schools count
      const { count: totalSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Get active schools count
      const { count: activeSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .is('deleted_at', null);

      // Get students count
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Get teachers count
      const { count: totalTeachers } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Get classes count
      const { count: totalClasses } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      return {
        totalSchools: totalSchools || 0,
        activeSchools: activeSchools || 0,
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        totalClasses: totalClasses || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to fetch schools list
export function useSuperAdminSchools(searchTerm: string = '') {
  return useQuery({
    queryKey: ['super-admin-schools', searchTerm],
    queryFn: async (): Promise<SchoolWithStats[]> => {
      let query = supabase
        .from('schools')
        .select(`
          id,
          name,
          address,
          phone,
          email,
          is_active,
          created_at
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Add search filter if provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      const { data: schools, error } = await query;

      if (error) throw error;

      if (!schools || schools.length === 0) {
        return [];
      }

      // For each school, get student, teacher, and class counts
      const schoolsWithStats = await Promise.all(
        schools.map(async (school) => {
          // Get student count
          const { count: studentCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .is('deleted_at', null);

          // Get teacher count
          const { count: teacherCount } = await supabase
            .from('teachers')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .is('deleted_at', null);

          // Get class count
          const { count: classCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .is('deleted_at', null);

          return {
            ...school,
            studentCount: studentCount || 0,
            teacherCount: teacherCount || 0,
            classCount: classCount || 0,
          };
        })
      );

      return schoolsWithStats;
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to fetch single school details
export function useSuperAdminSchoolDetails(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['super-admin-school', schoolId],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');

      const { data: school, error } = await supabase
        .from('schools')
        .select(`
          *,
          school_memberships (
            id,
            role,
            is_active,
            created_at,
            user_id
          )
        `)
        .eq('id', schoolId)
        .single();

      if (error) throw error;

      // Get student count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .is('deleted_at', null);

      // Get teacher count
      const { count: teacherCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .is('deleted_at', null);

      // Get class count
      const { count: classCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .is('deleted_at', null);

      return {
        ...school,
        studentCount: studentCount || 0,
        teacherCount: teacherCount || 0,
        classCount: classCount || 0,
      };
    },
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook for regional analytics
export function useSuperAdminAnalytics() {
  return useQuery({
    queryKey: ['super-admin-analytics'],
    queryFn: async () => {
      // Get all schools with their regions (extracted from address)
      const { data: schools } = await supabase
        .from('schools')
        .select('id, name, address')
        .eq('is_active', true)
        .is('deleted_at', null);

      if (!schools || schools.length === 0) {
        return {
          topSchools: [],
          monthlyGrowth: [],
        };
      }

      // Get student counts per school
      const schoolStats = await Promise.all(
        schools.map(async (school) => {
          const { count: studentCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .is('deleted_at', null);

          return {
            id: school.id,
            name: school.name,
            studentCount: studentCount || 0,
          };
        })
      );

      // Sort by student count
      const topSchools = schoolStats
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 10);

      // Get monthly growth (schools created in last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: recentSchools } = await supabase
        .from('schools')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      // Group by month
      const monthlyGrowth = (recentSchools || []).reduce((acc: any, school) => {
        const month = new Date(school.created_at).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      return {
        topSchools,
        monthlyGrowth: Object.entries(monthlyGrowth).map(([month, count]) => ({
          month,
          count,
        })),
      };
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });
}