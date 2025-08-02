-- Ensure blog_posts has all required columns and correct relationships
DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'blog_posts' 
                  AND column_name = 'category') THEN
        ALTER TABLE public.blog_posts ADD COLUMN category TEXT;
    END IF;

    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'blog_posts' 
                  AND column_name = 'tags') THEN
        ALTER TABLE public.blog_posts ADD COLUMN tags TEXT[];
    END IF;

    -- Add slug column if it doesn't exist and make it unique
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'blog_posts' 
                  AND column_name = 'slug') THEN
        ALTER TABLE public.blog_posts ADD COLUMN slug TEXT UNIQUE;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'blog_posts' 
                  AND column_name = 'status') THEN
        ALTER TABLE public.blog_posts ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
END $$;

-- Drop existing foreign key if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'blog_posts_author_id_fkey'
    ) THEN
        ALTER TABLE public.blog_posts DROP CONSTRAINT blog_posts_author_id_fkey;
    END IF;
END $$;

-- Create correct foreign key relationship
ALTER TABLE public.blog_posts
ADD CONSTRAINT blog_posts_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Update RLS policies
ALTER TABLE public.blog_posts FORCE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can manage their own posts" ON public.blog_posts;

-- Create policies
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (status = 'published');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts(status);

-- Grant necessary permissions
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
