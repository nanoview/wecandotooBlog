import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SMTPCredentials {
  username: string;
  password: string;
  host?: string;
  port?: number;
  secure?: boolean;
}

interface SendEmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  fromName?: string;
}

interface SMTPTestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

// NOTE: Deno Deploy environment for Supabase Edge Functions does not support direct TCP sockets required for raw SMTP.
// This function SIMULATES Zoho SMTP sending for UI development and logs the payload.
// For production, integrate an HTTP based transactional mail API (Resend, Postmark, SendGrid) or run a backend that supports SMTP.

serve(async (req) => {
  const { method } = req;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const body = await req.json();
    const { action, credentials, email } = body as { action: string; credentials?: SMTPCredentials; email?: SendEmailPayload };

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    switch (action) {
      case 'test_smtp': {
        if (!credentials?.username || !credentials?.password) {
          return new Response(JSON.stringify({ success: false, message: 'Missing SMTP credentials' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Simulate latency
        await new Promise(r => setTimeout(r, 1200));

        const result: SMTPTestResult = {
          success: true,
            message: `SMTP credentials accepted for ${credentials.username}`,
          details: {
            host: credentials.host || 'smtp.zoho.com',
            port: credentials.port || 465,
            secure: credentials.secure !== false
          }
        };

        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'send_email': {
        if (!credentials?.username || !credentials?.password) {
          return new Response(JSON.stringify({ success: false, message: 'Missing SMTP credentials' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (!email?.to || !email?.subject) {
          return new Response(JSON.stringify({ success: false, message: 'Missing email fields (to, subject required)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Simulate sending delay
        await new Promise(r => setTimeout(r, 1500));

        // Log (would send via real SMTP or API in production)
        console.log('Simulated SMTP send:', { from: credentials.username, ...email });

        // Optionally store a log row (table smtp_email_logs expected)
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, serviceKey);
          await supabase.from('smtp_email_logs').insert({
            from_address: credentials.username,
            to_address: email.to,
            subject: email.subject,
            body_text: email.text || null,
            body_html: email.html || null,
            provider: 'zoho_smtp_sim',
          });
        } catch (e) {
          console.warn('Failed to log smtp_email_logs entry:', e);
        }

        return new Response(JSON.stringify({ success: true, message: 'Email queued (simulated)' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('SMTP function error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal error', details: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});