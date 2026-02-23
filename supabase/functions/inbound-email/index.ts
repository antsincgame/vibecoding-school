import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InboundEmailPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    message_id?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
      content_disposition?: string;
      content_id?: string;
    }>;
  };
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
      .eq('key', 'resend_api_key');

    const resendApiKey = settings?.find(s => s.key === 'resend_api_key')?.value;

    console.log('[DEBUG] Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasResendKey: !!resendApiKey,
      resendKeyPrefix: resendApiKey?.substring(0, 8) || 'NOT_SET'
    });

    const rawPayload = await req.text();
    console.log('[DEBUG] Raw webhook payload received, length:', rawPayload.length);
    console.log('[DEBUG] Raw payload content:', rawPayload.substring(0, 1000));

    const payload = JSON.parse(rawPayload);

    await supabase.from('webhook_logs').insert({
      payload: {
        ...payload,
        debug_info: {
          timestamp: new Date().toISOString(),
          has_resend_key: !!resendApiKey,
          payload_keys: Object.keys(payload),
          data_keys: payload.data ? Object.keys(payload.data) : []
        }
      }
    });

    console.log('[DEBUG] Webhook event type:', payload.type);
    console.log('[DEBUG] Full payload structure:', JSON.stringify(payload, null, 2));

    if (payload.type !== 'email.received') {
      console.log('[DEBUG] Not an email.received event, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Event type not handled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailData = payload.data;
    console.log('[DEBUG] Email data structure:', {
      email_id: emailData.email_id,
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      hasHtml: !!emailData.html,
      hasText: !!emailData.text,
      htmlLength: emailData.html?.length || 0,
      textLength: emailData.text?.length || 0,
      allKeys: Object.keys(emailData)
    });

    let htmlContent = emailData.html || null;
    let textContent = emailData.text || null;

    console.log('[DEBUG] Content from webhook payload:', {
      hasHtml: !!htmlContent,
      hasText: !!textContent,
      htmlLength: htmlContent?.length,
      textLength: textContent?.length
    });

    if (!htmlContent && !textContent) {
      console.log(`[DEBUG] No content in payload, will fetch from Resend API`);
      console.log(`[DEBUG] Email ID: ${emailData.email_id}`);
      console.log(`[DEBUG] Has Resend API key: ${!!resendApiKey}`);

      if (!resendApiKey) {
        console.error('[ERROR] RESEND_API_KEY not found in system_settings!');
        await supabase.from('webhook_logs').insert({
          payload: {
            type: 'error',
            message: 'RESEND_API_KEY not configured in admin settings',
            email_id: emailData.email_id
          }
        });
      } else {
        const maxRetries = 3;
        const retryDelay = 2000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            if (attempt > 1) {
              console.log(`[DEBUG] Retry attempt ${attempt}, waiting ${retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }

            const apiUrl = `https://api.resend.com/emails/receiving/${emailData.email_id}`;
            console.log(`[DEBUG] Fetching from: ${apiUrl}`);
            console.log(`[DEBUG] Using API key prefix: ${resendApiKey.substring(0, 8)}...`);

            const resendResponse = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
              }
            });

            const responseText = await resendResponse.text();

            console.log(`[DEBUG] API Response status: ${resendResponse.status}`);
            console.log(`[DEBUG] API Response headers:`, Object.fromEntries(resendResponse.headers.entries()));
            console.log(`[DEBUG] API Response body (first 500 chars):`, responseText.substring(0, 500));

            await supabase.from('webhook_logs').insert({
              payload: {
                type: 'resend_api_response',
                attempt,
                email_id: emailData.email_id,
                status: resendResponse.status,
                url: apiUrl,
                response_preview: responseText.substring(0, 1000),
                response_full_length: responseText.length
              }
            });

            if (resendResponse.ok) {
              const emailContent = JSON.parse(responseText);
              console.log(`[DEBUG] Parsed response - all keys:`, Object.keys(emailContent));
              console.log(`[DEBUG] Full API response:`, JSON.stringify(emailContent, null, 2));

              await supabase.from('webhook_logs').insert({
                payload: {
                  type: 'resend_api_parsed_response',
                  email_id: emailData.email_id,
                  all_keys: Object.keys(emailContent),
                  html_exists: 'html' in emailContent,
                  text_exists: 'text' in emailContent,
                  body_exists: 'body' in emailContent,
                  content_sample: JSON.stringify(emailContent).substring(0, 2000)
                }
              });

              htmlContent = emailContent.html || emailContent.body || emailContent.html_body || null;
              textContent = emailContent.text || emailContent.plain_text || emailContent.text_body || null;

              console.log('[DEBUG] Extracted content:', {
                hasHtml: !!htmlContent,
                hasText: !!textContent,
                htmlLength: htmlContent?.length || 0,
                textLength: textContent?.length || 0,
                htmlPreview: htmlContent?.substring(0, 200) || 'null',
                textPreview: textContent?.substring(0, 200) || 'null'
              });

              if (htmlContent || textContent) {
                console.log('[DEBUG] Content successfully retrieved!');
                break;
              } else {
                console.log('[WARN] API returned OK but no content found in expected fields');
              }
            } else {
              console.error(`[ERROR] API returned status ${resendResponse.status}:`, responseText);
            }
          } catch (error) {
            console.error(`[ERROR] Exception on attempt ${attempt}:`, error);
            await supabase.from('webhook_logs').insert({
              payload: {
                type: 'error',
                attempt,
                email_id: emailData.email_id,
                error: error instanceof Error ? error.message : String(error)
              }
            });
          }
        }

        if (!htmlContent && !textContent) {
          console.error('[ERROR] Failed to retrieve content after all retries');
        }
      }
    } else {
      console.log('[DEBUG] Content found in webhook payload, no API call needed');
    }

    const fromMatch = emailData.from.match(/^(.+?)\s*<(.+?)>$/) || [null, null, emailData.from];
    const fromName = fromMatch[1]?.trim() || null;
    const fromEmail = fromMatch[2] || emailData.from;

    const attachmentsMetadata: Array<{
      filename: string;
      content_type: string;
      size: number;
      storage_path: string;
    }> = [];

    if (emailData.attachments && emailData.attachments.length > 0 && resendApiKey) {
      console.log(`Processing ${emailData.attachments.length} attachments`);

      for (const attachment of emailData.attachments) {
        try {
          const attachmentResponse = await fetch(`https://api.resend.com/emails/receiving/${emailData.email_id}/attachments/${attachment.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`
            }
          });

          if (!attachmentResponse.ok) {
            console.error(`Failed to fetch attachment ${attachment.filename}:`, attachmentResponse.status);
            continue;
          }

          const attachmentBlob = await attachmentResponse.blob();
          const attachmentBuffer = await attachmentBlob.arrayBuffer();
          const binaryData = new Uint8Array(attachmentBuffer);

          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 8);
          const storagePath = `${emailData.email_id}/${timestamp}-${randomStr}-${attachment.filename}`;

          const { error: uploadError } = await supabase.storage
            .from('email-attachments')
            .upload(storagePath, binaryData, {
              contentType: attachment.content_type,
              upsert: false
            });

          if (uploadError) {
            console.error('Failed to upload attachment:', uploadError);
          } else {
            attachmentsMetadata.push({
              filename: attachment.filename,
              content_type: attachment.content_type,
              size: binaryData.length,
              storage_path: storagePath
            });
            console.log(`Uploaded attachment: ${attachment.filename}`);
          }
        } catch (error) {
          console.error(`Error processing attachment ${attachment.filename}:`, error);
        }
      }
    }

    const emailToInsert = {
      message_id: emailData.email_id,
      from_email: fromEmail,
      from_name: fromName,
      to_email: emailData.to[0],
      subject: emailData.subject || '(No subject)',
      text_content: textContent,
      html_content: htmlContent,
      headers: {},
      attachments: attachmentsMetadata,
      is_read: false,
      is_archived: false
    };

    console.log('[DEBUG] Inserting into inbox:', {
      message_id: emailToInsert.message_id,
      from_email: emailToInsert.from_email,
      to_email: emailToInsert.to_email,
      subject: emailToInsert.subject,
      has_text: !!emailToInsert.text_content,
      has_html: !!emailToInsert.html_content,
      text_length: emailToInsert.text_content?.length || 0,
      html_length: emailToInsert.html_content?.length || 0,
      attachments_count: emailToInsert.attachments.length
    });

    const { error: insertError } = await supabase
      .from('inbox')
      .insert(emailToInsert);

    if (insertError) {
      console.error('[ERROR] Failed to insert into inbox:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store email', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SUCCESS] Email ${emailData.email_id} stored successfully with ${attachmentsMetadata.length} attachments and ${htmlContent || textContent ? 'WITH' : 'WITHOUT'} content`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email received and stored',
        email_id: emailData.email_id,
        attachments_count: attachmentsMetadata.length,
        has_content: !!(htmlContent || textContent)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});