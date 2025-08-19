# Email Monitoring Setup Guide

This guide explains how to set up email monitoring to check emails sent to hello@wecandotoo.com in the admin panel.

## � **Important: Zoho Mail API Limitations**

**Zoho Mail API is NOT available for free individual accounts.** It requires:
- ✅ Zoho Mail Business/Enterprise plan (paid)
- ✅ Organizational admin access
- ✅ Business domain verification

## 🆓 **Free Alternatives (Recommended)**

### **Option 1: Gmail API (Best for Free Tier)**
- **Free Quota**: 1 billion requests per day
- **Cost**: Free
- **Setup**: Forward hello@wecandotoo.com to Gmail account

### **Option 2: IMAP Access (Most Universal)**
- **Cost**: Free with email provider
- **Compatibility**: Works with most email providers
- **Setup**: Use app-specific passwords

### **Option 3: Email Webhooks (Real-time)**
- **Cost**: Depends on webhook service
- **Latency**: Real-time notifications
- **Setup**: Configure email forwarding to webhook endpoint

## 📋 **Current Implementation Features**

The admin panel includes an **Email Monitor** tab with:
- **Multiple Methods**: Demo, Gmail API, IMAP, Webhooks
- **Dashboard Metrics**: Total emails, unread count, last checked time
- **Email List**: Recent emails with sender, subject, snippets
- **Method Switching**: Easy switching between different monitoring methods

## 🔧 Setting Up Real Zoho Mail Integration

To connect to real Zoho Mail, follow these steps:

### Step 1: Create Zoho Developer Application

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Click "Create New Client"
3. Choose "Web based applications"
4. Fill in the details:
   - **Client Name**: WeCanDoToo Email Monitor
   - **Homepage URL**: `http://localhost:8080` (or your production URL)
   - **Authorized Redirect URI**: `http://localhost:8080/admin/zoho-callback`

### Step 2: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Zoho Mail API Configuration
VITE_ZOHO_CLIENT_ID=your_client_id_here
VITE_ZOHO_CLIENT_SECRET=your_client_secret_here
VITE_ZOHO_REDIRECT_URI=http://localhost:8080/admin/zoho-callback
```

### Step 3: Set Up OAuth Flow

The ZohoMailService provides methods for OAuth authentication:

```typescript
import { createZohoMailService } from '@/services/zohoMail';

// Initialize service
const zohoService = createZohoMailService();

// Get authorization URL
const authUrl = zohoService.getAuthUrl();

// Redirect user for authorization
window.location.href = authUrl;
```

### Step 4: Handle OAuth Callback

Create a callback route to handle the authorization response and exchange the code for tokens.

### Step 5: Update ZohoMailChecker Component

Replace the mock data in `ZohoMailChecker.tsx` with real API calls:

```typescript
const checkEmails = async () => {
  setIsLoading(true);
  try {
    const zohoService = createZohoMailService();
    const emails = await zohoService.getEmailsForAddress('hello@wecandotoo.com');
    setEmails(emails);
    // ... rest of the logic
  } catch (error) {
    // Handle errors
  } finally {
    setIsLoading(false);
  }
};
```

## 📊 Current Implementation

### Mock Data Structure

The current implementation uses mock email data with the following structure:

```typescript
interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  isUnread: boolean;
}
```

### Admin Panel Integration

- **Tab Navigation**: Added "Emails" tab to admin panel
- **Real-time UI**: Shows email count, unread count, and last checked time
- **Email List**: Displays recent emails with sender, subject, and timestamps
- **Status Indicators**: Visual indicators for unread emails

## 🔐 Security Considerations

1. **Environment Variables**: Store API credentials securely
2. **Token Storage**: Access tokens are stored in localStorage (consider more secure storage for production)
3. **API Rate Limits**: Implement proper rate limiting and error handling
4. **CORS**: Ensure proper CORS configuration for production

## 🛠️ API Service Features

The `ZohoMailService` class provides:

- ✅ OAuth authentication flow
- ✅ Token refresh mechanism
- ✅ Email fetching with filters
- ✅ Mark emails as read
- ✅ Account information retrieval
- ✅ Error handling and retry logic

## 📝 Next Steps

1. **Set up Zoho Developer Account** and create API application
2. **Configure environment variables** with your API credentials
3. **Implement OAuth callback** route and token storage
4. **Replace mock data** with real API calls
5. **Add email actions** like marking as read, archive, etc.
6. **Set up automatic refresh** with background polling

## 🎯 Benefits

- **Centralized Email Management**: Monitor important emails from the admin panel
- **Quick Response**: See new emails without checking email client
- **Business Intelligence**: Track contact form submissions and inquiries
- **Efficiency**: Streamlined workflow for handling customer communications

## 🔍 Troubleshooting

### Common Issues

1. **API Rate Limits**: Zoho Mail API has rate limits - implement proper throttling
2. **Token Expiration**: Access tokens expire - ensure refresh token logic works
3. **CORS Issues**: May need server-side proxy for production
4. **Authentication Errors**: Check API credentials and redirect URIs

### Testing

- Use the mock data implementation to test UI functionality
- Verify OAuth flow in development environment
- Test token refresh mechanism
- Validate email filtering and display logic

## 📚 Resources

- [Zoho Mail API Documentation](https://www.zoho.com/mail/help/api/)
- [Zoho OAuth 2.0 Guide](https://www.zoho.com/accounts/protocol/oauth.html)
- [API Console](https://api-console.zoho.com/)

---

**Note**: The current implementation shows mock data for demonstration. Follow the setup steps above to connect to real Zoho Mail API.
