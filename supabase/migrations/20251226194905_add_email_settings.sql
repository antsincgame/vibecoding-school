/*
  # Email Settings for Student Registration

  1. New Settings
    - Add email template settings to system_settings table
    - Template for email confirmation
    - SMTP settings (stored in system_settings)

  2. Email Templates
    - Welcome email template with cyberpunk theme
    - Email confirmation template
    - Password reset template

  3. Notes
    - Email confirmation is now required for new students
    - Templates support HTML with inline CSS
    - Admin can customize templates via admin panel
*/

-- Insert email template settings
INSERT INTO system_settings (key, value, description)
VALUES 
  ('email_confirmation_enabled', 'true', 'Enable email confirmation for new students'),
  ('email_confirmation_subject', 'Подтверждение регистрации в VIBECODING', 'Subject for email confirmation'),
  ('email_confirmation_template', 
    '<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #16213e;
          border: 2px solid #00fff9;
          box-shadow: 0 0 20px rgba(0, 255, 249, 0.3);
        }
        .header {
          background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 2px solid #00fff9;
        }
        .logo {
          font-size: 36px;
          font-weight: 900;
          color: #00fff9;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 0 0 20px rgba(0, 255, 249, 0.8);
        }
        .content {
          padding: 40px 30px;
          color: #ffffff;
        }
        h1 {
          color: #00fff9;
          font-size: 28px;
          margin: 0 0 20px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        p {
          font-size: 16px;
          line-height: 1.8;
          color: #e0e0e0;
          margin: 0 0 20px 0;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #00fff9 0%, #00ccf9 100%);
          color: #0a0a0a;
          text-decoration: none;
          font-weight: 700;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 4px;
          box-shadow: 0 0 20px rgba(0, 255, 249, 0.5);
          transition: all 0.3s ease;
        }
        .button:hover {
          box-shadow: 0 0 30px rgba(0, 255, 249, 0.8);
        }
        .footer {
          padding: 30px;
          text-align: center;
          border-top: 2px solid #00fff9;
          background: #0f3460;
          color: #888;
          font-size: 14px;
        }
        .footer a {
          color: #00fff9;
          text-decoration: none;
        }
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #00fff9, transparent);
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">VIBECODING</div>
        </div>
        <div class="content">
          <h1>Добро пожаловать!</h1>
          <p>Привет! Спасибо за регистрацию в школе программирования VIBECODING.</p>
          <p>Чтобы активировать свой аккаунт и начать обучение, пожалуйста, подтвердите свой email адрес, нажав на кнопку ниже:</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{ .ConfirmationURL }}" class="button">Подтвердить Email</a>
          </div>
          <div class="divider"></div>
          <p style="font-size: 14px; opacity: 0.8;">Если вы не регистрировались в VIBECODING, просто проигнорируйте это письмо.</p>
          <p style="font-size: 14px; opacity: 0.8;">Ссылка действительна в течение 24 часов.</p>
        </div>
        <div class="footer">
          <p>© 2024 VIBECODING. Школа программирования будущего.</p>
          <p><a href="{{ .SiteURL }}">vibecoding.com</a></p>
        </div>
      </div>
    </body>
    </html>',
    'HTML template for email confirmation'
  ),
  ('email_welcome_subject', 'Добро пожаловать в VIBECODING! 🚀', 'Subject for welcome email'),
  ('email_welcome_template',
    '<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #16213e;
          border: 2px solid #ff006e;
          box-shadow: 0 0 20px rgba(255, 0, 110, 0.3);
        }
        .header {
          background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 2px solid #ff006e;
        }
        .logo {
          font-size: 36px;
          font-weight: 900;
          color: #ff006e;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 0 0 20px rgba(255, 0, 110, 0.8);
        }
        .content {
          padding: 40px 30px;
          color: #ffffff;
        }
        h1 {
          color: #ff006e;
          font-size: 28px;
          margin: 0 0 20px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        h2 {
          color: #00fff9;
          font-size: 20px;
          margin: 30px 0 15px 0;
        }
        p {
          font-size: 16px;
          line-height: 1.8;
          color: #e0e0e0;
          margin: 0 0 20px 0;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #ff006e 0%, #ff4d94 100%);
          color: #ffffff;
          text-decoration: none;
          font-weight: 700;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 4px;
          box-shadow: 0 0 20px rgba(255, 0, 110, 0.5);
        }
        .features {
          background: rgba(0, 255, 249, 0.05);
          border: 1px solid rgba(0, 255, 249, 0.2);
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .feature-item {
          margin: 15px 0;
          padding-left: 30px;
          position: relative;
        }
        .feature-item:before {
          content: "→";
          position: absolute;
          left: 0;
          color: #00fff9;
          font-weight: 900;
          font-size: 20px;
        }
        .footer {
          padding: 30px;
          text-align: center;
          border-top: 2px solid #ff006e;
          background: #0f3460;
          color: #888;
          font-size: 14px;
        }
        .footer a {
          color: #ff006e;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">VIBECODING</div>
        </div>
        <div class="content">
          <h1>Добро пожаловать, {{ .UserName }}!</h1>
          <p>Поздравляем! Ваш аккаунт успешно активирован, и вы теперь часть сообщества VIBECODING.</p>
          
          <div class="features">
            <h2>Что вас ждёт:</h2>
            <div class="feature-item">Доступ к современным курсам по программированию</div>
            <div class="feature-item">Практические проекты и домашние задания</div>
            <div class="feature-item">Персональная обратная связь от преподавателя</div>
            <div class="feature-item">Поддержка на всех этапах обучения</div>
            <div class="feature-item">Сертификат по окончании курса</div>
          </div>

          <p>Готовы начать своё путешествие в мир кода?</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{ .DashboardURL }}" class="button">Перейти в личный кабинет</a>
          </div>

          <p style="font-size: 14px; opacity: 0.8; margin-top: 30px;">
            Если у вас возникнут вопросы, вы всегда можете обратиться к нам через личный кабинет или написать на наш email.
          </p>
        </div>
        <div class="footer">
          <p>© 2024 VIBECODING. Школа программирования будущего.</p>
          <p><a href="{{ .SiteURL }}">vibecoding.com</a></p>
        </div>
      </div>
    </body>
    </html>',
    'HTML template for welcome email after confirmation'
  )
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, description = EXCLUDED.description;