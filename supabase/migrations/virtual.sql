-- ============================================================================
-- VIRTUAL CLASSROOM DATABASE SCHEMA
-- Version: 1.0
-- Date: December 27, 2025
-- Description: Complete schema for virtual classroom with live streaming,
--              attendance tracking, and exam administration
-- ============================================================================

-- ============================================================================
-- 1. LESSONS TABLE
-- Stores lesson content that can be delivered live or recorded
-- ============================================================================
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_subject_id uuid NOT NULL,
  
  -- Lesson information
  title text NOT NULL CHECK (char_length(TRIM(BOTH FROM title)) > 0),
  description text,
  content text, -- Lesson notes, slides text, or references
  topic text,
  
  -- Video session link
  video_session_id uuid,
  is_live boolean NOT NULL DEFAULT false,
  
  -- Files and attachments
  file_url text,
  attachment_urls jsonb, -- Array of attachment objects
  
  -- Scheduling
  scheduled_date timestamp with time zone,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT lessons_class_subject_id_fkey FOREIGN KEY (class_subject_id) REFERENCES public.class_subjects(id) ON DELETE CASCADE,
  CONSTRAINT lessons_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT lessons_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT lessons_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id)
);

-- Index for performance
CREATE INDEX idx_lessons_school_id ON public.lessons(school_id);
CREATE INDEX idx_lessons_class_subject_id ON public.lessons(class_subject_id);
CREATE INDEX idx_lessons_video_session_id ON public.lessons(video_session_id);
CREATE INDEX idx_lessons_is_live ON public.lessons(is_live) WHERE deleted_at IS NULL;

-- ============================================================================
-- 2. VIDEO SESSIONS TABLE
-- Stores virtual classroom session information (Agora integration)
-- ============================================================================
CREATE TABLE public.video_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  lesson_id uuid,
  
  -- Session identification
  channel_name text NOT NULL CHECK (char_length(TRIM(BOTH FROM channel_name)) > 0),
  session_type text NOT NULL DEFAULT 'lesson' CHECK (session_type IN ('lesson', 'exam', 'meeting')),
  
  -- Session status
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'paused', 'ended', 'cancelled')),
  
  -- Timing
  scheduled_start timestamp with time zone,
  actual_start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration integer DEFAULT 0, -- Duration in seconds
  
  -- Agora/Video platform details
  agora_app_id text,
  agora_channel text,
  agora_uid text,
  agora_token text, -- Temporary token (should be regenerated)
  token_expiry timestamp with time zone,
  
  -- Recording
  is_recorded boolean NOT NULL DEFAULT false,
  recording_id text,
  recording_url text,
  recording_start_time timestamp with time zone,
  recording_end_time timestamp with time zone,
  recording_size_bytes bigint,
  
  -- Session settings
  max_participants integer DEFAULT 100,
  allow_screen_share boolean NOT NULL DEFAULT true,
  allow_recording boolean NOT NULL DEFAULT true,
  auto_record boolean NOT NULL DEFAULT false,
  mute_on_entry boolean NOT NULL DEFAULT false,
  
  -- Quality settings
  video_quality text DEFAULT 'high' CHECK (video_quality IN ('low', 'medium', 'high', 'hd')),
  audio_quality text DEFAULT 'high' CHECK (audio_quality IN ('low', 'medium', 'high')),
  
  -- Session metadata
  host_id uuid NOT NULL, -- Teacher who started the session
  co_hosts jsonb, -- Array of user IDs who can co-host
  
  -- Notes and description
  notes text,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  
  CONSTRAINT video_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT video_sessions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT video_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT video_sessions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL,
  CONSTRAINT video_sessions_host_id_fkey FOREIGN KEY (host_id) REFERENCES auth.users(id),
  CONSTRAINT video_sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT video_sessions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT video_sessions_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id),
  CONSTRAINT video_sessions_channel_name_unique UNIQUE (channel_name)
);

-- Add foreign key from lessons to video_sessions (circular reference)
ALTER TABLE public.lessons 
ADD CONSTRAINT lessons_video_session_id_fkey 
FOREIGN KEY (video_session_id) REFERENCES public.video_sessions(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_video_sessions_school_id ON public.video_sessions(school_id);
CREATE INDEX idx_video_sessions_class_id ON public.video_sessions(class_id);
CREATE INDEX idx_video_sessions_lesson_id ON public.video_sessions(lesson_id);
CREATE INDEX idx_video_sessions_status ON public.video_sessions(status);
CREATE INDEX idx_video_sessions_host_id ON public.video_sessions(host_id);
CREATE INDEX idx_video_sessions_scheduled_start ON public.video_sessions(scheduled_start);

-- ============================================================================
-- 3. SESSION PARTICIPANTS TABLE
-- Tracks who joined each video session and their activity
-- ============================================================================
CREATE TABLE public.session_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  
  -- Participant role
  role text NOT NULL CHECK (role IN ('teacher', 'student', 'guest', 'observer')),
  
  -- Connection details
  join_time timestamp with time zone NOT NULL DEFAULT now(),
  leave_time timestamp with time zone,
  duration integer DEFAULT 0, -- Duration in seconds
  is_currently_connected boolean NOT NULL DEFAULT true,
  
  -- Media state
  video_enabled boolean NOT NULL DEFAULT false,
  audio_enabled boolean NOT NULL DEFAULT false,
  screen_sharing boolean NOT NULL DEFAULT false,
  screen_share_count integer DEFAULT 0,
  
  -- Engagement metrics
  hand_raised_count integer DEFAULT 0,
  hand_currently_raised boolean NOT NULL DEFAULT false,
  messages_sent integer DEFAULT 0,
  reactions_sent integer DEFAULT 0,
  participation_score numeric DEFAULT 0 CHECK (participation_score >= 0 AND participation_score <= 100),
  
  -- Device and connection info
  joined_from text CHECK (joined_from IN ('web', 'mobile', 'desktop', 'unknown')),
  device_type text,
  browser_info text,
  os_info text,
  ip_address text,
  
  -- Network quality tracking
  average_network_quality numeric, -- 0-100 scale
  connection_drops integer DEFAULT 0,
  
  -- Permissions
  can_share_screen boolean NOT NULL DEFAULT true,
  can_unmute_audio boolean NOT NULL DEFAULT true,
  can_enable_video boolean NOT NULL DEFAULT true,
  can_send_chat boolean NOT NULL DEFAULT true,
  is_host boolean NOT NULL DEFAULT false,
  is_co_host boolean NOT NULL DEFAULT false,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT session_participants_pkey PRIMARY KEY (id),
  CONSTRAINT session_participants_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT session_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  CONSTRAINT session_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT session_participants_unique UNIQUE (session_id, user_id, join_time)
);

-- Indexes
CREATE INDEX idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX idx_session_participants_user_id ON public.session_participants(user_id);
CREATE INDEX idx_session_participants_school_id ON public.session_participants(school_id);
CREATE INDEX idx_session_participants_is_connected ON public.session_participants(is_currently_connected);
CREATE INDEX idx_session_participants_role ON public.session_participants(role);

-- ============================================================================
-- 4. VIRTUAL ATTENDANCE TABLE
-- Records attendance for virtual classroom sessions
-- ============================================================================
CREATE TABLE public.virtual_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  enrollment_id uuid,
  
  -- Attendance status
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused', 'left_early')),
  is_manual boolean NOT NULL DEFAULT false, -- True if marked manually by teacher
  
  -- Timing details
  join_time timestamp with time zone,
  leave_time timestamp with time zone,
  duration integer DEFAULT 0, -- Time spent in session (seconds)
  required_duration integer, -- Minimum duration to be marked present
  
  -- Engagement tracking
  video_enabled boolean DEFAULT false,
  audio_enabled boolean DEFAULT false,
  participation_score numeric DEFAULT 0 CHECK (participation_score >= 0 AND participation_score <= 100),
  interaction_count integer DEFAULT 0, -- Messages, reactions, hand raises
  
  -- Late tracking
  minutes_late integer DEFAULT 0,
  is_late boolean GENERATED ALWAYS AS (minutes_late > 0) STORED,
  
  -- Early departure tracking
  left_early_minutes integer DEFAULT 0,
  
  -- Notes
  notes text,
  teacher_remarks text,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  marked_by uuid, -- User who marked attendance (for manual entries)
  updated_by uuid,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  
  CONSTRAINT virtual_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT virtual_attendance_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT virtual_attendance_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  CONSTRAINT virtual_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT virtual_attendance_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE SET NULL,
  CONSTRAINT virtual_attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES auth.users(id),
  CONSTRAINT virtual_attendance_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT virtual_attendance_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id),
  CONSTRAINT virtual_attendance_unique UNIQUE (session_id, student_id)
);

-- Indexes
CREATE INDEX idx_virtual_attendance_session_id ON public.virtual_attendance(session_id);
CREATE INDEX idx_virtual_attendance_student_id ON public.virtual_attendance(student_id);
CREATE INDEX idx_virtual_attendance_school_id ON public.virtual_attendance(school_id);
CREATE INDEX idx_virtual_attendance_status ON public.virtual_attendance(status);
CREATE INDEX idx_virtual_attendance_enrollment_id ON public.virtual_attendance(enrollment_id);

-- ============================================================================
-- 5. SESSION CHAT MESSAGES TABLE
-- Stores chat messages during virtual sessions
-- ============================================================================
CREATE TABLE public.session_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  
  -- Message content
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'poll', 'announcement')),
  content text NOT NULL,
  
  -- File attachments
  file_url text,
  file_name text,
  file_size bigint,
  file_type text,
  
  -- Message metadata
  is_private boolean NOT NULL DEFAULT false,
  recipient_id uuid, -- For private messages
  is_pinned boolean NOT NULL DEFAULT false,
  is_announcement boolean NOT NULL DEFAULT false,
  
  -- Reactions
  reactions jsonb, -- Array of {emoji, user_id, timestamp}
  
  -- Moderation
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_reason text,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  deleted_by uuid,
  
  CONSTRAINT session_chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT session_chat_messages_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT session_chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  CONSTRAINT session_chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT session_chat_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT session_chat_messages_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_session_chat_messages_session_id ON public.session_chat_messages(session_id);
CREATE INDEX idx_session_chat_messages_sender_id ON public.session_chat_messages(sender_id);
CREATE INDEX idx_session_chat_messages_created_at ON public.session_chat_messages(created_at);
CREATE INDEX idx_session_chat_messages_is_pinned ON public.session_chat_messages(is_pinned) WHERE is_pinned = true;

-- ============================================================================
-- 6. SESSION RECORDINGS TABLE
-- Stores information about recorded sessions
-- ============================================================================
CREATE TABLE public.session_recordings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_id uuid NOT NULL,
  
  -- Recording details
  recording_id text NOT NULL, -- External recording service ID
  recording_url text NOT NULL,
  thumbnail_url text,
  
  -- File information
  file_size_bytes bigint,
  duration_seconds integer,
  format text, -- mp4, webm, etc.
  resolution text, -- 720p, 1080p, etc.
  
  -- Processing status
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'archived', 'deleted')),
  processing_started_at timestamp with time zone,
  processing_completed_at timestamp with time zone,
  error_message text,
  
  -- Access control
  is_public boolean NOT NULL DEFAULT false,
  allowed_roles text[] DEFAULT ARRAY['teacher', 'student'],
  password_protected boolean NOT NULL DEFAULT false,
  password_hash text,
  
  -- View tracking
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  
  -- Storage
  storage_provider text DEFAULT 'agora' CHECK (storage_provider IN ('agora', 's3', 'cloudinary', 'local')),
  storage_path text,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  
  CONSTRAINT session_recordings_pkey PRIMARY KEY (id),
  CONSTRAINT session_recordings_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT session_recordings_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  CONSTRAINT session_recordings_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id),
  CONSTRAINT session_recordings_recording_id_unique UNIQUE (recording_id)
);

-- Indexes
CREATE INDEX idx_session_recordings_session_id ON public.session_recordings(session_id);
CREATE INDEX idx_session_recordings_school_id ON public.session_recordings(school_id);
CREATE INDEX idx_session_recordings_status ON public.session_recordings(status);

-- ============================================================================
-- 7. RECORDING VIEWS TABLE
-- Tracks who viewed recordings and when
-- ============================================================================
CREATE TABLE public.recording_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  recording_id uuid NOT NULL,
  user_id uuid NOT NULL,
  
  -- View details
  view_started_at timestamp with time zone NOT NULL DEFAULT now(),
  view_ended_at timestamp with time zone,
  duration_watched_seconds integer DEFAULT 0,
  completion_percentage numeric DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Playback info
  device_type text,
  browser_info text,
  ip_address text,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT recording_views_pkey PRIMARY KEY (id),
  CONSTRAINT recording_views_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT recording_views_recording_id_fkey FOREIGN KEY (recording_id) REFERENCES public.session_recordings(id) ON DELETE CASCADE,
  CONSTRAINT recording_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_recording_views_recording_id ON public.recording_views(recording_id);
CREATE INDEX idx_recording_views_user_id ON public.recording_views(user_id);
CREATE INDEX idx_recording_views_created_at ON public.recording_views(created_at);

-- ============================================================================
-- 8. SESSION EVENTS TABLE
-- Logs important events during sessions (hand raises, mutes, etc.)
-- ============================================================================
CREATE TABLE public.session_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_id uuid NOT NULL,
  user_id uuid,
  participant_id uuid,
  
  -- Event details
  event_type text NOT NULL CHECK (event_type IN (
    'session_started', 'session_ended', 'session_paused', 'session_resumed',
    'user_joined', 'user_left', 'user_removed',
    'hand_raised', 'hand_lowered',
    'muted_by_host', 'unmuted_by_host',
    'video_disabled_by_host', 'video_enabled_by_host',
    'screen_share_started', 'screen_share_stopped',
    'recording_started', 'recording_stopped',
    'chat_disabled', 'chat_enabled',
    'participant_promoted', 'participant_demoted',
    'breakout_room_created', 'breakout_room_closed',
    'poll_created', 'poll_ended',
    'whiteboard_opened', 'whiteboard_closed'
  )),
  
  -- Event data
  event_data jsonb, -- Flexible storage for event-specific data
  description text,
  
  -- Metadata
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT session_events_pkey PRIMARY KEY (id),
  CONSTRAINT session_events_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT session_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  CONSTRAINT session_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT session_events_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.session_participants(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_session_events_session_id ON public.session_events(session_id);
CREATE INDEX idx_session_events_user_id ON public.session_events(user_id);
CREATE INDEX idx_session_events_event_type ON public.session_events(event_type);
CREATE INDEX idx_session_events_timestamp ON public.session_events(timestamp);

-- ============================================================================
-- 9. VIRTUAL EXAM SESSIONS TABLE (For live exam administration)
-- ============================================================================
CREATE TABLE public.virtual_exam_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  video_session_id uuid NOT NULL,
  assessment_id uuid NOT NULL,
  
  -- Exam details
  title text NOT NULL,
  instructions text,
  
  -- Timing
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL,
  extra_time_minutes integer DEFAULT 0,
  
  -- Exam status
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'paused', 'ended', 'cancelled')),
  
  -- Proctoring settings
  enable_proctoring boolean NOT NULL DEFAULT true,
  require_camera boolean NOT NULL DEFAULT true,
  require_screen_recording boolean NOT NULL DEFAULT false,
  allow_tab_switch boolean NOT NULL DEFAULT false,
  max_tab_switches integer DEFAULT 3,
  enable_plagiarism_detection boolean NOT NULL DEFAULT false,
  
  -- Security settings
  randomize_questions boolean NOT NULL DEFAULT false,
  show_results_immediately boolean NOT NULL DEFAULT false,
  allow_review boolean NOT NULL DEFAULT true,
  
  -- Auto-submission
  auto_submit_on_time_up boolean NOT NULL DEFAULT true,
  warning_before_minutes integer DEFAULT 5,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  
  CONSTRAINT virtual_exam_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT virtual_exam_sessions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT virtual_exam_sessions_video_session_id_fkey FOREIGN KEY (video_session_id) REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  CONSTRAINT virtual_exam_sessions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE,
  CONSTRAINT virtual_exam_sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT virtual_exam_sessions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT virtual_exam_sessions_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_virtual_exam_sessions_video_session_id ON public.virtual_exam_sessions(video_session_id);
CREATE INDEX idx_virtual_exam_sessions_assessment_id ON public.virtual_exam_sessions(assessment_id);
CREATE INDEX idx_virtual_exam_sessions_status ON public.virtual_exam_sessions(status);

-- ============================================================================
-- 10. EXAM PROCTORING LOGS TABLE
-- Records suspicious activities during exams
-- ============================================================================
CREATE TABLE public.exam_proctoring_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  exam_session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  
  -- Incident details
  incident_type text NOT NULL CHECK (incident_type IN (
    'tab_switch', 'window_blur', 'copy_detected', 'paste_detected',
    'multiple_faces_detected', 'no_face_detected', 'looking_away',
    'suspicious_object_detected', 'mobile_phone_detected',
    'another_person_detected', 'screen_capture_attempt',
    'network_disconnection', 'suspicious_activity'
  )),
  
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Evidence
  screenshot_url text,
  video_clip_url text,
  evidence_data jsonb,
  
  -- Description
  description text,
  
  -- Review
  reviewed boolean NOT NULL DEFAULT false,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  review_notes text,
  action_taken text,
  
  -- Metadata
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT exam_proctoring_logs_pkey PRIMARY KEY (id),
  CONSTRAINT exam_proctoring_logs_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT exam_proctoring_logs_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES public.virtual_exam_sessions(id) ON DELETE CASCADE,
  CONSTRAINT exam_proctoring_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT exam_proctoring_logs_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_exam_proctoring_logs_exam_session_id ON public.exam_proctoring_logs(exam_session_id);
CREATE INDEX idx_exam_proctoring_logs_student_id ON public.exam_proctoring_logs(student_id);
CREATE INDEX idx_exam_proctoring_logs_severity ON public.exam_proctoring_logs(severity);
CREATE INDEX idx_exam_proctoring_logs_reviewed ON public.exam_proctoring_logs(reviewed);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.lessons IS 'Stores lesson content for virtual classroom';
COMMENT ON TABLE public.video_sessions IS 'Tracks live virtual classroom sessions with Agora integration';
COMMENT ON TABLE public.session_participants IS 'Records participants in each video session with engagement metrics';
COMMENT ON TABLE public.virtual_attendance IS 'Automatically tracked attendance for virtual classroom sessions';
COMMENT ON TABLE public.session_chat_messages IS 'Chat messages sent during virtual sessions';
COMMENT ON TABLE public.session_recordings IS 'Recorded session metadata and storage information';
COMMENT ON TABLE public.recording_views IS 'Tracks who watched recordings and for how long';
COMMENT ON TABLE public.session_events IS 'Event log for all significant actions during sessions';
COMMENT ON TABLE public.virtual_exam_sessions IS 'Live exam administration within virtual classroom';
COMMENT ON TABLE public.exam_proctoring_logs IS 'Proctoring incidents and suspicious activities during exams';

-- ============================================================================
-- END OF VIRTUAL CLASSROOM SCHEMA
-- ============================================================================