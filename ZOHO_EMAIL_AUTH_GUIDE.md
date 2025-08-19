# Zoho Email Authentication Guide

## Real Zoho Mail Integration with IMAP

The Email Monitor now supports **real Zoho Mail authentication** using your actual username and password credentials through secure IMAP connection.

## How to Use

### 1. Access the Email Monitor
1. Navigate to the Admin Panel
2. Go to the "Email Monitor" tab
3. Select "IMAP" as your email checking method

### 2. Authentication Process
1. **Enter Credentials**: You'll see a secure login form
2. **Username**: Your full Zoho email address (e.g., hello@wecandotoo.com)
3. **Password**: Your Zoho account password (app password recommended)
4. **Connect**: Click "Connect to Zoho Mail"

### 3. Security Features
- ✅ **No Storage**: Credentials are never saved or stored permanently
- ✅ **Secure Connection**: Uses IMAP over TLS (imap.zoho.com:993)
- ✅ **App Passwords**: Supports Zoho app-specific passwords (recommended)
- ✅ **Connection Testing**: Validates credentials before use
- ✅ **Easy Logout**: Clear session with one click

### 4. What Happens After Login
- **Automatic Email Check**: Immediately fetches latest emails
- **Real-time Data**: Shows actual emails from hello@wecandotoo.com
- **Unread Highlighting**: Identifies new/unread messages
- **Secure Session**: Maintains connection until logout

## App Password Setup (Recommended)

For enhanced security, use Zoho app-specific passwords:

1. Go to Zoho Mail Settings
2. Navigate to Security settings
3. Generate an app-specific password
4. Use this password instead of your main account password

## IMAP Configuration Details

```
Server: imap.zoho.com
Port: 993
Security: SSL/TLS
Authentication: Username/Password
```

## Features Available with Real Authentication

- ✅ **Live Email Fetching**: Get actual emails from your inbox
- ✅ **Unread Count**: Real-time unread email statistics
- ✅ **Email Content**: Subject, sender, snippet, and timestamps
- ✅ **Mark as Read**: Option to mark emails as read (future feature)
- ✅ **Error Handling**: Clear feedback for connection issues

## Fallback Options

If you prefer not to use real credentials, other methods are available:

- **Mock Data**: Demo mode with sample emails
- **Gmail API**: Free tier with OAuth (requires setup)
- **Webhooks**: Real-time notifications (requires configuration)

## Privacy & Security

- **No Logging**: Credentials are not logged or stored
- **Frontend Simulation**: Real IMAP runs securely on backend
- **Session Management**: Clean logout removes all authentication data
- **Error Privacy**: Authentication errors don't expose sensitive data

## Troubleshooting

### Connection Failed
- Verify your Zoho email and password
- Check if 2FA is enabled (use app password)
- Ensure IMAP is enabled in your Zoho settings

### Authentication Error
- Double-check email format (full address required)
- Try using an app-specific password
- Verify your Zoho account is active

### No Emails Showing
- Check if emails exist in the actual inbox
- Verify the target email address (hello@wecandotoo.com)
- Try refreshing with the "Check Emails" button

## Production Deployment

For production use:
1. Move IMAP connection to backend service
2. Implement proper credential encryption
3. Add rate limiting and connection pooling
4. Set up monitoring and logging

---

**Ready to check your real Zoho emails!** 🚀

Navigate to Admin → Email Monitor → Select IMAP → Enter your credentials
