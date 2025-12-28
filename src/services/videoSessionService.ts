import { supabase } from "@/integrations/supabase/client";

export interface VideoSessionData {
  classId: string;
  teacherId: string;
  agoraChannelName: string;
}

export interface VideoSessionParticipantData {
  sessionId: string;
  studentId: string;
}

export class VideoSessionService {
  /**
   * Create a new video session
   */
  static async createVideoSession(data: VideoSessionData) {
    try {
      const { data: session, error } = await supabase
        .from("video_sessions")
        .insert({
          class_id: data.classId,
          host_id: data.teacherId,
          channel_name: data.agoraChannelName,
          status: "active",
          actual_start_time: new Date().toISOString(),
          school_id: "", // Will be set by RLS
        })
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Video session created:", session.id);
      return session;
    } catch (error) {
      console.error("❌ Failed to create video session:", error);
      throw error;
    }
  }

  /**
   * Get active session for a class
   */
  static async getActiveSessionForClass(classId: string) {
    try {
      const { data: session, error } = await supabase
        .from("video_sessions")
        .select("*")
        .eq("class_id", classId)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code === "PGRST116") {
        // No rows found
        return null;
      }

      if (error) throw error;
      return session;
    } catch (error) {
      console.error("❌ Failed to get active session:", error);
      return null;
    }
  }

  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: string) {
    try {
      const { data: session, error } = await supabase
        .from("video_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      return session;
    } catch (error) {
      console.error("❌ Failed to get session:", error);
      return null;
    }
  }

  /**
   * End a video session
   */
  static async endVideoSession(sessionId: string) {
    try {
      const { error } = await supabase
        .from("video_sessions")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;
      console.log("✅ Video session ended:", sessionId);
    } catch (error) {
      console.error("❌ Failed to end session:", error);
      throw error;
    }
  }

  // Note: video_session_participants table not yet created
  // Commented out until table exists in Supabase
  /*
  /**
   * Add participant to session
   */
  /*
  static async addParticipant(data: VideoSessionParticipantData) {
    try {
      const { error } = await supabase
        .from("video_session_participants")
        .insert({
          session_id: data.sessionId,
          student_id: data.studentId,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;
      console.log("✅ Participant added to session");
    } catch (error) {
      console.error("❌ Failed to add participant:", error);
      throw error;
    }
  }
  */

  // Note: video_session_participants table not yet created
  /*
  /**
   * Remove participant from session (mark as left)
   */
  /*
  static async removeParticipant(sessionId: string, studentId: string) {
    try {
      const { error } = await supabase
        .from("video_session_participants")
        .update({
          left_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
        .eq("student_id", studentId);

      if (error) throw error;
      console.log("✅ Participant removed from session");
    } catch (error) {
      console.error("❌ Failed to remove participant:", error);
      throw error;
    }
  }

  // Methods below use video_session_participants table which doesn't exist yet
  // Commented out: addParticipant, removeParticipant, getSessionParticipants, calculateAttendance

  /**
   * Get session history for a class
   */
  static async getSessionHistory(classId: string, limit: number = 10) {
    try {
      const { data: sessions, error } = await supabase
        .from("video_sessions")
        .select("*")
        .eq("class_id", classId)
        .order("actual_start_time", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return sessions || [];
    } catch (error) {
      console.error("❌ Failed to get session history:", error);
      return [];
    }
  }
}

export default VideoSessionService;
