/*
  # Добавление поля slug для ЧПУ в таблицу courses

  ## Описание
  Добавляет поле slug (человеко-понятный URL) в таблицу courses для создания красивых адресов страниц курсов.

  ## Изменения
  1. Добавлено новое поле
    - `slug` (text, unique) - Уникальный идентификатор курса для URL
  
  2. Обновление существующих записей
    - Устанавливаем slug для существующих курсов
    - "razrabotka-saitov" для курса веб-разработки
    - "razrabotka-prilozhenii" для курса разработки приложений

  ## Примечания
  - Поле slug обязательно для заполнения
  - Slug должен быть уникальным для каждого курса
  - Используется для создания красивых URL типа /course/razrabotka-saitov
*/

-- Добавляем поле slug в таблицу courses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'slug'
  ) THEN
    ALTER TABLE courses ADD COLUMN slug text UNIQUE;
  END IF;
END $$;

-- Обновляем существующие курсы, добавляя slug на основе названия
UPDATE courses 
SET slug = 'razrabotka-saitov'
WHERE title ILIKE '%веб%' OR title ILIKE '%web%' OR title ILIKE '%сайт%'
AND slug IS NULL;

UPDATE courses 
SET slug = 'razrabotka-prilozhenii'
WHERE (title ILIKE '%мобильн%' OR title ILIKE '%mobile%' OR title ILIKE '%приложен%' OR title ILIKE '%app%')
AND slug IS NULL;

UPDATE courses 
SET slug = 'python-gamedev'
WHERE title ILIKE '%python%' OR title ILIKE '%игр%'
AND slug IS NULL;

-- Создаем индекс для быстрого поиска по slug
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
