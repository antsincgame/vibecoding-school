/*
  # Clean Up Duplicate Policies and Unused Indexes
  
  1. Remove Unused Indexes
    - idx_trial_registrations_course_id
    - idx_lesson_files_lesson_id
  
  2. Remove Duplicate Always-True Policies
    - "Anyone can submit founder questions" (always-true policy)
    - Keep only "Public can submit founder questions" with validation
*/

-- ============================================================================
-- PART 1: Remove Unused Indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_trial_registrations_course_id;
DROP INDEX IF EXISTS idx_lesson_files_lesson_id;

-- ============================================================================
-- PART 2: Remove Duplicate Always-True Policy on founder_questions
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can submit founder questions" ON founder_questions;