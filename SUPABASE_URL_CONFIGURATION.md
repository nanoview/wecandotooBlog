# 🔧 Supabase Authentication URL Configuration

## 🎯 **Required URL Setup**

You need to configure these URLs in your Supabase dashboard for proper newsletter and authentication flow.

### **Step 1: Access Supabase Auth Settings**
1. Go to: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/settings/auth
2. Scroll to "Site URL" and "Additional Redirect URLs" sections

### **Step 2: Configure Site URL**
Set the main site URL:
```
Site URL: https://wecandotoo.com
```

### **Step 3: Add Additional Redirect URLs**
Add these URLs to the "Additional Redirect URLs" field (one per line):

```
https://wecandotoo.com
https://wecandotoo.com/auth/confirm
https://wecandotoo.com/auth/reset-password
https://wecandotoo.com/confirm-subscription
http://localhost:8080
http://localhost:8080/auth/confirm
http://localhost:8080/confirm-subscription
```

## 📧 **Current Newsletter Flow**

Your newsletter subscription function is configured to use:
- **Confirmation URL**: `https://wecandotoo.com/confirm-subscription?token=xxx`
- **Email Sender**: hello@wecandotoo.com
- **Frontend Route**: `/confirm-subscription` (already configured in App.tsx)

## ⚙️ **Config.toml Updates**

Update your local config file as well:

```toml
[auth]
enabled = true
site_url = "https://wecandotoo.com"
additional_redirect_urls = [
  "https://wecandotoo.com", 
  "https://wecandotoo.com/auth/confirm",
  "https://wecandotoo.com/auth/reset-password", 
  "https://wecandotoo.com/confirm-subscription",
  "http://localhost:8080",
  "http://localhost:8080/auth/confirm",
  "http://localhost:8080/confirm-subscription"
]
jwt_expiry = 3600
enable_signup = true
enable_anonymous_sign_ins = false
```

## 🧪 **Testing After Configuration**

### 1. Test Newsletter Subscription:
```
1. Go to https://wecandotoo.com
2. Find newsletter signup form
3. Enter test email
4. Check email for confirmation link
5. Click link → should go to /confirm-subscription
6. Verify confirmation page works
```

### 2. Test User Authentication:
```
1. Try user signup/signin
2. Check email confirmation links work
3. Test password reset links
4. Verify all redirect to correct URLs
```

## 🔍 **Troubleshooting**

### If Newsletter Confirmation Fails:
1. **Check URL Configuration**: Ensure all URLs are in Supabase dashboard
2. **Check Console Logs**: Look for CORS or redirect errors
3. **Verify Edge Function**: Check function logs in Supabase dashboard
4. **Test Token**: Ensure token is being generated correctly

### If Authentication Fails:
1. **OTP Expired**: Usually means URL mismatch
2. **CORS Errors**: Check additional redirect URLs
3. **404 Errors**: Verify frontend routes exist

## 📱 **URL Patterns**

### **Newsletter Subscriptions**:
- Signup: `wecandotoo.com` (any page with newsletter form)
- Confirmation: `wecandotoo.com/confirm-subscription?token=xxx`
- Success: Stay on confirmation page with success message

### **User Authentication**:
- Signup: `wecandotoo.com/auth/confirm?token=xxx&type=signup`
- Password Reset: `wecandotoo.com/auth/reset-password?token=xxx`
- Magic Link: `wecandotoo.com/auth/confirm?token=xxx&type=magiclink`

## ✅ **Quick Configuration Checklist**

- [ ] Set Site URL to `https://wecandotoo.com`
- [ ] Add all redirect URLs to dashboard
- [ ] Update config.toml with new URLs
- [ ] Test newsletter subscription flow
- [ ] Test user authentication flow
- [ ] Verify email confirmations work
- [ ] Check mobile/responsive behavior

After adding these URLs to your Supabase dashboard, your newsletter subscription and authentication flows will work correctly! 🎉
