-- Add 'editor' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';

-- Create a blog_posts table for storing created blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  slug text UNIQUE NOT NULL,
  featured_image text,
  author_id uuid NOT NULL,
  category text,
  tags text[],
  status text NOT NULL DEFAULT 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Editors can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'editor'::app_role) AND auth.uid() = author_id);

CREATE POLICY "Editors can update their own blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (has_role(auth.uid(), 'editor'::app_role) AND auth.uid() = author_id);

CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for blog media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for blog media
CREATE POLICY "Anyone can view blog media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-media');

CREATE POLICY "Editors can upload blog media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog-media' AND has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can manage all blog media" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'blog-media' AND has_role(auth.uid(), 'admin'::app_role));