/*
  # Fix Infinite Recursion in RLS Policies

  ## Problem
  RLS policies were checking profiles table within EXISTS subqueries, but profiles table itself has RLS enabled,
  causing infinite recursion: "infinite recursion detected in policy for relation profiles"

  ## Solution
  Drop all RLS policies that check admin status through profiles table.
  Create new helper function with SECURITY DEFINER to bypass RLS for admin checks.
  Use this function in all RLS policies instead of subqueries to profiles.
  
  ## Security
  - Function runs as owner (bypasses RLS for the function's logic)
  - Function only exposes boolean result, no data leakage
  - Still respects all security requirements
*/

-- Create helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = user_id
    AND profiles.role = 'admin'
  );
$$;

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Public can read published posts, authenticated can read all" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;

CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admin can read all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix courses policies
DROP POLICY IF EXISTS "Public can view active courses, authenticated admins can view all" ON courses;
DROP POLICY IF EXISTS "Authenticated users can view all courses" ON courses;

CREATE POLICY "Public can view active courses"
  ON courses FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can view all courses"
  ON courses FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix faqs policies
DROP POLICY IF EXISTS "Public can view active FAQs, authenticated admins can view all" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can view all FAQs" ON faqs;

CREATE POLICY "Public can view active FAQs"
  ON faqs FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can view all FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix lesson_files policies
DROP POLICY IF EXISTS "Public can view files for published lessons, admins can view all" ON lesson_files;

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
  USING (public.is_admin(auth.uid()));

-- Fix lessons policies
DROP POLICY IF EXISTS "Public can view published lessons, admins can view all" ON lessons;

CREATE POLICY "Public can view published lessons"
  ON lessons FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admin can view all lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix student_works policies
DROP POLICY IF EXISTS "Public can read active works, admins can view all" ON student_works;
DROP POLICY IF EXISTS "Authenticated admins can view all works" ON student_works;

CREATE POLICY "Public can read active student works"
  ON student_works FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can read all student works"
  ON student_works FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Keep all INSERT/UPDATE/DELETE policies with SECURITY DEFINER function
DROP POLICY IF EXISTS "Admin can insert lessons" ON lessons;
CREATE POLICY "Admin can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update lessons" ON lessons;
CREATE POLICY "Admin can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can delete lessons" ON lessons;
CREATE POLICY "Admin can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can insert lesson files" ON lesson_files;
CREATE POLICY "Admin can insert lesson files"
  ON lesson_files FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update lesson files" ON lesson_files;
CREATE POLICY "Admin can update lesson files"
  ON lesson_files FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can delete lesson files" ON lesson_files;
CREATE POLICY "Admin can delete lesson files"
  ON lesson_files FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
