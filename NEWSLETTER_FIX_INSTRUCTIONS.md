# Newsletter Subscription Fix Instructions

## Problem
The newsletter subscription edge function is returning non-2xx errors because the required database functions don't exist yet.

**Error:** `Could not find the function public.add_newsletter_subscriber(email_param, user_id_param) in the schema cache`

## Solution
The database migration needs to be applied manually through the Supabase Dashboard.

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `rowcloxlszwnowlggqon`

### Step 2: Apply Database Migration
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/20250812000000_create_newsletter_subscribers.sql`
4. Paste it into the SQL editor
5. Click **"Run"** to execute the migration

### Step 3: Verify the Migration
After running the migration, verify that the functions were created:

```sql
-- Check if the newsletter_subscribers table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers';

-- Check if the functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('add_newsletter_subscriber', 'confirm_newsletter_subscription', 'unsubscribe_newsletter');
```

### Step 4: Test the Edge Function
Once the migration is applied, test the newsletter subscription:

```powershell
$headers = @{
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI3MDM2MzEsImV4cCI6MjAzODI3OTYzMX0.RqnJOIkqJFBx1cGUP1-0xjl8tKkWHjZ_qdEHrJxYFUg'
    'Content-Type' = 'application/json'
}
$body = '{"email":"test@example.com","action":"subscribe"}'
Invoke-RestMethod -Uri "https://rowcloxlszwnowlggqon.supabase.co/functions/v1/newsletter-subscription" -Method POST -Headers $headers -Body $body
```

### Step 5: Configure Email Settings (If Needed)
If you want the confirmation emails to be sent from hello@wecandotoo.com:

1. In Supabase Dashboard, go to **Authentication > Settings**
2. Scroll down to **SMTP Settings**
3. Configure your email provider (Resend, SendGrid, etc.) with hello@wecandotoo.com

## What the Migration Creates

The migration will create:
- ✅ `newsletter_subscribers` table with proper structure
- ✅ RLS policies for security
- ✅ `add_newsletter_subscriber()` function
- ✅ `confirm_newsletter_subscription()` function  
- ✅ `unsubscribe_newsletter()` function
- ✅ Proper permissions and indexes

## Expected Result
After applying the migration, your newsletter subscription should work perfectly with:
- ✅ Proper subscription handling
- ✅ Email confirmation flow
- ✅ Unsubscription support
- ✅ Integration with hello@wecandotoo.com emails

## Troubleshooting
If you still get errors after the migration:
1. Check the Supabase function logs in Dashboard > Edge Functions
2. Verify your SMTP settings are configured
3. Test with a simple email first
