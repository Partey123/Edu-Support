-- Create video_sessions table for tracking live classroom sessions
CREATE TABLE IF NOT EXISTS public.video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'paused', 'ended')),
  is_active BOOLEAN DEFAULT false,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  recording_id UUID,
  recording_url TEXT,
  participant_count INTEGER DEFAULT 0,
  max_participants INTEGER,
  
  -- Settings
  allow_recording BOOLEAN DEFAULT true,
  allow_chat BOOLEAN DEFAULT true,
  allow_screen_share BOOLEAN DEFAULT true,
  allow_hand_raise BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_times CHECK (end_time IS NULL OR end_time >= start_time),
  CONSTRAINT valid_participant_count CHECK (participant_count >= 0 AND (max_participants IS NULL OR participant_count <= max_participants))
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_video_sessions_class_id ON public.video_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_teacher_id ON public.video_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON public.video_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_sessions_start_time ON public.video_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_video_sessions_is_active ON public.video_sessions(is_active);

-- Create user_activities table for tracking user interactions during sessions
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('joined', 'left', 'audioOn', 'audioOff', 'videoOn', 'videoOff', 'screenShare', 'screenShareEnd', 'questionAsked', 'answerSubmitted', 'handRaised', 'handLowered')),
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  
  -- Additional data
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_activities
CREATE INDEX IF NOT EXISTS idx_user_activities_session_id ON public.user_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action ON public.user_activities(action);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON public.user_activities(timestamp DESC);

-- Create session_recordings table for storing recording metadata
CREATE TABLE IF NOT EXISTS public.session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.video_sessions(id) ON DELETE CASCADE,
  
  -- File information
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Processing details
  video_codec VARCHAR(50),
  audio_codec VARCHAR(50),
  resolution VARCHAR(50),
  frame_rate INTEGER,
  bitrate_kbps INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0)
);

-- Create indexes for session_recordings
CREATE INDEX IF NOT EXISTS idx_session_recordings_session_id ON public.session_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_status ON public.session_recordings(status);
CREATE INDEX IF NOT EXISTS idx_session_recordings_created_at ON public.session_recordings(created_at DESC);

-- Create view for session analytics
CREATE OR REPLACE VIEW public.session_analytics AS
SELECT 
  vs.id as session_id,
  vs.class_id,
  vs.teacher_id,
  vs.channel_name,
  vs.start_time,
  vs.end_time,
  EXTRACT(EPOCH FROM (vs.end_time - vs.start_time))::INTEGER as duration_seconds,
  vs.participant_count,
  COUNT(DISTINCT ua.user_id) as unique_participants,
  COUNT(DISTINCT CASE WHEN ua.action = 'joined' THEN ua.user_id END) as users_joined,
  COUNT(DISTINCT CASE WHEN ua.action = 'left' THEN ua.user_id END) as users_left,
  COUNT(CASE WHEN ua.action = 'questionAsked' THEN 1 END) as questions_asked,
  COUNT(CASE WHEN ua.action = 'answerSubmitted' THEN 1 END) as answers_submitted,
  EXISTS (SELECT 1 FROM public.session_recordings WHERE session_id = vs.id AND status = 'completed') as has_recording
FROM public.video_sessions vs
LEFT JOIN public.user_activities ua ON vs.id = ua.session_id
GROUP BY vs.id, vs.class_id, vs.teacher_id, vs.channel_name, vs.start_time, vs.end_time, vs.participant_count;

-- Create function to update session duration
CREATE OR REPLACE FUNCTION public.update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating session duration
DROP TRIGGER IF EXISTS trigger_update_session_duration ON public.video_sessions;
CREATE TRIGGER trigger_update_session_duration
BEFORE UPDATE ON public.video_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_session_duration();

-- Create function to log user join activity
CREATE OR REPLACE FUNCTION public.log_user_joined(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.user_activities (session_id, user_id, action, metadata)
  VALUES (p_session_id, p_user_id, 'joined', jsonb_build_object('joined_at', NOW()))
  RETURNING id INTO v_activity_id;
  
  -- Update participant count
  UPDATE public.video_sessions
  SET participant_count = (
    SELECT COUNT(DISTINCT user_id) 
    FROM public.user_activities 
    WHERE session_id = p_session_id AND action IN ('joined', 'videoOn', 'audioOn')
  )
  WHERE id = p_session_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to log user left activity
CREATE OR REPLACE FUNCTION public.log_user_left(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_join_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Find the join time
  SELECT timestamp INTO v_join_time
  FROM public.user_activities
  WHERE session_id = p_session_id AND user_id = p_user_id AND action = 'joined'
  ORDER BY timestamp DESC
  LIMIT 1;
  
  INSERT INTO public.user_activities (
    session_id, 
    user_id, 
    action, 
    duration_seconds,
    metadata
  )
  VALUES (
    p_session_id, 
    p_user_id, 
    'left', 
    EXTRACT(EPOCH FROM (NOW() - v_join_time))::INTEGER,
    jsonb_build_object('left_at', NOW())
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_sessions
-- Teachers can view and create sessions for their classes
CREATE POLICY "Teachers can view their own sessions"
  ON public.video_sessions FOR SELECT
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE id = video_sessions.class_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create sessions for their classes"
  ON public.video_sessions FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE id = class_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their own sessions"
  ON public.video_sessions FOR UPDATE
  USING (
    teacher_id = auth.uid()
  );

-- Students can view sessions for their enrolled classes
CREATE POLICY "Students can view sessions for enrolled classes"
  ON public.video_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.classes c ON e.class_id = c.id
      WHERE c.id = video_sessions.class_id AND e.student_id = auth.uid()
    )
  );

-- RLS Policies for user_activities
-- Users can view activities from sessions they're part of
CREATE POLICY "Users can view activities from their sessions"
  ON public.user_activities FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.video_sessions vs
      WHERE vs.id = user_activities.session_id AND (
        vs.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.enrollments e
          WHERE e.class_id = vs.class_id AND e.student_id = auth.uid()
        )
      )
    )
  );

-- RLS Policies for session_recordings
-- Teachers can view recordings of their sessions
CREATE POLICY "Teachers can view their session recordings"
  ON public.session_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.video_sessions vs
      WHERE vs.id = session_recordings.session_id AND vs.teacher_id = auth.uid()
    )
  );

-- Students can view recordings of sessions they attended
CREATE POLICY "Students can view session recordings from enrolled classes"
  ON public.session_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.video_sessions vs
      JOIN public.enrollments e ON e.class_id = vs.class_id
      WHERE vs.id = session_recordings.session_id AND e.student_id = auth.uid()
    )
  );
