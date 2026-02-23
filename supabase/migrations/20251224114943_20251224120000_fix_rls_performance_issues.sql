/*
  # Fix RLS Performance and Security Issues

  ## Performance Optimizations

  1. **Optimize auth function calls in RLS policies**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This prevents re-evaluation for each row, improving query performance

  2. **Fix is_admin function**
     - Set immutable search_path to prevent security issues
     - Make function STABLE with proper configuration

  3. **Consolidate duplicate policies**
     - Merge multiple permissive policies into single policies where appropriate

  ## Tables Updated
  - profiles
  - blog_posts
  - courses
  - faqs
  - lessons
  - lesson_files
  - student_works
  - system_settings
  - trial_registrations
*/

-- Fix is_admin function with stable search_path (using CREATE OR REPLACE to keep dependencies)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = user_id
    AND profiles.role = 'admin'
  );
$$;

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- =============================================================================
-- BLOG_POSTS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can read all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can delete blog posts" ON blog_posts;

CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admin can read all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- =============================================================================
-- COURSES TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Public can view active courses" ON courses;
DROP POLICY IF EXISTS "Admin can view all courses" ON courses;
DROP POLICY IF EXISTS "Admin can insert courses" ON courses;
DROP POLICY IF EXISTS "Admin can update courses" ON courses;
DROP POLICY IF EXISTS "Admin can delete courses" ON courses;

CREATE POLICY "Public can view active courses"
  ON courses FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can view all courses"
  ON courses FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- =============================================================================
-- FAQS TABLE - Consolidate duplicate policies
-- =============================================================================

DROP POLICY IF EXISTS "Public can view active FAQs" ON faqs;
DROP POLICY IF EXISTS "Admin can view all FAQs" ON faqs;
DROP POLICY IF EXISTS "Admin can insert faqs" ON faqs;
DROP POLICY IF EXISTS "Admin can update faqs" ON faqs;
DROP POLICY IF EXISTS "Admin can delete faqs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can insert FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can update FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can delete FAQs" ON faqs;

CREATE POLICY "Public can view active FAQs"
  ON faqs FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage all FAQs"
  ON faqs FOR ALL
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

-- =============================================================================
-- LESSONS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Public can view published lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can view all lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can insert lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can update lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can delete lessons" ON lessons;

CREATE POLICY "Public can view published lessons"
  ON lessons FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admin can view all lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- =============================================================================
-- LESSON_FILES TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Public can view files for published lessons" ON lesson_files;
DROP POLICY IF EXISTS "Admin can view all lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Admin can insert lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Admin can update lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Admin can delete lesson files" ON lesson_files;

CREATE POLICY "Public can view files for published lessons"
  ON lesson_files FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = lesson_files.lesson_id
      AND lessons.is_published = true
    )
  );

CREATE POLICY "Admin can view all lesson files"
  ON lesson_files FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can insert lesson files"
  ON lesson_files FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can update lesson files"
  ON lesson_files FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can delete lesson files"
  ON lesson_files FOR DELETE
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- =============================================================================
-- STUDENT_WORKS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Public can read active student works" ON student_works;
DROP POLICY IF EXISTS "Admin can read all student works" ON student_works;
DROP POLICY IF EXISTS "Admin can insert student works" ON student_works;
DROP POLICY IF EXISTS "Admin can update student works" ON student_works;
DROP POLICY IF EXISTS "Admin can delete student works" ON student_works;

CREATE POLICY "Public can read active student works"
  ON student_works FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can read all student works"
  ON student_works FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can insert student works"
  ON student_works FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can update student works"
  ON student_works FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can delete student works"
  ON student_works FOR DELETE
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- =============================================================================
-- SYSTEM_SETTINGS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Public can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Admin can manage system settings" ON system_settings;

CREATE POLICY "Public can read system settings"
  ON system_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage system settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

-- =============================================================================
-- TRIAL_REGISTRATIONS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Public can insert trial registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Admin can view all trial registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Admin can update trial registrations" ON trial_registrations;

CREATE POLICY "Public can insert trial registrations"
  ON trial_registrations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin can view all trial registrations"
  ON trial_registrations FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

CREATE POLICY "Admin can update trial registrations"
  ON trial_registrations FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));