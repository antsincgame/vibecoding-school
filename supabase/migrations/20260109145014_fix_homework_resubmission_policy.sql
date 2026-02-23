/*
  # Fix Homework Resubmission Policy

  ## Problem
  Students cannot resubmit homework after rejection because the RLS policy
  only allows updates when status = 'pending', but rejected homework has
  status = 'rejected'.

  ## Solution
  Update the policy to allow students to update their homework when status
  is either 'pending' OR 'rejected'.

  ## Changes
  - Drop existing "Students can update pending submissions" policy
  - Create new policy allowing updates for pending or rejected submissions
*/

DROP POLICY IF EXISTS "Students can update pending submissions" ON homework_submissions;

CREATE POLICY "Students can update own submissions"
  ON homework_submissions
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() AND status IN ('pending', 'rejected'))
  WITH CHECK (student_id = auth.uid());
