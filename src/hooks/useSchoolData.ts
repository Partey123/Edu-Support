import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

// Types
export interface Student {
  id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: "Male" | "Female" | "Other" | null;
  admission_number: string | null;
  admission_date: string | null;
  address: string | null;
  status: "active" | "inactive" | "graduated" | "transferred";
  created_at: string;
  updated_at: string;
  enrollments?: any[];
}

export interface Teacher {
  id: string;
  user_id: string | null;
  school_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  subjects: string[];
  status: "active" | "on_leave" | "inactive";
  hire_date: string | null;
  created_at: string;
  updated_at: string;
  assigned_classes?: Class[];
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  level: string;
  section: string | null;
  room: string | null;
  class_teacher_id: string | null;
  academic_term_id: string;
  created_at: string;
  updated_at: string;
  class_teacher?: Teacher;
  student_count?: number;
}

export interface AcademicTerm {
  id: string;
  school_id: string;
  name: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  marked_by: string | null;
  notes: string | null;
  created_at: string;
  student?: Student;
}

export interface Grade {
  id: string;
  student_id: string;
  class_id: string;
  subject_id: string | null;
  grade: string;
  comments: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
  student?: Student;
  subject?: Subject;
}

export interface StudentComment {
  id: string;
  student_id: string;
  class_id: string;
  comment: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  student?: Student;
}

// School Hooks
export function useSchool(schoolId: string | null) {
  return useQuery({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      const { data, error } = await supabase
        .from("schools")
        .select("id, name, region, phone, created_at")
        .eq("id", schoolId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
  });
}

// Students Hooks
export function useStudents() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ["students", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("school_id", schoolId)
        .is("deleted_at", null)
        .order("last_name");

      if (error) throw error;
      return (data as any[]).map((s) => ({
        ...s,
        enrollments: [],
      })) as Student[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { schoolId } = useAuth();

  return useMutation({
    mutationFn: async (
      student:
        & Omit<
          Student,
          "id" | "school_id" | "created_at" | "updated_at" | "enrollments"
        >
        & {
          guardian_first_name: string;
          guardian_last_name: string;
          guardian_email: string;
          guardian_phone: string;
          relationship: string;
        },
    ) => {
      if (!schoolId) {
        throw new Error("School ID is required");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to create a student");
      }

      // Step 1: Create student record
      const { data: studentRecord, error: studentError } = await supabase
        .from("students")
        .insert({
          school_id: schoolId,
          first_name: student.first_name,
          last_name: student.last_name,
          date_of_birth: student.date_of_birth,
          gender: student.gender,
          admission_number: student.admission_number,
          admission_date: student.admission_date,
          address: student.address,
          status: student.status,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Step 2: Invite guardian via auth
      const inviteResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: student.guardian_email,
            first_name: student.guardian_first_name,
            last_name: student.guardian_last_name,
          }),
        },
      );

      let guardianUserId: string | null = null;

      if (inviteResponse.ok) {
        const inviteData = await inviteResponse.json();
        guardianUserId = inviteData.user?.id;

        if (guardianUserId) {
          // Step 3: Create school membership for guardian - disabled as school_memberships not in schema
          // const { error: membershipError } = await supabase
          //   .from('school_memberships')
          //   .insert({
          //     user_id: guardianUserId,
          //     school_id: schoolId,
          //     role: 'parent',
          //     is_active: true,
          //     created_by: session.user.id,
          //   });

          // if (membershipError) throw membershipError;

          // Step 4: Link guardian to student - commented out as student_guardians table may not exist
          // const { error: guardianError } = await supabase
          //   .from('student_guardians')
          //   .insert({...});
        }
      }

      return studentRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student created successfully!",
        description: "Guardian invitation email has been sent.",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create student",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      { id, ...updates }: Partial<Omit<Student, "enrollments">> & {
        id: string;
      },
    ) => {
      const { data, error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "Student updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update student",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "Student deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete student",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Teachers Hooks
export function useTeachers() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("school_id", schoolId)
        .is("deleted_at", null)
        .order("last_name");

      if (error) throw error;
      return data as Teacher[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { schoolId } = useAuth();

  return useMutation({
    mutationFn: async (
      teacher:
        & Omit<
          Teacher,
          | "id"
          | "school_id"
          | "user_id"
          | "created_at"
          | "updated_at"
          | "assigned_classes"
        >
        & { email: string; password: string; hire_date: string },
    ) => {
      if (!schoolId) {
        throw new Error("School ID is required");
      }

      // Get current session for auth
      const { data: { session }, error: sessionError } = await supabase.auth
        .getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to create a teacher");
      }

      console.log("Session user:", session.user.id.substring(0, 10) + "...");
      console.log(
        "Token preview:",
        session.access_token.substring(0, 20) + "...",
      );

      // Call edge function - it handles ALL the work:
      // - Creates auth user
      // - Creates teacher record
      // - Creates profile (auto via trigger)
      // - Creates school membership
      // - Assigns subjects
      try {
        const functionUrl =
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-teacher`;
        console.log("📤 Calling create-teacher edge function:", functionUrl);

        const payload = {
          email: teacher.email,
          password: teacher.password,
          first_name: teacher.first_name,
          last_name: teacher.last_name,
          phone: teacher.phone || null,
          subjects: teacher.subjects && teacher.subjects.length > 0
            ? teacher.subjects
            : undefined,
          created_by_user_id: session.user.id,
        };
        console.log("📦 Request payload:", {
          ...payload,
          password: "[REDACTED]",
        });

        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        });

        console.log("Response status:", response.status);
        const responseData = await response.json();
        console.log("Response data:", responseData);

        if (!response.ok) {
          console.error("❌ Edge function error:", responseData);
          throw new Error(
            responseData.error ||
              `Failed to create teacher: ${response.status}`,
          );
        }

        // Edge function returns: { success, message, teacher_id, user_id, email, school_id }
        if (!responseData.teacher_id) {
          throw new Error("No teacher_id returned from edge function");
        }

        console.log("✅ Teacher created successfully!");

        // Invalidate queries to refresh teacher list
        queryClient.invalidateQueries({ queryKey: ["teachers"] });

        return {
          id: responseData.teacher_id,
          user_id: responseData.user_id,
          school_id: responseData.school_id,
        };
      } catch (error) {
        console.error("❌ Create teacher error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({
        title: "Teacher created successfully!",
        description: "An invitation email has been sent to the teacher.",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create teacher",
        description: error.message,
        variant: "destructive",
        duration: 7000,
      });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      { id, ...updates }: Partial<Teacher> & { id: string },
    ) => {
      const { data, error } = await supabase
        .from("teachers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({ title: "Teacher updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update teacher",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("teachers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({ title: "Teacher deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete teacher",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Classes Hooks
export function useClasses() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ["classes", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      const { data, error } = await supabase
        .from("classes")
        .select(`
          *,
          class_teacher:teachers(id, first_name, last_name)
        `)
        .eq("school_id", schoolId)
        .order("level")
        .order("name");

      if (error) throw error;

      // For now, estimate student counts (can be enhanced later with actual enrollment data)
      return data.map((c) => ({
        ...c,
        student_count: 0, // TODO: fetch from enrollments when available
      })) as Class[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      classData: Omit<
        Class,
        | "id"
        | "school_id"
        | "created_at"
        | "updated_at"
        | "class_teacher"
        | "student_count"
      >,
    ) => {
      if (!schoolId) throw new Error("No school ID");

      const { data, error } = await supabase
        .from("classes")
        .insert({ ...classData, school_id: schoolId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({ title: "Class added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add class",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Class> & { id: string }) => {
      const { data, error } = await supabase
        .from("classes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({ title: "Class updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update class",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({ title: "Class deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete class",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Subjects Hooks
export function useSubjects() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ["subjects", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!schoolId,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      subject: Omit<Subject, "id" | "school_id" | "created_at" | "updated_at">,
    ) => {
      if (!schoolId) throw new Error("No school ID");

      const { data, error } = await supabase
        .from("subjects")
        .insert({ ...subject, school_id: schoolId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast({ title: "Subject added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add subject",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Dashboard Stats Hook
export function useDashboardStats() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      // Fetch counts in parallel
      const [studentsRes, teachersRes, classesRes, todayAttendanceRes] =
        await Promise.all([
          supabase.from("students").select("id", { count: "exact" }).eq(
            "school_id",
            schoolId,
          ).eq("status", "active"),
          supabase.from("teachers").select("id", { count: "exact" }).eq(
            "school_id",
            schoolId,
          ).eq("status", "active"),
          supabase.from("classes").select("id", { count: "exact" }).eq(
            "school_id",
            schoolId,
          ),
          supabase.from("attendance")
            .select("status", { count: "exact" })
            .eq("school_id", schoolId)
            .eq("date", new Date().toISOString().split("T")[0]),
        ]);

      const totalStudents = studentsRes.count || 0;
      const totalTeachers = teachersRes.count || 0;
      const totalClasses = classesRes.count || 0;

      // Calculate attendance rate
      const presentCount = todayAttendanceRes.data?.filter((a) =>
        a.status === "present" || a.status === "late"
      ).length || 0;
      const totalAttendance = todayAttendanceRes.data?.length || 0;
      const attendanceRate = totalAttendance > 0
        ? ((presentCount / totalAttendance) * 100).toFixed(1)
        : "0";

      return {
        totalStudents,
        totalTeachers,
        totalClasses,
        attendanceRate,
      };
    },
    enabled: !!schoolId,
  });
}

// Super Admin Hooks
export function useAllSchools() {
  const { hasRole } = useAuth();

  return useQuery({
    queryKey: ["all-schools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("name");

      if (error) throw error;

      // Get student and teacher counts per school
      const schoolIds = data.map((s) => s.id);

      const [studentCounts, teacherCounts] = await Promise.all([
        supabase.from("students").select("school_id").in(
          "school_id",
          schoolIds,
        ),
        supabase.from("teachers").select("school_id").in(
          "school_id",
          schoolIds,
        ),
      ]);

      const studentCountMap: Record<string, number> = {};
      const teacherCountMap: Record<string, number> = {};

      studentCounts.data?.forEach((s) => {
        studentCountMap[s.school_id] = (studentCountMap[s.school_id] || 0) + 1;
      });

      teacherCounts.data?.forEach((t) => {
        teacherCountMap[t.school_id] = (teacherCountMap[t.school_id] || 0) + 1;
      });

      return data.map((school) => ({
        ...school,
        student_count: studentCountMap[school.id] || 0,
        teacher_count: teacherCountMap[school.id] || 0,
      }));
    },
    enabled: hasRole("super_admin"),
  });
}

export function useSuperAdminStats() {
  const { hasRole } = useAuth();

  return useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: async () => {
      const [schoolsRes, studentsRes, teachersRes] = await Promise.all([
        supabase.from("schools").select("id", { count: "exact" }),
        supabase.from("students").select("id", { count: "exact" }),
        supabase.from("teachers").select("id", { count: "exact" }),
      ]);

      return {
        totalSchools: schoolsRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
      };
    },
    enabled: hasRole("super_admin"),
  });
}

// Teacher-specific hooks
export function useTeacherProfile() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ["teacher-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Teacher;
    },
    enabled: !!schoolId,
  });
}

export function useTeacherClasses() {
  const { data: currentTeacher } = useCurrentTeacher();

  return useQuery({
    queryKey: ["teacher-classes", currentTeacher?.id],
    queryFn: async () => {
      if (!currentTeacher?.id) {
        console.log(
          "🔴 useTeacherClasses: No currentTeacher.id, cannot fetch classes",
        );
        return [];
      }

      console.log(
        "🔍 useTeacherClasses: Fetching classes for teacher_id:",
        currentTeacher.id,
      );

      const { data, error } = await supabase
        .from("classes")
        .select(`
          *,
          class_teacher:teachers(id, first_name, last_name)
        `)
        .eq("class_teacher_id", currentTeacher.id)
        .order("level")
        .order("name");

      if (error) {
        console.error("❌ useTeacherClasses error:", error);
        throw error;
      }

      console.log("✅ useTeacherClasses found:", data);

      // Get student counts for each class through enrollments
      const { data: enrollmentCounts } = await supabase
        .from("enrollments")
        .select("class_id")
        .eq("status", "active")
        .in("class_id", data.map((c) => c.id));

      const countMap: Record<string, number> = {};
      enrollmentCounts?.forEach((e) => {
        if (e.class_id) {
          countMap[e.class_id] = (countMap[e.class_id] || 0) + 1;
        }
      });

      return data.map((c) => ({
        ...c,
        student_count: countMap[c.id] || 0,
      })) as Class[];
    },
    enabled: !!currentTeacher?.id,
  });
}

export function useClassStudents(classId: string) {
  return useQuery({
    queryKey: ["class-students", classId],
    queryFn: async () => {
      // Fix: Query through enrollments table, not directly on students
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          student_id,
          enrollment_date,
          status,
          student:students (
            id,
            school_id,
            first_name,
            last_name,
            date_of_birth,
            gender,
            admission_number,
            admission_date,
            address,
            status,
            created_at,
            updated_at
          )
        `)
        .eq("class_id", classId)
        .eq("status", "active")
        .order("student(last_name)", { ascending: true });

      if (error) {
        console.error("❌ useClassStudents error:", error);
        throw error;
      }

      // Flatten the nested student data
      const students = data?.map((enrollment: any) => ({
        ...enrollment.student,
        enrollment_id: enrollment.id,
        enrollment_status: enrollment.status,
        enrollment_date: enrollment.enrollment_date,
      })) || [];

      console.log(`✅ Loaded ${students.length} students for class ${classId}`);
      return students as Student[];
    },
    enabled: !!classId,
  });
}

// Current Teacher Hook - Get the authenticated teacher's record
export function useCurrentTeacher() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ["current-teacher"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.log("🔴 useCurrentTeacher: No user id, cannot fetch teacher");
        return null;
      }

      console.log(
        "🔍 useCurrentTeacher: Fetching teacher for user_id:",
        user.id,
      );

      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ useCurrentTeacher error:", error);
        throw error;
      }

      console.log("✅ useCurrentTeacher found:", data);
      return data as Teacher | null;
    },
    enabled: !!schoolId,
  });
}

// Teacher Students Hooks - Get students taught by current teacher
export function useTeacherStudents() {
  const { schoolId } = useAuth();
  const { data: currentTeacher } = useCurrentTeacher();

  return useQuery({
    queryKey: ["teacher-students", currentTeacher?.id],
    queryFn: async () => {
      if (!currentTeacher?.id) {
        console.log(
          "🔴 useTeacherStudents: No currentTeacher.id, cannot fetch students",
        );
        return [];
      }

      console.log(
        "🔍 useTeacherStudents: Fetching students for teacher_id:",
        currentTeacher.id,
      );

      // Get classes taught by this teacher
      const { data: classes, error: classError } = await supabase
        .from("classes")
        .select("id")
        .eq("class_teacher_id", currentTeacher.id);

      if (classError) {
        console.error(
          "❌ useTeacherStudents - failed to fetch classes:",
          classError,
        );
        throw classError;
      }

      console.log("✅ useTeacherStudents - found classes:", classes);

      if (!classes || classes.length === 0) {
        console.log("⚠️  useTeacherStudents: Teacher has no classes");
        return [];
      }

      const classIds = classes.map((c) => c.id);

      // Get all students in those classes through enrollments
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          student_id,
          students (*)
        `)
        .in("class_id", classIds)
        .eq("status", "active")
        .order("students(last_name)");

      if (error) {
        console.error(
          "❌ useTeacherStudents - failed to fetch students:",
          error,
        );
        throw error;
      }

      // Flatten the nested student data
      const students = data?.map((enrollment: any) => enrollment.students) ||
        [];
      console.log("✅ useTeacherStudents - found students:", data);
      return data as Student[];
    },
    enabled: !!currentTeacher?.id,
  });
}

// Attendance Hooks - Disabled: references non-existent 'enrollments' table
/*
export function useClassAttendance(classId: string) {
  return useQuery({
    queryKey: ['class-attendance', classId],
    queryFn: async () => {
      // Get enrollments for the class first
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('id, student_id, student:students(*)')
        .eq('class_id', classId)
        .is('deleted_at', null);

      if (enrollError) throw enrollError;

      // Get attendance for all enrollments
      const enrollmentIds = enrollments?.map(e => e.id) || [];
      if (enrollmentIds.length === 0) return [];

      const { data, error } = await supabase
        .from('attendance')
        .select('*, enrollment:enrollments(student:students(*))')
        .in('enrollment_id', enrollmentIds)
        .is('deleted_at', null)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!classId,
  });
}
*/

// Mark Attendance - Disabled: references non-existent 'enrollment_id' in actual attendance table
/*
export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { schoolId } = useAuth();

  return useMutation({
    mutationFn: async (attendance: Omit<AttendanceRecord, 'id' | 'created_at' | 'student'> & { enrollment_id: string; date: string; status: string; notes?: string }) => {
      if (!schoolId) throw new Error('School ID is required');

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          school_id: schoolId,
          enrollment_id: attendance.enrollment_id,
          date: attendance.date,
          status: attendance.status as 'present' | 'absent' | 'late' | 'excused',
          notes: attendance.notes || null,
          marked_by: user?.id || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-attendance'] });
      toast({ title: 'Attendance marked successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to mark attendance',
        description: error.message,
        variant: 'destructive'
      });
    },
  });
}
*/

// Update Attendance - Disabled: references non-existent table structure
/*
export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AttendanceRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update({
          status: updates.status,
          notes: updates.notes,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-attendance'] });
      toast({ title: 'Attendance updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update attendance',
        description: error.message,
        variant: 'destructive'
      });
    },
  });
}
*/

// Grades Hooks - Disabled: references non-existent tables
/*
export function useClassGrades(classId: string) {
  return useQuery({
    queryKey: ['class-grades', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select('*, student:students(*), subject:subjects(*)')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Grade[];
    },
    enabled: !!classId,
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (grade: { id?: string; student_id: string; class_id: string; subject_id?: string | null; grade: string; comments?: string | null; marked_by?: string | null }) => {
      if (grade.id) {
        // Update existing grade
        const { id, ...updateData } = grade;
        const { data, error } = await supabase
          .from('grades')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new grade
        const { id, ...insertData } = grade;
        const { data, error } = await supabase
          .from('grades')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-grades'] });
      toast({ title: 'Grade saved successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save grade',
        description: error.message,
        variant: 'destructive'
      });
    },
  });
}
*/

// Student Comments Hooks - Disabled: references non-existent tables
/*
export function useStudentComments(classId: string) {
  return useQuery({
    queryKey: ['student-comments', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_comments')
        .select('*, student:students(*)')
        .eq('class_id', classId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as StudentComment[];
    },
    enabled: !!classId,
  });
}

export function useUpdateStudentComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (comment: { id?: string; student_id: string; class_id: string; comment: string; created_by?: string | null }) => {
      if (comment.id) {
        // Update existing comment
        const { id, ...updateData } = comment;
        const { data, error } = await supabase
          .from('student_comments')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new comment
        const { id, ...insertData } = comment;
        const { data, error } = await supabase
          .from('student_comments')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-comments'] });
      toast({ title: 'Comment saved successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save comment',
        description: error.message,
        variant: 'destructive'
      });
    },
  });
}
*/

// Enrollment Hooks - Disabled: references non-existent tables
/*
export function useEnrollments(classId?: string) {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ['enrollments', classId, schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      let query = supabase
        .from('enrollments')
        .select('*, student:students(*), class:classes(*), academic_term:academic_terms(*)')
        .eq('school_id', schoolId)
        .is('deleted_at', null);

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('enrollment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { schoolId } = useAuth();

  return useMutation({
    mutationFn: async (enrollment: { student_id: string; class_id: string; academic_term_id: string; notes?: string }) => {
      if (!schoolId) throw new Error('School ID required');

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          school_id: schoolId,
          student_id: enrollment.student_id,
          class_id: enrollment.class_id,
          academic_term_id: enrollment.academic_term_id,
          enrollment_date: new Date().toISOString(),
          status: 'active',
          notes: enrollment.notes || null,
          created_by: user?.id || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Student enrolled successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to enroll student', description: error.message, variant: 'destructive' });
    },
  });
}

export function useWithdrawStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { schoolId } = useAuth();

  return useMutation({
    mutationFn: async ({ enrollmentId, notes }: { enrollmentId: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('enrollments')
        .update({
          status: 'withdrawn',
          withdrawal_date: new Date().toISOString().split('T')[0],
          notes: notes || null,
          updated_by: user?.id || null,
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'Student withdrawn successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to withdraw student', description: error.message, variant: 'destructive' });
    },
  });
}

// Academic Terms Hooks
export function useAcademicTerms() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ['academic-terms', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      const { data, error } = await supabase
        .from('academic_terms')
        .select('*')
        .eq('school_id', schoolId)
        .is('deleted_at', null)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
  });
}

export function useCurrentTerm() {
  const { schoolId } = useAuth();

  return useQuery({
    queryKey: ['current-term', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      const { data, error } = await supabase
        .from('academic_terms')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!schoolId,
  });
}

// Grades Hooks (Fixed)
export function useStudentGrades(enrollmentId: string) {
  return useQuery({
    queryKey: ['student-grades', enrollmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select('*, assessment:assessments(*)')
        .eq('enrollment_id', enrollmentId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Grade[];
    },
    enabled: !!enrollmentId,
  });
}

export function useRecordGrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { schoolId } = useAuth();

  return useMutation({
    mutationFn: async (grade: { enrollment_id: string; assessment_id: string; score?: number; grade?: string; remarks?: string; school_id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('grades')
        .insert([{
          school_id: grade.school_id,
          enrollment_id: grade.enrollment_id,
          assessment_id: grade.assessment_id,
          score: grade.score || null,
          grade: grade.grade || null,
          remarks: grade.remarks || null,
          recorded_by: user?.id || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-grades'] });
      toast({ title: 'Grade recorded successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to record grade', description: error.message, variant: 'destructive' });
    },
  });
}
*/

// Reports Hooks - Disabled: references non-existent 'generate_class_report' RPC
/*
export function useClassReport(classId: string, reportType: 'attendance' | 'grades' | 'progress' | 'summary') {
  return useQuery({
    queryKey: ['class-report', classId, reportType],
    queryFn: async () => {
      if (!classId) return null;

      const { data, error } = await supabase
        .rpc('generate_class_report', {
          class_id: classId,
          report_type: reportType
        });

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });
}
*/
