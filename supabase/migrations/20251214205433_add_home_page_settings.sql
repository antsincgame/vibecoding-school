/*
  # Add home page settings
  
  1. New Records
    - Insert default home page settings into system_settings table
    - Includes title, subtitle, description, and SEO meta tags
  2. Settings Added
    - home_title: Page heading
    - home_subtitle: Page subheading
    - home_description: Main description text
    - home_meta_title: SEO title tag
    - home_meta_description: SEO meta description
    - home_meta_keywords: SEO keywords
*/

INSERT INTO system_settings (key, value, description)
VALUES
  ('home_title', 'VIBECODING', 'Main title on home page'),
  ('home_subtitle', 'Vibecoding - первая в Гродно школа вайб-кодинга', 'Subtitle on home page'),
  ('home_description', 'Забудьте о сложных языках программирования! В Vibecoding мы научим вас создавать настоящие сайты, веб-сервисы и приложения, используя революционный подход — вайб-кодинг.', 'Main description text on home page'),
  ('home_meta_title', 'Vibecoding - школа веб-разработки в Гродно', 'SEO meta title for home page'),
  ('home_meta_description', 'Научитесь создавать сайты и веб-приложения с нуля. Школа Vibecoding предлагает инновационный подход к обучению веб-разработке для детей и взрослых.', 'SEO meta description for home page'),
  ('home_meta_keywords', 'программирование, веб-разработка, обучение, гродно, курсы, дети', 'SEO keywords for home page')
ON CONFLICT (key) DO NOTHING;
