-- Verification Script: Presence of specific user across Supabase tables
-- Target Email: arif.js@gmail.com
-- Run this in Supabase SQL Editor.

-- 1. BASIC: Does the user exist in auth.users?
SELECT 'auth.users' AS source,
			 id AS user_id,
			 email,
			 created_at,
			 last_sign_in_at
FROM auth.users
WHERE email = 'arif.js@gmail.com';

-- 2. PROFILE: Linked profile record
SELECT 'profiles' AS source,
			 p.id AS profile_row_id,
			 p.user_id,
			 p.username,
			 p.display_name,
			 p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE u.email = 'arif.js@gmail.com';

-- 3. ROLE: Current role assignment (user_roles)
SELECT 'user_roles' AS source,
			 ur.id AS role_row_id,
			 ur.user_id,
			 ur.role,
			 ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'arif.js@gmail.com';

-- 4. BLOG POSTS authored
SELECT 'blog_posts' AS source,
			 bp.id AS post_id,
			 bp.title,
			 bp.status,
			 bp.created_at,
			 bp.published_at
FROM public.blog_posts bp
JOIN auth.users u ON u.id = bp.author_id
WHERE u.email = 'arif.js@gmail.com'
ORDER BY bp.created_at DESC
LIMIT 25;

-- 5. COMMENTS written
SELECT 'comments' AS source,
			 c.id AS comment_id,
			 c.blog_post_id,
			 c.created_at,
			 LEFT(c.content, 120) AS snippet
FROM public.comments c
JOIN auth.users u ON u.id = c.user_id
WHERE u.email = 'arif.js@gmail.com'
ORDER BY c.created_at DESC
LIMIT 25;

-- 6. ANY ORPHANED ROLE referencing this user's id (defensive check)
SELECT 'orphaned_role_check' AS source,
			 ur.*
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
WHERE u.id IS NULL
	AND ur.user_id IN (
		SELECT id FROM auth.users WHERE email = 'arif.js@gmail.com'
	);

-- 7. SUMMARY COUNTS
SELECT 'summary_counts' AS summary_type,
			 (SELECT COUNT(*) FROM auth.users WHERE email = 'arif.js@gmail.com')            AS auth_users_count,
			 (SELECT COUNT(*) FROM public.profiles p JOIN auth.users u ON u.id = p.user_id WHERE u.email = 'arif.js@gmail.com') AS profiles_count,
			 (SELECT COUNT(*) FROM public.user_roles ur JOIN auth.users u ON u.id = ur.user_id WHERE u.email = 'arif.js@gmail.com') AS roles_count,
			 (SELECT COUNT(*) FROM public.blog_posts bp JOIN auth.users u ON u.id = bp.author_id WHERE u.email = 'arif.js@gmail.com') AS posts_count,
			 (SELECT COUNT(*) FROM public.comments c JOIN auth.users u ON u.id = c.user_id WHERE u.email = 'arif.js@gmail.com') AS comments_count;
