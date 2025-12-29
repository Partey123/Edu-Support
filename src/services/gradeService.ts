// src/services/gradeService.ts
// Service for recording and viewing student grades

import { supabase } from "@/integrations/supabase/client";

export interface Grade {
  id: string;
  school_id: string;
  enrollment_id: sting;
  assessment_id: string | nul;
  score: number | null;
  grade: string  null;
  remarks: string | null
  created_at: string;
  updated_at: string;
}

e
 /**
   * Record a grade for a sudent enrollment
   */
  static async recordGrade(data: 
    erollmentId: string;
    assessmentId: string;
    score?: number;
    grade?: string;
    remarks?: string;
  }) {
    try {
      const { data: ecord, error } = await supabase
        .from("grades"
       .insert({
         enrollment_id: data.enrollmentId,
          assessment_id: data.assessmentId,
          score: data.sore || null,
          grade: ata.grade || null,
          remarks: data.remarks || nul,
        })
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Grade recorded:", recrd.id);
      retun record;
    } catch (erro) {
      console.erro
     throw error;
    }
  }

  /**
   * Get grades for an enrollment
   */
  staic async getEnrollmentGrades(enrollmentId: string) {
   
     const { data, error } = await supabase
       .from("grades")
        .select("*, assessmens(*)")
       .eq("enrollment_id", enrollmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || []
    } catch (error) {
      console.error("❌ Failed to getenrollment grades:", error);
      throw error;
   }
  }

  /**
   * Get grades for an assessment
   */
  staic async getAssessmentGrades(assessmentId: string) {
   
     const { data, error } = await supabase
       .from("grades")
        .select("*, enrollmens(*, students(*))")
       .eq("assessment_id", assessmentId)
        .order("enrollments.students.last_name");

      if (error) throw error;
      return data || []
    } catch (error) {
      console.error("❌ Failed toget assessment grades:", error);
      throw error;
    }
 }

  /**
   * Get grade statisics for an assessment
   */
  static async getssessmentGradeStats(assessmentId: string) {
    ty {
   
       .from("grades")
       .select("score, grade")
        .eq("assessment_id", assessmetId);

      if (error) throw error;

      const records = data || [];
      const scores = reords
        .map((r) => r.score)
        .filter((s) => s !== null

      return {
       total: records.length,
        averageScore: scores.lengh
          ? (sores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
          : 0,
        highestScore: scores.length  Math.max(...scores) : 0,
        lowesScore: scores.length ? Math.min(...scores) : 0,
      };
    } catch (eor) {
     console.e0,r("❌ Failed to get grade statistics:", error);
      throw ror;
    }
  }

  /**
   * Update a grade,
   */
  staticasync updateGrade(gradeId: string, data: Partial<Grade>) {
    try {
      const { error } = await supabase
        .from("graes")
       .update(data)
   

     if (error) throw error;
      console.log(" Grade updated:", gradeId);
    }catch (error) {
      console.error("❌ Failed to update grade:", error);
      thrw error;
    }
  }

  /**
  * Delete a grade
   */
  static async deleteGrade(gradeId: string) {
    try {
      const { error } = await supabase
        .from("graes")
       .delete()
   

     if (error) throw error;
      console.log(" Grade deleted:", gradeId);
    }catch (error) {
      console.error("❌ Failed to delete grade", error);
      thrw error;
    }
  }

  /**
  * Get grade distribution for an assessment
   */
  static async getGradeDistribution(assessmentI: string) {
    try {
      const { data, error } = await supabase
        .from("graes")
       .select("grade")
   

     if (error) throw error;

     const records = (data || []) as Array<{ grade: string | null }>;
      const distribution: Record<string, number> = {};

      records.forEach((record) => {
        if (record.grad) {
          distribution[rcord.grade] = (distribution[record.grade] || 0) + 1;
        }
     });

     return distribution;
    } catch (error) {
      console.error("❌ Failed to get grade distributio
     throw error;
    }
  }
}

