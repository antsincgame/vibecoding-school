/*
  # Create student_works table for showcasing student projects

  1. New Tables
    - `student_works`
      - `id` (uuid, primary key)
      - `student_name` (text) - Name of the student
      - `student_age` (integer) - Age of the student
      - `project_title` (text) - Title of the project
      - `project_description` (text) - Description of what the project does
      - `project_url` (text) - URL to view the live project
      - `image_url` (text) - URL of the project screenshot
      - `tool_type` (text) - Either 'bolt' or 'cursor'
      - `is_active` (boolean) - Whether to display this work
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `student_works` table
    - Add policy for public read access to active works
*/

CREATE TABLE IF NOT EXISTS student_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_age integer NOT NULL,
  project_title text NOT NULL,
  project_description text NOT NULL,
  project_url text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  tool_type text NOT NULL CHECK (tool_type IN ('bolt', 'cursor')),
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active student works"
  ON student_works
  FOR SELECT
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_student_works_tool_type ON student_works(tool_type);
CREATE INDEX IF NOT EXISTS idx_student_works_order ON student_works(order_index);
CREATE INDEX IF NOT EXISTS idx_student_works_active ON student_works(is_active);