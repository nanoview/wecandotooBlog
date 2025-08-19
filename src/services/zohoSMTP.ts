// Frontend client for Zoho SMTP (via Supabase Edge Function simulation)
// Provides functions to test SMTP credentials and send an email through the edge function.

import { supabase } from '@/integrations/supabase/client';

export interface SMTPCredentials {
  username: string;
  password: string; // App-specific password
  host?: string; // default smtp.zoho.com
  port?: number; // default 465
  secure?: boolean; // default true
}

export interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  fromName?: string;
}

interface SMTPTestResponse {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

interface SMTPSendResponse {
  success: boolean;
  message: string;
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-smtp-sender`;

async function post<T>(body: any): Promise<T> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!import.meta.env.VITE_SUPABASE_URL) {
      throw new Error('VITE_SUPABASE_URL not set – cannot reach SMTP function');
    }
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      // Try to parse JSON error
      let detail: string;
      try {
        const j = await res.json();
        detail = j.error || j.message || JSON.stringify(j);
      } catch {
        detail = await res.text();
      }
      throw new Error(`SMTP function HTTP ${res.status}: ${detail}`);
    }
    return res.json();
  } catch (err) {
    console.error('zohoSMTPService fetch error:', err);
    throw err instanceof Error ? err : new Error('Unknown SMTP fetch error');
  }
}

export const zohoSMTPService = {
  async test(credentials: SMTPCredentials): Promise<SMTPTestResponse> {
    return post<SMTPTestResponse>({ action: 'test_smtp', credentials });
  },
  async send(credentials: SMTPCredentials, email: SendEmailInput): Promise<SMTPSendResponse> {
    return post<SMTPSendResponse>({ action: 'send_email', credentials, email });
  }
};
