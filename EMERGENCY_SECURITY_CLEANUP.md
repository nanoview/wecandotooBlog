# 🚨 EMERGENCY SECURITY CLEANUP INSTRUCTIONS

## Critical Issue
The user "shapnokhan@yahoo.com" still has access to the admin panel despite being deleted from the project. This is a **CRITICAL SECURITY VULNERABILITY** that must be fixed immediately.

## Immediate Action Required

### Option 1: Run SQL in Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase Dashboard: https://app.supabase.com/
2. Navigate to "SQL Editor"
3. Copy and paste the following SQL queries one by one:

```sql
-- STEP 1: Check current status
SELECT 'Current user_roles status' as check_type,
       COUNT(*) as total_roles
FROM public.user_roles;

-- STEP 2: Find orphaned roles (where user no longer exists)
SELECT 'Orphaned roles' as issue_type,
       ur.id as role_id,
       ur.user_id,
       ur.role,
       'User deleted but role remains' as problem
FROM public.user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
WHERE u.id IS NULL;

-- STEP 3: Check for shapnokhan specifically
SELECT 'Shapnokhan access check' as issue_type,
       ur.id as role_id,
       ur.user_id,
       ur.role,
       u.email
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'shapnokhan@yahoo.com';

-- STEP 4: EMERGENCY CLEANUP - Remove orphaned roles
DELETE FROM public.user_roles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- STEP 5: EMERGENCY CLEANUP - Remove shapnokhan roles specifically
DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id
AND u.email = 'shapnokhan@yahoo.com';

-- STEP 6: Clean user metadata (remove admin privileges)
UPDATE auth.users
SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'user')
WHERE email = 'shapnokhan@yahoo.com';

-- STEP 7: Final verification
SELECT 'Final verification' as check_type,
       COUNT(*) as remaining_admin_roles
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'shapnokhan@yahoo.com';

-- STEP 8: List all current admin users
SELECT 'Current admin users' as status,
       u.email,
       ur.role,
       ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at;
```

### Option 2: Use Environment Variable (If you have service role key)

If you have the `SUPABASE_SERVICE_ROLE_KEY` environment variable set:

```bash
# Set the service role key (replace with your actual key)
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key-here"

# Run the emergency cleanup script
node emergency-cleanup.mjs
```

## Expected Results

After running the cleanup:

1. ✅ All orphaned user_roles entries should be removed
2. ✅ shapnokhan@yahoo.com should have NO admin roles
3. ✅ shapnokhan@yahoo.com should be downgraded to 'user' role (if they still exist)
4. ✅ Only legitimate admin users should remain

## Ongoing Security Measures

1. **Regular Audits**: Run the cleanup function weekly
2. **Monitor Access**: Check the Users tab in admin panel regularly
3. **Blacklist System**: Consider implementing the user blacklist from previous scripts

## Prevention Function

The cleanup script created this function for regular maintenance:

```sql
-- Use this function regularly to prevent future orphaned roles
SELECT public.cleanup_orphaned_user_roles() as roles_cleaned;
```

## If Issues Persist

If shapnokhan@yahoo.com can still access admin features after this cleanup:

1. Check Row Level Security (RLS) policies
2. Verify application-level role checking
3. Clear all user sessions in Supabase Dashboard
4. Consider implementing IP-based blocking

## Contact for Emergency Support

This is a critical security issue. If you need immediate assistance, prioritize this cleanup above all other development work.

---

**⚠️ IMPORTANT: Run this cleanup IMMEDIATELY to secure your application!**
