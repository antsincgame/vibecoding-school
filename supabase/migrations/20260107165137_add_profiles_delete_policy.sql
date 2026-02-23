/*
  # Add delete policy for profiles table

  1. Changes
    - Add DELETE policy for profiles table
    - Allows admins to delete user profiles
    - Prevents users from deleting themselves through RLS
  
  2. Security
    - Only admins can delete profiles
    - The actual deletion is handled by the delete-user edge function
    - This policy ensures data integrity at the database level
*/

CREATE POLICY "Admins can delete user profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );