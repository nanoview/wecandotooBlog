-- Apply this SQL to add missing SEO columns for AI optimization
-- Run this in Supabase SQL Editor

-- Add AI-specific SEO columns
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS suggested_keywords JSONB,
ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_seo_update TIMESTAMP WITH TIME ZONE;

-- Add comments for the new AI columns
COMMENT ON COLUMN blog_posts.suggested_keywords IS 'AI-generated related keywords (JSON array)';
COMMENT ON COLUMN blog_posts.seo_score IS 'SEO quality score from 0-100';
COMMENT ON COLUMN blog_posts.last_seo_update IS 'Timestamp of last AI SEO optimization';

-- Create index for better performance on AI fields
CREATE INDEX IF NOT EXISTS idx_blog_posts_ai_seo ON blog_posts(seo_score, last_seo_update);

-- Optional: Update existing posts with default SEO scores
UPDATE blog_posts 
SET seo_score = 50
WHERE seo_score IS NULL OR seo_score = 0;
