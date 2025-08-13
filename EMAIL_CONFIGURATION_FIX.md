# Email Configuration Fix for Newsletter Confirmations

## Problem
- ✅ Database is receiving email subscriptions
- ✅ Both edge functions are deployed (`newsletter-subscription` and `send-confirmation-email`)
- ❌ Confirmation emails are not being sent

## Root Cause
The `RESEND_API_KEY` environment variable is not configured in your Supabase project.

## Solution Steps

### Step 1: Get Your Resend API Key
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Sign in or create an account
3. Create a new API key or copy your existing one
4. Make sure your domain `wecandotoo.com` is verified in Resend

### Step 2: Add Environment Variable to Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `rowcloxlszwnowlggqon`
3. In the left sidebar, click **Settings** → **Edge Functions**
4. Scroll down to **Environment Variables**
5. Click **Add new secret**
6. Set:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (starts with `re_`)

### Step 3: Redeploy Functions (Optional)
After adding the environment variable, you may need to redeploy:

```powershell
npx supabase functions deploy send-confirmation-email --import-map ./import_map.json
```

### Step 4: Test the Newsletter Subscription
Try subscribing again from your website and check:

1. **Subscription Test:**
```powershell
$headers = @{
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI3MDM2MzEsImV4cCI6MjAzODI3OTYzMX0.RqnJOIkqJFBx1cGUP1-0xjl8tKkWHjZ_qdEHrJxYFUg'
    'Content-Type' = 'application/json'
}
$body = '{"email":"your-test@email.com","action":"subscribe"}'
Invoke-RestMethod -Uri "https://rowcloxlszwnowlggqon.supabase.co/functions/v1/newsletter-subscription" -Method POST -Headers $headers -Body $body
```

2. **Check Function Logs:**
   - In Supabase Dashboard → Edge Functions → `send-confirmation-email`
   - Click **Logs** to see any errors

## Alternative: Supabase Auth Email Templates

If you prefer using Supabase's built-in email system instead of Resend:

1. **Configure SMTP in Supabase:**
   - Dashboard → Authentication → Settings
   - Scroll to **SMTP Settings**
   - Configure with your email provider

2. **Use Auth Email Templates:**
   - Dashboard → Authentication → Email Templates
   - Customize the templates to match your branding

## Expected Result
After configuring the `RESEND_API_KEY`:
- ✅ Subscription emails saved to database
- ✅ Confirmation emails sent from hello@wecandotoo.com
- ✅ Users can confirm their subscriptions
- ✅ Complete newsletter workflow working

## Troubleshooting
If emails still don't work:
1. Check Resend dashboard for sending errors
2. Verify `wecandotoo.com` domain is verified in Resend
3. Check Supabase function logs for detailed errors
4. Ensure SPF/DKIM records are configured for your domain
