# 🚨 Login & Posts Not Working - Troubleshooting Guide

## Current Issues
1. ❌ **Can't login** - Authentication failing
2. ❌ **Can't see posts** - Blog posts not loading
3. ❌ **API 401 Unauthorized** - Database access failing

## Root Cause Analysis

### 🔑 **API Key Issues**
The Supabase anon key is returning 401 Unauthorized, which suggests:

1. **API Key Expired** - The token might have expired
2. **API Key Wrong** - Using incorrect key for project
3. **Project Configuration** - Supabase project settings changed

### 🔒 **RLS Policy Issues**
Blog posts have Row Level Security that:
- **Anonymous users** can only see `status = 'published'` posts
- **Authenticated users** can see their own posts
- **Must be logged in** to create/edit posts

## Quick Diagnostic Steps

### Step 1: Check Server Status ✅
Your dev server is running on: http://localhost:8081/

### Step 2: Test API Access
Current API key test returns: **401 Unauthorized**

### Step 3: Check Environment Variables
```bash
# Current .env:
VITE_SUPABASE_URL=https://rowcloxlszwnowlggqon.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI3MDM2MzEsImV4cCI6MjAzODI3OTYzMX0.RqnJOIkqJFBx1cGUP1-0xjl8tKkWHjZ_qdEHrJxYFUg
```

## Immediate Solutions

### Solution 1: Restart Development Server
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

### Solution 2: Check Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `rowcloxlszwnowlggqon`
3. Go to **Settings** → **API**
4. Verify the **anon key** matches your .env file
5. Check if the project is paused or has issues

### Solution 3: Test Direct Database Access
Visit: http://localhost:8081/ and check browser console (F12) for errors

### Solution 4: Emergency API Key Reset
If API key is wrong, get the correct one from Supabase Dashboard:
1. Dashboard → Settings → API
2. Copy the **anon/public** key
3. Update `.env` file
4. Restart server

## Expected Browser Console Errors

Look for these in F12 console:
- `"Invalid API key"`
- `"Failed to fetch"`
- `"Supabase client error"`
- `"AuthError: Invalid credentials"`

## Next Steps

1. **Check browser console** at http://localhost:8081/
2. **Verify API key** in Supabase Dashboard
3. **Test authentication** by trying to login
4. **Check if posts are published** (status = 'published')

## Working Newsletter System ✅

Note: The newsletter subscription system IS working:
- ✅ Edge functions deployed
- ✅ Database migration applied
- ✅ Emails being sent from hello@wecandotoo.com
- ✅ Subscribers being stored

The issue is specifically with the frontend authentication and blog post access.
