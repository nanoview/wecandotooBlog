# 🚨 Edge Function Non-2xx Error - Debugging Guide

## ❌ **Current Issue**: Edge Function Returning Non-2xx Response

The newsletter-subscription edge function is failing. This is most likely because:

1. **Database functions don't exist** (migration not applied)
2. **Missing environment variables**
3. **Database connection issues**
4. **RLS policy blocking access**

## 🔍 **Debugging Steps**

### **Step 1: Check Function Logs**
1. Go to: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/functions/newsletter-subscription/logs
2. Look for recent error messages
3. Check what specific error is being thrown

### **Step 2: Test Database Functions**
Go to: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/sql

Run this test query:
```sql
-- Test if the newsletter functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'add_newsletter_subscriber', 
  'confirm_newsletter_subscription', 
  'unsubscribe_newsletter'
);
```

**Expected Result**: Should return 3 function names
**If Empty**: Migration hasn't been applied

### **Step 3: Check if Table Exists**
```sql
-- Test if newsletter_subscribers table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'newsletter_subscribers';
```

**Expected Result**: Should return 'newsletter_subscribers'
**If Empty**: Migration hasn't been applied

## 🔧 **Fix: Apply Database Migration**

### **Manual Migration Application**:
1. Go to: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/sql
2. Copy the entire contents of: `supabase/migrations/20250812000000_create_newsletter_subscribers.sql`
3. Paste and execute in the SQL Editor

### **Migration Contents** (Copy this if needed):
```sql
-- Create newsletter_subscribers table with proper RLS policies

-- Create the subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
    confirmation_token TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user_id ON public.newsletter_subscribers(user_id);

-- RLS Policies
CREATE POLICY "Anyone can subscribe to newsletter"
    ON public.newsletter_subscribers
    FOR INSERT
    TO public
    WITH CHECK (status = 'pending');

CREATE POLICY "Users can view their own subscriptions"
    ON public.newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own subscriptions"
    ON public.newsletter_subscribers
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to subscribers"
    ON public.newsletter_subscribers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can manage all subscriptions"
    ON public.newsletter_subscribers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.profiles p ON ur.user_id = p.id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.profiles p ON ur.user_id = p.id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'super_admin')
        )
    );

-- Create function to handle subscription confirmation
CREATE OR REPLACE FUNCTION public.confirm_newsletter_subscription(
    confirmation_token_param TEXT
) RETURNS JSONB AS $$
DECLARE
    subscriber_record RECORD;
BEGIN
    UPDATE public.newsletter_subscribers 
    SET 
        status = 'confirmed',
        confirmed_at = NOW(),
        confirmation_token = NULL
    WHERE confirmation_token = confirmation_token_param
    AND status = 'pending'
    RETURNING * INTO subscriber_record;
    
    IF subscriber_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid or expired confirmation token'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Subscription confirmed successfully',
        'email', subscriber_record.email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle unsubscription
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(
    email_param TEXT,
    token_param TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    subscriber_record RECORD;
BEGIN
    UPDATE public.newsletter_subscribers 
    SET 
        status = 'unsubscribed',
        unsubscribed_at = NOW()
    WHERE email = email_param
    AND status IN ('pending', 'confirmed')
    RETURNING * INTO subscriber_record;
    
    IF subscriber_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Email not found or already unsubscribed'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully unsubscribed from newsletter'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add new subscriber
CREATE OR REPLACE FUNCTION public.add_newsletter_subscriber(
    email_param TEXT,
    user_id_param UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    new_token TEXT;
    subscriber_id UUID;
BEGIN
    new_token := encode(gen_random_bytes(32), 'hex');
    
    INSERT INTO public.newsletter_subscribers (email, user_id, confirmation_token, status)
    VALUES (email_param, user_id_param, new_token, 'pending')
    ON CONFLICT (email) DO UPDATE SET
        confirmation_token = new_token,
        status = 'pending',
        subscribed_at = NOW(),
        unsubscribed_at = NULL
    RETURNING id INTO subscriber_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'subscriber_id', subscriber_id,
        'confirmation_token', new_token,
        'message', 'Subscriber added successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.newsletter_subscribers TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.confirm_newsletter_subscription(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unsubscribe_newsletter(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_newsletter_subscriber(TEXT, UUID) TO anon, authenticated, service_role;
```

## 🧪 **Test After Migration**

### **Test Database Functions**:
```sql
-- Test add subscriber
SELECT public.add_newsletter_subscriber('test@example.com', NULL);

-- Should return success with confirmation token
```

### **Test Edge Function**:
```bash
# Test in browser console or curl
fetch('https://rowcloxlszwnowlggqon.supabase.co/functions/v1/newsletter-subscription', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    action: 'subscribe'
  })
}).then(r => r.json()).then(console.log);
```

## 🔍 **Common Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| `function does not exist` | Migration not applied | Apply migration SQL |
| `relation does not exist` | Table not created | Apply migration SQL |
| `permission denied` | RLS blocking access | Check service role key |
| `CORS error` | Headers/origin issue | Check CORS headers |
| `Invalid JSON` | Malformed request | Check request format |

## ✅ **Success Indicators**

After fixing:
- ✅ Function logs show successful execution
- ✅ Database has newsletter_subscribers table
- ✅ Functions return 200 status codes
- ✅ Email confirmations are sent
- ✅ Frontend subscription works

The most likely fix is applying the database migration. Once that's done, your newsletter subscription will work perfectly! 🎉
