# Newsletter Form Debug Guide

## Issue: Newsletter form not sending email addresses to store

## Current Status Check ✅

### 1. Edge Function Working ✅
```powershell
# Direct test shows it's working:
$response = Invoke-RestMethod -Uri "https://rowcloxlszwnowlggqon.supabase.co/functions/v1/newsletter-subscription" -Method POST -Headers @{'Authorization'='Bearer ...'; 'Content-Type'='application/json'} -Body '{"email":"test@example.com","action":"subscribe"}'

# Response: success: True, emailSent: True
```

### 2. Frontend Form Structure ✅
- NewsletterSubscription component exists in `src/components/NewsletterSubscription.tsx`
- Form has proper email input with validation
- Uses subscriptionService.ts to call edge function
- Component used in Index.tsx page

### 3. Environment Configuration ⚠️ **POTENTIAL ISSUE**
```bash
# .env file:
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyODAwMDksImV4cCI6MjAzNzg1NjAwOX0.RvYoHgWjShOlqrOQ2D__lUVcVEhOllQWZhZkJr0NFQU

# client.ts file:
supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis"
```

**❌ MISMATCH DETECTED!** The API keys don't match.

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Try subscribing to newsletter
4. Look for errors like:
   - "Invalid API key"
   - "Unauthorized"
   - "Failed to fetch"

### Step 2: Check Network Tab
1. Open Network tab in dev tools
2. Try subscribing
3. Look for the request to `/functions/v1/newsletter-subscription`
4. Check if it returns 401 Unauthorized or other errors

### Step 3: Verify Client Configuration
The client.ts file might be overriding the .env variables.

## Solutions to Try

### Solution 1: Update client.ts to use environment variables
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Solution 2: Restart development server
```powershell
# Stop current dev server (Ctrl+C)
npm run dev
```

### Solution 3: Clear browser cache
- Hard refresh (Ctrl+F5)
- Clear site data in dev tools

## Test Commands

### Test 1: Manual API call
```javascript
// In browser console:
fetch('https://rowcloxlszwnowlggqon.supabase.co/functions/v1/newsletter-subscription', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyODAwMDksImV4cCI6MjAzNzg1NjAwOX0.RvYoHgWjShOlqrOQ2D__lUVcVEhOllQWZhZkJr0NFQU',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({email: 'test@example.com', action: 'subscribe'})
}).then(r => r.json()).then(console.log)
```

### Test 2: Check Supabase client
```javascript
// In browser console:
console.log(window.supabase) // or however it's exposed
```

## Expected Result
Newsletter form should save emails to database and send confirmation emails.
