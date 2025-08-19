-- Security Script: Remove Unauthorized User Access
-- This script completely removes a user from the system and prevents future login

-- Target user email to be removed
-- WARNING: This will permanently delete the user and all associated data
DO $$ 
DECLARE
    target_email TEXT := 'shapnokhan@yahoo.com';
    target_user_id UUID;
BEGIN
    -- Step 1: Find the user ID
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = target_email;
    
    IF target_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found user with email: % and ID: %', target_email, target_user_id;
        
        -- Step 2: Remove from user_roles (removes admin/editor privileges)
        DELETE FROM public.user_roles 
        WHERE user_id = target_user_id;
        RAISE NOTICE 'Removed user roles for user: %', target_email;
        
        -- Step 3: Remove from profiles
        DELETE FROM public.profiles 
        WHERE user_id = target_user_id;
        RAISE NOTICE 'Removed profile for user: %', target_email;
        
        -- Step 4: Remove any blog posts by this user
        DELETE FROM public.blog_posts 
        WHERE author_id = target_user_id;
        RAISE NOTICE 'Removed blog posts by user: %', target_email;
        
        -- Step 5: Remove any comments by this user
        DELETE FROM public.comments 
        WHERE user_id = target_user_id;
        RAISE NOTICE 'Removed comments by user: %', target_email;
        
        -- Step 6: Remove from auth.users (completely deletes the account)
        DELETE FROM auth.users 
        WHERE id = target_user_id;
        RAISE NOTICE 'Completely removed user account: %', target_email;
        
    ELSE
        RAISE NOTICE 'User with email % not found in the system', target_email;
    END IF;
END $$;

-- Step 7: Add the email to a blacklist to prevent re-registration
CREATE TABLE IF NOT EXISTS public.user_blacklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    reason TEXT,
    blacklisted_at TIMESTAMPTZ DEFAULT NOW(),
    blacklisted_by TEXT DEFAULT 'system_admin'
);

-- Add email to blacklist
INSERT INTO public.user_blacklist (email, reason) 
VALUES ('shapnokhan@yahoo.com', 'Unauthorized access - account removed')
ON CONFLICT (email) DO UPDATE SET
    reason = EXCLUDED.reason,
    blacklisted_at = NOW();

-- Step 8: Create a function to check blacklist during signup
CREATE OR REPLACE FUNCTION public.check_user_blacklist()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.user_blacklist 
        WHERE email = NEW.email
    ) THEN
        RAISE EXCEPTION 'Registration not allowed for this email address'
            USING HINT = 'Contact administrator if you believe this is an error';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger to prevent blacklisted users from signing up
DROP TRIGGER IF EXISTS trigger_check_blacklist ON auth.users;
CREATE TRIGGER trigger_check_blacklist
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_blacklist();

-- Step 10: Enable RLS on blacklist table
ALTER TABLE public.user_blacklist ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view blacklist
CREATE POLICY "Admin can view blacklist" ON public.user_blacklist
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy: Only admins can modify blacklist
CREATE POLICY "Admin can modify blacklist" ON public.user_blacklist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Step 11: Grant permissions
GRANT ALL ON TABLE public.user_blacklist TO authenticated, service_role;

-- Step 12: Verification query
-- Run this to confirm the user has been completely removed
SELECT 
    'User completely removed' as status,
    NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shapnokhan@yahoo.com') as user_deleted,
    NOT EXISTS (SELECT 1 FROM public.user_roles ur JOIN auth.users u ON ur.user_id = u.id WHERE u.email = 'shapnokhan@yahoo.com') as roles_removed,
    EXISTS (SELECT 1 FROM public.user_blacklist WHERE email = 'shapnokhan@yahoo.com') as blacklisted;

COMMENT ON TABLE public.user_blacklist IS 'Prevents unauthorized users from re-registering';
COMMENT ON FUNCTION public.check_user_blacklist IS 'Trigger function to block blacklisted email registration';
