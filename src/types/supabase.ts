export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      academic_terms: {
        Row: {
          academic_year: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          end_date: string;
          id: string;
          is_current: boolean;
          name: string;
          school_id: string;
          start_date: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          academic_year: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          end_date: string;
          id?: string;
          is_current?: boolean;
          name: string;
          school_id: string;
          start_date: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          academic_year?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          end_date?: string;
          id?: string;
          is_current?: boolean;
          name?: string;
          school_id?: string;
          start_date?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "academic_terms_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_types: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          id: string;
          name: string;
          school_id: string;
          updated_at: string;
          updated_by: string | null;
          weight: number;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          school_id: string;
          updated_at?: string;
          updated_by?: string | null;
          weight?: number;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          school_id?: string;
          updated_at?: string;
          updated_by?: string | null;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_types_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      assessments: {
        Row: {
          assessment_type_id: string;
          class_subject_id: string;
          created_at: string;
          created_by: string | null;
          date: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          id: string;
          max_score: number;
          name: string;
          school_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          assessment_type_id: string;
          class_subject_id: string;
          created_at?: string;
          created_by?: string | null;
          date?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          max_score: number;
          name: string;
          school_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          assessment_type_id?: string;
          class_subject_id?: string;
          created_at?: string;
          created_by?: string | null;
          date?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          max_score?: number;
          name?: string;
          school_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessments_assessment_type_id_fkey";
            columns: ["assessment_type_id"];
            isOneToOne: false;
            referencedRelation: "assessment_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_class_subject_id_fkey";
            columns: ["class_subject_id"];
            isOneToOne: false;
            referencedRelation: "class_subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_class_subject_id_fkey";
            columns: ["class_subject_id"];
            isOneToOne: false;
            referencedRelation: "v_teacher_class_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance: {
        Row: {
          created_at: string;
          date: string;
          deleted_at: string | null;
          deleted_by: string | null;
          enrollment_id: string;
          id: string;
          marked_by: string | null;
          notes: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          date?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          enrollment_id: string;
          id?: string;
          marked_by?: string | null;
          notes?: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          date?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          enrollment_id?: string;
          id?: string;
          marked_by?: string | null;
          notes?: string | null;
          school_id?: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "v_active_enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      class_subjects: {
        Row: {
          class_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          id: string;
          school_id: string;
          subject_id: string;
          teacher_id: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          class_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          school_id: string;
          subject_id: string;
          teacher_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          school_id?: string;
          subject_id?: string;
          teacher_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          academic_term_id: string;
          class_teacher_id: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          id: string;
          level: string;
          name: string;
          room: string | null;
          school_id: string;
          section: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          academic_term_id: string;
          class_teacher_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          level: string;
          name: string;
          room?: string | null;
          school_id: string;
          section?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          academic_term_id?: string;
          class_teacher_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          level?: string;
          name?: string;
          room?: string | null;
          school_id?: string;
          section?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "classes_academic_term_id_fkey";
            columns: ["academic_term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_class_teacher_id_fkey";
            columns: ["class_teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          academic_term_id: string;
          class_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          enrollment_date: string;
          id: string;
          notes: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["enrollment_status"];
          student_id: string;
          updated_at: string;
          updated_by: string | null;
          withdrawal_date: string | null;
        };
        Insert: {
          academic_term_id: string;
          class_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          enrollment_date?: string;
          id?: string;
          notes?: string | null;
          school_id: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          student_id: string;
          updated_at?: string;
          updated_by?: string | null;
          withdrawal_date?: string | null;
        };
        Update: {
          academic_term_id?: string;
          class_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          enrollment_date?: string;
          id?: string;
          notes?: string | null;
          school_id?: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          student_id?: string;
          updated_at?: string;
          updated_by?: string | null;
          withdrawal_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_academic_term_id_fkey";
            columns: ["academic_term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      exam_proctoring_logs: {
        Row: {
          action_taken: string | null;
          created_at: string;
          description: string | null;
          evidence_data: Json | null;
          exam_session_id: string;
          id: string;
          incident_type: string;
          review_notes: string | null;
          reviewed: boolean;
          reviewed_at: string | null;
          reviewed_by: string | null;
          school_id: string;
          screenshot_url: string | null;
          severity: string;
          student_id: string;
          timestamp: string;
          video_clip_url: string | null;
        };
        Insert: {
          action_taken?: string | null;
          created_at?: string;
          description?: string | null;
          evidence_data?: Json | null;
          exam_session_id: string;
          id?: string;
          incident_type: string;
          review_notes?: string | null;
          reviewed?: boolean;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id: string;
          screenshot_url?: string | null;
          severity: string;
          student_id: string;
          timestamp?: string;
          video_clip_url?: string | null;
        };
        Update: {
          action_taken?: string | null;
          created_at?: string;
          description?: string | null;
          evidence_data?: Json | null;
          exam_session_id?: string;
          id?: string;
          incident_type?: string;
          review_notes?: string | null;
          reviewed?: boolean;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id?: string;
          screenshot_url?: string | null;
          severity?: string;
          student_id?: string;
          timestamp?: string;
          video_clip_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exam_proctoring_logs_exam_session_id_fkey";
            columns: ["exam_session_id"];
            isOneToOne: false;
            referencedRelation: "virtual_exam_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_proctoring_logs_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_proctoring_logs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      fee_assignments: {
        Row: {
          academic_term_id: string;
          amount: number;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          discount: number | null;
          due_date: string | null;
          fee_type_id: string;
          id: string;
          notes: string | null;
          school_id: string;
          student_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          academic_term_id: string;
          amount: number;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          discount?: number | null;
          due_date?: string | null;
          fee_type_id: string;
          id?: string;
          notes?: string | null;
          school_id: string;
          student_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          academic_term_id?: string;
          amount?: number;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          discount?: number | null;
          due_date?: string | null;
          fee_type_id?: string;
          id?: string;
          notes?: string | null;
          school_id?: string;
          student_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fee_assignments_academic_term_id_fkey";
            columns: ["academic_term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fee_assignments_fee_type_id_fkey";
            columns: ["fee_type_id"];
            isOneToOne: false;
            referencedRelation: "fee_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fee_assignments_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fee_assignments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      fee_types: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string | null;
          default_amount: number | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          id: string;
          is_mandatory: boolean;
          name: string;
          school_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_amount?: number | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          is_mandatory?: boolean;
          name: string;
          school_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_amount?: number | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          is_mandatory?: boolean;
          name?: string;
          school_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fee_types_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      grades: {
        Row: {
          assessment_id: string;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          enrollment_id: string;
          grade: string | null;
          id: string;
          recorded_by: string | null;
          remarks: string | null;
          school_id: string;
          score: number | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          assessment_id: string;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          enrollment_id: string;
          grade?: string | null;
          id?: string;
          recorded_by?: string | null;
          remarks?: string | null;
          school_id: string;
          score?: number | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          assessment_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          enrollment_id?: string;
          grade?: string | null;
          id?: string;
          recorded_by?: string | null;
          remarks?: string | null;
          school_id?: string;
          score?: number | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "grades_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grades_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grades_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "v_active_enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grades_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      grading_scales: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          grade: string;
          grade_point: number | null;
          id: string;
          max_score: number;
          min_score: number;
          name: string;
          school_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          grade: string;
          grade_point?: number | null;
          id?: string;
          max_score: number;
          min_score: number;
          name: string;
          school_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          grade?: string;
          grade_point?: number | null;
          id?: string;
          max_score?: number;
          min_score?: number;
          name?: string;
          school_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "grading_scales_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          attachment_urls: Json | null;
          class_subject_id: string;
          content: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          file_url: string | null;
          id: string;
          is_live: boolean;
          scheduled_date: string | null;
          school_id: string;
          title: string;
          topic: string | null;
          updated_at: string;
          updated_by: string | null;
          video_session_id: string | null;
        };
        Insert: {
          attachment_urls?: Json | null;
          class_subject_id: string;
          content?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          file_url?: string | null;
          id?: string;
          is_live?: boolean;
          scheduled_date?: string | null;
          school_id: string;
          title: string;
          topic?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          video_session_id?: string | null;
        };
        Update: {
          attachment_urls?: Json | null;
          class_subject_id?: string;
          content?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          file_url?: string | null;
          id?: string;
          is_live?: boolean;
          scheduled_date?: string | null;
          school_id?: string;
          title?: string;
          topic?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          video_session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_class_subject_id_fkey";
            columns: ["class_subject_id"];
            isOneToOne: false;
            referencedRelation: "class_subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_class_subject_id_fkey";
            columns: ["class_subject_id"];
            isOneToOne: false;
            referencedRelation: "v_teacher_class_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_video_session_id_fkey";
            columns: ["video_session_id"];
            isOneToOne: false;
            referencedRelation: "video_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          fee_assignment_id: string;
          id: string;
          notes: string | null;
          payment_date: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          recorded_by: string | null;
          reference_number: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          fee_assignment_id: string;
          id?: string;
          notes?: string | null;
          payment_date?: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          recorded_by?: string | null;
          reference_number?: string | null;
          school_id: string;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          fee_assignment_id?: string;
          id?: string;
          notes?: string | null;
          payment_date?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          recorded_by?: string | null;
          reference_number?: string | null;
          school_id?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_fee_assignment_id_fkey";
            columns: ["fee_assignment_id"];
            isOneToOne: false;
            referencedRelation: "fee_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          first_name: string | null;
          id: string;
          is_super_admin: boolean;
          last_name: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          first_name?: string | null;
          id: string;
          is_super_admin?: boolean;
          last_name?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          first_name?: string | null;
          id?: string;
          is_super_admin?: boolean;
          last_name?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      recording_views: {
        Row: {
          browser_info: string | null;
          completion_percentage: number | null;
          created_at: string;
          device_type: string | null;
          duration_watched_seconds: number | null;
          id: string;
          ip_address: string | null;
          recording_id: string;
          school_id: string;
          updated_at: string;
          user_id: string;
          view_ended_at: string | null;
          view_started_at: string;
        };
        Insert: {
          browser_info?: string | null;
          completion_percentage?: number | null;
          created_at?: string;
          device_type?: string | null;
          duration_watched_seconds?: number | null;
          id?: string;
          ip_address?: string | null;
          recording_id: string;
          school_id: string;
          updated_at?: string;
          user_id: string;
          view_ended_at?: string | null;
          view_started_at?: string;
        };
        Update: {
          browser_info?: string | null;
          completion_percentage?: number | null;
          created_at?: string;
          device_type?: string | null;
          duration_watched_seconds?: number | null;
          id?: string;
          ip_address?: string | null;
          recording_id?: string;
          school_id?: string;
          updated_at?: string;
          user_id?: string;
          view_ended_at?: string | null;
          view_started_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recording_views_recording_id_fkey";
            columns: ["recording_id"];
            isOneToOne: false;
            referencedRelation: "session_recordings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recording_views_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      school_memberships: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["school_membership_role"];
          school_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          is_active?: boolean;
          role: Database["public"]["Enums"]["school_membership_role"];
          school_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["school_membership_role"];
          school_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_memberships_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      schools: {
        Row: {
          address: string | null;
          created_at: string;
          deleted_at: string | null;
          email: string | null;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      session_chat_messages: {
        Row: {
          content: string;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          deleted_reason: string | null;
          file_name: string | null;
          file_size: number | null;
          file_type: string | null;
          file_url: string | null;
          id: string;
          is_announcement: boolean;
          is_deleted: boolean;
          is_pinned: boolean;
          is_private: boolean;
          message_type: string;
          reactions: Json | null;
          recipient_id: string | null;
          school_id: string;
          sender_id: string;
          session_id: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          deleted_reason?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          file_url?: string | null;
          id?: string;
          is_announcement?: boolean;
          is_deleted?: boolean;
          is_pinned?: boolean;
          is_private?: boolean;
          message_type?: string;
          reactions?: Json | null;
          recipient_id?: string | null;
          school_id: string;
          sender_id: string;
          session_id: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          deleted_reason?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          file_url?: string | null;
          id?: string;
          is_announcement?: boolean;
          is_deleted?: boolean;
          is_pinned?: boolean;
          is_private?: boolean;
          message_type?: string;
          reactions?: Json | null;
          recipient_id?: string | null;
          school_id?: string;
          sender_id?: string;
          session_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_chat_messages_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "video_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      session_events: {
        Row: {
          created_at: string;
          description: string | null;
          event_data: Json | null;
          event_type: string;
          id: string;
          participant_id: string | null;
          school_id: string;
          session_id: string;
          timestamp: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          event_data?: Json | null;
          event_type: string;
          id?: string;
          participant_id?: string | null;
          school_id: string;
          session_id: string;
          timestamp?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          event_data?: Json | null;
          event_type?: string;
          id?: string;
          participant_id?: string | null;
          school_id?: string;
          session_id?: string;
          timestamp?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "session_events_participant_id_fkey";
            columns: ["participant_id"];
            isOneToOne: false;
            referencedRelation: "session_participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_events_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_events_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "video_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      session_participants: {
        Row: {
          audio_enabled: boolean;
          average_network_quality: number | null;
          browser_info: string | null;
          can_enable_video: boolean;
          can_send_chat: boolean;
          can_share_screen: boolean;
          can_unmute_audio: boolean;
          connection_drops: number | null;
          created_at: string;
          device_type: string | null;
          duration: number | null;
          hand_currently_raised: boolean;
          hand_raised_count: number | null;
          id: string;
          ip_address: string | null;
          is_co_host: boolean;
          is_currently_connected: boolean;
          is_host: boolean;
          join_time: string;
          joined_from: string | null;
          leave_time: string | null;
          messages_sent: number | null;
          os_info: string | null;
          participation_score: number | null;
          reactions_sent: number | null;
          role: string;
          school_id: string;
          screen_share_count: number | null;
          screen_sharing: boolean;
          session_id: string;
          updated_at: string;
          user_id: string;
          video_enabled: boolean;
        };
        Insert: {
          audio_enabled?: boolean;
          average_network_quality?: number | null;
          browser_info?: string | null;
          can_enable_video?: boolean;
          can_send_chat?: boolean;
          can_share_screen?: boolean;
          can_unmute_audio?: boolean;
          connection_drops?: number | null;
          created_at?: string;
          device_type?: string | null;
          duration?: number | null;
          hand_currently_raised?: boolean;
          hand_raised_count?: number | null;
          id?: string;
          ip_address?: string | null;
          is_co_host?: boolean;
          is_currently_connected?: boolean;
          is_host?: boolean;
          join_time?: string;
          joined_from?: string | null;
          leave_time?: string | null;
          messages_sent?: number | null;
          os_info?: string | null;
          participation_score?: number | null;
          reactions_sent?: number | null;
          role: string;
          school_id: string;
          screen_share_count?: number | null;
          screen_sharing?: boolean;
          session_id: string;
          updated_at?: string;
          user_id: string;
          video_enabled?: boolean;
        };
        Update: {
          audio_enabled?: boolean;
          average_network_quality?: number | null;
          browser_info?: string | null;
          can_enable_video?: boolean;
          can_send_chat?: boolean;
          can_share_screen?: boolean;
          can_unmute_audio?: boolean;
          connection_drops?: number | null;
          created_at?: string;
          device_type?: string | null;
          duration?: number | null;
          hand_currently_raised?: boolean;
          hand_raised_count?: number | null;
          id?: string;
          ip_address?: string | null;
          is_co_host?: boolean;
          is_currently_connected?: boolean;
          is_host?: boolean;
          join_time?: string;
          joined_from?: string | null;
          leave_time?: string | null;
          messages_sent?: number | null;
          os_info?: string | null;
          participation_score?: number | null;
          reactions_sent?: number | null;
          role?: string;
          school_id?: string;
          screen_share_count?: number | null;
          screen_sharing?: boolean;
          session_id?: string;
          updated_at?: string;
          user_id?: string;
          video_enabled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "session_participants_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_participants_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "video_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      session_recordings: {
        Row: {
          allowed_roles: string[] | null;
          archived_at: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          download_count: number | null;
          duration_seconds: number | null;
          error_message: string | null;
          file_size_bytes: number | null;
          format: string | null;
          id: string;
          is_public: boolean;
          password_hash: string | null;
          password_protected: boolean;
          processing_completed_at: string | null;
          processing_started_at: string | null;
          recording_id: string;
          recording_url: string;
          resolution: string | null;
          school_id: string;
          session_id: string;
          status: string;
          storage_path: string | null;
          storage_provider: string | null;
          thumbnail_url: string | null;
          updated_at: string;
          view_count: number | null;
        };
        Insert: {
          allowed_roles?: string[] | null;
          archived_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          download_count?: number | null;
          duration_seconds?: number | null;
          error_message?: string | null;
          file_size_bytes?: number | null;
          format?: string | null;
          id?: string;
          is_public?: boolean;
          password_hash?: string | null;
          password_protected?: boolean;
          processing_completed_at?: string | null;
          processing_started_at?: string | null;
          recording_id: string;
          recording_url: string;
          resolution?: string | null;
          school_id: string;
          session_id: string;
          status?: string;
          storage_path?: string | null;
          storage_provider?: string | null;
          thumbnail_url?: string | null;
          updated_at?: string;
          view_count?: number | null;
        };
        Update: {
          allowed_roles?: string[] | null;
          archived_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          download_count?: number | null;
          duration_seconds?: number | null;
          error_message?: string | null;
          file_size_bytes?: number | null;
          format?: string | null;
          id?: string;
          is_public?: boolean;
          password_hash?: string | null;
          password_protected?: boolean;
          processing_completed_at?: string | null;
          processing_started_at?: string | null;
          recording_id?: string;
          recording_url?: string;
          resolution?: string | null;
          school_id?: string;
          session_id?: string;
          status?: string;
          storage_path?: string | null;
          storage_provider?: string | null;
          thumbnail_url?: string | null;
          updated_at?: string;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "session_recordings_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_recordings_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "video_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      student_guardians: {
        Row: {
          can_pickup: boolean;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          email: string | null;
          guardian_user_id: string;
          id: string;
          is_emergency_contact: boolean;
          is_primary: boolean;
          phone: string | null;
          receives_reports: boolean;
          relationship: Database["public"]["Enums"]["guardian_relationship"];
          school_id: string;
          student_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          can_pickup?: boolean;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          email?: string | null;
          guardian_user_id: string;
          id?: string;
          is_emergency_contact?: boolean;
          is_primary?: boolean;
          phone?: string | null;
          receives_reports?: boolean;
          relationship: Database["public"]["Enums"]["guardian_relationship"];
          school_id: string;
          student_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          can_pickup?: boolean;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          email?: string | null;
          guardian_user_id?: string;
          id?: string;
          is_emergency_contact?: boolean;
          is_primary?: boolean;
          phone?: string | null;
          receives_reports?: boolean;
          relationship?: Database["public"]["Enums"]["guardian_relationship"];
          school_id?: string;
          student_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_guardians_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          address: string | null;
          admission_date: string | null;
          admission_number: string | null;
          created_at: string;
          created_by: string | null;
          date_of_birth: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          first_name: string;
          gender: string | null;
          id: string;
          last_name: string;
          school_id: string;
          status: Database["public"]["Enums"]["student_status"];
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          address?: string | null;
          admission_date?: string | null;
          admission_number?: string | null;
          created_at?: string;
          created_by?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          first_name: string;
          gender?: string | null;
          id?: string;
          last_name: string;
          school_id: string;
          status?: Database["public"]["Enums"]["student_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          address?: string | null;
          admission_date?: string | null;
          admission_number?: string | null;
          created_at?: string;
          created_by?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          first_name?: string;
          gender?: string | null;
          id?: string;
          last_name?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["student_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          id: string;
          name: string;
          school_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          school_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          school_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      teacher_subjects: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          id: string;
          school_id: string;
          subject_id: string;
          teacher_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          school_id: string;
          subject_id: string;
          teacher_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          id?: string;
          school_id?: string;
          subject_id?: string;
          teacher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teacher_subjects_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teacher_subjects_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
        ];
      };
      teachers: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          first_name: string;
          hire_date: string | null;
          id: string;
          last_name: string;
          phone: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["teacher_status"];
          updated_at: string;
          updated_by: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          first_name: string;
          hire_date?: string | null;
          id?: string;
          last_name: string;
          phone?: string | null;
          school_id: string;
          status?: Database["public"]["Enums"]["teacher_status"];
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          first_name?: string;
          hire_date?: string | null;
          id?: string;
          last_name?: string;
          phone?: string | null;
          school_id?: string;
          status?: Database["public"]["Enums"]["teacher_status"];
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      video_sessions: {
        Row: {
          actual_start_time: string | null;
          agora_app_id: string | null;
          agora_channel: string | null;
          agora_token: string | null;
          agora_uid: string | null;
          allow_recording: boolean;
          allow_screen_share: boolean;
          audio_quality: string | null;
          auto_record: boolean;
          channel_name: string;
          class_id: string;
          co_hosts: Json | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          duration: number | null;
          end_time: string | null;
          host_id: string;
          id: string;
          is_recorded: boolean;
          lesson_id: string | null;
          max_participants: number | null;
          mute_on_entry: boolean;
          notes: string | null;
          recording_end_time: string | null;
          recording_id: string | null;
          recording_size_bytes: number | null;
          recording_start_time: string | null;
          recording_url: string | null;
          scheduled_start: string | null;
          school_id: string;
          session_type: string;
          status: string;
          token_expiry: string | null;
          updated_at: string;
          updated_by: string | null;
          video_quality: string | null;
        };
        Insert: {
          actual_start_time?: string | null;
          agora_app_id?: string | null;
          agora_channel?: string | null;
          agora_token?: string | null;
          agora_uid?: string | null;
          allow_recording?: boolean;
          allow_screen_share?: boolean;
          audio_quality?: string | null;
          auto_record?: boolean;
          channel_name: string;
          class_id: string;
          co_hosts?: Json | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration?: number | null;
          end_time?: string | null;
          host_id: string;
          id?: string;
          is_recorded?: boolean;
          lesson_id?: string | null;
          max_participants?: number | null;
          mute_on_entry?: boolean;
          notes?: string | null;
          recording_end_time?: string | null;
          recording_id?: string | null;
          recording_size_bytes?: number | null;
          recording_start_time?: string | null;
          recording_url?: string | null;
          scheduled_start?: string | null;
          school_id: string;
          session_type?: string;
          status?: string;
          token_expiry?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          video_quality?: string | null;
        };
        Update: {
          actual_start_time?: string | null;
          agora_app_id?: string | null;
          agora_channel?: string | null;
          agora_token?: string | null;
          agora_uid?: string | null;
          allow_recording?: boolean;
          allow_screen_share?: boolean;
          audio_quality?: string | null;
          auto_record?: boolean;
          channel_name?: string;
          class_id?: string;
          co_hosts?: Json | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration?: number | null;
          end_time?: string | null;
          host_id?: string;
          id?: string;
          is_recorded?: boolean;
          lesson_id?: string | null;
          max_participants?: number | null;
          mute_on_entry?: boolean;
          notes?: string | null;
          recording_end_time?: string | null;
          recording_id?: string | null;
          recording_size_bytes?: number | null;
          recording_start_time?: string | null;
          recording_url?: string | null;
          scheduled_start?: string | null;
          school_id?: string;
          session_type?: string;
          status?: string;
          token_expiry?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          video_quality?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "video_sessions_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_sessions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_sessions_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      virtual_attendance: {
        Row: {
          audio_enabled: boolean | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          duration: number | null;
          enrollment_id: string | null;
          id: string;
          interaction_count: number | null;
          is_late: boolean | null;
          is_manual: boolean;
          join_time: string | null;
          leave_time: string | null;
          left_early_minutes: number | null;
          marked_by: string | null;
          minutes_late: number | null;
          notes: string | null;
          participation_score: number | null;
          required_duration: number | null;
          school_id: string;
          session_id: string;
          status: string;
          student_id: string;
          teacher_remarks: string | null;
          updated_at: string;
          updated_by: string | null;
          video_enabled: boolean | null;
        };
        Insert: {
          audio_enabled?: boolean | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration?: number | null;
          enrollment_id?: string | null;
          id?: string;
          interaction_count?: number | null;
          is_late?: boolean | null;
          is_manual?: boolean;
          join_time?: string | null;
          leave_time?: string | null;
          left_early_minutes?: number | null;
          marked_by?: string | null;
          minutes_late?: number | null;
          notes?: string | null;
          participation_score?: number | null;
          required_duration?: number | null;
          school_id: string;
          session_id: string;
          status?: string;
          student_id: string;
          teacher_remarks?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          video_enabled?: boolean | null;
        };
        Update: {
          audio_enabled?: boolean | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration?: number | null;
          enrollment_id?: string | null;
          id?: string;
          interaction_count?: number | null;
          is_late?: boolean | null;
          is_manual?: boolean;
          join_time?: string | null;
          leave_time?: string | null;
          left_early_minutes?: number | null;
          marked_by?: string | null;
          minutes_late?: number | null;
          notes?: string | null;
          participation_score?: number | null;
          required_duration?: number | null;
          school_id?: string;
          session_id?: string;
          status?: string;
          student_id?: string;
          teacher_remarks?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          video_enabled?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "virtual_attendance_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "virtual_attendance_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "v_active_enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "virtual_attendance_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "virtual_attendance_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "video_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "virtual_attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      virtual_exam_sessions: {
        Row: {
          allow_review: boolean;
          allow_tab_switch: boolean;
          assessment_id: string;
          auto_submit_on_time_up: boolean;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          duration_minutes: number;
          enable_plagiarism_detection: boolean;
          enable_proctoring: boolean;
          end_time: string;
          extra_time_minutes: number | null;
          id: string;
          instructions: string | null;
          max_tab_switches: number | null;
          randomize_questions: boolean;
          require_camera: boolean;
          require_screen_recording: boolean;
          school_id: string;
          show_results_immediately: boolean;
          start_time: string;
          status: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
          video_session_id: string;
          warning_before_minutes: number | null;
        };
        Insert: {
          allow_review?: boolean;
          allow_tab_switch?: boolean;
          assessment_id: string;
          auto_submit_on_time_up?: boolean;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration_minutes: number;
          enable_plagiarism_detection?: boolean;
          enable_proctoring?: boolean;
          end_time: string;
          extra_time_minutes?: number | null;
          id?: string;
          instructions?: string | null;
          max_tab_switches?: number | null;
          randomize_questions?: boolean;
          require_camera?: boolean;
          require_screen_recording?: boolean;
          school_id: string;
          show_results_immediately?: boolean;
          start_time: string;
          status?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
          video_session_id: string;
          warning_before_minutes?: number | null;
        };
        Update: {
          allow_review?: boolean;
          allow_tab_switch?: boolean;
          assessment_id?: string;
          auto_submit_on_time_up?: boolean;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          duration_minutes?: number;
          enable_plagiarism_detection?: boolean;
          enable_proctoring?: boolean;
          end_time?: string;
          extra_time_minutes?: number | null;
          id?: string;
          instructions?: string | null;
          max_tab_switches?: number | null;
          randomize_questions?: boolean;
          require_camera?: boolean;
          require_screen_recording?: boolean;
          school_id?: string;
          show_results_immediately?: boolean;
          start_time?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          video_session_id?: string;
          warning_before_minutes?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "virtual_exam_sessions_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "virtual_exam_sessions_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "virtual_exam_sessions_video_session_id_fkey";
            columns: ["video_session_id"];
            isOneToOne: false;
            referencedRelation: "video_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number;
          currency: string;
          max_students: number | null;
          max_teachers: number | null;
          max_classes: number | null;
          max_video_participants: number;
          features: Json;
          paystack_plan_code: string | null;
          is_active: boolean;
          is_visible: boolean;
          sort_order: number;
          trial_days: number;
          billing_description: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          price_monthly: number;
          price_yearly: number;
          currency: string;
          max_students?: number | null;
          max_teachers?: number | null;
          max_classes?: number | null;
          max_video_participants: number;
          features: Json;
          paystack_plan_code?: string | null;
          is_active?: boolean;
          is_visible?: boolean;
          sort_order?: number;
          trial_days?: number;
          billing_description?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          currency?: string;
          max_students?: number | null;
          max_teachers?: number | null;
          max_classes?: number | null;
          max_video_participants?: number;
          features?: Json;
          paystack_plan_code?: string | null;
          is_active?: boolean;
          is_visible?: boolean;
          sort_order?: number;
          trial_days?: number;
          billing_description?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      v_active_enrollments: {
        Row: {
          academic_term_id: string | null;
          academic_year: string | null;
          admission_number: string | null;
          class_id: string | null;
          class_level: string | null;
          class_name: string | null;
          enrollment_date: string | null;
          id: string | null;
          school_id: string | null;
          status: Database["public"]["Enums"]["enrollment_status"] | null;
          student_id: string | null;
          student_name: string | null;
          term_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_academic_term_id_fkey";
            columns: ["academic_term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      v_student_guardians: {
        Row: {
          can_pickup: boolean | null;
          guardian_email: string | null;
          guardian_name: string | null;
          guardian_phone: string | null;
          guardian_user_id: string | null;
          id: string | null;
          is_emergency_contact: boolean | null;
          is_primary: boolean | null;
          receives_reports: boolean | null;
          relationship:
            | Database["public"]["Enums"]["guardian_relationship"]
            | null;
          school_id: string | null;
          student_id: string | null;
          student_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_guardians_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      v_teacher_class_assignments: {
        Row: {
          academic_year: string | null;
          class_id: string | null;
          class_level: string | null;
          class_name: string | null;
          id: string | null;
          school_id: string | null;
          subject_id: string | null;
          subject_name: string | null;
          teacher_id: string | null;
          teacher_name: string | null;
          term_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      get_user_school_id: { Args: { _user_id: string }; Returns: string };
      get_user_school_ids: { Args: never; Returns: string[] };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      has_school_role: {
        Args: {
          p_role: Database["public"]["Enums"]["school_membership_role"];
          p_school_id: string;
        };
        Returns: boolean;
      };
      is_guardian_of_student: {
        Args: { p_student_id: string };
        Returns: boolean;
      };
      is_school_admin: { Args: { p_school_id: string }; Returns: boolean };
      is_super_admin: { Args: never; Returns: boolean };
      is_teacher: { Args: { p_school_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "super_admin" | "school_admin" | "teacher" | "parent";
      attendance_status: "present" | "absent" | "late" | "excused";
      enrollment_status: "active" | "completed" | "withdrawn" | "transferred";
      guardian_relationship:
        | "mother"
        | "father"
        | "guardian"
        | "grandparent"
        | "other";
      payment_method:
        | "cash"
        | "card"
        | "bank_transfer"
        | "mobile_money"
        | "check"
        | "other";
      payment_status:
        | "pending"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled"
        | "refunded";
      school_membership_role: "school_admin" | "teacher" | "parent";
      student_status: "active" | "inactive" | "graduated" | "transferred";
      teacher_status: "active" | "on_leave" | "inactive";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema =
  DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof (
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
        "Tables"
      ]
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
        "Views"
      ]
    )
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? (
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Views"
    ]
  )[TableName] extends {
    Row: infer R;
  } ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (
    & DefaultSchema["Tables"]
    & DefaultSchema["Views"]
  ) ? (
      & DefaultSchema["Tables"]
      & DefaultSchema["Views"]
    )[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    } ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
    "Tables"
  ][TableName] extends {
    Insert: infer I;
  } ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    } ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
    "Tables"
  ][TableName] extends {
    Update: infer U;
  } ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    } ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]][
      "Enums"
    ]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][
    EnumName
  ]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[
      PublicCompositeTypeNameOrOptions["schema"]
    ]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]][
    "CompositeTypes"
  ][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "school_admin", "teacher", "parent"],
      attendance_status: ["present", "absent", "late", "excused"],
      enrollment_status: ["active", "completed", "withdrawn", "transferred"],
      guardian_relationship: [
        "mother",
        "father",
        "guardian",
        "grandparent",
        "other",
      ],
      payment_method: [
        "cash",
        "card",
        "bank_transfer",
        "mobile_money",
        "check",
        "other",
      ],
      payment_status: [
        "pending",
        "partial",
        "paid",
        "overdue",
        "cancelled",
        "refunded",
      ],
      school_membership_role: ["school_admin", "teacher", "parent"],
      student_status: ["active", "inactive", "graduated", "transferred"],
      teacher_status: ["active", "on_leave", "inactive"],
    },
  },
} as const;
