/*
  # Fix all RLS policies to use JWT instead of profiles table

  1. Changes
    - Replace all recursive profiles checks with JWT-based admin role verification
    - Prevents infinite recursion across all tables
    - Maintains same security guarantees
    
  2. Tables affected
    - auth_tokens
    - blog_posts
    - course_lessons
    - course_modules
    - email_logs
    - email_templates
    - faqs
    - inbox
    - lesson_files
    - lessons
    - openrouter_settings
    - site_settings
    - student_works
    - system_settings
    - trial_registrations
    - video_testimonials
    - webhook_logs
    
  3. Security
    - Admin role checked from JWT token (app_metadata)
    - Cannot be modified by users
    - No performance impact from recursive queries
*/

-- auth_tokens
DROP POLICY IF EXISTS "Admin can view auth tokens" ON auth_tokens;
DROP POLICY IF EXISTS "Admin can delete auth tokens" ON auth_tokens;

CREATE POLICY "Admin can view auth tokens"
  ON auth_tokens FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete auth tokens"
  ON auth_tokens FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- blog_posts
DROP POLICY IF EXISTS "Public or admin can read blog posts" ON blog_posts;

CREATE POLICY "Public or admin can read blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (
    is_published = true 
    OR 
    ((auth.role() = 'authenticated') AND ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  );

-- course_lessons
DROP POLICY IF EXISTS "Admin can insert course lessons" ON course_lessons;
DROP POLICY IF EXISTS "Admin can update course lessons" ON course_lessons;
DROP POLICY IF EXISTS "Admin can delete course lessons" ON course_lessons;

CREATE POLICY "Admin can insert course lessons"
  ON course_lessons FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update course lessons"
  ON course_lessons FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete course lessons"
  ON course_lessons FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- course_modules
DROP POLICY IF EXISTS "Admin can insert course modules" ON course_modules;
DROP POLICY IF EXISTS "Admin can update course modules" ON course_modules;
DROP POLICY IF EXISTS "Admin can delete course modules" ON course_modules;

CREATE POLICY "Admin can insert course modules"
  ON course_modules FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update course modules"
  ON course_modules FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete course modules"
  ON course_modules FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- email_logs
DROP POLICY IF EXISTS "Admins can view all email logs" ON email_logs;
DROP POLICY IF EXISTS "Service role can insert email logs" ON email_logs;
DROP POLICY IF EXISTS "Service role can update email logs" ON email_logs;

CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Service role can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Service role can update email logs"
  ON email_logs FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- email_templates
DROP POLICY IF EXISTS "Admins can view email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can insert email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can update email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can delete email templates" ON email_templates;

CREATE POLICY "Admins can view email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert email templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update email templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete email templates"
  ON email_templates FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- faqs (needs special handling for public access)
DROP POLICY IF EXISTS "Public or admin can view FAQs" ON faqs;

CREATE POLICY "Public or admin can view FAQs"
  ON faqs FOR SELECT
  TO public
  USING (
    is_active = true 
    OR 
    ((auth.role() = 'authenticated') AND ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  );

-- inbox
DROP POLICY IF EXISTS "Admins can view all inbox messages" ON inbox;
DROP POLICY IF EXISTS "Service role can insert inbox messages" ON inbox;
DROP POLICY IF EXISTS "Admins can update inbox messages" ON inbox;
DROP POLICY IF EXISTS "Admins can delete inbox messages" ON inbox;

CREATE POLICY "Admins can view all inbox messages"
  ON inbox FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Service role can insert inbox messages"
  ON inbox FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update inbox messages"
  ON inbox FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete inbox messages"
  ON inbox FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- lesson_files
DROP POLICY IF EXISTS "Public or admin can view lesson files" ON lesson_files;

CREATE POLICY "Public or admin can view lesson files"
  ON lesson_files FOR SELECT
  TO public
  USING (
    EXISTS (SELECT 1 FROM lessons WHERE lessons.id = lesson_files.lesson_id AND lessons.is_published = true)
    OR 
    ((auth.role() = 'authenticated') AND ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  );

-- lessons
DROP POLICY IF EXISTS "Public or admin can view lessons" ON lessons;

CREATE POLICY "Public or admin can view lessons"
  ON lessons FOR SELECT
  TO public
  USING (
    is_published = true 
    OR 
    ((auth.role() = 'authenticated') AND ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  );

-- openrouter_settings
DROP POLICY IF EXISTS "Admin users can view OpenRouter settings" ON openrouter_settings;
DROP POLICY IF EXISTS "Admin users can insert OpenRouter settings" ON openrouter_settings;
DROP POLICY IF EXISTS "Admin users can update OpenRouter settings" ON openrouter_settings;

CREATE POLICY "Admin users can view OpenRouter settings"
  ON openrouter_settings FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin users can insert OpenRouter settings"
  ON openrouter_settings FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin users can update OpenRouter settings"
  ON openrouter_settings FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- site_settings
DROP POLICY IF EXISTS "Admin can insert site settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can update site settings" ON site_settings;

CREATE POLICY "Admin can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- student_works
DROP POLICY IF EXISTS "Public or admin can view student works" ON student_works;

CREATE POLICY "Public or admin can view student works"
  ON student_works FOR SELECT
  TO public
  USING (
    is_active = true 
    OR 
    ((auth.role() = 'authenticated') AND ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  );

-- system_settings
DROP POLICY IF EXISTS "Admin can insert system settings" ON system_settings;
DROP POLICY IF EXISTS "Admin can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Admin can delete system settings" ON system_settings;

CREATE POLICY "Admin can insert system settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete system settings"
  ON system_settings FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- trial_registrations
DROP POLICY IF EXISTS "Admin can view trial registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Admin can update trial registrations" ON trial_registrations;

CREATE POLICY "Admin can view trial registrations"
  ON trial_registrations FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update trial registrations"
  ON trial_registrations FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- video_testimonials
DROP POLICY IF EXISTS "Admin can read all video testimonials" ON video_testimonials;
DROP POLICY IF EXISTS "Admin can insert video testimonials" ON video_testimonials;
DROP POLICY IF EXISTS "Admin can update video testimonials" ON video_testimonials;
DROP POLICY IF EXISTS "Admin can delete video testimonials" ON video_testimonials;

CREATE POLICY "Admin can read all video testimonials"
  ON video_testimonials FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can insert video testimonials"
  ON video_testimonials FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update video testimonials"
  ON video_testimonials FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete video testimonials"
  ON video_testimonials FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- webhook_logs
DROP POLICY IF EXISTS "Admins can read webhook logs" ON webhook_logs;

CREATE POLICY "Admins can read webhook logs"
  ON webhook_logs FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
