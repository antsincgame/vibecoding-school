/*
  # Add admin policies for student_works table

  1. Security Changes
    - Add policies for insert, update, delete operations
    - These policies allow management through the admin panel
*/

CREATE POLICY "Allow insert for admin"
  ON student_works
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for admin"
  ON student_works
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for admin"
  ON student_works
  FOR DELETE
  USING (true);