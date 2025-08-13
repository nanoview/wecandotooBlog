# 🔑 Fix Invalid API Key - Step by Step Guide

## Issue: "Invalid API key" Error

Your current API key is not working with the Supabase project. Here's how to fix it:

## Step 1: Get Correct API Key from Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account

2. **Select Your Project:**
   - Click on project: `rowcloxlszwnowlggqon`
   - Or go directly to: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon

3. **Get API Keys:**
   - In left sidebar, click **Settings**
   - Click **API**
   - Find the **Project API keys** section
   - Copy the **anon / public** key (NOT the service_role key)

## Step 2: Update Your Environment File

Replace the current key in your `.env` file:

```bash
# Current (NOT WORKING):
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI3MDM2MzEsImV4cCI6MjAzODI3OTYzMX0.RqnJOIkqJFBx1cGUP1-0xjl8tKkWHjZ_qdEHrJxYFUg

# Replace with the CORRECT key from Supabase Dashboard:
VITE_SUPABASE_ANON_KEY=YOUR_CORRECT_ANON_KEY_HERE
```

## Step 3: Update Client Configuration

The client file should also be updated to use the new key.

## Step 4: Restart Development Server

```powershell
# Stop current server (Ctrl+C if running)
npm run dev
```

## Step 5: Test the Fix

After updating, test if the API works:

```powershell
# Test with the new API key
$headers = @{
    'Authorization' = 'Bearer YOUR_NEW_API_KEY'
    'apikey' = 'YOUR_NEW_API_KEY'
}
$response = Invoke-RestMethod -Uri "https://rowcloxlszwnowlggqon.supabase.co/rest/v1/blog_posts?select=id,title&limit=3" -Headers $headers
$response
```

## What You'll Find in Supabase Dashboard

The API section will show:
- **Project URL:** https://rowcloxlszwnowlggqon.supabase.co
- **anon / public key:** (This is what you need)
- **service_role key:** (Don't use this in frontend)

## Expected Result

After updating with the correct key:
- ✅ Login should work
- ✅ Blog posts should load
- ✅ Authentication should function properly
- ✅ Newsletter subscription should continue working

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```powershell
supabase status
```

This will show your project's API keys.

---

**Next Step:** Please go to the Supabase Dashboard and get the correct anon/public API key, then I'll help you update the configuration files.
