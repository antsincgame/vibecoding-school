/*
  # Create Founder Questions Table
  
  1. New Tables
    - `founder_questions`
      - `id` (uuid, primary key)
      - `name` (text) - Person's name
      - `email` (text) - Contact email
      - `phone` (text, nullable) - Optional phone number
      - `question` (text) - The question text
      - `status` (text) - 'new', 'in_progress', 'answered'
      - `admin_notes` (text, nullable) - Internal notes for admin
      - `answered_at` (timestamptz, nullable) - When question was answered
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on founder_questions table
    - Public can INSERT new questions
    - Only admins can SELECT, UPDATE, DELETE
  
  3. Indexes
    - Index on status for filtering
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS founder_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  question text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'answered')),
  admin_notes text DEFAULT '',
  answered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_founder_questions_status ON founder_questions(status);
CREATE INDEX IF NOT EXISTS idx_founder_questions_created_at ON founder_questions(created_at DESC);

ALTER TABLE founder_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit questions"
  ON founder_questions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin can view all questions"
  ON founder_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update questions"
  ON founder_questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete questions"
  ON founder_questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );