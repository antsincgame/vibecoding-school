import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, svix-id, svix-timestamp, svix-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    console.log('Resend webhook received:', JSON.stringify(payload));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const eventType = payload.type;
    const emailId = payload.data?.email_id;

    if (!emailId) {
      console.log('No email_id in payload, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'No email_id, skipped' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (eventType) {
      case 'email.sent':
        updates.status = 'sent';
        break;
      case 'email.delivered':
        updates.status = 'delivered';
        break;
      case 'email.delivery_delayed':
        updates.status = 'delayed';
        break;
      case 'email.opened':
        updates.status = 'opened';
        updates.opened_at = new Date().toISOString();
        break;
      case 'email.clicked':
        updates.status = 'clicked';
        updates.clicked_at = new Date().toISOString();
        break;
      case 'email.bounced':
        updates.status = 'bounced';
        updates.bounced_at = new Date().toISOString();
        updates.error_message = payload.data?.bounce?.message || 'Email bounced';
        break;
      case 'email.complained':
        updates.status = 'complained';
        updates.error_message = 'Marked as spam by recipient';
        break;
      default:
        console.log('Unknown event type:', eventType);
        return new Response(
          JSON.stringify({ success: true, message: `Unknown event: ${eventType}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const { error } = await supabase
      .from('email_logs')
      .update(updates)
      .eq('resend_email_id', emailId);

    if (error) {
      console.error('Error updating email_logs:', error);
    } else {
      console.log(`Updated email ${emailId} with status: ${updates.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, event: eventType, emailId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
