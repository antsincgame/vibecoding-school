/*
  # Fix courses, FAQs, and all tables using is_admin() function

  1. Changes
    - Drop all policies using is_admin() function
    - Drop is_admin() function
    - Recreate policies with JWT-based checks
    
  2. Tables affected
    - blog_posts
    - courses  
    - lessons
    - lesson_files
    - student_works
    - faqs
    
  3. Security
    - Admin role checked from JWT token (app_metadata)
    - No recursive queries to profiles table
*/

-- Drop all policies that use is_admin() function
-- blog_posts
DROP POLICY IF EXISTS "Admin can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can delete blog posts" ON blog_posts;

-- courses
DROP POLICY IF EXISTS "Admin can view all courses" ON courses;
DROP POLICY IF EXISTS "Admin can insert courses" ON courses;
DROP POLICY IF EXISTS "Admin can update courses" ON courses;
DROP POLICY IF EXISTS "Admin can delete courses" ON courses;

-- lessons
DROP POLICY IF EXISTS "Admin can insert lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can update lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can delete lessons" ON lessons;

-- lesson_files
DROP POLICY IF EXISTS "Admin can insert lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Admin can update lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Admin can delete lesson files" ON lesson_files;

-- student_works
DROP POLICY IF EXISTS "Admin can insert student works" ON student_works;
DROP POLICY IF EXISTS "Admin can update student works" ON student_works;
DROP POLICY IF EXISTS "Admin can delete student works" ON student_works;

-- Now we can drop the function
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;

-- Recreate all policies with JWT-based checks
-- blog_posts
CREATE POLICY "Admin can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- courses
CREATE POLICY "Admin can view all courses"
  ON courses FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- lessons
CREATE POLICY "Admin can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- lesson_files
CREATE POLICY "Admin can insert lesson files"
  ON lesson_files FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update lesson files"
  ON lesson_files FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete lesson files"
  ON lesson_files FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- student_works
CREATE POLICY "Admin can insert student works"
  ON student_works FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update student works"
  ON student_works FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete student works"
  ON student_works FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- faqs - add missing admin policies
CREATE POLICY "Admin can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update FAQs"
  ON faqs FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
