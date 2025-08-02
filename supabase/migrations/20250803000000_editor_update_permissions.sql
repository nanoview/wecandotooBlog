-- Drop existing blog_posts update policies
DROP POLICY IF EXISTS "Users can update their own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Editors and admins can update any posts" ON public.blog_posts;

-- Create policy for editors to update their own posts
CREATE POLICY "Editors can update their own posts"
ON public.blog_posts
FOR UPDATE
USING (
  -- User is the author of the post AND is an editor
  auth.uid() = author_id 
  AND public.has_role(auth.uid(), 'editor'::app_role)
);

-- Create policy for nanopro and admins to update any posts
CREATE POLICY "Nanopro and admins can update any posts"
ON public.blog_posts
FOR UPDATE
USING (
  -- User is nanopro
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND username = 'nanopro'
  )
  OR
  -- User is an admin
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure RLS is enabled
ALTER TABLE public.blog_posts FORCE ROW LEVEL SECURITY;

-- Add helper function to check if user is editor or admin
CREATE OR REPLACE FUNCTION public.can_edit_posts(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY definer
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('editor', 'admin')
  );
$$;
