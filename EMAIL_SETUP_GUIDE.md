# Email Configuration Setup Guide for WeCanDoToo

## Overview
This guide will help you complete the email configuration to send confirmation and authentication emails from `hello@wecandotoo.com`.

## ✅ What's Already Done

1. **Supabase Configuration Updated**
   - Enabled email confirmations in `config.toml`
   - Created custom email templates
   - Updated edge functions to use `hello@wecandotoo.com`

2. **Frontend Pages Created**
   - `/auth/confirm` - Email confirmation page
   - `/auth/reset-password` - Password reset page
   - Updated routing in App.tsx

3. **Edge Functions Ready**
   - `send-confirmation-email` - Newsletter confirmations
   - `auth-email-template` - Authentication emails

## 🔧 Next Steps to Complete

### 1. Configure SMTP in Supabase Dashboard

Go to your Supabase project dashboard:
1. Navigate to **Authentication** > **Settings** > **SMTP Settings**
2. Configure the following:

```
SMTP Host: [Your SMTP provider host]
SMTP Port: 587 (or 465 for SSL)
SMTP User: hello@wecandotoo.com
SMTP Pass: [Your email password/app password]
SMTP Sender Name: WeCanDoToo
SMTP Admin Email: hello@wecandotoo.com
```

### 2. Popular SMTP Providers

#### Option A: Google Workspace/Gmail
- **Host**: `smtp.gmail.com`
- **Port**: 587
- **Security**: TLS
- **User**: `hello@wecandotoo.com`
- **Pass**: App password (not regular password)

#### Option B: Mailgun
- **Host**: `smtp.mailgun.org`
- **Port**: 587
- **Security**: TLS
- **User**: `hello@wecandotoo.com`
- **Pass**: Mailgun password

#### Option C: SendGrid
- **Host**: `smtp.sendgrid.net`
- **Port**: 587
- **Security**: TLS
- **User**: `apikey`
- **Pass**: Your SendGrid API key

### 3. Update Site URL in Supabase

1. Go to **Authentication** > **Settings** > **General**
2. Update **Site URL** to: `https://wecandotoo.com`
3. Add **Redirect URLs**:
   - `https://wecandotoo.com/auth/confirm`
   - `https://wecandotoo.com/auth/reset-password`
   - `http://localhost:3000/auth/confirm` (for development)
   - `http://localhost:3000/auth/reset-password` (for development)

### 4. Deploy Edge Functions

Run the deployment command:
```bash
npm run sync:deploy
```

Or manually:
```bash
supabase functions deploy auth-email-template --import-map ./import_map.json
supabase functions deploy send-confirmation-email --import-map ./import_map.json
```

### 5. Set Environment Variables

Make sure these environment variables are set in your Supabase project:
- `RESEND_API_KEY` (if using Resend as backup)

### 6. Test Email Configuration

#### Test Signup Confirmation:
1. Create a new user account
2. Check if confirmation email is sent from `hello@wecandotoo.com`
3. Verify the confirmation link works

#### Test Password Reset:
1. Use "Forgot Password" feature
2. Check if reset email is sent from `hello@wecandotoo.com`
3. Verify the reset link works

## 🎯 Email Templates Configured

The following email templates are now configured:

### 1. Signup Confirmation
- **From**: WeCanDoToo <hello@wecandotoo.com>
- **Subject**: Welcome to WeCanDoToo - Confirm your account
- **Features**: Branded design, clear CTA, helpful next steps

### 2. Password Recovery
- **From**: WeCanDoToo <hello@wecandotoo.com>
- **Subject**: Reset your WeCanDoToo password
- **Features**: Security-focused, clear instructions, expiry notice

### 3. Magic Link
- **From**: WeCanDoToo <hello@wecandotoo.com>
- **Subject**: Your WeCanDoToo magic link
- **Features**: Simple sign-in, security notice

## 🚨 Important Security Notes

1. **Use App Passwords**: If using Gmail, create an app password instead of your regular password
2. **Enable 2FA**: Enable two-factor authentication on your email account
3. **Monitor Usage**: Keep track of email sending volume and bounce rates
4. **SPF/DKIM**: Configure SPF and DKIM records for better deliverability

## 📧 Email Authentication Records

Add these DNS records to improve email deliverability:

### SPF Record
```
TXT @ "v=spf1 include:_spf.google.com ~all"
```

### DMARC Record
```
TXT _dmarc "v=DMARC1; p=none; rua=mailto:hello@wecandotoo.com"
```

## 🔄 Migration Command

Run this migration to apply the email template changes:
```bash
supabase db push
```

## 📞 Support

If you encounter issues:
- Check Supabase logs for authentication errors
- Verify SMTP credentials
- Test with a simple SMTP client first
- Contact your SMTP provider for delivery issues

The email system is now ready to send beautiful, branded emails from `hello@wecandotoo.com`! 🎉
