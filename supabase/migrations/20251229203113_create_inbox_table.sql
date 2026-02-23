/*
  # Create inbox table for incoming emails
  
  1. New Tables
    - `inbox`
      - `id` (uuid, primary key)
      - `message_id` (text, unique) - Resend message ID
      - `from_email` (text) - Sender email
      - `from_name` (text) - Sender name
      - `to_email` (text) - Recipient email
      - `subject` (text) - Email subject
      - `text_content` (text) - Plain text content
      - `html_content` (text) - HTML content
      - `headers` (jsonb) - Email headers
      - `attachments` (jsonb) - Array of attachment metadata
      - `is_read` (boolean) - Read status
      - `is_archived` (boolean) - Archive status
      - `created_at` (timestamptz) - When received
      - `updated_at` (timestamptz) - Last update
  
  2. Security
    - Enable RLS on `inbox` table
    - Add policies for admin to read/update inbox
*/

CREATE TABLE IF NOT EXISTS inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text UNIQUE NOT NULL,
  from_email text NOT NULL,
  from_name text,
  to_email text NOT NULL,
  subject text,
  text_content text,
  html_content text,
  headers jsonb DEFAULT '{}'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbox_message_id ON inbox(message_id);
CREATE INDEX IF NOT EXISTS idx_inbox_from_email ON inbox(from_email);
CREATE INDEX IF NOT EXISTS idx_inbox_to_email ON inbox(to_email);
CREATE INDEX IF NOT EXISTS idx_inbox_created_at ON inbox(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_is_read ON inbox(is_read) WHERE is_read = false;

ALTER TABLE inbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all inbox messages" ON inbox;
CREATE POLICY "Admins can view all inbox messages"
  ON inbox
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update inbox messages" ON inbox;
CREATE POLICY "Admins can update inbox messages"
  ON inbox
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can insert inbox messages" ON inbox;
CREATE POLICY "Service role can insert inbox messages"
  ON inbox
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete inbox messages" ON inbox;
CREATE POLICY "Admins can delete inbox messages"
  ON inbox
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
