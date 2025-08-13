# Email Configuration Guide for hello@wecandotoo.com

## ✅ Completed Steps

1. **Edge Functions Deployed** ✅
   - `auth-email-template` - Handles all authentication emails
   - `send-confirmation-email` - Sends confirmation emails
   - Functions are live at: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/functions

2. **Frontend Components Created** ✅
   - `AuthConfirm.tsx` - Email confirmation page
   - `ResetPassword.tsx` - Password reset page
   - Routes added to App.tsx for `/auth/confirm` and `/auth/reset-password`

3. **Configuration Updated** ✅
   - `config.toml` configured for email confirmations
   - Invalid config keys removed

## 🔧 Next Steps - Supabase Dashboard Configuration

### Step 1: Configure SMTP Settings
1. Go to https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/settings/auth
2. Scroll to "SMTP Settings"
3. Configure:
   ```
   SMTP Host: [Your SMTP host - e.g., smtp.gmail.com, mail.wecandotoo.com]
   SMTP Port: 587 (or 465 for SSL)
   SMTP User: hello@wecandotoo.com
   SMTP Pass: [Your SMTP password]
   Sender Name: WeCanDoToo Team
   Sender Email: hello@wecandotoo.com
   ```

### Step 2: Configure Auth Email Template Hook
1. Go to https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/database/hooks
2. Create a new hook with:
   ```
   Hook Name: auth_email_template
   Table: auth.users
   Events: INSERT, UPDATE
   Type: HTTP
   URL: https://rowcloxlszwnowlggqon.supabase.co/functions/v1/auth-email-template
   HTTP Method: POST
   HTTP Headers: 
     Content-Type: application/json
     Authorization: Bearer [YOUR_ANON_KEY]
   ```

### Step 3: Test Email Flow
1. Go to your website: https://wecandotoo.com
2. Try signing up with a new email
3. Check that confirmation email is sent from hello@wecandotoo.com
4. Test the confirmation link works on `/auth/confirm`
5. Test password reset from hello@wecandotoo.com

## 📧 Email Templates Available

The `auth-email-template` function handles:
- **Signup Confirmation** - Welcome email with confirmation link
- **Password Recovery** - Reset password email
- **Magic Link** - Passwordless login email
- **Email Change** - Confirm new email address

All emails:
- ✅ Sent from hello@wecandotoo.com
- ✅ Branded with WeCanDoToo styling
- ✅ Mobile responsive design
- ✅ Include social sharing buttons
- ✅ Professional HTML templates

## 🔍 Troubleshooting

If emails aren't working:
1. Check SMTP settings in Supabase dashboard
2. Verify hello@wecandotoo.com email credentials
3. Check edge function logs in Supabase dashboard
4. Test edge function directly: `curl -X POST https://rowcloxlszwnowlggqon.supabase.co/functions/v1/auth-email-template`

## 📁 Files Created/Modified

- `supabase/functions/auth-email-template/index.ts` - Main email handler
- `supabase/functions/send-confirmation-email/index.ts` - Updated sender
- `src/pages/AuthConfirm.tsx` - Email confirmation page
- `src/pages/ResetPassword.tsx` - Password reset page
- `src/App.tsx` - Added auth routes
- `supabase/config.toml` - Email configuration

## 🎯 Final Result

Users will receive professional, branded confirmation emails from hello@wecandotoo.com with:
- Clean, responsive design
- WeCanDoToo branding
- Working confirmation/reset links
- Social media integration
- Professional appearance

Your email system is now ready! Just complete the SMTP configuration in the Supabase dashboard.
