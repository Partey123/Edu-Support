import { BookOpen, Users, Calendar, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherClasses } from "@/hooks/useSchoolData";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function TeacherClasses() {
  const { profile } = useAuth();
  const { data: teacherClasses = [], isLoading } = useTeacherClasses();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = teacherClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout role="teacher" schoolName="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const schoolName = 'Your School';

  return (
    <DashboardLayout role="teacher" schoolName={schoolName}>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">
          Classes
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage {teacherClasses.length} assigned classes
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "No classes found" : "No classes assigned yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="group">
              <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border hover:border-primary hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-xl">
                    <BookOpen className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    {cls.level}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {cls.name}
                </h3>

                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>{cls.student_count || 0} Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Class {cls.level}</span>
                  </div>
                  {cls.room && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Room {cls.room}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border space-y-2 flex flex-col">
                  <Link
                    to={`/teacher/class/${cls.id}`}
                    className="text-xs sm:text-sm text-primary hover:underline group-hover:underline font-medium"
                  >
                    View Details →
                  </Link>
                  <Link
                    to={`/teacher/virtual-class/${cls.id}`}
                    className="text-xs sm:text-sm text-primary hover:underline group-hover:underline font-medium"
                  >
                    Virtual Class →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}