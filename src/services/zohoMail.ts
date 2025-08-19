// Zoho Mail API Service
// This file contains functions to integrate with Zoho Mail API

interface ZohoMailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
  accessToken?: string;
}

interface ZohoEmail {
  messageId: string;
  subject: string;
  fromAddress: string;
  toAddress: string;
  receivedTime: string;
  summary: string;
  isUnread: boolean;
  attachments?: Array<{
    fileName: string;
    size: number;
    contentType: string;
  }>;
}

class ZohoMailService {
  private config: ZohoMailConfig;
  private baseUrl = 'https://mail.zoho.com/api';

  constructor(config: ZohoMailConfig) {
    this.config = config;
  }

  /**
   * Get OAuth authorization URL for Zoho Mail
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'ZohoMail.messages.READ,ZohoMail.folders.READ',
      access_type: 'offline',
    });

    return `https://accounts.zoho.com/oauth/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(authCode: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code: authCode,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.config.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    this.config.accessToken = data.access_token;
    return data.access_token;
  }

  /**
   * Get emails from a specific folder (inbox by default)
   */
  async getEmails(
    folderId: string = 'inbox',
    limit: number = 50,
    offset: number = 0
  ): Promise<ZohoEmail[]> {
    if (!this.config.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    const url = `${this.baseUrl}/accounts/{accountId}/folders/${folderId}/messages`;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      include: 'summary,attachments',
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken();
        return this.getEmails(folderId, limit, offset);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform Zoho API response to our format
      return data.data.map((email: any): ZohoEmail => ({
        messageId: email.messageId,
        subject: email.subject,
        fromAddress: email.fromAddress,
        toAddress: email.toAddress,
        receivedTime: email.receivedTime,
        summary: email.summary || '',
        isUnread: !email.isRead,
        attachments: email.attachments?.map((att: any) => ({
          fileName: att.fileName,
          size: att.size,
          contentType: att.contentType,
        })),
      }));
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  /**
   * Get emails for a specific email address (hello@wecandotoo.com)
   */
  async getEmailsForAddress(
    emailAddress: string = 'hello@wecandotoo.com',
    limit: number = 50
  ): Promise<ZohoEmail[]> {
    try {
      // First get all emails from inbox
      const emails = await this.getEmails('inbox', limit);
      
      // Filter emails sent to the specific address
      return emails.filter(email => 
        email.toAddress.toLowerCase().includes(emailAddress.toLowerCase())
      );
    } catch (error) {
      console.error('Error fetching emails for address:', error);
      throw error;
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(messageId: string): Promise<void> {
    if (!this.config.accessToken) {
      throw new Error('No access token available');
    }

    const url = `${this.baseUrl}/accounts/{accountId}/messages/${messageId}/read`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark email as read');
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.config.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.baseUrl}/accounts`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get account info');
    }

    return response.json();
  }
}

// Export service and types
export { ZohoMailService, type ZohoMailConfig, type ZohoEmail };

// Environment configuration helper
export const createZohoMailService = () => {
  const config: ZohoMailConfig = {
    clientId: import.meta.env.VITE_ZOHO_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_ZOHO_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_ZOHO_REDIRECT_URI || `${window.location.origin}/admin/zoho-callback`,
    accessToken: localStorage.getItem('zoho_access_token') || undefined,
    refreshToken: localStorage.getItem('zoho_refresh_token') || undefined,
  };

  return new ZohoMailService(config);
};

// Example usage:
/*
// 1. First, set up environment variables in .env:
// VITE_ZOHO_CLIENT_ID=your_client_id
// VITE_ZOHO_CLIENT_SECRET=your_client_secret
// VITE_ZOHO_REDIRECT_URI=http://localhost:8080/admin/zoho-callback

// 2. Initialize the service:
const zohoService = createZohoMailService();

// 3. Get authorization URL and redirect user:
const authUrl = zohoService.getAuthUrl();
window.location.href = authUrl;

// 4. After user authorizes, exchange code for tokens:
const tokens = await zohoService.getAccessToken(authCode);
localStorage.setItem('zoho_access_token', tokens.access_token);
localStorage.setItem('zoho_refresh_token', tokens.refresh_token);

// 5. Fetch emails:
const emails = await zohoService.getEmailsForAddress('hello@wecandotoo.com');
*/
