// Supabase Zoho Email Service
// This service handles email checking via Supabase Edge Functions

import { supabase } from '@/integrations/supabase/client';

interface ZohoCredentials {
  username: string;
  password: string;
}

interface EmailData {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  isUnread: boolean;
  body?: string;
}

interface EmailCheckResult {
  success: boolean;
  emails: EmailData[];
  totalCount: number;
  unreadCount: number;
  lastChecked: Date;
  error?: string;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  serverInfo?: {
    host: string;
    port: number;
    secure: boolean;
  };
}

interface EmailCheckHistory {
  id: string;
  target_email: string;
  total_count: number;
  unread_count: number;
  last_checked: string;
  email_data: EmailData[];
  checked_via: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export class SupabaseZohoEmailService {
  private baseUrl: string;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.baseUrl = `${supabaseUrl}/functions/v1/zoho-email-checker`;
  }

  /**
   * Test Zoho IMAP connection with provided credentials
   */
  async testConnection(credentials: ZohoCredentials): Promise<ConnectionTestResult> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          action: 'test_connection',
          credentials
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Check emails using Zoho IMAP via Supabase Edge Function
   */
  async checkEmails(
    credentials: ZohoCredentials, 
    targetEmail: string = 'hello@wecandotoo.com'
  ): Promise<EmailCheckResult> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          action: 'check_emails',
          credentials,
          targetEmail
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Convert string date back to Date object
      if (result.lastChecked) {
        result.lastChecked = new Date(result.lastChecked);
      }

      return result;
    } catch (error) {
      console.error('Email check failed:', error);
      return {
        success: false,
        emails: [],
        totalCount: 0,
        unreadCount: 0,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Email check failed'
      };
    }
  }

  /**
   * Get email check history from Supabase database
   */
  async getEmailCheckHistory(targetEmail: string = 'hello@wecandotoo.com'): Promise<EmailCheckHistory[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${this.baseUrl}?email=${encodeURIComponent(targetEmail)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.history : [];
    } catch (error) {
      console.error('Failed to fetch email history:', error);
      return [];
    }
  }

  /**
   * Get email statistics from Supabase
   */
  async getEmailStats(targetEmail: string = 'hello@wecandotoo.com') {
    try {
      const { data, error } = await supabase
        .rpc('get_email_stats', { target_email_param: targetEmail });

      if (error) {
        throw error;
      }

      return data?.[0] || {
        total_emails: 0,
        unread_emails: 0,
        last_check: null,
        checks_today: 0,
        average_emails_per_check: 0
      };
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
      return {
        total_emails: 0,
        unread_emails: 0,
        last_check: null,
        checks_today: 0,
        average_emails_per_check: 0
      };
    }
  }

  /**
   * Get the latest email check for a target email
   */
  async getLatestEmailCheck(targetEmail: string = 'hello@wecandotoo.com'): Promise<EmailCheckHistory | null> {
    try {
      const { data, error } = await supabase
        .from('latest_email_checks')
        .select('*')
        .eq('target_email', targetEmail)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch latest email check:', error);
      return null;
    }
  }

  /**
   * Schedule automatic email checking (for future implementation)
   */
  async scheduleEmailCheck(
    credentials: ZohoCredentials,
    targetEmail: string = 'hello@wecandotoo.com',
    intervalMinutes: number = 15
  ): Promise<{ success: boolean; message: string }> {
    // This would integrate with Supabase Cron Jobs or similar scheduling service
    // For now, return a message about manual checking
    return {
      success: true,
      message: `Email checking configured for ${targetEmail}. Currently using manual checks. Automatic scheduling will be available in a future update.`
    };
  }
}

// Export singleton instance
export const supabaseZohoEmailService = new SupabaseZohoEmailService();

// Export types for use in components
export type {
  ZohoCredentials,
  EmailData,
  EmailCheckResult,
  ConnectionTestResult,
  EmailCheckHistory
};
