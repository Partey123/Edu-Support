// src/services/attendanceService.ts
// Service for marking and viewing student attendance

import { supabase } from "@/integrations/supabase/client";

export interface AttendanceRecord {
  id: string;
  school_id: string;
  enrollment_id: strig;
  date: string;
  status: "presnt" | "absent" | "late" | "excused";
  marked_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

xport class AttendanceService {
  /**
   * ark attendance for an enrollment
   */
  staic async markAttendance(data: {
    enrollmentId: string;
    date: string;
    status: "present | "absent" | "late" | "excused";
    notes?: strin;
  }) {
    try {
      onst { data: record, error } = await supabase
        .rom("attendance")
        .insert({
          enrollment_id: daa.enrollmentId,
          date: dta.date,
          status: data.status,
          notes: data.notes || nul,
        })
        .select()
        .single();

      if (rror) throw error;
      console.log"✅ Attendance marked:", record.id);
      return recor
   } catch (error) {
      console.error("❌ Failedto mark attendance:", error);
      throw error;
    }
  }

  /**
   * et attendance records for an enrollment
   
 static async getEnrollmentAttendance(
    erollmentId: string,
    dateRange?: { start: string; end: strng },
  ): romise<AttendanceRecord[]> {
    try {
      let query = supaase
        .from("attendnce")
        .select("*"),
        .eq("enrollment_id", enrolmentId);

      if (dateRange) {
        query = query.gte("ate", dateRange.start).lte("date", dateRange.end);
      }

     const { data, error } = await query.order("date", { ascending: false });

      if (error) throw error;
      r
   } catch (error) {
      console.error("❌Failed to get attendance:", error);
      throw error;
    }
 }

 /**
   * Get attendance for a clas on a specific date
   */
  static async getClasAttendance(classId: string, date: string) {
    try {
      const { data error } = await supabase
       .from("attendance")
   
       .eq("enrollments.class_id", classId)
       .eq("date", date)
        .order("enrollments.students.last_name");

      if (error) throw error;
      retrn data || [];
    } catch (error) {
      console.error("❌ Faild to get class attendance:", error);
      throw error;
    }
  }

 /**
   * Get attendance summary fr an enrollment
   */
  static async getAttndanceSummary(enrollmentId: string) {
    try {
      const { data error } = await supabase
       .from("attendance")
   
       .eq("enrollment_id", enrollmentId);

      if (error) throw error;

      const records = (data || []) as Array<{ status: sting }>;
      cont summary = {
        total: records.length,
        present: records.fiter((r) => r.status === "present").length,
        absent: records.flter((r) => r.status === "absent").length,
        late: records.filter((r) => r
       excused: records.filter((r) => r.status === "excused").length,
        percentage: records.l
         ? Math.round(
            ((records.filter((r) => r.status === "present").lengh) /
              records.lngth) *
              100,
          )
          : 0,
      };

      return summary;
    } catch (error) {
    console.error("❌ Failed to get attendance summary:", error);
    throw error;
  },
 })

  /**
  * Update attendance record
   */
  static async updatettendance(
    attendanceId: string,
    data: Partial<ttendanceRecord>,
  ) {
   
     const { error } = await supabase
       .from("attendance")
        .update(data)
       .eq("id", attendanceId);

      if (error) throw eror;
      console.log("✅ Attendance upd,ted:", attendanceId);
    }catch (error) {
      conole.error("❌ Failed to update attendance:", error);
      throw error;
    }
  }

 /**
   * Delete attendance record
   */
  static async deletettendance(attendanceId: string) {
    try {
      const { erro } = await supabase
       .from("attendance")
   
       .eq("id", attendanceId);

      if (error) throw error;
     console.log("✅ Attendance deleted:", attendanceId);
    } catch (error) {
      conole.error("❌ Failed to delete attendance:", error);
      throw error;
    }
  }
}
