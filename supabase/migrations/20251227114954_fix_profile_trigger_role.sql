/*
  # Fix profile creation trigger role

  1. Problem
    - The handle_new_user trigger function tries to insert role='student'
    - But the profiles table check constraint only allows 'user' or 'admin'
    - This causes the trigger to fail silently
    
  2. Changes
    - Update the trigger function to use 'user' instead of 'student'
    - Create profiles for existing users who don't have them
    
  3. Security
    - Maintains existing RLS policies
    - Uses 'user' role which matches the check constraint
*/

-- Update the trigger function to use 'user' role
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
    'user'
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

-- Create profiles for existing users who don't have them
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT 
    u.id,
    u.email,
    COALESCE(
        u.raw_user_meta_data->>'full_name', 
        u.raw_user_meta_data->>'name', 
        split_part(u.email, '@', 1)
    ),
    u.raw_user_meta_data->>'avatar_url',
    'user'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
