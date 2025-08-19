-- Quick Fix: Remove User from user_roles Table by ID
-- This targets the specific issue where user might remain in user_roles

-- Step 1: Find any remaining entries in user_roles that might be orphaned
-- or still referencing the unauthorized user

-- Check for orphaned user_roles (where user no longer exists in auth.users)
SELECT 
    ur.id as role_id,
    ur.user_id,
    ur.role,
    ur.created_at,
    u.email,
    CASE 
        WHEN u.id IS NULL THEN 'ORPHANED - User deleted but role remains'
        ELSE 'Active user with role'
    END as status
FROM public.user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
WHERE u.id IS NULL OR u.email LIKE '%shapnokhan%';

-- Step 2: Clean up orphaned user_roles entries
-- Remove any user_roles entries where the user no longer exists
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 3: Specifically target any remaining shapnokhan entries
-- (in case the user still exists but we want to remove their admin privileges)
DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id 
AND u.email = 'shapnokhan@yahoo.com';

-- Step 4: Also check and clean user metadata that might grant admin access
UPDATE auth.users 
SET raw_user_meta_data = 
    CASE 
        WHEN raw_user_meta_data ? 'role' THEN
            raw_user_meta_data - 'role' || jsonb_build_object('role', 'user')
        ELSE 
            COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'user')
    END
WHERE email = 'shapnokhan@yahoo.com';

-- Step 5: Verification queries
-- Run these to confirm the cleanup worked

-- Check if any admin roles remain for the user
SELECT 'Admin roles check' as verification_type,
       COUNT(*) as remaining_admin_roles
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'shapnokhan@yahoo.com' 
AND ur.role = 'admin';

-- Check for orphaned user_roles
SELECT 'Orphaned roles check' as verification_type,
       COUNT(*) as orphaned_roles
FROM public.user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
WHERE u.id IS NULL;

-- List all current admin users
SELECT 'Current admins' as verification_type,
       u.email,
       ur.role,
       ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at;

-- Step 6: Create a function to clean orphaned roles regularly
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_user_roles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Remove user_roles where the user no longer exists
    DELETE FROM public.user_roles 
    WHERE user_id NOT IN (SELECT id FROM auth.users);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Grant permission to use the cleanup function
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_user_roles TO service_role, authenticated;

-- Run the cleanup function
SELECT public.cleanup_orphaned_user_roles() as orphaned_roles_removed;

COMMENT ON FUNCTION public.cleanup_orphaned_user_roles IS 'Removes user_roles entries for users that no longer exist';
