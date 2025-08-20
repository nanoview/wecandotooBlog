-- 🚀 AUTOMATIC SEO KEYWORDS & TAGS GENERATION
-- This script sets up automatic generation of tags and suggested_keywords for blog posts

-- ✅ Step 1: Enhanced keyword generation function with better tag extraction
CREATE OR REPLACE FUNCTION generate_comprehensive_keywords_and_tags(
    title TEXT, 
    content TEXT, 
    category TEXT DEFAULT NULL
)
RETURNS TABLE(
    suggested_keywords JSONB,
    tags JSONB,
    focus_keyword TEXT,
    meta_description TEXT
) AS $$
DECLARE
    keywords TEXT[] := ARRAY[]::TEXT[];
    extracted_tags TEXT[] := ARRAY[]::TEXT[];
    title_words TEXT[];
    content_words TEXT[];
    tech_keywords TEXT[] := ARRAY[
        'javascript', 'python', 'react', 'nodejs', 'typescript', 'html', 'css',
        'vue', 'angular', 'api', 'database', 'sql', 'mongodb', 'postgresql',
        'docker', 'kubernetes', 'aws', 'cloud', 'microservices', 'devops',
        'machine learning', 'ai', 'blockchain', 'web development', 'mobile',
        'ios', 'android', 'flutter', 'git', 'github', 'ci/cd', 'testing',
        'security', 'performance', 'optimization', 'seo', 'marketing',
        'analytics', 'firebase', 'supabase', 'vercel', 'netlify'
    ];
    category_keywords TEXT[];
    focus_word TEXT;
    description TEXT;
BEGIN
    -- Clean and normalize inputs
    title := COALESCE(TRIM(title), '');
    content := COALESCE(TRIM(content), '');
    category := COALESCE(LOWER(TRIM(category)), 'general');
    
    -- Extract meaningful words from title (potential tags and keywords)
    title_words := ARRAY(
        SELECT DISTINCT LOWER(TRIM(word))
        FROM regexp_split_to_table(title, '\W+') word
        WHERE LENGTH(TRIM(word)) >= 3
        AND LOWER(TRIM(word)) NOT IN ('the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'did', 'get', 'may', 'him', 'old', 'see', 'now', 'way', 'who', 'boy', 'its', 'let', 'put', 'too', 'end', 'why', 'try', 'how', 'new', 'use', 'that', 'this', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'your')
    );
    
    -- Extract meaningful words from content (first 500 chars for performance)
    content_words := ARRAY(
        SELECT DISTINCT LOWER(TRIM(word))
        FROM regexp_split_to_table(SUBSTRING(content, 1, 500), '\W+') word
        WHERE LENGTH(TRIM(word)) >= 4
        AND LOWER(TRIM(word)) NOT IN ('the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'did', 'get', 'may', 'him', 'old', 'see', 'now', 'way', 'who', 'boy', 'its', 'let', 'put', 'too', 'end', 'why', 'try', 'how', 'new', 'use', 'that', 'this', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'your')
        LIMIT 10
    );
    
    -- Category-specific keywords
    category_keywords := CASE category
        WHEN 'web-development' THEN ARRAY['html', 'css', 'javascript', 'frontend', 'backend', 'responsive', 'framework']
        WHEN 'mobile-development' THEN ARRAY['ios', 'android', 'react native', 'flutter', 'app', 'mobile', 'development']
        WHEN 'data-science' THEN ARRAY['python', 'machine learning', 'data analysis', 'visualization', 'statistics']
        WHEN 'devops' THEN ARRAY['docker', 'kubernetes', 'ci/cd', 'automation', 'cloud', 'deployment']
        WHEN 'security' THEN ARRAY['cybersecurity', 'encryption', 'authentication', 'vulnerability', 'privacy']
        WHEN 'ai' THEN ARRAY['artificial intelligence', 'neural networks', 'deep learning', 'nlp', 'computer vision']
        WHEN 'career' THEN ARRAY['career development', 'skills', 'interview', 'resume', 'professional growth']
        ELSE ARRAY['technology', 'programming', 'development', 'software', 'coding']
    END;
    
    -- Combine all keywords
    keywords := title_words || content_words || category_keywords;
    
    -- Find tech keywords mentioned in content
    keywords := keywords || ARRAY(
        SELECT tech_keywords[i]
        FROM generate_subscripts(tech_keywords, 1) i
        WHERE content ILIKE '%' || tech_keywords[i] || '%'
        LIMIT 8
    );
    
    -- Add trending 2025 keywords
    keywords := keywords || ARRAY['2025', 'latest', 'modern', 'best practices', 'tutorial', 'guide'];
    
    -- Generate TAGS (shorter, more specific terms from title)
    extracted_tags := ARRAY(
        SELECT DISTINCT word
        FROM unnest(title_words) word
        WHERE LENGTH(word) BETWEEN 3 AND 12
        AND word NOT IN ('tutorial', 'guide', 'how', 'what', 'when', 'where', 'why', 'best', 'top', 'learn', 'complete', 'ultimate', 'beginner', 'advanced')
        LIMIT 8
    );
    
    -- Add category as a tag
    IF category IS NOT NULL AND category != 'general' THEN
        extracted_tags := extracted_tags || ARRAY[category];
    END IF;
    
    -- Generate focus keyword (most important word from title)
    focus_word := (
        SELECT word
        FROM unnest(title_words) word
        WHERE LENGTH(word) >= 4
        ORDER BY LENGTH(word) DESC, word
        LIMIT 1
    );
    
    -- Generate meta description (first sentence or 150 chars)
    description := CASE 
        WHEN LENGTH(content) > 150 THEN
            SUBSTRING(content, 1, 147) || '...'
        ELSE
            content
    END;
    
    -- Return results
    RETURN QUERY SELECT 
        (
            SELECT json_agg(DISTINCT keyword ORDER BY keyword)::JSONB
            FROM unnest(keywords) keyword
            WHERE keyword IS NOT NULL 
            AND LENGTH(keyword) >= 3 
            AND LENGTH(keyword) <= 25
            LIMIT 12
        ) as suggested_keywords,
        (
            SELECT json_agg(DISTINCT tag ORDER BY tag)::JSONB
            FROM unnest(extracted_tags) tag
            WHERE tag IS NOT NULL 
            AND LENGTH(tag) >= 3
            LIMIT 6
        ) as tags,
        COALESCE(focus_word, SPLIT_PART(title, ' ', 1)) as focus_keyword,
        COALESCE(description, title) as meta_description;
END;
$$ LANGUAGE plpgsql;

-- ✅ Step 2: Automatic trigger function
CREATE OR REPLACE FUNCTION auto_generate_seo_data()
RETURNS TRIGGER AS $$
DECLARE
    seo_data RECORD;
BEGIN
    -- Only generate if title and content exist
    IF NEW.title IS NOT NULL AND NEW.content IS NOT NULL THEN
        -- Generate SEO data
        SELECT * INTO seo_data 
        FROM generate_comprehensive_keywords_and_tags(
            NEW.title, 
            NEW.content, 
            NEW.category
        );
        
        -- Update the new record with generated SEO data
        NEW.suggested_keywords := COALESCE(seo_data.suggested_keywords, '[]'::JSONB);
        NEW.tags := COALESCE(seo_data.tags, '[]'::JSONB);
        NEW.focus_keyword := seo_data.focus_keyword;
        NEW.meta_description := seo_data.meta_description;
        NEW.last_seo_update := CURRENT_TIMESTAMP;
        
        -- Calculate simple SEO score
        NEW.seo_score := CASE 
            WHEN jsonb_array_length(NEW.suggested_keywords) >= 8 
                AND jsonb_array_length(NEW.tags) >= 4 
                AND LENGTH(NEW.meta_description) BETWEEN 120 AND 160 
                THEN 95
            WHEN jsonb_array_length(NEW.suggested_keywords) >= 5 
                AND jsonb_array_length(NEW.tags) >= 3 
                THEN 80
            WHEN jsonb_array_length(NEW.suggested_keywords) >= 3 
                THEN 65
            ELSE 40
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ Step 3: Create the automatic trigger
DROP TRIGGER IF EXISTS auto_seo_generation ON blog_posts;
CREATE TRIGGER auto_seo_generation
    BEFORE INSERT OR UPDATE OF title, content, category
    ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_seo_data();

-- ✅ Step 4: Update existing posts that don't have SEO data (safe version)
-- This version checks column types and handles them appropriately
DO $$
DECLARE
    update_count INTEGER := 0;
BEGIN
    -- Update posts that need SEO data, handling different column types safely
    UPDATE blog_posts 
    SET 
        title = title,  -- This will trigger the function
        updated_at = CURRENT_TIMESTAMP
    WHERE suggested_keywords IS NULL 
       OR (suggested_keywords::text IN ('[]', '{}', 'null'))
       OR (tags IS NULL OR tags::text IN ('[]', '{}', 'null', ''))
       OR (suggested_keywords IS NOT NULL 
           AND jsonb_typeof(suggested_keywords) = 'array' 
           AND jsonb_array_length(suggested_keywords) < 3);
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    RAISE NOTICE 'Updated % posts to generate SEO data', update_count;
END $$;

-- ✅ Step 5: Verification and results
SELECT 
    '🎉 AUTO SEO SETUP COMPLETE!' as status,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN suggested_keywords IS NOT NULL AND jsonb_array_length(suggested_keywords) > 0 THEN 1 END) as posts_with_keywords,
    COUNT(CASE WHEN tags IS NOT NULL AND jsonb_array_length(tags) > 0 THEN 1 END) as posts_with_tags
FROM blog_posts;

-- Show recent results
SELECT 
    title,
    category,
    tags,
    suggested_keywords,
    focus_keyword,
    seo_score,
    last_seo_update
FROM blog_posts 
WHERE suggested_keywords IS NOT NULL 
ORDER BY last_seo_update DESC 
LIMIT 5;

-- ✅ Step 6: Create a function to manually regenerate SEO for specific posts
CREATE OR REPLACE FUNCTION regenerate_post_seo(post_id UUID)
RETURNS JSONB AS $$
DECLARE
    post_record blog_posts%ROWTYPE;
    seo_data RECORD;
BEGIN
    -- Get the post
    SELECT * INTO post_record FROM blog_posts WHERE id = post_id;
    
    IF NOT FOUND THEN
        RETURN '{"error": "Post not found"}'::JSONB;
    END IF;
    
    -- Generate new SEO data
    SELECT * INTO seo_data 
    FROM generate_comprehensive_keywords_and_tags(
        post_record.title, 
        post_record.content, 
        post_record.category
    );
    
    -- Update the post
    UPDATE blog_posts 
    SET 
        suggested_keywords = seo_data.suggested_keywords,
        tags = seo_data.tags,
        focus_keyword = seo_data.focus_keyword,
        meta_description = seo_data.meta_description,
        last_seo_update = CURRENT_TIMESTAMP,
        seo_score = CASE 
            WHEN jsonb_array_length(seo_data.suggested_keywords) >= 8 
                AND jsonb_array_length(seo_data.tags) >= 4 
                AND LENGTH(seo_data.meta_description) BETWEEN 120 AND 160 
                THEN 95
            WHEN jsonb_array_length(seo_data.suggested_keywords) >= 5 
                AND jsonb_array_length(seo_data.tags) >= 3 
                THEN 80
            WHEN jsonb_array_length(seo_data.suggested_keywords) >= 3 
                THEN 65
            ELSE 40
        END
    WHERE id = post_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'keywords', seo_data.suggested_keywords,
        'tags', seo_data.tags,
        'focus_keyword', seo_data.focus_keyword
    );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ AUTOMATIC SEO GENERATION IS NOW ACTIVE!' as final_status;
