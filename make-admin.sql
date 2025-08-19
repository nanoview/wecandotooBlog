-- Admin User Management Script
-- This script manages admin user privileges securely

-- Function to make a user admin (run this for legitimate admin users)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    result_message TEXT;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'Error: User with email ' || user_email || ' not found';
    END IF;
    
    -- Check if user is already admin
    IF EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = target_user_id AND role = 'admin'
    ) THEN
        RETURN 'User ' || user_email || ' is already an admin';
    END IF;
    
    -- Add admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update user metadata
    UPDATE auth.users 
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', 'admin')
    WHERE id = target_user_id;
    
    RETURN 'Successfully granted admin privileges to ' || user_email;
END;
$$;

-- Function to remove admin privileges
CREATE OR REPLACE FUNCTION public.remove_admin_privileges(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'Error: User with email ' || user_email || ' not found';
    END IF;
    
    -- Remove admin role
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id AND role = 'admin';
    
    -- Update user metadata to regular user
    UPDATE auth.users 
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', 'user')
    WHERE id = target_user_id;
    
    RETURN 'Successfully removed admin privileges from ' || user_email;
END;
$$;

-- Function to list all admin users
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        u.id as user_id,
        u.email,
        u.created_at,
        u.last_sign_in_at
    FROM auth.users u
    JOIN public.user_roles ur ON u.id = ur.user_id
    WHERE ur.role = 'admin'
    ORDER BY u.created_at;
$$;

-- Grant execute permissions to authenticated users (admins can use these functions)
GRANT EXECUTE ON FUNCTION public.make_user_admin TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.remove_admin_privileges TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.list_admin_users TO authenticated, service_role;

-- Example usage (replace with your legitimate admin email):
-- SELECT public.make_user_admin('your-admin@wecandotoo.com');

-- To remove unauthorized access:
-- SELECT public.remove_admin_privileges('shapnokhan@yahoo.com');

-- To see all current admins:
-- SELECT * FROM public.list_admin_users();

COMMENT ON FUNCTION public.make_user_admin IS 'Grants admin privileges to a user by email';
COMMENT ON FUNCTION public.remove_admin_privileges IS 'Removes admin privileges from a user by email';
COMMENT ON FUNCTION public.list_admin_users IS 'Lists all users with admin privileges';