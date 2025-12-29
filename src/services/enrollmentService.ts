import { supabase } from "@/integrations/supabase/client";

export interface EnrollmentData {
  id?: string;
  class_id: string;
  student_id: string;
  academic_term_id: string;
  status?: "active" | "completed" | "withdrawn" | "transferred";
}

export interface EnrollmentWithDetails extends EnrollmentData {
  class?: {
    name: string;
    level: string;
    section: string | null;
  };
  student?: {
    first_name: string | null;
    last_name: string | null;
    admission_number: string | null;
  };
}

// Enroll a student in a class
export async function enrollStudentInClass(
  studentId: string,
  classId: string,
  status: "active" | "completed" | "withdrawn" | "transferred" = "active",
): Promise<
  { success: boolean; enrollment?: EnrollmentWithDetails; message: string }
> {
  try {
    // Get class to find school_id and academic_term_id
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("school_id, academic_term_id")
      .eq("id", classId)
      .single();

    if (classError || !classData) {
      throw new Error("Class not found");
    }

    // Check if enrollment already exists for this term
    const { data: existing } = await supabase
      .from("enrollments")
      .select("*")
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .eq("academic_term_id", classData.academic_term_id)
      .single();

    if (existing) {
      return {
        success: false,
        message: "Student is already enrolled in this class",
      };
    }

    // Create enrollment
    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        student_id: studentId,
        class_id: classId,
        academic_term_id: classData.academic_term_id,
        school_id: classData.school_id,
        status,
      })
      .select(
        `*,
        class:classes(name, level, section),
        student:students(first_name, last_name, admission_number)`,
      )
      .single();

    if (error) throw error;

    return {
      success: true,
      enrollment: data as EnrollmentWithDetails,
      message: "Student successfully enrolled in class",
    };
  } catch (error) {
    console.error("Error enrolling student:", error);
    return {
      success: false,
      message: `Failed to enroll student: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Remove student from class
export async function removeStudentFromClass(
  enrollmentId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("id", enrollmentId);

    if (error) throw error;

    return {
      success: true,
      message: "Student removed from class",
    };
  } catch (error) {
    console.error("Error removing student:", error);
    return {
      success: false,
      message: `Failed to remove student: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Update enrollment status
export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: "active" | "completed" | "withdrawn" | "transferred",
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from("enrollments")
      .update({ status })
      .eq("id", enrollmentId);

    if (error) throw error;

    return {
      success: true,
      message: `Enrollment status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return {
      success: false,
      message: `Failed to update enrollment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Get students not enrolled in a class
export async function getAvailableStudentsForClass(
  classId: string,
  schoolId: string,
): Promise<any[]> {
  try {
    // Get all students in the school
    const { data: allStudents } = await supabase
      .from("students")
      .select("id, first_name, last_name, admission_number")
      .eq("school_id", schoolId)
      .order("first_name", { ascending: true });

    if (!allStudents) return [];

    // Get students already enrolled in this class
    const { data: enrolledStudents } = await supabase
      .from("enrollments")
      .select("student_id")
      .eq("class_id", classId);

    const enrolledIds = new Set(
      enrolledStudents?.map((e) => e.student_id) || [],
    );

    // Return students not enrolled
    return allStudents.filter((s) => !enrolledIds.has(s.id));
  } catch (error) {
    console.error("Error fetching available students:", error);
    return [];
  }
}

// Get available classes for a student
export async function getAvailableClassesForStudent(
  studentId: string,
  schoolId: string,
): Promise<any[]> {
  try {
    // Get current term first
    const { data: termData } = await supabase
      .from("academic_terms")
      .select("id")
      .eq("school_id", schoolId)
      .eq("is_current", true)
      .single();

    const termId = termData?.id;
    if (!termId) return [];

    // Get all classes in the school for current term
    const { data: allClasses } = await supabase
      .from("classes")
      .select("id, name, level, section, class_teacher_id")
      .eq("school_id", schoolId)
      .eq("academic_term_id", termId)
      .order("name", { ascending: true });

    if (!allClasses) return [];

    // Get classes student is already enrolled in
    const { data: enrolledClasses } = await supabase
      .from("enrollments")
      .select("class_id")
      .eq("student_id", studentId)
      .eq("academic_term_id", termId);

    const enrolledIds = new Set(enrolledClasses?.map((e) => e.class_id) || []);

    // Return classes student is not enrolled in
    return allClasses.filter((c) => !enrolledIds.has(c.id));
  } catch (error) {
    console.error("Error fetching available classes:", error);
    return [];
  }
}

// Bulk enroll multiple students in a class
export async function bulkEnrollStudents(
  classId: string,
  studentIds: string[],
  status: "active" | "completed" | "withdrawn" | "transferred" = "active",
): Promise<
  { success: boolean; enrolled: number; failed: number; message: string }
> {
  try {
    // Get class to find school_id and academic_term_id
    const { data: classData } = await supabase
      .from("classes")
      .select("school_id, academic_term_id")
      .eq("id", classId)
      .single();

    if (!classData) {
      return {
        success: false,
        enrolled: 0,
        failed: studentIds.length,
        message: "Class not found",
      };
    }

    let enrolled = 0;
    let failed = 0;

    // Prepare enrollment data
    const enrollments = studentIds.map((studentId) => ({
      student_id: studentId,
      class_id: classId,
      academic_term_id: classData.academic_term_id,
      school_id: classData.school_id,
      status,
    }));

    // Insert all at once
    const { data, error } = await supabase
      .from("enrollments")
      .insert(enrollments)
      .select();

    if (error) {
      // If bulk insert fails, try individual inserts to track which ones failed
      for (const enrollment of enrollments) {
        try {
          const { error: individualError } = await supabase
            .from("enrollments")
            .insert(enrollment);

          if (!individualError) {
            enrolled++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }
    } else {
      enrolled = data?.length || 0;
    }

    return {
      success: failed === 0,
      enrolled,
      failed,
      message: `Enrolled ${enrolled} student(s)${
        failed > 0 ? `, ${failed} failed` : ""
      }`,
    };
  } catch (error) {
    console.error("Error bulk enrolling students:", error);
    return {
      success: false,
      enrolled: 0,
      failed: studentIds.length,
      message: `Failed to bulk enroll students: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
