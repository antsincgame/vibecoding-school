import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    const clientOrigin = url.searchParams.get('origin') || Deno.env.get('CLIENT_ORIGIN') || 'http://localhost:5173';

    console.log('Auth exchange called with code:', code ? 'present' : 'absent', 'origin:', clientOrigin);

    if (error) {
      const redirectUrl = `${clientOrigin}/auth/callback?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`;
      console.log('Redirecting with error:', redirectUrl);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          ...corsHeaders
        }
      });
    }

    if (!code) {
      const redirectUrl = `${clientOrigin}/auth/callback?error=no_code`;
      console.log('Redirecting - no code:', redirectUrl);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          ...corsHeaders
        }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('Exchanging code for session on server...');
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session) {
      console.error('Failed to exchange code:', exchangeError);
      const redirectUrl = `${clientOrigin}/auth/callback?error=${encodeURIComponent('exchange_failed')}&error_description=${encodeURIComponent(exchangeError?.message || 'Unknown error')}`;
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          ...corsHeaders
        }
      });
    }

    console.log('Code exchanged successfully, user:', data.session.user.email);

    const redirectUrl = `${clientOrigin}/auth/callback#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_in=${data.session.expires_in}&token_type=bearer`;
    console.log('Redirecting with tokens in hash');

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Auth exchange error:', error);
    const clientOrigin = Deno.env.get('CLIENT_ORIGIN') || 'http://localhost:5173';
    const redirectUrl = `${clientOrigin}/auth/callback?error=exception&error_description=${encodeURIComponent(String(error))}`;
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        ...corsHeaders
      }
    });
  }
});