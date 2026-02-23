/*
  # Add homework_optional field to courses

  1. Changes
    - Add `homework_optional` boolean field to `courses` table
    - Default value is false (homework required)
    - For free courses, this can be set to true

  2. Purpose
    - Allow some courses to have optional homework
    - Free courses can have non-mandatory homework assignments
*/

ALTER TABLE courses ADD COLUMN IF NOT EXISTS homework_optional boolean DEFAULT false;

UPDATE courses SET homework_optional = true WHERE slug = 'vibecoder-free';
