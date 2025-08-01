-- Complete Database Setup for Stellar Content Stream
-- Run this entire script in your Supabase SQL Editor to set up everything at once

-- ==============================================
-- 1. CREATE ENUMS AND TYPES
-- ==============================================

-- Create app_role enum for user roles (if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================
-- 2. CREATE TABLES
-- ==============================================

-- Profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Blog posts table for storing created blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  slug text UNIQUE NOT NULL,
  featured_image text,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text,
  tags text[],
  status text NOT NULL DEFAULT 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Comments table for blog comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blog_post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. CREATE UTILITY FUNCTIONS
-- ==============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Security definer function to check user roles
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

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Function to check if the current user is nanopro
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

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'display_name'
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Helper function for nanopro to manage roles easily
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

-- Function for nanopro to get all user roles
CREATE OR REPLACE FUNCTION public.nanopro_get_all_user_roles()
RETURNS TABLE(user_id UUID, username TEXT, role app_role, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow nanopro to use this function
  IF NOT public.is_nanopro() THEN
    RAISE EXCEPTION 'Access denied: Only nanopro can use this function';
  END IF;
  
  RETURN QUERY
  SELECT 
    ur.user_id,
    p.username,
    ur.role,
    ur.created_at
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON ur.user_id = p.user_id
  ORDER BY ur.created_at DESC;
END;
$$;

-- ==============================================
-- 5. CREATE TRIGGERS
-- ==============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Nanopro can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Nanopro can insert any user role" ON public.user_roles;
DROP POLICY IF EXISTS "Nanopro can update any user role" ON public.user_roles;
DROP POLICY IF EXISTS "Nanopro can delete any user role" ON public.user_roles;

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Editors can create blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Editors can update their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments or admins can delete any" ON public.comments;

-- Profiles RLS policies
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

-- User roles RLS policies (with nanopro super privileges)
CREATE POLICY "Nanopro can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.is_nanopro() OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

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

-- Blog posts RLS policies
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Editors can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'editor') AND auth.uid() = author_id);

CREATE POLICY "Editors can update their own blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'editor') AND auth.uid() = author_id);

CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Comments RLS policies
CREATE POLICY "Anyone can view comments"
ON public.comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments or admins can delete any"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ==============================================
-- 7. STORAGE SETUP
-- ==============================================

-- Create storage bucket for blog media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view blog media" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload blog media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all blog media" ON storage.objects;

-- Create storage policies for blog media
CREATE POLICY "Anyone can view blog media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-media');

CREATE POLICY "Editors can upload blog media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can manage all blog media" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));

-- ==============================================
-- 8. SET NANOPRO AS ADMIN (IF EXISTS)
-- ==============================================

-- Set nanopro as admin if the user exists
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
    
    RAISE NOTICE 'User nanopro has been set as admin';
  ELSE
    RAISE NOTICE 'User nanopro not found. They will become admin when they register.';
  END IF;
END;
$$;

-- ==============================================
-- SETUP COMPLETE!
-- ==============================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Database setup completed successfully!';
  RAISE NOTICE '✅ All tables, functions, and policies have been created';
  RAISE NOTICE '✅ Row Level Security is enabled';
  RAISE NOTICE '✅ Storage bucket for blog media is ready';
  RAISE NOTICE '✅ Nanopro user privileges configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Your blog platform is now ready to use!';
END;
$$;
