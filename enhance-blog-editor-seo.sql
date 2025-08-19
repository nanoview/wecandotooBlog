-- Add SEO-related columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'Article',
ADD COLUMN IF NOT EXISTS focus_keyword TEXT,
ADD COLUMN IF NOT EXISTS alt_text TEXT,
ADD COLUMN IF NOT EXISTS suggested_keywords JSONB,
ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_seo_update TIMESTAMP WITH TIME ZONE;

-- Update existing posts with basic SEO data
UPDATE blog_posts 
SET 
  meta_title = title,
  meta_description = SUBSTRING(excerpt, 1, 160),
  schema_type = 'Article'
WHERE meta_title IS NULL;

-- Add index for SEO fields for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_seo ON blog_posts(focus_keyword, meta_title);

-- Add comments to document the new fields
COMMENT ON COLUMN blog_posts.meta_title IS 'Custom SEO title for search engines (max 60 chars)';
COMMENT ON COLUMN blog_posts.meta_description IS 'SEO description for search results (max 160 chars)';
COMMENT ON COLUMN blog_posts.canonical_url IS 'Canonical URL to prevent duplicate content issues';
COMMENT ON COLUMN blog_posts.schema_type IS 'Schema.org structured data type (Article, BlogPosting, etc.)';
COMMENT ON COLUMN blog_posts.focus_keyword IS 'Primary SEO keyword for this post';
COMMENT ON COLUMN blog_posts.alt_text IS 'Alt text for the featured image (accessibility)';
COMMENT ON COLUMN blog_posts.suggested_keywords IS 'AI-generated related keywords (JSON array)';
COMMENT ON COLUMN blog_posts.seo_score IS 'SEO quality score from 0-100';
COMMENT ON COLUMN blog_posts.last_seo_update IS 'Timestamp of last AI SEO optimization';
