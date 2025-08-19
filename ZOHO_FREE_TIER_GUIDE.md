# Zoho Mail API - Free Tier Guide

## 🆓 **Free Tier Limitations & Alternatives**

### **Important Note About Zoho Mail API**
Zoho Mail API is **primarily designed for organizational/business use** and has significant limitations for free individual accounts:

#### ❌ **Current Limitations:**
1. **Organization Required**: Most API endpoints require organizational authentication
2. **Admin Access Needed**: Many features require admin-level permissions
3. **Business Plans**: Full API access typically requires paid Zoho Mail plans
4. **Rate Limits**: Even with access, there are strict rate limits

#### ✅ **Free Alternatives for Email Monitoring:**

## 🔄 **Alternative Approaches**

### **Option 1: Gmail API (Recommended for Free Tier)**
If hello@wecandotoo.com is forwarded to a Gmail account:

```typescript
// Gmail API has a generous free tier
const GMAIL_API_QUOTAS = {
  dailyRequests: 1000000000, // 1 billion per day
  requestsPerSecond: 250,
  requestsPer100Seconds: 25000
};
```

### **Option 2: IMAP Access (Most Practical)**
Use standard IMAP protocol to check emails:

```typescript
// IMAP connection (works with most email providers)
const imapConfig = {
  host: 'imap.zoho.com', // or your provider
  port: 993,
  secure: true,
  auth: {
    user: 'hello@wecandotoo.com',
    pass: 'app-specific-password'
  }
};
```

### **Option 3: Email Webhooks**
Set up email forwarding to a webhook endpoint:

```typescript
// Forward emails to your webhook
const webhookConfig = {
  endpoint: 'https://your-domain.com/api/email-webhook',
  method: 'POST',
  authentication: 'bearer-token'
};
```

## 🛠 **Practical Implementation for Free Tier**

### **Updated ZohoMailChecker with Realistic Free Options**

```typescript
interface EmailCheckOptions {
  method: 'imap' | 'webhook' | 'gmail-api' | 'mock';
  credentials?: {
    email: string;
    password: string;
    host?: string;
    port?: number;
  };
}

class FreeEmailChecker {
  private options: EmailCheckOptions;

  constructor(options: EmailCheckOptions) {
    this.options = options;
  }

  async checkEmails(): Promise<EmailData[]> {
    switch (this.options.method) {
      case 'imap':
        return this.checkViaIMAP();
      case 'webhook':
        return this.getWebhookEmails();
      case 'gmail-api':
        return this.checkViaGmailAPI();
      default:
        return this.getMockEmails(); // Current implementation
    }
  }

  private async checkViaIMAP(): Promise<EmailData[]> {
    // IMAP implementation using node-imap or similar
    // This works with most email providers for free
    throw new Error('IMAP implementation needed');
  }

  private async getWebhookEmails(): Promise<EmailData[]> {
    // Fetch emails received via webhook
    throw new Error('Webhook implementation needed');
  }

  private async checkViaGmailAPI(): Promise<EmailData[]> {
    // Gmail API implementation (free tier: 1B requests/day)
    throw new Error('Gmail API implementation needed');
  }
}
```

## 📊 **Free Tier Comparison**

| Provider | Free Tier | Rate Limits | Best For |
|----------|-----------|-------------|----------|
| **Gmail API** | ✅ 1B requests/day | 250/sec | High volume |
| **IMAP** | ✅ Unlimited | Provider dependent | Simple setup |
| **Webhooks** | ✅ Server dependent | Custom | Real-time |
| **Zoho Mail API** | ❌ Limited/Paid | Strict | Enterprise |

## 🎯 **Recommended Approach for hello@wecandotoo.com**

### **Step 1: Email Forwarding Setup**
1. Set up email forwarding from hello@wecandotoo.com to a Gmail account
2. Use Gmail API for monitoring (generous free tier)
3. Filter emails by original recipient (hello@wecandotoo.com)

### **Step 2: Gmail API Integration**

```typescript
// Gmail API service (free tier friendly)
class GmailEmailChecker {
  private auth: any; // Google Auth client

  async getEmailsForAddress(targetEmail: string): Promise<EmailData[]> {
    const gmail = google.gmail({ version: 'v1', auth: this.auth });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `to:${targetEmail}`, // Filter by original recipient
      maxResults: 50
    });

    // Process and return emails
    return this.processGmailMessages(response.data.messages || []);
  }
}
```

### **Step 3: IMAP Alternative**

```typescript
// IMAP approach (works with most providers)
import Imap from 'node-imap';

class IMAPEmailChecker {
  private imap: Imap;

  constructor(config: ImapConfig) {
    this.imap = new Imap(config);
  }

  async checkEmails(): Promise<EmailData[]> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', true, (err, box) => {
          if (err) reject(err);
          
          // Search for recent emails
          this.imap.search(['UNSEEN'], (err, results) => {
            // Process results
            resolve(this.processResults(results));
          });
        });
      });

      this.imap.connect();
    });
  }
}
```

## 💡 **Current Implementation Strategy**

Since we want to keep the demo working while providing real options:

1. **Keep Mock Data**: For demonstration and development
2. **Add Provider Options**: Let users choose their email checking method
3. **Documentation**: Clear guide on setting up each method
4. **Environment Variables**: Support for different providers

```env
# Email checking configuration
EMAIL_CHECK_METHOD=mock # mock, imap, gmail, webhook
EMAIL_ADDRESS=hello@wecandotoo.com

# IMAP Configuration (if using IMAP)
IMAP_HOST=imap.zoho.com
IMAP_PORT=993
IMAP_USER=hello@wecandotoo.com
IMAP_PASS=your_app_password

# Gmail API Configuration (if using Gmail)
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=your_redirect_uri
```

## 🔐 **Security Considerations for Free Tier**

1. **App Passwords**: Use app-specific passwords instead of main passwords
2. **OAuth When Possible**: Prefer OAuth over password authentication
3. **Environment Variables**: Never hard-code credentials
4. **Rate Limiting**: Implement client-side rate limiting
5. **Error Handling**: Graceful handling of API limits

## 📝 **Next Steps**

1. **Choose Method**: Decide between Gmail API, IMAP, or webhooks
2. **Set Up Forwarding**: Configure email forwarding if needed
3. **Update Component**: Implement chosen method in ZohoMailChecker
4. **Test Thoroughly**: Verify email monitoring works reliably
5. **Monitor Usage**: Track API usage to stay within free limits

## 🎉 **Benefits of This Approach**

- ✅ **Cost Effective**: Works with free tiers
- ✅ **Reliable**: Uses proven email protocols
- ✅ **Scalable**: Can upgrade to paid tiers later
- ✅ **Flexible**: Multiple implementation options
- ✅ **Secure**: Industry-standard authentication methods

This approach provides a practical path to email monitoring without requiring paid Zoho Mail API access while maintaining the professional admin interface we've created.
