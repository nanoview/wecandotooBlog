# 🚨 CRITICAL: Invalid API Key - Complete Fix Guide

## Problem Confirmed ✅
- API Key test: ❌ **401 Unauthorized**
- Authentication: ❌ **401 Unauthorized** 
- Login/Posts: ❌ **Completely broken**

## Root Cause
Your Supabase API key `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` is **INVALID**.

This could be because:
1. **API key was regenerated** in Supabase Dashboard
2. **Project was paused/suspended**
3. **API key expired** or revoked
4. **Project settings changed**

---

## 🔧 IMMEDIATE FIX STEPS

### Step 1: Check Project Status
1. Go to: **https://supabase.com/dashboard/project/rowcloxlszwnowlggqon**
2. Check if project shows any warnings/errors
3. Verify project is **ACTIVE** (not paused)

### Step 2: Get NEW API Key
1. In Supabase Dashboard, go to: **Settings → API**
2. Copy the **anon / public** key (NOT service_role)
3. It should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Update Configuration
Replace the key in **BOTH** files:

**File 1: `.env`**
```bash
VITE_SUPABASE_ANON_KEY=YOUR_NEW_API_KEY_HERE
```

**File 2: `src/integrations/supabase/client.ts`**
```typescript
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_NEW_API_KEY_HERE";
```

### Step 4: Test the Fix
```powershell
# Test new API key
$newKey = "YOUR_NEW_API_KEY_HERE"
$headers = @{'Authorization' = "Bearer $newKey"; 'apikey' = $newKey}
$response = Invoke-RestMethod -Uri "https://rowcloxlszwnowlggqon.supabase.co/rest/v1/blog_posts?select=id,title&limit=3" -Headers $headers
$response
```

### Step 5: Restart Development Server
```powershell
npm run dev
```

---

## 🎯 What You Need to Do NOW

1. **Visit Supabase Dashboard**: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/settings/api
2. **Copy the current anon/public API key**
3. **Provide me the new key** and I'll update both files instantly

---

## Expected Result After Fix
- ✅ Login will work
- ✅ Blog posts will load  
- ✅ Authentication will function
- ✅ Newsletter will continue working
- ✅ All 401 errors will be resolved

---

**🚀 ACTION REQUIRED:** Get the current API key from Supabase Dashboard and tell me what it is. I'll fix everything immediately!
