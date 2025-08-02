-- Make arif.js@gmail.com an admin
-- Run this in your Supabase SQL Editor

-- First, let's check your current user ID and profile
SELECT 
  auth.users.id as user_id,
  auth.users.email,
  profiles.username,
  profiles.display_name,
  user_roles.role
FROM auth.users 
LEFT JOIN profiles ON auth.users.id = profiles.user_id
LEFT JOIN user_roles ON auth.users.id = user_roles.user_id
WHERE auth.users.email = 'arif.js@gmail.com';

-- Insert admin role for arif.js@gmail.com
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'arif.js@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the admin role was added
SELECT 
  auth.users.email,
  profiles.username,
  user_roles.role,
  user_roles.created_at
FROM auth.users 
JOIN profiles ON auth.users.id = profiles.user_id
JOIN user_roles ON auth.users.id = user_roles.user_id
WHERE auth.users.email = 'arif.js@gmail.com';

-- Also temporarily disable RLS on google_site_kit table for immediate access
ALTER TABLE google_site_kit DISABLE ROW LEVEL SECURITY;

-- Update redirect URI to production domain
UPDATE google_site_kit 
SET oauth_redirect_uri = 'https://wecandotoo.com/oauth/callback'
WHERE oauth_redirect_uri LIKE '%localhost%';

SELECT 'Admin role assigned, RLS disabled, and redirect URI updated to production! ✅' as result;
