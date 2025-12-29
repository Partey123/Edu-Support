import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  User,
  AlertCircle,
  Loader2,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AssignClassToStudentDialog } from "@/components/dialogs/AssignClassToStudentDialog";
import { removeStudentFromClass } from "@/services/enrollmentService";

interface Student {
  id: string;
  first_name: string | null;
  last_name: string | null;
  admission_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  status: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  class_id: string;
  status: string;
  class?: {
    id: string;
    name: string;
    level: string;
    section: string | null;
  };
}

interface Grade {
  id: string;
  score: number;
  grade: string;
  remarks: string | null;
  created_at: string;
  assessment_id: string;
  class?: {
    name: string;
  };
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  enrollment_id: string;
  class?: {
    name: string;
  };
}

export default function StudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { schoolId } = useAuth();
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId && schoolId) {
      fetchStudentDetail();
    }
  }, [studentId, schoolId]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);

      // Fetch student details
      const { data: studentRes, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .eq("school_id", schoolId)
        .single();

      if (studentError) throw studentError;
      setStudent(studentRes);

      // Fetch enrollments
      const { data: enrollmentsRes } = await supabase
        .from("enrollments")
        .select(
          `*,
          class:classes(id, name, level, section)`
        )
        .eq("student_id", studentId);

      if (enrollmentsRes) setEnrollments(enrollmentsRes);

      // Fetch grades using enrollment IDs
      const enrollmentIds = enrollmentsRes?.map((e) => e.id) || [];
      if (enrollmentIds.length > 0) {
        const { data: gradesRes } = await supabase
          .from("grades")
          .select(
            `*,
            enrollment:enrollments(class:classes(name, level, section))`
          )
          .in("enrollment_id", enrollmentIds)
          .order("created_at", { ascending: false });

        if (gradesRes) setGrades(gradesRes);

        // Fetch attendance
        const { data: attendanceRes } = await supabase
          .from("attendance")
          .select(
            `*,
            enrollment:enrollments(class:classes(name, level, section))`
          )
          .in("enrollment_id", enrollmentIds)
          .order("date", { ascending: false });

        if (attendanceRes) setAttendance(attendanceRes);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClass = async (enrollmentId: string) => {
    try {
      const result = await removeStudentFromClass(enrollmentId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        fetchStudentDetail();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing class:", error);
      toast({
        title: "Error",
        description: "Failed to remove class",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/school-admin/students")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Student not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeClasses = enrollments.filter(e => e.status === "active").length;
  const averageGrade =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1)
      : 0;
  const attendanceRate =
    attendance.length > 0
      ? (
          (attendance.filter(a => a.status === "present").length / attendance.length) *
          100
        ).toFixed(0)
      : 0;

  return (
    <DashboardLayout role="school_admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/school-admin/students")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-gray-600 mt-2">
                Admission #: {student.admission_number || "Not assigned"}
              </p>
            </div>
            <Badge
              variant={student.status === "active" ? "default" : "secondary"}
            >
              {student.status}
            </Badge>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Classes</p>
                <p className="text-2xl font-bold mt-1">{activeClasses}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Avg Grade</p>
                <p className="text-2xl font-bold mt-1">{averageGrade}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold mt-1">{attendanceRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="text-lg font-semibold mt-1">
                  {grades.length > 0 ? "Graded" : "Not graded"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Tabs */}
        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Enrolled Classes ({enrollments.length})</CardTitle>
                <AssignClassToStudentDialog
                  studentId={student.id}
                  studentName={`${student.first_name} ${student.last_name}`}
                  onEnrollmentSuccess={fetchStudentDetail}
                />
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Not enrolled in any classes
                  </p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() =>
                            navigate(`/school-admin/classes/${enrollment.class_id}`)
                          }
                        >
                          <p className="font-medium text-gray-900">
                            {enrollment.class?.name}
                          </p>
                          {enrollment.class?.form && (
                            <p className="text-sm text-muted-foreground">
                              Form: {enrollment.class.form}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              enrollment.status === "active" ? "default" : "secondary"
                            }
                          >
                            {enrollment.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveClass(enrollment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Grades ({grades.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No grades recorded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {grades.map((grade) => (
                      <div
                        key={grade.id}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {grade.class?.name}
                          </p>
                          <Badge variant="outline">{grade.grade}</Badge>
                        </div>
                        {grade.remarks && (
                          <p className="text-sm text-gray-600">
                            {grade.remarks}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(grade.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records ({attendance.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No attendance records yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {record.class?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            record.status === "present"
                              ? "default"
                              : record.status === "absent"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">First Name</p>
                    <p className="font-medium">{student.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    <p className="font-medium">{student.last_name}</p>
                  </div>
                  {student.date_of_birth && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {new Date(student.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {student.gender && (
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{student.gender}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-1">
                    {student.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled</p>
                  <p className="font-medium">
                    {new Date(student.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
