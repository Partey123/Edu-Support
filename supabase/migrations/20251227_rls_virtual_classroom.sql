-- ============================================================================
-- ROW LEVEL SECURITY POLICIES FOR VIRTUAL CLASSROOM
-- Migration: 20251227_rls_virtual_classroom
-- ============================================================================

-- ============================================================================
-- DROP EXISTING POLICIES (if any)
-- ============================================================================

DROP POLICY IF EXISTS "Teachers can view class_subjects in their school" ON public.class_subjects;
DROP POLICY IF EXISTS "Teachers can create class_subjects in their school" ON public.class_subjects;
DROP POLICY IF EXISTS "Teachers can update class_subjects in their school" ON public.class_subjects;
DROP POLICY IF EXISTS "Teachers can delete class_subjects in their school" ON public.class_subjects;

DROP POLICY IF EXISTS "Teachers can view lessons in their school" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can create lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can delete lessons" ON public.lessons;

DROP POLICY IF EXISTS "Teachers can view video sessions" ON public.video_sessions;
DROP POLICY IF EXISTS "Teachers can create video sessions" ON public.video_sessions;
DROP POLICY IF EXISTS "Teachers can update video sessions" ON public.video_sessions;
DROP POLICY IF EXISTS "Teachers can delete video sessions" ON public.video_sessions;

DROP POLICY IF EXISTS "Teachers can view subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can update subjects" ON public.subjects;

DROP POLICY IF EXISTS "Students can view enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments in their school" ON public.enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Students can view class data" ON public.classes;
DROP POLICY IF EXISTS "Students can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can view classes in their school" ON public.classes;
DROP POLICY IF EXISTS "Students can view their enrolled classes" ON public.classes;

-- ============================================================================
-- CLASS_SUBJECTS TABLE POLICIES
-- ============================================================================

-- Allow teachers to read class_subjects in their school
CREATE POLICY "Teachers can view class_subjects in their school"
ON public.class_subjects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = class_subjects.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to insert class_subjects in their school
CREATE POLICY "Teachers can create class_subjects in their school"
ON public.class_subjects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = class_subjects.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to update class_subjects in their school
CREATE POLICY "Teachers can update class_subjects in their school"
ON public.class_subjects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = class_subjects.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to delete class_subjects in their school
CREATE POLICY "Teachers can delete class_subjects in their school"
ON public.class_subjects
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = class_subjects.school_id
    AND t.deleted_at IS NULL
  )
);

-- ============================================================================
-- LESSONS TABLE POLICIES
-- ============================================================================

-- Allow teachers to read lessons in their school
CREATE POLICY "Teachers can view lessons in their school"
ON public.lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = lessons.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to create lessons
CREATE POLICY "Teachers can create lessons"
ON public.lessons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = lessons.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to update lessons
CREATE POLICY "Teachers can update lessons"
ON public.lessons
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = lessons.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to delete lessons
CREATE POLICY "Teachers can delete lessons"
ON public.lessons
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = lessons.school_id
    AND t.deleted_at IS NULL
  )
);

-- ============================================================================
-- VIDEO_SESSIONS TABLE POLICIES
-- ============================================================================

-- Allow teachers to read video sessions
CREATE POLICY "Teachers can view video sessions"
ON public.video_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = video_sessions.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to create video sessions
CREATE POLICY "Teachers can create video sessions"
ON public.video_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = video_sessions.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to update video sessions
CREATE POLICY "Teachers can update video sessions"
ON public.video_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = video_sessions.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to delete video sessions
CREATE POLICY "Teachers can delete video sessions"
ON public.video_sessions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = video_sessions.school_id
    AND t.deleted_at IS NULL
  )
);

-- ============================================================================
-- SUBJECTS TABLE POLICIES
-- ============================================================================

-- Allow teachers to read subjects
CREATE POLICY "Teachers can view subjects"
ON public.subjects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = subjects.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to create subjects
CREATE POLICY "Teachers can create subjects"
ON public.subjects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = subjects.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow teachers to update subjects
CREATE POLICY "Teachers can update subjects"
ON public.subjects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = subjects.school_id
    AND t.deleted_at IS NULL
  )
);

-- ============================================================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================================================

-- Allow teachers to read enrollments in their school
CREATE POLICY "Teachers can view enrollments in their school"
ON public.enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = enrollments.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow students to view their own enrollments
CREATE POLICY "Students can view their own enrollments"
ON public.enrollments
FOR SELECT
USING (
  student_id = auth.uid()
);

-- ============================================================================
-- CLASSES TABLE POLICIES
-- ============================================================================

-- Allow teachers to read classes in their school
CREATE POLICY "Teachers can view classes in their school"
ON public.classes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
    AND t.school_id = classes.school_id
    AND t.deleted_at IS NULL
  )
);

-- Allow students to view classes they're enrolled in
CREATE POLICY "Students can view their enrolled classes"
ON public.classes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.student_id = auth.uid()
    AND e.class_id = classes.id
    AND e.deleted_at IS NULL
  )
);

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
