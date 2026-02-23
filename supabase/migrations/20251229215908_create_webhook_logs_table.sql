/*
  # Create webhook logs table for debugging

  1. New Tables
    - `webhook_logs`
      - `id` (uuid, primary key)
      - `payload` (jsonb) - full webhook payload
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Admin-only access
*/

CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read webhook logs"
  ON webhook_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );