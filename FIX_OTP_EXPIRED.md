# 🔧 Fix OTP Expired Error - Production URL Configuration

## ❌ Current Issue
You're getting `otp_expired` error because the email confirmation links are redirecting to localhost instead of your production domain.

## ✅ Solutions Applied

### 1. Updated config.toml ✅
- Changed `site_url` from `http://localhost:8080` to `https://wecandotoo.com`
- Added production URL to `additional_redirect_urls`

### 2. Redeployed Email Function ✅
- The `auth-email-template` function now uses the correct site URL
- Email links will now point to `https://wecandotoo.com/auth/confirm`

## 🔧 Required Dashboard Configuration

**IMPORTANT**: You must update your Supabase dashboard settings:

### Step 1: Update Auth Configuration
1. Go to: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/settings/auth
2. Update these settings:
   ```
   Site URL: https://wecandotoo.com
   
   Additional Redirect URLs:
   https://wecandotoo.com
   https://wecandotoo.com/auth/confirm
   https://wecandotoo.com/auth/reset-password
   http://localhost:8080 (for local testing)
   ```

### Step 2: Email Settings
3. In the same Auth settings page, configure:
   ```
   Confirm email: Enabled ✅
   Secure email change: Enabled ✅
   
   Email Templates > Confirm signup:
   Subject: Welcome to WeCanDoToo - Confirm your account
   Body: Use the custom auth-email-template function
   ```

## 🧪 Testing the Fix

1. **Clear browser cache** to remove any old cached redirects
2. **Try signing up again** with a fresh email
3. **Check email** - the confirmation link should now go to:
   ```
   https://wecandotoo.com/auth/confirm?token=...&type=signup&email=...
   ```
4. **Click the link** - it should successfully confirm your account

## 🔄 If Still Getting Errors

If you still get OTP expired:
1. Make sure the dashboard settings are saved
2. Wait 2-3 minutes for changes to propagate
3. Try with a completely new email address
4. Check that your domain `wecandotoo.com` is accessible

## ⚡ Quick Commands

To redeploy if needed:
```powershell
# Deploy functions
npx supabase functions deploy auth-email-template --import-map ./import_map.json

# Check status
npx supabase status
```

The main fix is updating the **Site URL in your Supabase dashboard** from localhost to `https://wecandotoo.com`!
