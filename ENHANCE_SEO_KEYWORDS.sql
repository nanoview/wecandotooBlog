-- 🚀 Call AI SEO Optimizer for Better Keywords
-- This script will call your AI SEO optimizer function to generate better keywords

-- Function to call the AI SEO optimizer edge function
CREATE OR REPLACE FUNCTION optimize_post_seo(post_id UUID)
RETURNS JSONB AS $$
DECLARE
    post_data RECORD;
    seo_result JSONB;
    http_result JSONB;
BEGIN
    -- Get post data
    SELECT id, title, content, category INTO post_data
    FROM blog_posts 
    WHERE id = post_id;
    
    IF NOT FOUND THEN
        RETURN '{"error": "Post not found"}'::JSONB;
    END IF;
    
    -- Call the AI SEO optimizer function
    -- Note: This is a simplified version. In practice, you'd call the edge function via HTTP
    -- For now, we'll update with enhanced keywords
    
    -- Generate enhanced keywords based on title and content analysis
    UPDATE blog_posts 
    SET 
        suggested_keywords = generate_enhanced_keywords(title, content, category),
        last_seo_update = CURRENT_TIMESTAMP
    WHERE id = post_id;
    
    RETURN '{"success": true, "message": "SEO optimized"}'::JSONB;
END;
$$ LANGUAGE plpgsql;

-- Enhanced keyword generation function
CREATE OR REPLACE FUNCTION generate_enhanced_keywords(title TEXT, content TEXT, category TEXT)
RETURNS JSONB AS $$
DECLARE
    keywords TEXT[] := ARRAY[]::TEXT[];
    title_keywords TEXT[];
    content_keywords TEXT[];
    tech_keywords TEXT[];
BEGIN
    -- Extract meaningful words from title
    title_keywords := ARRAY(
        SELECT DISTINCT LOWER(word)
        FROM regexp_split_to_table(title, '\W+') word
        WHERE LENGTH(word) >= 3
        AND word NOT SIMILAR TO '%(the|and|for|are|but|not|you|all|can|her|was|one|our|had|did|get|may|him|old|see|now|way|who|boy|its|let|put|too|end|why|try|god|six|dog|eat|ago|sit|fun|bad|yes|yet|arm|far|off|ill|any|saw|run|own)%'
    );
    
    -- Add title keywords (high priority)
    keywords := keywords || title_keywords;
    
    -- Category-specific enhanced keywords
    CASE LOWER(category)
        WHEN 'technology' THEN
            tech_keywords := ARRAY['technology', 'tech', 'software', 'development', 'programming', 'coding', 'innovation', 'digital', 'ai', 'machine learning', 'web development', 'mobile app', 'javascript', 'python', 'react', 'nodejs'];
        WHEN 'business' THEN
            tech_keywords := ARRAY['business', 'strategy', 'growth', 'entrepreneurship', 'management', 'leadership', 'startup', 'marketing', 'sales', 'productivity', 'success', 'profit', 'investment', 'finance'];
        WHEN 'design' THEN
            tech_keywords := ARRAY['design', 'creative', 'visual', 'ui', 'ux', 'user interface', 'user experience', 'graphic design', 'web design', 'branding', 'typography', 'color theory'];
        WHEN 'development' THEN
            tech_keywords := ARRAY['development', 'coding', 'programming', 'developer', 'software', 'web', 'frontend', 'backend', 'fullstack', 'api', 'database', 'framework'];
        WHEN 'education' THEN
            tech_keywords := ARRAY['education', 'learning', 'tutorial', 'guide', 'knowledge', 'teaching', 'course', 'training', 'skill', 'certification'];
        WHEN 'lifestyle' THEN
            tech_keywords := ARRAY['lifestyle', 'health', 'wellness', 'productivity', 'habits', 'motivation', 'personal development', 'work life balance'];
        WHEN 'travel' THEN
            tech_keywords := ARRAY['travel', 'destination', 'adventure', 'vacation', 'tourism', 'culture', 'experience', 'journey'];
        ELSE
            tech_keywords := ARRAY['blog', 'article', 'guide', 'tips', 'advice', 'insights', 'knowledge', 'information'];
    END CASE;
    
    -- Add relevant category keywords based on content
    keywords := keywords || (
        SELECT ARRAY(
            SELECT tech_keywords[i]
            FROM generate_subscripts(tech_keywords, 1) i
            WHERE content ILIKE '%' || tech_keywords[i] || '%'
            LIMIT 5
        )
    );
    
    -- Add some trending keywords
    keywords := keywords || ARRAY['2025', 'latest', 'modern', 'new', 'innovative', 'best practices'];
    
    -- Convert to JSONB, remove duplicates, limit to 15 keywords
    RETURN (
        SELECT json_agg(keyword ORDER BY keyword)::JSONB
        FROM (
            SELECT DISTINCT keyword
            FROM unnest(keywords) keyword
            WHERE keyword IS NOT NULL AND LENGTH(keyword) >= 3
            LIMIT 15
        ) sorted_keywords
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate focus keyword from title
CREATE OR REPLACE FUNCTION extract_focus_keyword(title TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Get the most significant word from title (longest non-stop word)
    RETURN (
        SELECT word
        FROM regexp_split_to_table(title, '\W+') word
        WHERE LENGTH(word) >= 3
        AND LOWER(word) NOT IN ('the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'did', 'get', 'may', 'him', 'old', 'see', 'now', 'way', 'who', 'boy', 'its', 'let', 'put', 'too', 'end', 'why', 'try', 'how', 'new', 'use')
        ORDER BY LENGTH(word) DESC, word
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate meta description
CREATE OR REPLACE FUNCTION generate_meta_description(title TEXT, content TEXT)
RETURNS TEXT AS $$
DECLARE
    first_sentence TEXT;
    clean_content TEXT;
BEGIN
    -- Remove HTML tags and get first 155 characters
    clean_content := regexp_replace(content, '<[^>]*>', '', 'g');
    
    -- Get first sentence or 155 characters
    first_sentence := LEFT(clean_content, 155);
    
    -- If we cut mid-word, go back to last complete word
    IF LENGTH(clean_content) > 155 THEN
        first_sentence := LEFT(first_sentence, LENGTH(first_sentence) - POSITION(' ' IN REVERSE(first_sentence)));
        first_sentence := first_sentence || '...';
    END IF;
    
    RETURN COALESCE(first_sentence, LEFT(title || ' - Learn more about this topic', 155));
END;
$$ LANGUAGE plpgsql;

-- Add missing SEO columns if they don't exist
DO $$ 
BEGIN
    -- Add focus_keyword column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'focus_keyword') THEN
        ALTER TABLE blog_posts ADD COLUMN focus_keyword TEXT;
    END IF;
    
    -- Add meta_description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'meta_description') THEN
        ALTER TABLE blog_posts ADD COLUMN meta_description TEXT;
    END IF;
    
    -- Add seo_score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'seo_score') THEN
        ALTER TABLE blog_posts ADD COLUMN seo_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update all posts with enhanced SEO keywords
UPDATE blog_posts 
SET 
    suggested_keywords = generate_enhanced_keywords(title, content, category),
    focus_keyword = extract_focus_keyword(title),
    meta_description = generate_meta_description(title, content),
    seo_score = CASE 
        WHEN LENGTH(title) BETWEEN 30 AND 60 THEN 20 ELSE 10 
    END + CASE 
        WHEN LENGTH(content) > 300 THEN 30 ELSE 15 
    END + CASE 
        WHEN category IS NOT NULL THEN 10 ELSE 0 
    END,
    last_seo_update = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT id FROM blog_posts 
    WHERE suggested_keywords IS NULL 
       OR suggested_keywords = '[]'::JSONB 
       OR jsonb_array_length(suggested_keywords) < 3
    LIMIT 20  -- Process in batches
);

-- Show updated results
SELECT 
    title,
    category,
    suggested_keywords,
    last_seo_update
FROM blog_posts 
WHERE suggested_keywords IS NOT NULL 
  AND suggested_keywords != '[]'::JSONB
ORDER BY last_seo_update DESC
LIMIT 10;

-- Create a view for SEO dashboard
CREATE OR REPLACE VIEW seo_dashboard AS
SELECT 
    id,
    title,
    category,
    suggested_keywords,
    focus_keyword,
    meta_description,
    seo_score,
    last_seo_update,
    created_at,
    jsonb_array_length(COALESCE(suggested_keywords, '[]'::JSONB)) as keyword_count,
    CASE 
        WHEN suggested_keywords IS NULL OR suggested_keywords = '[]'::JSONB THEN 'Needs Keywords'
        WHEN jsonb_array_length(suggested_keywords) < 5 THEN 'Few Keywords'
        WHEN last_seo_update < CURRENT_DATE - INTERVAL '30 days' THEN 'Outdated SEO'
        ELSE 'Good SEO'
    END as seo_status
FROM blog_posts
ORDER BY last_seo_update DESC;

-- Summary report
SELECT 
    seo_status,
    COUNT(*) as post_count,
    ROUND(AVG(seo_score), 1) as avg_seo_score
FROM seo_dashboard 
GROUP BY seo_status
ORDER BY post_count DESC;
