/*
  # Add Testimonial Text Field

  1. Changes
    - Add `testimonial_text` column to `video_testimonials` table for storing written reviews
    - This allows displaying text reviews with student photos when no video is available

  2. Updates
    - Update existing testimonials with placeholder images and sample review texts
*/

ALTER TABLE video_testimonials
ADD COLUMN IF NOT EXISTS testimonial_text text DEFAULT '';

UPDATE video_testimonials
SET 
  video_url = '',
  thumbnail_url = 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  testimonial_text = 'Когда я впервые услышал о вайб-кодинге, честно говоря, не поверил, что это возможно. Программирование без знания языков программирования? Звучало как фантастика! Но уже на втором занятии я создал свой первый работающий лендинг. Преподаватели объясняют всё простым языком, без заумных терминов. Bolt.ai оказался невероятно удобным инструментом - ты просто описываешь, что хочешь получить, и ИИ генерирует код. Теперь у меня есть портфолио из трёх проектов, и я уже взял первый фриланс-заказ!'
WHERE student_name = 'Александр К.';

UPDATE video_testimonials
SET 
  video_url = '',
  thumbnail_url = 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=400',
  testimonial_text = 'Мне 42 года, и я всегда думала, что программирование - это не для меня. Слишком сложно, слишком много надо учить. Vibecoding полностью изменил мой взгляд! Курс по Cursor AI помог мне автоматизировать рутинные задачи в работе и даже создать небольшое веб-приложение для учёта клиентов. Особенно понравилась поддержка преподавателей - всегда готовы помочь и ответить на вопросы. Рекомендую всем, кто хочет войти в IT, но боится сложностей традиционного программирования!'
WHERE student_name = 'Мария В.';

UPDATE video_testimonials
SET 
  video_url = '',
  thumbnail_url = 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  testimonial_text = 'Прошёл оба курса - и по Bolt.ai, и по Cursor AI. Это лучшая инвестиция в своё образование! За три месяца я научился создавать полноценные веб-приложения с базами данных, авторизацией и красивым дизайном. Самое крутое - что можно сразу применять знания на практике. Сейчас работаю над собственным стартапом, используя навыки вайб-кодинга. Спасибо команде Vibecoding за то, что открыли мне двери в мир разработки без боли и страданий!'
WHERE student_name = 'Дмитрий С.';