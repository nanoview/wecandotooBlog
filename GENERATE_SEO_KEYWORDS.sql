-- 🚀 Generate SEO Keywords for All Blog Posts
-- This script will update all blog posts with basic SEO keywords automatically

-- Function to extract keywords from title and content
CREATE OR REPLACE FUNCTION generate_basic_seo_keywords(title TEXT, content TEXT, category TEXT DEFAULT 'general')
RETURNS JSONB AS $$
DECLARE
    keywords JSONB;
    clean_title TEXT;
    clean_content TEXT;
    title_words TEXT[];
    content_words TEXT[];
    combined_keywords TEXT[];
    word TEXT;
BEGIN
    -- Clean and process title
    clean_title := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', ' ', 'g'));
    title_words := string_to_array(clean_title, ' ');
    
    -- Clean and process content (first 500 chars for performance)
    clean_content := LOWER(REGEXP_REPLACE(LEFT(content, 500), '[^a-zA-Z0-9\s]', ' ', 'g'));
    content_words := string_to_array(clean_content, ' ');
    
    -- Filter out common stop words and short words
    combined_keywords := ARRAY[]::TEXT[];
    
    -- Add meaningful words from title (higher priority)
    FOREACH word IN ARRAY title_words
    LOOP
        IF LENGTH(word) >= 3 AND word NOT IN ('the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'did', 'get', 'may', 'him', 'old', 'see', 'now', 'way', 'who', 'boy', 'its', 'let', 'put', 'too', 'end', 'why', 'try', 'god', 'six', 'dog', 'eat', 'ago', 'sit', 'fun', 'bad', 'yes', 'yet', 'arm', 'far', 'off', 'ill', 'any', 'saw', 'run', 'own') THEN
            combined_keywords := array_append(combined_keywords, word);
        END IF;
    END LOOP;
    
    -- Add category-specific keywords
    IF category IS NOT NULL THEN
        combined_keywords := array_append(combined_keywords, LOWER(category));
    END IF;
    
    -- Add some general tech/blog keywords based on category
    CASE LOWER(category)
        WHEN 'technology' THEN
            combined_keywords := combined_keywords || ARRAY['tech', 'software', 'development', 'programming', 'innovation'];
        WHEN 'business' THEN
            combined_keywords := combined_keywords || ARRAY['business', 'strategy', 'growth', 'entrepreneurship', 'management'];
        WHEN 'design' THEN
            combined_keywords := combined_keywords || ARRAY['design', 'creative', 'visual', 'ui', 'ux'];
        WHEN 'development' THEN
            combined_keywords := combined_keywords || ARRAY['coding', 'programming', 'developer', 'software', 'web'];
        WHEN 'education' THEN
            combined_keywords := combined_keywords || ARRAY['learning', 'education', 'tutorial', 'guide', 'knowledge'];
        ELSE
            combined_keywords := combined_keywords || ARRAY['blog', 'article', 'guide', 'tips'];
    END CASE;
    
    -- Remove duplicates and limit to 10 keywords
    SELECT json_agg(DISTINCT unnest) INTO keywords
    FROM (
        SELECT unnest(combined_keywords) 
        ORDER BY unnest 
        LIMIT 10
    ) t;
    
    RETURN COALESCE(keywords, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Function to generate meta description
CREATE OR REPLACE FUNCTION generate_meta_description(title TEXT, content TEXT)
RETURNS TEXT AS $$
DECLARE
    clean_content TEXT;
    meta_desc TEXT;
BEGIN
    -- Remove HTML tags and get first paragraph
    clean_content := REGEXP_REPLACE(content, '<[^>]+>', ' ', 'g');
    clean_content := REGEXP_REPLACE(clean_content, '\s+', ' ', 'g');
    clean_content := TRIM(clean_content);
    
    -- Take first 150 characters and ensure it ends properly
    meta_desc := LEFT(clean_content, 150);
    
    -- If we cut off in the middle of a word, trim to last complete word
    IF LENGTH(clean_content) > 150 THEN
        meta_desc := SUBSTRING(meta_desc FROM 1 FOR LENGTH(meta_desc) - POSITION(' ' IN REVERSE(meta_desc)));
        meta_desc := meta_desc || '...';
    END IF;
    
    RETURN meta_desc;
END;
$$ LANGUAGE plpgsql;

-- Update all blog posts with generated SEO data
UPDATE blog_posts 
SET 
    suggested_keywords = generate_basic_seo_keywords(title, content, category),
    meta_description = CASE 
        WHEN meta_description IS NULL OR meta_description = '' 
        THEN generate_meta_description(title, content)
        ELSE meta_description
    END,
    focus_keyword = CASE 
        WHEN focus_keyword IS NULL OR focus_keyword = ''
        THEN LOWER(SPLIT_PART(title, ' ', 1))
        ELSE focus_keyword
    END,
    last_seo_update = CURRENT_TIMESTAMP,
    seo_score = CASE 
        WHEN seo_score IS NULL OR seo_score = 0
        THEN 75 -- Default good score
        ELSE seo_score
    END
WHERE suggested_keywords IS NULL 
   OR suggested_keywords = '[]'::JSONB 
   OR last_seo_update IS NULL;

-- Create trigger to auto-generate SEO data for new posts
CREATE OR REPLACE FUNCTION auto_generate_seo_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if not already set
    IF NEW.suggested_keywords IS NULL OR NEW.suggested_keywords = '[]'::JSONB THEN
        NEW.suggested_keywords := generate_basic_seo_keywords(NEW.title, NEW.content, NEW.category);
    END IF;
    
    IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
        NEW.meta_description := generate_meta_description(NEW.title, NEW.content);
    END IF;
    
    IF NEW.focus_keyword IS NULL OR NEW.focus_keyword = '' THEN
        NEW.focus_keyword := LOWER(SPLIT_PART(NEW.title, ' ', 1));
    END IF;
    
    NEW.last_seo_update := CURRENT_TIMESTAMP;
    
    IF NEW.seo_score IS NULL OR NEW.seo_score = 0 THEN
        NEW.seo_score := 75;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new posts
DROP TRIGGER IF EXISTS auto_seo_trigger ON blog_posts;
CREATE TRIGGER auto_seo_trigger
    BEFORE INSERT OR UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_seo_data();

-- Verify the update worked
SELECT 
    id,
    title,
    category,
    suggested_keywords,
    focus_keyword,
    meta_description,
    seo_score,
    last_seo_update
FROM blog_posts 
WHERE suggested_keywords IS NOT NULL
ORDER BY last_seo_update DESC
LIMIT 5;

-- Show summary of SEO data generation
SELECT 
    'Total Posts' as metric,
    COUNT(*) as count
FROM blog_posts
UNION ALL
SELECT 
    'Posts with Keywords' as metric,
    COUNT(*) as count
FROM blog_posts 
WHERE suggested_keywords IS NOT NULL AND suggested_keywords != '[]'::JSONB
UNION ALL
SELECT 
    'Posts with Meta Description' as metric,
    COUNT(*) as count
FROM blog_posts 
WHERE meta_description IS NOT NULL AND meta_description != ''
UNION ALL
SELECT 
    'Posts with Focus Keyword' as metric,
    COUNT(*) as count
FROM blog_posts 
WHERE focus_keyword IS NOT NULL AND focus_keyword != '';

-- ✅ SEO Keywords Generated Successfully!
-- Your blog posts should now have:
-- - suggested_keywords (JSON array)
-- - meta_description (auto-generated from content)
-- - focus_keyword (first word of title)
-- - last_seo_update (timestamp)
-- - seo_score (default 75)
-- 
-- New posts will automatically get SEO data via the trigger!
