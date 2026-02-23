/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add index on `lesson_files.lesson_id` for foreign key optimization
    - Add index on `trial_registrations.course_id` for foreign key optimization

  2. Why This Matters
    - Foreign keys without indexes cause full table scans during JOIN operations
    - Adding indexes significantly improves query performance for related data lookups
*/

CREATE INDEX IF NOT EXISTS idx_lesson_files_lesson_id 
  ON public.lesson_files(lesson_id);

CREATE INDEX IF NOT EXISTS idx_trial_registrations_course_id 
  ON public.trial_registrations(course_id);