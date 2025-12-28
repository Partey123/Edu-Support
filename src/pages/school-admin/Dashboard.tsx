import { Users, GraduationCap, BookOpen, ClipboardCheck, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useSchoolData";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { title: "Add Student", href: "/school-admin/students", icon: Users },
  { title: "Mark Attendance", href: "/school-admin/attendance", icon: ClipboardCheck },
  { title: "View Reports", href: "/school-admin/reports", icon: TrendingUp },
  { title: "Manage Classes", href: "/school-admin/classes", icon: BookOpen },
];

const alerts = [
  { id: 1, type: "info", message: "Welcome! Start by adding classes and students.", priority: "high" },
  { id: 2, type: "success", message: "Your school profile is set up", priority: "low" },
];

export default function SchoolAdminDashboard() {
  const { profile, user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const [schoolName, setSchoolName] = useState<string>("Your School");

  useEffect(() => {
    const fetchSchoolName = async () => {
      if (!user) return;
      
      try {
        // Fetch school_memberships to get school_id
        const { data: memberships, error: memberError } = await supabase
          .from('school_memberships')
          .select('school_id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .limit(1)
          .single();

        if (memberError || !memberships?.school_id) {
          return;
        }

        // Fetch school data
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('name')
          .eq('id', memberships.school_id)
          .single();

        if (schoolError) {
          return;
        }

        if (school?.name) {
          setSchoolName(school.name);
        }
      } catch (error) {
        // Silently fail
      }
    };

    fetchSchoolName();
  }, [user]);

  return (
    <DashboardLayout role="school-admin" schoolName={schoolName}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
          Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground font-content">
          Here's what's happening at your school today.
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents?.toString() || "0"}
            change="Active students"
            changeType="neutral"
            icon={Users}
          />
          <StatCard
            title="Teachers"
            value={stats?.totalTeachers?.toString() || "0"}
            change="Active teachers"
            changeType="neutral"
            icon={GraduationCap}
          />
          <StatCard
            title="Classes"
            value={stats?.totalClasses?.toString() || "0"}
            change="All classes"
            changeType="neutral"
            icon={BookOpen}
          />
          <StatCard
            title="Today's Attendance"
            value={stats?.attendanceRate ? `${stats.attendanceRate}%` : "N/A"}
            change="Mark attendance to see stats"
            changeType="neutral"
            icon={ClipboardCheck}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="p-4 bg-muted/30 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 text-center group"
                >
                  <action.icon className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">{action.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Getting Started */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Getting Started</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl flex items-start gap-3 ${
                    alert.type === "warning" ? "bg-warning/10" :
                    alert.type === "success" ? "bg-success/10" :
                    "bg-info/10"
                  }`}
                >
                  {alert.type === "warning" ? (
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  ) : alert.type === "success" ? (
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-foreground">Setup Your School</h2>
            </div>
            <div className="space-y-4">
              <SetupItem
                title="1. Add Classes"
                description="Create classes for your school (e.g., Basic 1A, Basic 2B)"
                href="/school-admin/classes"
                completed={!!stats?.totalClasses && stats.totalClasses > 0}
              />
              <SetupItem
                title="2. Add Teachers"
                description="Add your teaching staff and assign them to classes"
                href="/school-admin/teachers"
                completed={!!stats?.totalTeachers && stats.totalTeachers > 0}
              />
              <SetupItem
                title="3. Add Students"
                description="Enroll students and assign them to classes"
                href="/school-admin/students"
                completed={!!stats?.totalStudents && stats.totalStudents > 0}
              />
              <SetupItem
                title="4. Configure Subjects"
                description="Add subjects taught at your school"
                href="/school-admin/subjects"
                completed={false}
              />
              <SetupItem
                title="5. Mark Attendance"
                description="Start tracking daily attendance for your students"
                href="/school-admin/attendance"
                completed={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Overview Chart */}
      <div className="mt-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-foreground">Attendance Overview (This Week)</h2>
            <Button variant="outline" size="sm" className="rounded-xl">Export</Button>
          </div>
          {!stats?.totalStudents ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Add students and mark attendance to see attendance trends</p>
            </div>
          ) : (
            <div className="h-64 flex items-end gap-4 px-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => {
                const heights = [88, 92, 85, 94, 91];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-muted/50 rounded-t-xl relative" style={{ height: "200px" }}>
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-primary rounded-t-xl transition-all duration-500"
                        style={{ height: `${heights[i]}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{day}</span>
                    <span className="text-xs font-data font-semibold text-primary">{heights[i]}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function SetupItem({ 
  title, 
  description, 
  href, 
  completed 
}: { 
  title: string; 
  description: string; 
  href: string; 
  completed: boolean;
}) {
  return (
    <Link
      to={href}
      className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
        completed ? "bg-success/10" : "bg-muted/20 hover:bg-muted/40"
      }`}
    >
      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        completed ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {completed ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <span className="text-sm font-data font-medium">{title.split(".")[0]}.</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${completed ? "text-success" : "text-foreground"}`}>{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </Link>
  );
}
