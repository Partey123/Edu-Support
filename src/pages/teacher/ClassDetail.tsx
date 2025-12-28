import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, Calendar, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherClasses, useClassStudents } from "@/hooks/useSchoolData";

export default function TeacherClassDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch class data
  const { data: teacherClasses = [] } = useTeacherClasses();
  const classData = teacherClasses.find(c => c.id === id);
  
  // Fetch related data
  const { data: students = [], isLoading: studentsLoading } = useClassStudents(id || "");
  
  // State for different actions
  const [gradesData, setGradesData] = useState<Record<string, string>>({});
  const [commentsData, setCommentsData] = useState<Record<string, string>>({});

  const handleGradeChange = (studentId: string, grade: string) => {
    setGradesData(prev => ({ ...prev, [studentId]: grade }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setCommentsData(prev => ({ ...prev, [studentId]: comment }));
  };

  const handleSaveGrades = () => {
    if (!id) return;
    
    Object.entries(gradesData).forEach(([studentId, grade]) => {
      if (grade) {
        // Update grade functionality disabled - grades table not in schema
      }
    });
    setGradesData({});
  };

  const handleSaveComments = () => {
    if (!id) return;
    
    Object.entries(commentsData).forEach(([studentId, comment]) => {
      if (comment) {
        // Update comment functionality disabled - student_comments table not in schema
      }
    });
    setCommentsData({});
  };

  const isLoading = studentsLoading;

  if (!classData) {
    return (
      <DashboardLayout role="teacher" schoolName="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const schoolName = 'Your School';
  const totalStudents = students.length;
  
  // Calculate average grade
  const grades: any[] = [];
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (parseInt(g.grade) || 0), 0) / grades.length).toFixed(1)
    : '--';

  return (
    <DashboardLayout role="teacher" schoolName={schoolName}>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/teacher/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {classData.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {totalStudents} Students
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Class {classData.level}
              </span>
              {classData.room && <span>Room: {classData.room}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Class Overview</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Average Grade</p>
                <p className="text-2xl font-bold">{averageGrade}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <h3 className="text-md font-semibold mb-3">Student List</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.admission_number || 'N/A'}</TableCell>
                        <TableCell>{student.first_name} {student.last_name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="mt-6">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Enter Grades</h2>
              <Button 
                onClick={handleSaveGrades}
                disabled={Object.keys(gradesData).length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Grades (Disabled - Feature Under Development)
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.admission_number || 'N/A'}</TableCell>
                      <TableCell>{student.first_name} {student.last_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Enter grade (0-100)"
                          min="0"
                          max="100"
                          value={gradesData[student.id] || ""}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          className="max-w-[200px]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-6">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Comments</h2>
              <Button 
                onClick={handleSaveComments}
                disabled={Object.keys(commentsData).length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Comments (Disabled - Feature Under Development)
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.admission_number || 'N/A'}</TableCell>
                      <TableCell>{student.first_name} {student.last_name}</TableCell>
                      <TableCell>
                        <Textarea
                          placeholder="Enter comment..."
                          value={commentsData[student.id] || ""}
                          onChange={(e) => handleCommentChange(student.id, e.target.value)}
                          className="min-h-[60px]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}