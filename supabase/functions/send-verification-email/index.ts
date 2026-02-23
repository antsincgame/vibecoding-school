import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, fullName, siteUrl } = await req.json();
    
    if (!email || !siteUrl) {
      return new Response(
        JSON.stringify({ error: 'Email and siteUrl are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'user_already_exists', message: 'This email is already registered' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['resend_api_key', 'resend_from_email', 'resend_from_name']);

    if (!settings || settings.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Email settings not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const settingsMap: Record<string, string> = {};
    settings.forEach(item => { settingsMap[item.key] = item.value; });

    const resendApiKey = settingsMap['resend_api_key'];
    const fromEmail = settingsMap['resend_from_email'];
    const fromName = settingsMap['resend_from_name'] || 'VIBECODING';

    if (!resendApiKey || !fromEmail) {
      return new Response(
        JSON.stringify({ error: 'Resend settings not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('auth_tokens')
      .delete()
      .eq('email', email)
      .eq('token_type', 'email_verification');

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error: tokenError } = await supabase
      .from('auth_tokens')
      .insert({
        email,
        token,
        token_type: 'email_verification',
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Token creation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to create verification token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verificationUrl = `${siteUrl}/student/verify?token=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName || '')}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #fff; padding: 40px 20px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(0,255,249,0.1), rgba(255,0,110,0.05)); border: 1px solid rgba(0,255,249,0.3); border-radius: 12px; padding: 40px; }
          h1 { color: #00fff9; margin-bottom: 20px; font-size: 28px; }
          p { line-height: 1.7; color: #ccc; font-size: 16px; margin-bottom: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #00fff9, #00b8b0); color: #000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 14px; color: #888; }
          .warning { color: #ff6b6b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>VIBECODING</h1>
          <p>Привет${fullName ? ', ' + fullName : ''}!</p>
          <p>Спасибо за регистрацию в VIBECODING. Для завершения регистрации подтвердите ваш email, нажав на кнопку ниже:</p>
          <a href="${verificationUrl}" class="button">ПОДТВЕРДИТЬ EMAIL</a>
          <p class="warning">Ссылка действительна 24 часа.</p>
          <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
          <div class="footer">
            <p>С уважением,<br>Команда VIBECODING</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject: 'VIBECODING - Подтверждение email',
        html: htmlContent,
        tags: [
          { name: 'category', value: 'verification' },
          { name: 'environment', value: 'production' }
        ]
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      await supabase.from('auth_tokens').delete().eq('token', token);
      return new Response(
        JSON.stringify({ error: `Email sending failed: ${resendData.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('email_logs')
      .insert({
        resend_email_id: resendData.id,
        recipient_email: email,
        subject: 'VIBECODING - Подтверждение email',
        template_type: 'verification',
        status: 'sent',
        metadata: { fullName }
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Verification email sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending verification email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: `Server error: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});