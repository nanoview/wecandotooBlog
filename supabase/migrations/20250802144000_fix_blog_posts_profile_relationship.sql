-- Check if blog_posts table exists and create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
        CREATE TABLE public.blog_posts (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT,
            status TEXT DEFAULT 'draft',
            author_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            published_at TIMESTAMP WITH TIME ZONE,
            featured_image TEXT,
            excerpt TEXT,
            meta_description TEXT,
            meta_keywords TEXT[]
        );
    END IF;
END $$;

-- Add foreign key relationship if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'blog_posts_author_id_fkey'
    ) THEN
        ALTER TABLE public.blog_posts
        ADD CONSTRAINT blog_posts_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES public.profiles(user_id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS on blog_posts if not already enabled
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create or replace the RLS policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Authors can manage their own posts" ON public.blog_posts;
CREATE POLICY "Authors can manage their own posts"
ON public.blog_posts
FOR ALL
USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
