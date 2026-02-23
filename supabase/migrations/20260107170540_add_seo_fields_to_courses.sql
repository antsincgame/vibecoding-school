/*
  # Add SEO fields to courses table

  1. New Columns
    - `meta_title` (text) - Custom SEO title for the course page
    - `meta_description` (text) - Custom SEO description for search engines
    - `meta_keywords` (text) - SEO keywords for the course
    - `seo_text` (text) - Additional SEO-optimized text content for the course page
    - `canonical_url` (text) - Custom canonical URL if needed

  2. Purpose
    - Enable admin to customize SEO metadata for each course
    - Improve search engine rankings in Yandex and Google
    - Allow detailed course descriptions for indexing
*/

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS meta_title text DEFAULT '',
ADD COLUMN IF NOT EXISTS meta_description text DEFAULT '',
ADD COLUMN IF NOT EXISTS meta_keywords text DEFAULT '',
ADD COLUMN IF NOT EXISTS seo_text text DEFAULT '',
ADD COLUMN IF NOT EXISTS canonical_url text DEFAULT '';