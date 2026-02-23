/*
  # Create auth tokens table for email verification and password reset

  1. New Tables
    - `auth_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text) - user email
      - `token` (text, unique) - secure random token
      - `token_type` (text) - 'email_verification' or 'password_reset'
      - `expires_at` (timestamptz) - token expiration time
      - `used_at` (timestamptz, nullable) - when token was used
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `auth_tokens` table
    - Service role can manage all tokens
    - Users cannot directly access tokens (only via edge functions)
  
  3. Indexes
    - Index on token for fast lookup
    - Index on email for finding tokens by email
    - Index on expires_at for cleanup
*/

CREATE TABLE IF NOT EXISTS auth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  token_type text NOT NULL CHECK (token_type IN ('email_verification', 'password_reset')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_email ON auth_tokens(email);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);

CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth_tokens WHERE expires_at < now();
END;
$$;
