import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  Clock, 
  Upload, 
  FileText,
  ArrowLeft,
  Loader2,
  Plus,
  X,
  Video
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherClasses, useClassStudents } from "@/hooks/useSchoolData";
import { useToast } from "@/hooks/use-toast";
import { VideoStream } from "@/components/virtual-class/VideoStream";
import { supabase } from "@/integrations/supabase/client";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  file_url?: string;
  created_at: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  duration: number;
  total_questions: number;
  file_url?: string;
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  topic: string;
  file_url?: string;
  created_at: string;
}

export default function TeacherVirtualClass() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses();
  
  // Default to first class if no ID provided
  const classId = id || (classes.length > 0 ? classes[0].id : "");
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useClassStudents(classId);

  const classData = classes.find(c => c.id === classId);

  const [activeTab, setActiveTab] = useState("lesson");
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [classSubjectId, setClassSubjectId] = useState<string | null>(null);

  // Lesson State
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    content: "",
    topic: "",
  });

  // Load class subject ID first (needed for lessons)
  useEffect(() => {
    if (!classId || !classData?.school_id) return;
    
    const fetchClassSubject = async () => {
      try {
        // Get the first class_subject for this class
        const { data, error } = await supabase
          .from('class_subjects')
          .select('id')
          .eq('class_id', classId)
          .eq('school_id', classData.school_id)
          .is('deleted_at', null)
          .limit(1);
        
        if (error) throw error;
        
        // Check if class_subject exists
        if (!data || data.length === 0) {
          console.log('⚠️ No class subject found, creating one...');
          
          // Check if a default subject exists
          const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id')
            .eq('school_id', classData.school_id)
            .is('deleted_at', null)
            .limit(1);
          
          if (subjectsError) throw subjectsError;
          
          let subjectId: string;
          
          // If no subjects exist, create a default one
          if (!subjects || subjects.length === 0) {
            const { data: newSubject, error: subjectError } = await supabase
              .from('subjects')
              .insert({
                school_id: classData.school_id,
                name: 'General',
                code: 'GEN',
                description: 'Default subject for class',
                created_by: user?.id,
              })
              .select('id')
              .single();
            
            if (subjectError) {
              console.error('Failed to create default subject:', subjectError);
              toast({
                title: "Setup Error",
                description: "Failed to initialize class subject. Please contact support.",
                variant: "destructive",
              });
              return;
            }
            
            subjectId = newSubject.id;
          } else {
            subjectId = subjects[0].id;
          }
          
          // Now create class_subject
          const { data: newClassSubject, error: createError } = await supabase
            .from('class_subjects')
            .insert({
              school_id: classData.school_id,
              class_id: classId,
              subject_id: subjectId,
              created_by: user?.id,
            })
            .select('id')
            .single();
          
          if (createError) {
            console.error('Failed to create class subject:', createError);
            toast({
              title: "Setup Error",
              description: "Failed to initialize class subject. Check RLS policies.",
              variant: "destructive",
            });
            return;
          }
          
          setClassSubjectId(newClassSubject.id);
          return;
        }
        
        setClassSubjectId(data[0].id);
      } catch (error) {
        console.error('Error fetching class subject:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load class information",
          variant: "destructive",
        });
      }
    };
    
    fetchClassSubject();
  }, [classId, classData?.school_id, user?.id]);

  // Load lessons from database
  useEffect(() => {
    if (!classSubjectId || !classData?.school_id) return;
    
    const fetchLessons = async () => {
      setLessonsLoading(true);
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('class_subject_id', classSubjectId)
          .eq('school_id', classData.school_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setLessons(data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast({
          title: "Error",
          description: "Failed to load lessons",
          variant: "destructive",
        });
      } finally {
        setLessonsLoading(false);
      }
    };
    
    fetchLessons();
  }, [classSubjectId, classData?.school_id]);

  // Exam State
  const [exams, setExams] = useState<Exam[]>([
    {
      id: "1",
      title: "Calculus Midterm Exam",
      description: "Mid-semester assessment covering derivatives and integrals",
      scheduled_date: "2025-01-10",
      duration: 120,
      total_questions: 30,
      created_at: "2025-12-27",
    },
  ]);

  const [showExamForm, setShowExamForm] = useState(false);
  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    duration: 60,
    total_questions: 10,
  });

  // Assignment State
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "Solve Derivatives Problems",
      description: "Complete exercises from chapter 3, problems 1-50",
      due_date: "2025-01-03",
      created_at: "2025-12-27",
    },
  ]);

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  // Lesson Handlers
  const handleCreateLesson = async () => {
    if (!newLesson.title || !newLesson.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    if (!classData?.school_id || !classSubjectId) {
      toast({
        title: "Error",
        description: "Class information not found",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingLesson(true);

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          school_id: classData.school_id,
          class_subject_id: classSubjectId,
          title: newLesson.title,
          description: newLesson.description,
          content: newLesson.content,
          topic: newLesson.topic,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setLessons([data, ...lessons]);
      setNewLesson({ title: "", description: "", content: "", topic: "" });
      setShowLessonForm(false);
      
      toast({
        title: "Lesson created",
        description: `"${data.title}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create lesson",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id 
        })
        .eq('id', id);

      if (error) throw error;

      setLessons(lessons.filter(l => l.id !== id));
      
      toast({
        title: "Lesson deleted",
        description: "The lesson has been removed.",
      });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete lesson",
        variant: "destructive",
      });
    }
  };

  const handleStartLiveStream = async (lessonId: string) => {
    if (!classData?.school_id) {
      toast({
        title: "Error",
        description: "School information not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const channelName = `class-${classId}-lesson-${lessonId}-${Date.now()}`;
      
      const { data: session, error: sessionError } = await supabase
        .from('video_sessions')
        .insert({
          school_id: classData.school_id,
          class_id: classId,
          lesson_id: lessonId,
          channel_name: channelName,
          session_type: 'lesson',
          status: 'live',
          host_id: user?.id,
          actual_start_time: new Date().toISOString(),
          created_by: user?.id,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { error: lessonError } = await supabase
        .from('lessons')
        .update({ 
          is_live: true,
          video_session_id: session.id,
          updated_by: user?.id 
        })
        .eq('id', lessonId);

      if (lessonError) throw lessonError;

      setActiveSessionId(session.id);
      setIsStreamingActive(true);
      
      toast({
        title: "Stream started",
        description: "Live stream is now active.",
      });
    } catch (error) {
      console.error("Error starting stream:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start stream",
        variant: "destructive",
      });
    }
  };

  const handleStopLiveStream = async () => {
    if (!activeSessionId) return;

    try {
      const { error: sessionError } = await supabase
        .from('video_sessions')
        .update({ 
          status: 'ended',
          end_time: new Date().toISOString(),
          updated_by: user?.id 
        })
        .eq('id', activeSessionId);

      if (sessionError) throw sessionError;

      const { error: lessonError } = await supabase
        .from('lessons')
        .update({ 
          is_live: false,
          updated_by: user?.id 
        })
        .eq('video_session_id', activeSessionId);

      if (lessonError) throw lessonError;

      setIsStreamingActive(false);
      setActiveSessionId(null);
      
      toast({
        title: "Stream ended",
        description: "Live stream has been stopped.",
      });
    } catch (error) {
      console.error("Error stopping stream:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop stream",
        variant: "destructive",
      });
    }
  };

  // Exam Handlers
  const handleCreateExam = () => {
    if (!newExam.title || !newExam.scheduled_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and scheduled date",
        variant: "destructive",
      });
      return;
    }

    const exam: Exam = {
      id: String(exams.length + 1),
      title: newExam.title,
      description: newExam.description,
      scheduled_date: newExam.scheduled_date,
      duration: newExam.duration,
      total_questions: newExam.total_questions,
      created_at: new Date().toISOString(),
    };

    setExams([...exams, exam]);
    setNewExam({ title: "", description: "", scheduled_date: "", duration: 60, total_questions: 10 });
    setShowExamForm(false);
    toast({
      title: "Exam created",
      description: `"${exam.title}" has been scheduled.`,
    });
  };

  const handleDeleteExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
    toast({
      title: "Exam deleted",
      description: "The exam has been removed.",
    });
  };

  // Assignment Handlers
  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.due_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and due date",
        variant: "destructive",
      });
      return;
    }

    const assignment: Assignment = {
      id: String(assignments.length + 1),
      title: newAssignment.title,
      description: newAssignment.description,
      due_date: newAssignment.due_date,
      created_at: new Date().toISOString(),
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({ title: "", description: "", due_date: "" });
    setShowAssignmentForm(false);
    toast({
      title: "Assignment created",
      description: `"${assignment.title}" has been assigned to the class.`,
    });
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    toast({
      title: "Assignment deleted",
      description: "The assignment has been removed.",
    });
  };

  const isLoading = classesLoading || studentsLoading;

  // Early return for errors
  if (studentsError) {
    return (
      <DashboardLayout role="teacher" schoolName="Error">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-6 bg-red-50 border-red-200 max-w-md">
            <h2 className="font-semibold text-red-900 mb-2">Error Loading Students</h2>
            <p className="text-sm text-red-700 mb-4">
              {studentsError instanceof Error ? studentsError.message : "Failed to load student list"}
            </p>
            <Button asChild variant="outline">
              <Link to="/teacher/classes">Back to Classes</Link>
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout role="teacher" schoolName="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!classData) {
    return (
      <DashboardLayout role="teacher" schoolName="Class Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Class not found</p>
          <Button asChild>
            <Link to="/teacher/classes">Back to Classes</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const schoolName = "Your School";

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
              {classData.name} - Virtual Classroom
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {students.length} Students
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="lesson">Lesson</TabsTrigger>
          <TabsTrigger value="exam">Exam</TabsTrigger>
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
        </TabsList>

        {/* Lesson Tab */}
        <TabsContent value="lesson" className="mt-6">
          {/* Active Stream */}
          {isStreamingActive && activeSessionId && (
            <div className="mb-6">
              <VideoStream
                classId={classId}
                className={classData?.name || "Class"}
                teacherId={user?.id || ""}
                sessionId={activeSessionId}
                onClose={handleStopLiveStream}
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Class Lessons</h2>
              <Button onClick={() => setShowLessonForm(!showLessonForm)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Lesson
              </Button>
            </div>

            {/* Lesson Form */}
            {showLessonForm && (
              <Card className="p-4 space-y-4">
                <Input
                  placeholder="Lesson Title"
                  value={newLesson.title}
                  onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                />
                <Input
                  placeholder="Topic"
                  value={newLesson.topic}
                  onChange={e => setNewLesson({ ...newLesson, topic: e.target.value })}
                />
                <Input
                  placeholder="Brief Description"
                  value={newLesson.description}
                  onChange={e => setNewLesson({ ...newLesson, description: e.target.value })}
                />
                <Textarea
                  placeholder="Lesson Content"
                  value={newLesson.content}
                  onChange={e => setNewLesson({ ...newLesson, content: e.target.value })}
                  className="min-h-32"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateLesson} 
                    className="flex-1"
                    disabled={isCreatingLesson}
                  >
                    {isCreatingLesson ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Lesson"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLessonForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Lessons List */}
            <div className="space-y-3">
              {lessons.map(lesson => (
                <Card key={lesson.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{lesson.topic}</p>
                      <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                      <div className="bg-muted p-3 rounded text-sm text-foreground max-h-24 overflow-y-auto">
                        {lesson.content}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartLiveStream(lesson.id)}
                        disabled={isStreamingActive}
                        className="gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Go Live
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(lesson.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>

            {lessons.length === 0 && !showLessonForm && (
              <Card className="p-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No lessons yet. Create your first lesson.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Exam Tab */}
        <TabsContent value="exam" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Class Exams</h2>
              <Button onClick={() => setShowExamForm(!showExamForm)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Schedule Exam
              </Button>
            </div>

            {/* Exam Form */}
            {showExamForm && (
              <Card className="p-4 space-y-4">
                <Input
                  placeholder="Exam Title"
                  value={newExam.title}
                  onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newExam.description}
                  onChange={e => setNewExam({ ...newExam, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Scheduled Date</label>
                    <Input
                      type="date"
                      value={newExam.scheduled_date}
                      onChange={e => setNewExam({ ...newExam, scheduled_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={newExam.duration}
                      onChange={e => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Questions</label>
                    <Input
                      type="number"
                      value={newExam.total_questions}
                      onChange={e => setNewExam({ ...newExam, total_questions: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateExam} className="flex-1">
                    Schedule Exam
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowExamForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Exams List */}
            <div className="space-y-3">
              {exams.map(exam => (
                <Card key={exam.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{exam.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(exam.scheduled_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {exam.duration} mins
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {exam.total_questions} questions
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {exams.length === 0 && !showExamForm && (
              <Card className="p-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No exams scheduled. Schedule your first exam.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Assignment Tab */}
        <TabsContent value="assignment" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Class Assignments</h2>
              <Button onClick={() => setShowAssignmentForm(!showAssignmentForm)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Assignment
              </Button>
            </div>

            {/* Assignment Form */}
            {showAssignmentForm && (
              <Card className="p-4 space-y-4">
                <Input
                  placeholder="Assignment Title"
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="min-h-24"
                />
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newAssignment.due_date}
                    onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAssignment} className="flex-1">
                    Create Assignment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignmentForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Assignments List */}
            <div className="space-y-3">
              {assignments.map(assignment => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {assignments.length === 0 && !showAssignmentForm && (
              <Card className="p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No assignments yet. Create your first assignment.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
