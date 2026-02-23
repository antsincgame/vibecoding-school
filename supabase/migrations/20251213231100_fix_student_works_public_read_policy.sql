/*
  # Fix student_works public read policy

  1. Changes
    - Drop existing public read policy
    - Create new policy with explicit anon role for anonymous users to read active works

  2. Security
    - Allow anonymous users to read active student works
*/

DROP POLICY IF EXISTS "Anyone can read active student works" ON student_works;

CREATE POLICY "Anyone can read active student works"
  ON student_works
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);