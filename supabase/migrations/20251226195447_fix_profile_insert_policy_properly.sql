/*
  # Fix profile insert policy for trigger

  1. Problem
    - Previous policy was too permissive
    - Need to allow both user inserts and trigger inserts
    
  2. Solution
    - Drop the overly permissive policy
    - Keep the original "Users can insert own profile" policy
    - The trigger will work because it uses SECURITY DEFINER with proper owner
    
  3. Notes
    - SECURITY DEFINER functions run with the privileges of the function owner
    - The function owner (postgres) can bypass RLS
*/

DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;