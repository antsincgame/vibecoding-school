/*
  # Fix Profiles Table RLS Infinite Recursion

  ## Problem
  The profiles table has a SELECT policy that references itself through an EXISTS subquery,
  causing infinite recursion errors that appear intermittently.

  ## Solution
  1. Drop the recursive policy on profiles
  2. Create simple, non-recursive policies for profiles
  3. Update remaining policies on other tables that still use direct profiles queries

  ## Changes
  - profiles: Replace recursive SELECT policy with simple user-only policy
  - profiles: Admin check moved to is_admin() SECURITY DEFINER function
  - student_works: Update INSERT/UPDATE/DELETE policies to use is_admin() function
*/

-- Fix profiles SELECT policy (remove recursion)
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create policy for is_admin function to read profiles (bypasses RLS via SECURITY DEFINER)
-- The is_admin() function already uses SECURITY DEFINER so it can read profiles

-- Fix student_works INSERT/UPDATE/DELETE policies to use is_admin() function
DROP POLICY IF EXISTS "Authenticated admins can insert" ON student_works;
CREATE POLICY "Admin can insert student works"
  ON student_works FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated admins can update" ON student_works;
CREATE POLICY "Admin can update student works"
  ON student_works FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated admins can delete" ON student_works;
CREATE POLICY "Admin can delete student works"
  ON student_works FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix any remaining policies on other tables that might have the same issue
-- Check blog_posts
DROP POLICY IF EXISTS "Admin can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated admins can insert posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated admins can update posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated admins can delete posts" ON blog_posts;

CREATE POLICY "Admin can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix courses INSERT/UPDATE/DELETE (they currently use USING(true) which is insecure)
DROP POLICY IF EXISTS "Authenticated users can insert courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can update courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can delete courses" ON courses;

CREATE POLICY "Admin can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix faqs INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Authenticated admins can insert faqs" ON faqs;
DROP POLICY IF EXISTS "Authenticated admins can update faqs" ON faqs;
DROP POLICY IF EXISTS "Authenticated admins can delete faqs" ON faqs;
DROP POLICY IF EXISTS "Admin can insert faqs" ON faqs;
DROP POLICY IF EXISTS "Admin can update faqs" ON faqs;
DROP POLICY IF EXISTS "Admin can delete faqs" ON faqs;

CREATE POLICY "Admin can insert faqs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update faqs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete faqs"
  ON faqs FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
