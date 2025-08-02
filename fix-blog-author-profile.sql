-- Fix Missing Profile for Blog Post Author
-- Run this in Supabase SQL Editor to ensure the author profile exists

-- First, check if we have the user in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email LIKE '%rabbit%' OR email LIKE '%nanopro%'
ORDER BY created_at DESC;

-- Check if profile exists for blog post authors
SELECT DISTINCT
  bp.author_id,
  au.email,
  p.username,
  p.display_name
FROM blog_posts bp
LEFT JOIN auth.users au ON au.id = bp.author_id
LEFT JOIN profiles p ON p.user_id = bp.author_id
WHERE bp.status = 'published';

-- Create missing profile for the blog post author if needed
-- Replace the email/user info with your actual details
INSERT INTO profiles (
  id,
  user_id,
  username,
  display_name,
  bio,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  au.id,
  'rabbit',
  'Rab bit',
  'Content creator and web development expert',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email LIKE '%rabbit%'
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.user_id = au.id
)
LIMIT 1;

-- Alternative: Update blog posts to use an existing admin user
-- UPDATE blog_posts 
-- SET author_id = (
--   SELECT id FROM auth.users WHERE email LIKE '%nanopro%' LIMIT 1
-- )
-- WHERE status = 'published';
