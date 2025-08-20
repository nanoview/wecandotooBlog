-- Check if blog_posts table has all required SEO columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'blog_posts'
    AND column_name IN ('tags', 'suggested_keywords', 'focus_keyword', 'meta_description', 'seo_score', 'last_seo_update')
ORDER BY column_name;

-- If any columns are missing, add them:
DO $$ 
BEGIN
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'tags') THEN
        ALTER TABLE blog_posts ADD COLUMN tags JSONB DEFAULT '[]'::JSONB;
        RAISE NOTICE 'Added tags column to blog_posts';
    END IF;
    
    -- Add suggested_keywords column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'suggested_keywords') THEN
        ALTER TABLE blog_posts ADD COLUMN suggested_keywords JSONB DEFAULT '[]'::JSONB;
        RAISE NOTICE 'Added suggested_keywords column to blog_posts';
    END IF;
    
    -- Add focus_keyword column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'focus_keyword') THEN
        ALTER TABLE blog_posts ADD COLUMN focus_keyword TEXT;
        RAISE NOTICE 'Added focus_keyword column to blog_posts';
    END IF;
    
    -- Add meta_description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'meta_description') THEN
        ALTER TABLE blog_posts ADD COLUMN meta_description TEXT;
        RAISE NOTICE 'Added meta_description column to blog_posts';
    END IF;
    
    -- Add seo_score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'seo_score') THEN
        ALTER TABLE blog_posts ADD COLUMN seo_score INTEGER DEFAULT 0;
        RAISE NOTICE 'Added seo_score column to blog_posts';
    END IF;
    
    -- Add last_seo_update column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'last_seo_update') THEN
        ALTER TABLE blog_posts ADD COLUMN last_seo_update TIMESTAMPTZ;
        RAISE NOTICE 'Added last_seo_update column to blog_posts';
    END IF;
END $$;

SELECT '✅ SEO COLUMNS READY!' as status;
