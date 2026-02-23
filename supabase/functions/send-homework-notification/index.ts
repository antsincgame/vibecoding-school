import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  studentEmail: string;
  studentName: string;
  lessonTitle: string;
  courseTitle: string;
  status: 'approved' | 'rejected';
  feedback: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['resend_api_key', 'resend_from_email', 'resend_from_name']);

    const settingsMap: Record<string, string> = {};
    settings?.forEach(item => {
      settingsMap[item.key] = item.value;
    });

    const resendApiKey = settingsMap['resend_api_key'];
    const fromEmail = settingsMap['resend_from_email'];
    const fromName = settingsMap['resend_from_name'] || 'VibeCoding';

    if (!resendApiKey || !fromEmail) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured in admin settings' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: RequestBody = await req.json();
    const { studentEmail, studentName, lessonTitle, courseTitle, status, feedback } = body;

    if (!studentEmail || !lessonTitle || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const statusText = status === 'approved' ? 'принято' : 'требует доработки';
    const statusColor = status === 'approved' ? '#39ff14' : '#ff006e';
    const statusEmoji = status === 'approved' ? '✅' : '📝';

    const subject = `${statusEmoji} Домашнее задание ${statusText} - ${lessonTitle}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0a0a0f;
      color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 1px solid rgba(0, 255, 249, 0.2);
    }
    .header h1 {
      color: #00fff9;
      font-size: 24px;
      margin: 0;
    }
    .content {
      padding: 30px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 10px 20px;
      background: ${status === 'approved' ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255, 0, 110, 0.2)'};
      border: 1px solid ${statusColor};
      border-radius: 8px;
      color: ${statusColor};
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .lesson-info {
      background: rgba(0, 255, 249, 0.05);
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .lesson-info p {
      margin: 8px 0;
      color: rgba(255, 255, 255, 0.8);
    }
    .lesson-info .label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .lesson-info .value {
      color: #00fff9;
      font-weight: 600;
    }
    .feedback {
      background: rgba(0, 0, 0, 0.3);
      border-left: 3px solid ${statusColor};
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .feedback-title {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .cta {
      text-align: center;
      padding: 30px 0;
    }
    .cta a {
      display: inline-block;
      padding: 15px 30px;
      background: linear-gradient(135deg, #00fff9 0%, #00b8b8 100%);
      color: #0a0a0f;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid rgba(0, 255, 249, 0.2);
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VibeCoding</h1>
    </div>
    <div class="content">
      <p>Привет, ${studentName}!</p>
      
      <div class="status-badge">
        ${statusEmoji} Домашнее задание ${statusText}
      </div>
      
      <div class="lesson-info">
        <p><span class="label">Курс:</span><br><span class="value">${courseTitle || 'Курс'}</span></p>
        <p><span class="label">Урок:</span><br><span class="value">${lessonTitle}</span></p>
      </div>
      
      ${feedback ? `
      <div class="feedback">
        <div class="feedback-title">Комментарий преподавателя</div>
        <p>${feedback}</p>
      </div>
      ` : ''}
      
      ${status === 'approved' ? `
      <p>Отлично! Вы можете продолжить обучение и перейти к следующему уроку.</p>
      ` : `
      <p>Пожалуйста, доработайте задание с учетом комментария преподавателя и отправьте его повторно.</p>
      `}
      
      <div class="cta">
        <a href="https://vibecoding.by/student/dashboard">Перейти к обучению</a>
      </div>
    </div>
    <div class="footer">
      <p>VibeCoding - Программирование с помощью нейросетей</p>
      <p>Есть вопросы? <a href="https://t.me/+5iwI77TdHTJlYzNi" style="color: #00fff9;">Напишите нам в Telegram</a></p>
    </div>
  </div>
</body>
</html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [studentEmail],
        subject,
        html: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      await supabase.from('email_logs').insert({
        recipient_email: studentEmail,
        subject,
        template_type: 'homework_notification',
        status: 'failed',
        error_message: JSON.stringify(result),
        metadata: { lessonTitle, courseTitle, homeworkStatus: status }
      });
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase.from('email_logs').insert({
      resend_email_id: result.id,
      recipient_email: studentEmail,
      subject,
      template_type: 'homework_notification',
      status: 'sent',
      metadata: { lessonTitle, courseTitle, homeworkStatus: status, feedback }
    });

    console.log('Homework notification sent successfully to:', studentEmail);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending homework notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});