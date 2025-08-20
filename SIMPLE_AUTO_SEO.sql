-- 🚀 SIMPLE AUTO SEO SETUP (No Type Conflicts)
-- This version creates the functions and triggers without trying to update existing posts

-- ✅ Step 1: Enhanced keyword generation function
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
        'security', 'performance', 'optimization', 'seo', 'marketing'
    ];
    category_keywords TEXT[];
    focus_word TEXT;
    description TEXT;
BEGIN
    -- Clean inputs
    title := COALESCE(TRIM(title), '');
    content := COALESCE(TRIM(content), '');
    category := COALESCE(LOWER(TRIM(category)), 'general');
    
    -- Extract title words
    title_words := ARRAY(
        SELECT DISTINCT LOWER(TRIM(word))
        FROM regexp_split_to_table(title, '\W+') word
        WHERE LENGTH(TRIM(word)) >= 3
        AND LOWER(TRIM(word)) NOT IN ('the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'how', 'new', 'use', 'that', 'this', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'your')
    );
    
    -- Extract content words (first 300 chars)
    content_words := ARRAY(
        SELECT DISTINCT LOWER(TRIM(word))
        FROM regexp_split_to_table(SUBSTRING(content, 1, 300), '\W+') word
        WHERE LENGTH(TRIM(word)) >= 4
        AND LOWER(TRIM(word)) NOT IN ('the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'how', 'new', 'use', 'that', 'this', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'your')
        LIMIT 8
    );
    
    -- Category keywords
    category_keywords := CASE category
        WHEN 'web-development' THEN ARRAY['html', 'css', 'javascript', 'frontend', 'backend']
        WHEN 'mobile-development' THEN ARRAY['ios', 'android', 'mobile', 'app']
        WHEN 'data-science' THEN ARRAY['python', 'machine learning', 'data']
        WHEN 'devops' THEN ARRAY['docker', 'kubernetes', 'cloud']
        WHEN 'ai' THEN ARRAY['artificial intelligence', 'machine learning']
        ELSE ARRAY['technology', 'programming', 'development']
    END;
    
    -- Combine keywords
    keywords := title_words || content_words || category_keywords;
    
    -- Add tech keywords found in content
    keywords := keywords || ARRAY(
        SELECT tech_keywords[i]
        FROM generate_subscripts(tech_keywords, 1) i
        WHERE content ILIKE '%' || tech_keywords[i] || '%'
        LIMIT 6
    );
    
    -- Add trending keywords
    keywords := keywords || ARRAY['2025', 'latest', 'modern', 'guide', 'tutorial'];
    
    -- Generate tags (from title)
    extracted_tags := ARRAY(
        SELECT DISTINCT word
        FROM unnest(title_words) word
        WHERE LENGTH(word) BETWEEN 3 AND 15
        AND word NOT IN ('tutorial', 'guide', 'how', 'what', 'best', 'top', 'learn')
        LIMIT 6
    );
    
    -- Add category as tag
    IF category IS NOT NULL AND category != 'general' THEN
        extracted_tags := extracted_tags || ARRAY[category];
    END IF;
    
    -- Focus keyword
    focus_word := (
        SELECT word
        FROM unnest(title_words) word
        WHERE LENGTH(word) >= 4
        ORDER BY LENGTH(word) DESC
        LIMIT 1
    );
    
    -- Meta description
    description := CASE 
        WHEN LENGTH(content) > 150 THEN SUBSTRING(content, 1, 147) || '...'
        ELSE content
    END;
    
    -- Return results
    RETURN QUERY SELECT 
        (SELECT json_agg(DISTINCT keyword ORDER BY keyword)::JSONB
         FROM unnest(keywords) keyword
         WHERE keyword IS NOT NULL AND LENGTH(keyword) BETWEEN 3 AND 20
         LIMIT 10) as suggested_keywords,
        (SELECT json_agg(DISTINCT tag ORDER BY tag)::JSONB
         FROM unnest(extracted_tags) tag
         WHERE tag IS NOT NULL AND LENGTH(tag) >= 3
         LIMIT 6) as tags,
        COALESCE(focus_word, SPLIT_PART(title, ' ', 1)) as focus_keyword,
        COALESCE(description, title) as meta_description;
END;
$$ LANGUAGE plpgsql;

-- ✅ Step 2: Trigger function
CREATE OR REPLACE FUNCTION auto_generate_seo_data()
RETURNS TRIGGER AS $$
DECLARE
    seo_data RECORD;
BEGIN
    IF NEW.title IS NOT NULL AND NEW.content IS NOT NULL THEN
        SELECT * INTO seo_data 
        FROM generate_comprehensive_keywords_and_tags(NEW.title, NEW.content, NEW.category);
        
        NEW.suggested_keywords := COALESCE(seo_data.suggested_keywords, '[]'::JSONB);
        NEW.tags := COALESCE(seo_data.tags, '[]'::JSONB);
        NEW.focus_keyword := seo_data.focus_keyword;
        NEW.meta_description := seo_data.meta_description;
        NEW.last_seo_update := CURRENT_TIMESTAMP;
        
        NEW.seo_score := CASE 
            WHEN jsonb_array_length(NEW.suggested_keywords) >= 6 
                AND jsonb_array_length(NEW.tags) >= 3 
                THEN 85
            WHEN jsonb_array_length(NEW.suggested_keywords) >= 4 
                THEN 70
            ELSE 50
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ Step 3: Create trigger
DROP TRIGGER IF EXISTS auto_seo_generation ON blog_posts;
CREATE TRIGGER auto_seo_generation
    BEFORE INSERT OR UPDATE OF title, content, category
    ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_seo_data();

-- ✅ Step 4: Test the function
SELECT 
    'Testing SEO generation...' as status,
    jsonb_pretty(suggested_keywords) as sample_keywords,
    jsonb_pretty(tags) as sample_tags,
    focus_keyword,
    LEFT(meta_description, 50) || '...' as sample_description
FROM generate_comprehensive_keywords_and_tags(
    'Complete Guide to React Hooks in 2025',
    'React Hooks revolutionized the way we write React components. Learn useState, useEffect, and custom hooks in this comprehensive tutorial.',
    'web-development'
);

-- ✅ Step 5: Manual regeneration function
CREATE OR REPLACE FUNCTION regenerate_post_seo(post_id UUID)
RETURNS JSONB AS $$
DECLARE
    post_record blog_posts%ROWTYPE;
    seo_data RECORD;
BEGIN
    SELECT * INTO post_record FROM blog_posts WHERE id = post_id;
    
    IF NOT FOUND THEN
        RETURN '{"error": "Post not found"}'::JSONB;
    END IF;
    
    SELECT * INTO seo_data 
    FROM generate_comprehensive_keywords_and_tags(
        post_record.title, 
        post_record.content, 
        post_record.category
    );
    
    UPDATE blog_posts 
    SET 
        suggested_keywords = seo_data.suggested_keywords,
        tags = seo_data.tags,
        focus_keyword = seo_data.focus_keyword,
        meta_description = seo_data.meta_description,
        last_seo_update = CURRENT_TIMESTAMP
    WHERE id = post_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'keywords', seo_data.suggested_keywords,
        'tags', seo_data.tags,
        'focus_keyword', seo_data.focus_keyword
    );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ SIMPLE AUTO SEO SETUP COMPLETE!' as final_status;
SELECT 'Now create or edit a blog post to see automatic SEO generation!' as next_step;
