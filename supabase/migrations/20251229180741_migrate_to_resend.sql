/*
  # Миграция email системы с SMTP/IMAP на Resend.com

  1. Изменения в system_settings
    - Удаление устаревших SMTP/IMAP настроек
    - Добавление Resend API настроек:
      - resend_api_key: API ключ Resend
      - resend_from_email: Email отправителя (vibecoding.com)
      - resend_from_name: Имя отправителя
      - resend_reply_to: Email для ответов
      - resend_track_opens: Отслеживание открытий
      - resend_track_clicks: Отслеживание кликов

  2. Новая таблица email_logs
    - Логирование всех отправленных писем
    - Отслеживание статусов (sent, delivered, opened, clicked, bounced)
    - Связь с Resend через resend_email_id для webhook событий

  3. Безопасность
    - RLS включен для email_logs
    - Только админы могут просматривать логи
*/

-- Удалить устаревшие SMTP/IMAP настройки
DELETE FROM system_settings 
WHERE key IN (
  'smtp_host',
  'smtp_port', 
  'smtp_user',
  'smtp_password',
  'smtp_from_email',
  'smtp_from_name',
  'smtp_secure',
  'imap_host',
  'imap_port',
  'imap_user',
  'imap_password',
  'imap_secure'
);

-- Добавить новые Resend настройки
INSERT INTO system_settings (key, value, description)
VALUES 
  ('resend_api_key', '', 'Resend API Key'),
  ('resend_from_email', 'noreply@vibecoding.com', 'Email отправителя'),
  ('resend_from_name', 'VIBECODING', 'Имя отправителя'),
  ('resend_reply_to', '', 'Email для ответов (опционально)'),
  ('resend_track_opens', 'true', 'Отслеживать открытия писем'),
  ('resend_track_clicks', 'true', 'Отслеживать клики по ссылкам')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, description = EXCLUDED.description;

-- Создать таблицу для логирования отправленных писем
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_email_id text,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  template_type text NOT NULL DEFAULT 'general',
  status text DEFAULT 'pending',
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включить RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Политика: только админы могут видеть логи
CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Политика: только админы могут вставлять логи (через Edge Functions)
CREATE POLICY "Service role can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Политика: только админы могут обновлять логи (через webhooks)
CREATE POLICY "Service role can update email logs"
  ON email_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Создать индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON email_logs(resend_email_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_type ON email_logs(template_type);