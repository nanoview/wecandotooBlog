# 🚀 Supabase Backend & Edge Functions Access Guide

## 📊 **Your Current Setup**
- **Project ID**: `rowcloxlszwnowlggqon`
- **URL**: `https://rowcloxlszwnowlggqon.supabase.co`
- **Dashboard**: `https://supabase.com/dashboard/project/rowcloxlszwnowlggqon`

## 🔧 **1. Backend Database Access**

### Using the Client (Already Working)
```typescript
import { supabase } from '@/integrations/supabase/client';

// Database queries
const { data, error } = await supabase
  .from('table_name')
  .select('*');

// Authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Real-time subscriptions
const subscription = supabase
  .channel('table_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'your_table' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe();
```

## ⚡ **2. Edge Functions Access**

### Available Functions:
- `google-adsense` - Google AdSense integration
- `google-analytics` - Google Analytics integration  
- `google-oauth` - Google OAuth authentication
- `google-search-console` - Google Search Console integration
- `send-confirmation-email` - Email confirmation service

### Calling Edge Functions:
```typescript
// Call an edge function
const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
  body: {
    email: 'user@example.com',
    confirmationToken: 'abc123',
    siteUrl: 'https://yoursite.com'
  }
});

// With custom headers
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* your data */ },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`
  }
});
```

## 🛠️ **3. CLI Commands (Local Development)**

```bash
# Start local development (requires Docker)
npx supabase start

# View local dashboard
npx supabase status

# Deploy functions
npx supabase functions deploy function-name

# View logs
npx supabase functions logs function-name

# Create new function
npx supabase functions new function-name

# Generate types
npx supabase gen types typescript --local > src/types/supabase.ts
```

## 🌐 **4. Direct API Access**

### REST API:
```bash
# Base URL: https://rowcloxlszwnowlggqon.supabase.co/rest/v1/
# Headers:
# - apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis
# - Authorization: Bearer YOUR_JWT_TOKEN

# Example GET request:
curl -X GET 'https://rowcloxlszwnowlggqon.supabase.co/rest/v1/blog_posts' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis"
```

### Edge Functions API:
```bash
# Base URL: https://rowcloxlszwnowlggqon.supabase.co/functions/v1/
# Example POST to edge function:
curl -X POST 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/send-confirmation-email' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "confirmationToken": "abc123"}'
```

## 📁 **5. Your Database Schema**

Based on your migrations, you have these tables:
- `blog_posts` - Blog content management
- `profiles` - User profiles
- `user_roles` - Role-based access control
- `categories` - Content categories
- `comments` - Blog comments
- `subscribers` - Newsletter subscribers
- `google_site_kit` - Google integrations

## 🔐 **6. Authentication Examples**

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      username: 'username',
      full_name: 'Full Name'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

## 🚀 **Quick Start Commands**

```bash
# Check if everything is working
npx supabase --help

# View your project info
npx supabase projects list

# Generate TypeScript types
npx supabase gen types typescript --project-id rowcloxlszwnowlggqon > src/types/supabase.ts

# Test edge function locally (requires Docker)
npx supabase functions serve

# Deploy edge function
npx supabase functions deploy send-confirmation-email
```

## 📚 **Resources**

- **Dashboard**: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon
- **Documentation**: https://supabase.com/docs
- **API Reference**: https://supabase.com/docs/reference/javascript
- **Edge Functions**: https://supabase.com/docs/guides/functions

---

**Note**: Your Supabase is fully configured and working! You can access it through the web dashboard, JavaScript client (already in use), or direct API calls.
