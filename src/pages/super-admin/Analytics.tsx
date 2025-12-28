import { useEffect, useState } from "react";
import { Building, Users, Activity, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlatformStats {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  totalTeachers: number;
  newSchoolsThisMonth: number;
  newStudentsThisMonth: number;
}

interface SchoolWithStats {
  id: string;
  name: string;
  studentCount: number;
  teacherCount: number;
  classCount: number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30");
  const [stats, setStats] = useState<PlatformStats>({
    totalSchools: 0,
    activeSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    newSchoolsThisMonth: 0,
    newStudentsThisMonth: 0,
  });
  const [topSchools, setTopSchools] = useState<SchoolWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range based on period
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - parseInt(period));

      // Fetch all schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .is('deleted_at', null);

      if (schoolsError) throw schoolsError;

      // Count active schools
      const activeSchools = schools?.filter(s => s.is_active).length || 0;

      // Count new schools this period
      const newSchools = schools?.filter(s => 
        new Date(s.created_at) >= startDate
      ).length || 0;

      // Get total students
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Get new students this period
      const { count: newStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .is('deleted_at', null);

      // Get total teachers
      const { count: totalTeachers } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      setStats({
        totalSchools: schools?.length || 0,
        activeSchools,
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        newSchoolsThisMonth: newSchools,
        newStudentsThisMonth: newStudents || 0,
      });

      // Fetch top 5 schools by student count
      if (schools && schools.length > 0) {
        const schoolsWithCounts = await Promise.all(
          schools.slice(0, 10).map(async (school) => {
            const [studentsRes, teachersRes, classesRes] = await Promise.all([
              supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('school_id', school.id)
                .is('deleted_at', null),
              supabase
                .from('teachers')
                .select('*', { count: 'exact', head: true })
                .eq('school_id', school.id)
                .is('deleted_at', null),
              supabase
                .from('classes')
                .select('*', { count: 'exact', head: true })
                .eq('school_id', school.id)
                .is('deleted_at', null),
            ]);

            return {
              id: school.id,
              name: school.name,
              studentCount: studentsRes.count || 0,
              teacherCount: teachersRes.count || 0,
              classCount: classesRes.count || 0,
            };
          })
        );

        // Sort by student count and take top 5
        const sorted = schoolsWithCounts
          .sort((a, b) => b.studentCount - a.studentCount)
          .slice(0, 5);

        setTopSchools(sorted);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const growth = ((current - previous) / previous) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout role="super-admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Platform-wide performance metrics and insights.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Schools"
          value={stats.totalSchools.toString()}
          change={`+${stats.newSchoolsThisMonth} this period`}
          changeType={stats.newSchoolsThisMonth > 0 ? "positive" : "neutral"}
          icon={Building}
        />
        <StatCard
          title="Active Schools"
          value={stats.activeSchools.toString()}
          change={`${Math.round((stats.activeSchools / stats.totalSchools) * 100)}% of total`}
          changeType="neutral"
          icon={Activity}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          change={`+${stats.newStudentsThisMonth} this period`}
          changeType={stats.newStudentsThisMonth > 0 ? "positive" : "neutral"}
          icon={Users}
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers.toLocaleString()}
          change="Active staff"
          changeType="neutral"
          icon={TrendingUp}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Growth Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Schools</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalSchools}</p>
                <p className="text-xs text-primary mt-1">{stats.activeSchools} active</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Students</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-success mt-1">+{stats.newStudentsThisMonth} new</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Teachers</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalTeachers}</p>
                <p className="text-xs text-muted-foreground mt-1">All schools</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Period Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Schools:</span>
                  <span className="font-medium text-foreground">{stats.newSchoolsThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Students:</span>
                  <span className="font-medium text-foreground">{stats.newStudentsThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Students/School:</span>
                  <span className="font-medium text-foreground">
                    {stats.totalSchools > 0 ? Math.round(stats.totalStudents / stats.totalSchools) : 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Active Rate</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.totalSchools > 0 
                    ? Math.round((stats.activeSchools / stats.totalSchools) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Avg Class Size</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.totalTeachers > 0 
                    ? Math.round(stats.totalStudents / stats.totalTeachers) 
                    : 0}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
                <p className="text-xl font-bold text-success">
                  {stats.totalStudents > 0 && stats.newStudentsThisMonth > 0
                    ? `+${((stats.newStudentsThisMonth / stats.totalStudents) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Schools */}
      <Card>
        <CardHeader>
          <CardTitle>Top Schools by Student Count</CardTitle>
        </CardHeader>
        <CardContent>
          {topSchools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No schools found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Rank</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">School</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Students</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Teachers</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Classes</th>
                  </tr>
                </thead>
                <tbody>
                  {topSchools.map((school, index) => (
                    <tr key={school.id} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-foreground">{school.name}</span>
                      </td>
                      <td className="py-4 text-foreground font-medium">
                        {school.studentCount.toLocaleString()}
                      </td>
                      <td className="py-4 text-foreground">{school.teacherCount}</td>
                      <td className="py-4 text-foreground">{school.classCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}