import { BookOpen, Users, ClipboardCheck, FileText, TrendingUp, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherClasses } from "@/hooks/useSchoolData";
import { Loader2 } from "lucide-react";

const upcomingTasks = [
  { id: 1, title: "Grade Math Assignments", due: "Due Today", priority: "high" },
  { id: 2, title: "Prepare Science Quiz", due: "Due Tomorrow", priority: "medium" },
  { id: 3, title: "Update Progress Reports", due: "Due in 3 days", priority: "low" },
];

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const { data: teacherClasses = [], isLoading } = useTeacherClasses();

  const totalStudents = teacherClasses.reduce((sum, cls) => sum + (cls.student_count || 0), 0);

  if (isLoading) {
    return (
      <DashboardLayout role="teacher" schoolName="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const firstName = profile?.first_name || 'Teacher';
  const schoolName = 'Your School';

  return (
    <DashboardLayout role="teacher" schoolName={schoolName}>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">
          Good morning, {firstName}! 📚
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          You have {teacherClasses.length} classes. Here's your overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Students"
          value={totalStudents.toString()}
          change={`${teacherClasses.length} classes`}
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Classes"
          value={teacherClasses.length.toString()}
          change="Assigned"
          changeType="neutral"
          icon={BookOpen}
        />
        <StatCard
          title="Attendance"
          value="0/3"
          change="Coming soon"
          changeType="neutral"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Grades"
          value="0"
          change="Pending"
          changeType="neutral"
          icon={FileText}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-2">
          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Classes</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/teacher/classes">View All →</Link>
              </Button>
            </div>
            {teacherClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No classes assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teacherClasses.slice(0, 3).map((cls, index) => (
                  <div
                    key={cls.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all ${index === 0 ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex flex-col gap-2 sm:gap-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base text-foreground">{cls.name}</h3>
                            <span className="text-xs text-muted-foreground">• {cls.level}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                          <Link to={`/teacher/class/${cls.id}`}>
                            <ClipboardCheck className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          {cls.student_count || 0} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          Class {cls.level}
                        </span>
                        {cls.room && <span className="text-xs">Room {cls.room}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Actions</h2>
            <div className="space-y-2">
              <Button variant="dashboard" className="w-full justify-start text-sm sm:text-base" asChild>
                <Link to="/teacher/classes">
                  <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Classes</span>
                </Link>
              </Button>
              <Button variant="dashboard" className="w-full justify-start text-sm sm:text-base" asChild>
                <Link to="/teacher/students">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Students</span>
                </Link>
              </Button>
              <Button variant="dashboard" className="w-full justify-start text-sm sm:text-base" asChild>
                <Link to="/teacher/reports">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Reports</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Tasks</h2>
            <div className="space-y-2">
              {upcomingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg"
                >
                  <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    task.priority === "high" ? "border-destructive" :
                    task.priority === "medium" ? "border-warning" :
                    "border-muted-foreground"
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      task.priority === "high" ? "bg-destructive" :
                      task.priority === "medium" ? "bg-warning" :
                      "bg-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Preview */}
          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border hidden sm:block">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">This Week</h2>
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {["M", "T", "W", "T", "F"].map((day, i) => (
                <div key={day + i} className={`p-2 rounded-lg ${i === 1 ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                  <div className="text-xs font-medium">{day}</div>
                  <div className="text-sm font-bold">{23 + i}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}