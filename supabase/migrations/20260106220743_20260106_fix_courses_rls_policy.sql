/*
  # Fix Courses RLS Policy
  
  The SELECT policy was too complex and causing issues.
  Simplifying to allow public read of active courses.
  
  1. Changes
    - Replace complex SELECT policy with simpler version
    - Public can see active courses
    - Admin can see all courses
*/

-- Drop the existing complex policy
DROP POLICY IF EXISTS "Public or admin can view courses" ON courses;

-- Create simple policy for public to view active courses
CREATE POLICY "Anyone can view active courses"
  ON courses
  FOR SELECT
  USING (is_active = true);

-- Create separate policy for admin to view all courses
CREATE POLICY "Admin can view all courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));