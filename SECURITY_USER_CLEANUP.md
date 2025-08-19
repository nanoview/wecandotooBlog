# 🚨 User Security Audit & Cleanup Guide

## Issue: Unauthorized User Access
The email `shapnokhan@yahoo.com` appears to have access even after being "deleted" from the project. This suggests the user might still exist in the database with admin privileges.

## 🔍 **Step 1: Security Audit**

Run this SQL query to check current user status:

```sql
-- Check if user exists and their privileges
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    ur.role,
    u.raw_user_meta_data->>'role' as metadata_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'shapnokhan@yahoo.com';
```

## 🛡️ **Step 2: Complete User Removal**

### Option A: Run the Automated Cleanup Script
Execute the `remove-unauthorized-user.sql` file:

```bash
# Via Supabase CLI (if you have local setup)
supabase db reset
psql -f remove-unauthorized-user.sql

# Or run directly in Supabase SQL Editor
```

### Option B: Manual Removal via Supabase Dashboard

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Find `shapnokhan@yahoo.com`** in the user list
3. **Delete the user** using the delete button
4. **Verify deletion** by checking the user list again

### Option C: SQL Commands (Manual)
```sql
-- Find and remove the user completely
DO $$ 
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'shapnokhan@yahoo.com';
    
    IF target_user_id IS NOT NULL THEN
        -- Remove all user data
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        DELETE FROM public.profiles WHERE user_id = target_user_id;
        DELETE FROM public.blog_posts WHERE author_id = target_user_id;
        DELETE FROM public.comments WHERE user_id = target_user_id;
        DELETE FROM auth.users WHERE id = target_user_id;
        
        RAISE NOTICE 'User completely removed';
    END IF;
END $$;
```

## 🔒 **Step 3: Prevent Re-registration**

The automated script creates a blacklist table that prevents the email from signing up again:

```sql
-- Verify blacklist is active
SELECT * FROM public.user_blacklist WHERE email = 'shapnokhan@yahoo.com';
```

## ✅ **Step 4: Verification**

Run this query to confirm complete removal:

```sql
SELECT 
    'Security Status' as check_type,
    NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shapnokhan@yahoo.com') as user_deleted,
    NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        JOIN auth.users u ON ur.user_id = u.id 
        WHERE u.email = 'shapnokhan@yahoo.com'
    ) as roles_removed,
    EXISTS (SELECT 1 FROM public.user_blacklist WHERE email = 'shapnokhan@yahoo.com') as blacklisted;
```

Expected result:
- `user_deleted: true`
- `roles_removed: true` 
- `blacklisted: true`

## 🔧 **Step 5: Secure Admin Management**

Use the `make-admin.sql` script to properly manage admin users:

```sql
-- List current admins
SELECT * FROM public.list_admin_users();

-- Make a legitimate user admin
SELECT public.make_user_admin('your-email@wecandotoo.com');

-- Remove admin privileges (if needed)
SELECT public.remove_admin_privileges('user@example.com');
```

## 🚨 **Security Best Practices**

### Immediate Actions:
1. ✅ **Remove unauthorized user** using the scripts above
2. ✅ **Change admin passwords** if you suspect compromise
3. ✅ **Review all admin users** using `list_admin_users()`
4. ✅ **Check recent activity** in Supabase logs

### Ongoing Security:
1. **Regular Admin Audits**: Monthly review of admin users
2. **Strong Passwords**: Require strong passwords for admin accounts
3. **2FA**: Enable two-factor authentication where possible
4. **Access Logs**: Monitor Supabase auth logs regularly
5. **Principle of Least Privilege**: Only grant admin to necessary users

## 📊 **Monitor Access**

Add this to your admin panel to monitor user access:

```sql
-- Create a view for admin monitoring
CREATE OR REPLACE VIEW public.admin_access_log AS
SELECT 
    u.email,
    u.last_sign_in_at,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY u.last_sign_in_at DESC;
```

## 🔗 **Related Files Created:**
- `remove-unauthorized-user.sql` - Complete user removal script
- `make-admin.sql` - Secure admin management functions
- User blacklist table with trigger prevention

## ⚠️ **Important Notes:**
- The unauthorized user will lose ALL access immediately after script execution
- The email will be permanently blacklisted from registration
- All associated data (posts, comments, etc.) will be deleted
- This action is **irreversible**

Run the scripts and verify the results to ensure complete security.
