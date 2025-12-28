import { Users, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherClasses, useTeacherStudents } from "@/hooks/useSchoolData";
import { Loader2 } from "lucide-react";
import { useState, useMemo } from "react";

export default function TeacherStudents() {
  const { profile } = useAuth();
  const { data: teacherClasses = [], isLoading: classesLoading } = useTeacherClasses();
  const { data: allStudents = [], isLoading: studentsLoading } = useTeacherStudents();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    let students = allStudents;
    
    // Filter by search query
    return students.filter((student) => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchQuery.toLowerCase()) ||
        (student.admission_number?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      return matchesSearch;
    });
  }, [searchQuery, allStudents]);

  const isLoading = classesLoading || studentsLoading;

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
  const totalStudents = teacherClasses.reduce((sum, cls) => sum + (cls.student_count || 0), 0);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getAttendanceBadge = (attendance: number | null) => {
    if (attendance === null || attendance === undefined) {
      return <Badge variant="outline">No Data</Badge>;
    }
    if (attendance >= 95) return <Badge className="bg-green-500">Excellent</Badge>;
    if (attendance >= 85) return <Badge className="bg-blue-500">Good</Badge>;
    if (attendance >= 75) return <Badge className="bg-yellow-500">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const calculateAttendancePercentage = (studentId: string) => {
    // This would need to be calculated from attendance records
    // For now, returning null as we need attendance data
    return null;
  };

  return (
    <DashboardLayout role="teacher" schoolName={schoolName}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          My Students
        </h1>
        <p className="text-muted-foreground">
          Manage {totalStudents} students across {teacherClasses.length} classes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No students found matching your search" : "No students found"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(student.first_name, student.last_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{student.first_name} {student.last_name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.admission_number || 'N/A'}</TableCell>
                  <TableCell>{student.gender || 'N/A'}</TableCell>
                  <TableCell>
                    {student.admission_date 
                      ? new Date(student.admission_date).toLocaleDateString() 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={student.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                    >
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
}