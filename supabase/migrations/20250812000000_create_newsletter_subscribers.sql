-- Create newsletter_subscribers table with proper RLS policies
-- This will handle email subscription management

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

-- Allow anyone to subscribe (insert with pending status)
CREATE POLICY "Anyone can subscribe to newsletter"
    ON public.newsletter_subscribers
    FOR INSERT
    TO public
    WITH CHECK (status = 'pending');

-- Allow reading own subscription status (if authenticated)
CREATE POLICY "Users can view their own subscriptions"
    ON public.newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow updating own subscription (confirm/unsubscribe)
CREATE POLICY "Users can update their own subscriptions"
    ON public.newsletter_subscribers
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow service role full access for email functions
CREATE POLICY "Service role has full access to subscribers"
    ON public.newsletter_subscribers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow admins to manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
    ON public.newsletter_subscribers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.profiles p ON ur.user_id = p.id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.profiles p ON ur.user_id = p.id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Create function to handle subscription confirmation
CREATE OR REPLACE FUNCTION public.confirm_newsletter_subscription(
    confirmation_token_param TEXT
) RETURNS JSONB AS $$
DECLARE
    subscriber_record RECORD;
BEGIN
    -- Find and update the subscriber
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
    -- Update subscription status
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
    -- Generate confirmation token
    new_token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert or update subscriber
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
