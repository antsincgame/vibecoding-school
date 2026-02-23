/*
  # Add automatic profile creation trigger

  1. Problem
    - When users sign up via Google OAuth, a profile record is not created automatically
    - This causes the user to appear as not logged in even after successful authentication
    
  2. Solution
    - Create a trigger function that automatically creates a profile when a new user signs up
    - The trigger fires on INSERT to auth.users table
    
  3. Security
    - Function runs with SECURITY DEFINER to have permission to insert into profiles table
    - Extracts user metadata (full_name, avatar_url) from auth.users
    - Sets default role to 'student'
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'student'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();