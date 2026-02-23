import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['resend_api_key', 'resend_from_email', 'resend_from_name', 'resend_reply_to']);

    const settingsMap: Record<string, string> = {};
    settings?.forEach(item => {
      settingsMap[item.key] = item.value;
    });

    const resendApiKey = settingsMap['resend_api_key'];
    const defaultFromEmail = settingsMap['resend_from_email'];
    const defaultFromName = settingsMap['resend_from_name'] || 'VIBECODING';
    const defaultReplyTo = settingsMap['resend_reply_to'];

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured in admin settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: SendEmailRequest = await req.json();

    if (!payload.to || !payload.subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.html && !payload.text) {
      return new Response(
        JSON.stringify({ error: 'Either html or text content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fromAddress = payload.from || (defaultFromEmail ? `${defaultFromName} <${defaultFromEmail}>` : 'VibeCoding <info@vibecoding.by>');

    const emailData: Record<string, unknown> = {
      from: fromAddress,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
    };

    if (payload.html) emailData.html = payload.html;
    if (payload.text) emailData.text = payload.text;
    if (payload.replyTo) {
      emailData.reply_to = payload.replyTo;
    } else if (defaultReplyTo) {
      emailData.reply_to = defaultReplyTo;
    }

    console.log('Sending email via Resend:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email', 
          details: errorText,
          status: response.status 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send email error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});