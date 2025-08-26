-- ============================================================================
-- Fix Missing Columns in post_impressions Table
-- Date: 2025-08-27
-- 
-- This script adds all missing columns that are referenced in views
-- ============================================================================

-- Add missing columns to post_impressions table
DO $$
BEGIN
    RAISE NOTICE 'Starting post_impressions column fixes...';
    
    -- Add user_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' 
                   AND column_name = 'user_id' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE '✅ Added user_id column to post_impressions';
    ELSE
        RAISE NOTICE '✅ user_id column already exists';
    END IF;
    
    -- Add ip_address column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' 
                   AND column_name = 'ip_address' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN ip_address INET;
        RAISE NOTICE '✅ Added ip_address column to post_impressions';
    ELSE
        RAISE NOTICE '✅ ip_address column already exists';
    END IF;
    
    -- Add user_agent column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' 
                   AND column_name = 'user_agent' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN user_agent TEXT;
        RAISE NOTICE '✅ Added user_agent column to post_impressions';
    ELSE
        RAISE NOTICE '✅ user_agent column already exists';
    END IF;
    
    -- Add referrer column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' 
                   AND column_name = 'referrer' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN referrer TEXT;
        RAISE NOTICE '✅ Added referrer column to post_impressions';
    ELSE
        RAISE NOTICE '✅ referrer column already exists';
    END IF;
    
    -- Add session_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' 
                   AND column_name = 'session_id' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN session_id TEXT;
        RAISE NOTICE '✅ Added session_id column to post_impressions';
    ELSE
        RAISE NOTICE '✅ session_id column already exists';
    END IF;
    
    -- Add post_id column if missing (should be UUID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' 
                   AND column_name = 'post_id' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN post_id UUID REFERENCES public.blog_posts(id);
        RAISE NOTICE '✅ Added post_id column to post_impressions';
    ELSE
        RAISE NOTICE '✅ post_id column already exists';
    END IF;
    
    -- Add created_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' 
                   AND column_name = 'created_at' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Added created_at column to post_impressions';
    ELSE
        RAISE NOTICE '✅ created_at column already exists';
    END IF;
    
    -- Add id column if missing (primary key)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' 
                   AND column_name = 'id' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
        RAISE NOTICE '✅ Added id column to post_impressions';
    ELSE
        RAISE NOTICE '✅ id column already exists';
    END IF;
    
    RAISE NOTICE '🎉 post_impressions column fixes completed!';
END $$;

-- ============================================================================
-- Verify the columns were added correctly
-- ============================================================================

SELECT 
  'POST_IMPRESSIONS SCHEMA VERIFICATION' as check_type,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'post_id', 'user_id', 'session_id', 'ip_address', 'user_agent', 'referrer', 'created_at') 
    THEN '✅ REQUIRED COLUMN' 
    ELSE '📝 ADDITIONAL COLUMN' 
  END as status
FROM information_schema.columns 
WHERE table_name = 'post_impressions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- Test that we can now create the problematic view
-- ============================================================================

-- Test creating the post_impressions_with_posts view
DROP VIEW IF EXISTS public.test_post_impressions_with_posts CASCADE;

CREATE VIEW public.test_post_impressions_with_posts AS
SELECT 
  pi.id,
  pi.post_id,
  pi.user_id,
  pi.session_id,
  pi.ip_address,        -- This should now work!
  pi.user_agent,
  pi.referrer,
  pi.created_at as impression_date,
  bp.title as post_title,
  bp.slug as post_slug,
  bp.status as post_status
FROM post_impressions pi
LEFT JOIN blog_posts bp ON pi.post_id = bp.id
ORDER BY pi.created_at DESC
LIMIT 10;  -- Limit for testing

-- Test the view works
SELECT 
  'VIEW TEST RESULT' as test_type,
  COUNT(*) as row_count,
  '✅ SUCCESS: post_impressions view works!' as status
FROM public.test_post_impressions_with_posts;

-- Clean up test view
DROP VIEW IF EXISTS public.test_post_impressions_with_posts CASCADE;

SELECT '🎉 POST_IMPRESSIONS COLUMNS FIXED! Now run the complete security fix.' as final_message;
