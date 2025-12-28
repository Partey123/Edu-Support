CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'super_admin',
    'school_admin',
    'teacher',
    'parent'
);


--
-- Name: get_user_school_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_school_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT school_id FROM public.profiles WHERE id = _user_id
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, school_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    (NEW.raw_user_meta_data ->> 'school_id')::UUID
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    status text NOT NULL,
    marked_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT attendance_status_check CHECK ((status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text, 'excused'::text])))
);


--
-- Name: class_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    teacher_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid NOT NULL,
    name text NOT NULL,
    level text NOT NULL,
    section text,
    room text,
    class_teacher_id uuid,
    academic_year text DEFAULT '2024/2025'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    phone text,
    avatar_url text,
    school_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: schools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    email text,
    logo_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid NOT NULL,
    class_id uuid,
    first_name text NOT NULL,
    last_name text NOT NULL,
    date_of_birth date,
    gender text,
    admission_number text,
    admission_date date DEFAULT CURRENT_DATE,
    parent_name text,
    parent_phone text,
    parent_email text,
    address text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT students_gender_check CHECK ((gender = ANY (ARRAY['Male'::text, 'Female'::text]))),
    CONSTRAINT students_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'graduated'::text, 'transferred'::text])))
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid NOT NULL,
    name text NOT NULL,
    code text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teachers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    school_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    subjects text[] DEFAULT '{}'::text[],
    status text DEFAULT 'active'::text NOT NULL,
    hire_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT teachers_status_check CHECK ((status = ANY (ARRAY['active'::text, 'on-leave'::text, 'inactive'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_student_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_date_key UNIQUE (student_id, date);


--
-- Name: class_subjects class_subjects_class_id_subject_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_class_id_subject_id_key UNIQUE (class_id, subject_id);


--
-- Name: class_subjects class_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_attendance_class_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_class_date ON public.attendance USING btree (class_id, date);


--
-- Name: idx_attendance_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_school_id ON public.attendance USING btree (school_id);


--
-- Name: idx_attendance_student_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_student_date ON public.attendance USING btree (student_id, date);


--
-- Name: idx_classes_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_classes_school_id ON public.classes USING btree (school_id);


--
-- Name: idx_students_class_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_class_id ON public.students USING btree (class_id);


--
-- Name: idx_students_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_school_id ON public.students USING btree (school_id);


--
-- Name: idx_subjects_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subjects_school_id ON public.subjects USING btree (school_id);


--
-- Name: idx_teachers_school_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teachers_school_id ON public.teachers USING btree (school_id);


--
-- Name: classes update_classes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: schools update_schools_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: students update_students_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subjects update_subjects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: teachers update_teachers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendance attendance_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES auth.users(id);


--
-- Name: attendance attendance_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: class_subjects class_subjects_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: class_subjects class_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: class_subjects class_subjects_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;


--
-- Name: classes classes_class_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_class_teacher_id_fkey FOREIGN KEY (class_teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;


--
-- Name: classes classes_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;


--
-- Name: students students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- Name: students students_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: subjects subjects_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Allow role assignment during signup; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow role assignment during signup" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: schools Allow school creation during signup; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow school creation during signup" ON public.schools FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: attendance Parents can view attendance in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view attendance in their school" ON public.attendance FOR SELECT USING ((public.has_role(auth.uid(), 'parent'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: classes Parents can view classes in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view classes in their school" ON public.classes FOR SELECT USING ((public.has_role(auth.uid(), 'parent'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: students Parents can view students in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view students in their school" ON public.students FOR SELECT USING ((public.has_role(auth.uid(), 'parent'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: user_roles School admins can assign roles to users in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can assign roles to users in their school" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (public.get_user_school_id(user_id) = public.get_user_school_id(auth.uid())) AND (role = ANY (ARRAY['teacher'::public.app_role, 'parent'::public.app_role]))));


--
-- Name: profiles School admins can insert profiles in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can insert profiles in their school" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: attendance School admins can manage attendance in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can manage attendance in their school" ON public.attendance USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: class_subjects School admins can manage class subjects in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can manage class subjects in their school" ON public.class_subjects USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (EXISTS ( SELECT 1
   FROM public.classes c
  WHERE ((c.id = class_subjects.class_id) AND (c.school_id = public.get_user_school_id(auth.uid())))))));


--
-- Name: classes School admins can manage classes in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can manage classes in their school" ON public.classes USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: students School admins can manage students in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can manage students in their school" ON public.students USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: subjects School admins can manage subjects in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can manage subjects in their school" ON public.subjects USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: teachers School admins can manage teachers in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can manage teachers in their school" ON public.teachers USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: profiles School admins can update profiles in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can update profiles in their school" ON public.profiles FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: profiles School admins can view profiles in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can view profiles in their school" ON public.profiles FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: user_roles School admins can view roles of users in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can view roles of users in their school" ON public.user_roles FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'school_admin'::public.app_role) AND (public.get_user_school_id(user_id) = public.get_user_school_id(auth.uid()))));


--
-- Name: schools School admins can view their own school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "School admins can view their own school" ON public.schools FOR SELECT TO authenticated USING ((id = public.get_user_school_id(auth.uid())));


--
-- Name: attendance Super admins can manage all attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all attendance" ON public.attendance USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: class_subjects Super admins can manage all class subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all class subjects" ON public.class_subjects USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: classes Super admins can manage all classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all classes" ON public.classes USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: user_roles Super admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: schools Super admins can manage all schools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all schools" ON public.schools TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: students Super admins can manage all students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all students" ON public.students USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: subjects Super admins can manage all subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all subjects" ON public.subjects USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: teachers Super admins can manage all teachers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage all teachers" ON public.teachers USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: profiles Super admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: schools Teachers and parents can view their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers and parents can view their school" ON public.schools FOR SELECT TO authenticated USING ((id = public.get_user_school_id(auth.uid())));


--
-- Name: attendance Teachers can manage attendance in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can manage attendance in their school" ON public.attendance USING ((public.has_role(auth.uid(), 'teacher'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: class_subjects Teachers can view class subjects in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view class subjects in their school" ON public.class_subjects FOR SELECT USING ((public.has_role(auth.uid(), 'teacher'::public.app_role) AND (EXISTS ( SELECT 1
   FROM public.classes c
  WHERE ((c.id = class_subjects.class_id) AND (c.school_id = public.get_user_school_id(auth.uid())))))));


--
-- Name: classes Teachers can view classes in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view classes in their school" ON public.classes FOR SELECT USING ((public.has_role(auth.uid(), 'teacher'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: students Teachers can view students in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view students in their school" ON public.students FOR SELECT USING ((public.has_role(auth.uid(), 'teacher'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: subjects Teachers can view subjects in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view subjects in their school" ON public.subjects FOR SELECT USING ((public.has_role(auth.uid(), 'teacher'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: teachers Teachers can view teachers in their school; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view teachers in their school" ON public.teachers FOR SELECT USING ((public.has_role(auth.uid(), 'teacher'::public.app_role) AND (school_id = public.get_user_school_id(auth.uid()))));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((id = auth.uid()));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((id = auth.uid()));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((id = auth.uid()));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

--
-- Name: class_subjects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

--
-- Name: classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: schools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

--
-- Name: students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

--
-- Name: subjects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

--
-- Name: teachers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;