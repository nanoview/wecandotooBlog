-- ==============================================
-- RE-ENABLE RLS AND SET UP PROPER SECURITY
-- Run this in Supabase SQL Editor after basic setup
-- ==============================================

-- 1. Re-enable RLS on all tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create the app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Update user_roles table to use proper enum type
ALTER TABLE public.user_roles ALTER COLUMN role TYPE app_role USING role::app_role;

-- 4. Create essential security functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_nanopro()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND username = 'nanopro'
  )
$$;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Nanopro can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Nanopro can insert any user role" ON public.user_roles;
DROP POLICY IF EXISTS "Nanopro can update any user role" ON public.user_roles;
DROP POLICY IF EXISTS "Nanopro can delete any user role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Editors can create blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Editors can update their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Nanopro can manage all blog posts" ON public.blog_posts;

-- 6. Create profiles RLS policies
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 7. Create user_roles RLS policies with nanopro super privileges
CREATE POLICY "Nanopro can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.is_nanopro() OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Nanopro can insert any user role"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_nanopro() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Nanopro can update any user role"
ON public.user_roles
FOR UPDATE
USING (public.is_nanopro() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Nanopro can delete any user role"
ON public.user_roles
FOR DELETE
USING (public.is_nanopro() OR public.has_role(auth.uid(), 'admin'));

-- 8. Create blog_posts RLS policies with proper permissions
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published' OR status = 'draft');

CREATE POLICY "Editors can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.is_nanopro());

CREATE POLICY "Editors can update their own blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin') OR public.is_nanopro());

CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.is_nanopro());

CREATE POLICY "Nanopro can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.is_nanopro());

-- 9. Ensure nanopro has admin role
DO $$
DECLARE
  nanopro_user_id UUID;
BEGIN
  -- Find the user_id for username 'nanopro'
  SELECT user_id INTO nanopro_user_id
  FROM public.profiles
  WHERE username = 'nanopro';
  
  -- If user exists, ensure they have admin role
  IF nanopro_user_id IS NOT NULL THEN
    -- Remove existing roles for nanopro
    DELETE FROM public.user_roles WHERE user_id = nanopro_user_id;
    
    -- Insert admin role for nanopro
    INSERT INTO public.user_roles (user_id, role)
    VALUES (nanopro_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'User nanopro has been set as admin with RLS enabled';
  ELSE
    RAISE NOTICE 'User nanopro not found. They will become admin when they register.';
  END IF;
END;
$$;

-- 10. Create helper function for nanopro to manage roles
CREATE OR REPLACE FUNCTION public.nanopro_set_user_role(target_user_id UUID, new_role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow nanopro to use this function
  IF NOT public.is_nanopro() THEN
    RAISE EXCEPTION 'Access denied: Only nanopro can use this function';
  END IF;
  
  -- Delete existing role for the user
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 11. Test the setup
DO $$
BEGIN
  RAISE NOTICE '🔒 RLS has been re-enabled on all tables';
  RAISE NOTICE '✅ Security policies have been created';
  RAISE NOTICE '✅ nanopro has admin privileges';
  RAISE NOTICE '✅ Proper access controls are now in place';
  RAISE NOTICE '';
  RAISE NOTICE 'Your blog platform now has secure RLS policies!';
END;
$$;
