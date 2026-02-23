import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BulkEmailRequest {
  recipients: string[];
  subject: string;
  html: string;
  template_type?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { recipients, subject, html, template_type = 'bulk' }: BulkEmailRequest = await req.json();

    if (!recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Список получателей пуст' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Тема и содержимое письма обязательны' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['resend_api_key', 'resend_from_email', 'resend_from_name', 'resend_reply_to']);

    const settingsMap: Record<string, string> = {};
    settings?.forEach(item => {
      settingsMap[item.key] = item.value;
    });

    const resendApiKey = settingsMap['resend_api_key'];
    const fromEmail = settingsMap['resend_from_email'];
    const fromName = settingsMap['resend_from_name'] || 'VIBECODING';
    const replyTo = settingsMap['resend_reply_to'] || undefined;

    if (!resendApiKey || !fromEmail) {
      return new Response(
        JSON.stringify({ error: 'Resend не настроен. Заполните API Key и Email отправителя.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { success: boolean; count?: number; error?: string }[] = [];
    let totalSent = 0;
    let totalFailed = 0;

    const BATCH_SIZE = 100;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      const batchEmails = batch.map(email => {
        const payload: Record<string, unknown> = {
          from: `${fromName} <${fromEmail}>`,
          to: [email],
          subject: subject,
          html: html,
          tags: [
            { name: 'type', value: template_type },
            { name: 'batch', value: 'true' }
          ]
        };
        if (replyTo) {
          payload.reply_to = replyTo;
        }
        return payload;
      });

      try {
        const batchResponse = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batchEmails),
        });

        const batchData = await batchResponse.json();

        if (batchResponse.ok && batchData.data) {
          const logs = batchData.data.map((item: { id: string }, index: number) => ({
            resend_email_id: item.id,
            recipient_email: batch[index],
            subject: subject,
            template_type: template_type,
            status: 'sent',
            metadata: { bulk: true, batch_index: Math.floor(i / BATCH_SIZE) }
          }));

          await supabase.from('email_logs').insert(logs);

          totalSent += batch.length;
          results.push({ success: true, count: batch.length });
        } else {
          totalFailed += batch.length;
          results.push({ success: false, error: batchData.message || 'Batch send failed' });
        }
      } catch (batchError) {
        totalFailed += batch.length;
        results.push({ success: false, error: batchError instanceof Error ? batchError.message : 'Unknown error' });
      }

      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Отправлено: ${totalSent}, Ошибок: ${totalFailed}`,
        totalSent,
        totalFailed,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk email error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
