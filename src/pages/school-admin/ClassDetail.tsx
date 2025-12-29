import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Clock, 
  MapPin,
  AlertCircle,
  Loader2,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AddStudentsToClassDialog } from "@/components/dialogs/AddStudentsToClassDialog";
import { removeStudentFromClass } from "@/services/enrollmentService";

interface Class {
  id: string;
  name: string;
  level: string;
  section: string | null;
  room: string | null;
  class_teacher_id: string | null;
  academic_term_id: string;
  created_at: string;
  teacher?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

interface Enrollment {
  id: string;
  student_id: string;
  status: string;
  student?: {
    first_name: string | null;
    last_name: string | null;
    admission_number: string | null;
  };
}

interface AttendanceStat {
  total_sessions: number;
  average_attendance_rate: number;
}

export default function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { schoolId } = useAuth();
  const { toast } = useToast();

  const [classData, setClassData] = useState<Class | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId && schoolId) {
      fetchClassDetail();
    }
  }, [classId, schoolId]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);

      // Fetch class details
      const { data: classDataRes, error: classError } = await supabase
        .from("classes")
        .select(
          `*,
          teacher:teachers(id, first_name, last_name)`
        )
        .eq("id", classId)
        .eq("school_id", schoolId)
        .single();

      if (classError) throw classError;
      setClassData(classDataRes);

      // Fetch enrollments
      const { data: enrollmentsRes, error: enrollError } = await supabase
        .from("enrollments")
        .select(
          `*,
          student:students(first_name, last_name, admission_number)`
        )
        .eq("class_id", classId)
        .order("created_at", { ascending: true });

      if (enrollError) throw enrollError;
      setEnrollments(enrollmentsRes || []);

      // Attendance stats calculation - can be done on frontend if needed
      // For now, set to null
      setAttendanceStats(null);
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast({
        title: "Error",
        description: "Failed to load class details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    try {
      const result = await removeStudentFromClass(enrollmentId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        fetchClassDetail();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student",
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

  if (!classData) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/school-admin/classes")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </Button>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Class not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeStudents = enrollments.filter(e => e.status === "active").length;

  return (
    <DashboardLayout role="school_admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/school-admin/classes")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {classData.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {classData.form && `Form: ${classData.form}`}
                {classData.level && ` • Level: ${classData.level}`}
              </p>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold mt-1">{activeStudents}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="text-lg font-semibold mt-1">
                  {classData.subject?.name || "Not assigned"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold mt-1">
                  {attendanceStats?.average_attendance_rate
                    ? `${Math.round(attendanceStats.average_attendance_rate)}%`
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Room</p>
                <p className="text-lg font-semibold mt-1">
                  {classData.room_number || "Not assigned"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Tabs */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Enrolled Students ({enrollments.length})</CardTitle>
                <AddStudentsToClassDialog
                  classId={classData.id}
                  className={classData.name}
                  onEnrollmentSuccess={fetchClassDetail}
                />
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No students enrolled in this class
                  </p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {enrollment.student?.first_name} {enrollment.student?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.student?.admission_number}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={enrollment.status === "active" ? "default" : "secondary"}
                          >
                            {enrollment.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudent(enrollment.id)}
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

          {/* Teacher Tab */}
          <TabsContent value="teacher">
            <Card>
              <CardHeader>
                <CardTitle>Class Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                {classData.teacher ? (
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium text-gray-900">
                      {classData.teacher.first_name} {classData.teacher.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Teacher ID: {classData.teacher.id}
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No teacher assigned to this class
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Class Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Class Name</p>
                    <p className="font-medium">{classData.name}</p>
                  </div>
                  {classData.form && (
                    <div>
                      <p className="text-sm text-muted-foreground">Form</p>
                      <p className="font-medium">{classData.form}</p>
                    </div>
                  )}
                  {classData.level && (
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="font-medium">{classData.level}</p>
                    </div>
                  )}
                  {classData.max_students && (
                    <div>
                      <p className="text-sm text-muted-foreground">Max Students</p>
                      <p className="font-medium">{classData.max_students}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(classData.created_at).toLocaleDateString()}
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
