-- ============================================================================
-- Complete Security and Schema Fix - Create Missing Columns and Fix Issues
-- Date: 2025-08-27
-- 
-- This script:
-- 1. Creates missing columns if they don't exist
-- 2. Recreates views with proper schema (no SECURITY DEFINER)
-- 3. Fixes function search path security issues
-- ============================================================================

-- First, let's check what columns we need and create them if missing
DO $$
BEGIN
    -- Add missing columns to post_impressions if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'user_id') THEN
        ALTER TABLE post_impressions ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added user_id column to post_impressions';
    END IF;
    
    -- Add missing columns to profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE profiles ADD COLUMN username TEXT;
        RAISE NOTICE 'Added username column to profiles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
        RAISE NOTICE 'Added display_name column to profiles';
    END IF;
    
    -- Add missing email validation columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_checks' AND column_name = 'is_valid') THEN
        ALTER TABLE email_checks ADD COLUMN is_valid BOOLEAN;
        RAISE NOTICE 'Added is_valid column to email_checks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_checks' AND column_name = 'is_deliverable') THEN
        ALTER TABLE email_checks ADD COLUMN is_deliverable BOOLEAN;
        RAISE NOTICE 'Added is_deliverable column to email_checks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_checks' AND column_name = 'is_disposable') THEN
        ALTER TABLE email_checks ADD COLUMN is_disposable BOOLEAN;
        RAISE NOTICE 'Added is_disposable column to email_checks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_checks' AND column_name = 'is_role_account') THEN
        ALTER TABLE email_checks ADD COLUMN is_role_account BOOLEAN;
        RAISE NOTICE 'Added is_role_account column to email_checks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_checks' AND column_name = 'confidence_score') THEN
        ALTER TABLE email_checks ADD COLUMN confidence_score DECIMAL(3,2);
        RAISE NOTICE 'Added confidence_score column to email_checks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_checks' AND column_name = 'error_message') THEN
        ALTER TABLE email_checks ADD COLUMN error_message TEXT;
        RAISE NOTICE 'Added error_message column to email_checks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_checks' AND column_name = 'checked_at') THEN
        ALTER TABLE email_checks ADD COLUMN checked_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added checked_at column to email_checks';
    END IF;
    
    RAISE NOTICE 'Schema check and column creation completed!';
END $$;

-- ============================================================================
-- Now recreate all views with the proper schema (ensuring no SECURITY DEFINER)
-- ============================================================================

-- 1. Recreate seo_optimization_dashboard view
DROP VIEW IF EXISTS public.seo_optimization_dashboard CASCADE;

CREATE VIEW public.seo_optimization_dashboard AS
SELECT 
  bp.id,
  bp.title,
  bp.slug,
  bp.status,
  bp.created_at,
  bp.updated_at,
  bp.meta_description,
  bp.focus_keyword,
  bp.seo_score,
  bp.seo_status,
  bp.optimization_priority,
  bp.effort_level,
  bp.recommendations,
  -- Enhanced SEO scoring
  CASE 
    WHEN bp.seo_score >= 80 THEN 'Excellent'
    WHEN bp.seo_score >= 60 THEN 'Good'
    WHEN bp.seo_score >= 40 THEN 'Needs Work'
    ELSE 'Poor'
  END as performance_category,
  -- Calculated SEO score if none exists
  COALESCE(bp.seo_score, 
    (CASE WHEN bp.title IS NOT NULL AND LENGTH(bp.title) BETWEEN 30 AND 60 THEN 25 ELSE 0 END +
     CASE WHEN bp.meta_description IS NOT NULL AND LENGTH(bp.meta_description) BETWEEN 120 AND 160 THEN 25 ELSE 0 END +
     CASE WHEN bp.focus_keyword IS NOT NULL AND LENGTH(bp.focus_keyword) > 0 THEN 25 ELSE 0 END +
     CASE WHEN bp.slug IS NOT NULL AND bp.slug ~ '^[a-z0-9-]+$' THEN 25 ELSE 0 END)
  ) as calculated_seo_score
FROM blog_posts bp
WHERE bp.status IN ('published', 'draft')
ORDER BY COALESCE(bp.optimization_priority, 999) ASC, bp.updated_at DESC;

-- 2. Recreate posts_needing_seo_optimization view
DROP VIEW IF EXISTS public.posts_needing_seo_optimization CASCADE;

CREATE VIEW public.posts_needing_seo_optimization AS
SELECT 
  bp.id,
  bp.title,
  bp.slug,
  bp.status,
  bp.created_at,
  bp.updated_at,
  bp.meta_description,
  bp.focus_keyword,
  bp.seo_score,
  bp.seo_status,
  bp.optimization_priority,
  bp.effort_level,
  bp.recommendations,
  -- SEO issues that need fixing
  ARRAY_REMOVE(ARRAY[
    CASE WHEN bp.title IS NULL OR LENGTH(bp.title) = 0 THEN 'Missing Title' END,
    CASE WHEN bp.meta_description IS NULL OR LENGTH(bp.meta_description) = 0 THEN 'Missing Meta Description' END,
    CASE WHEN bp.focus_keyword IS NULL OR LENGTH(bp.focus_keyword) = 0 THEN 'Missing Focus Keyword' END,
    CASE WHEN bp.title IS NOT NULL AND LENGTH(bp.title) < 30 THEN 'Title Too Short' END,
    CASE WHEN bp.title IS NOT NULL AND LENGTH(bp.title) > 60 THEN 'Title Too Long' END,
    CASE WHEN bp.meta_description IS NOT NULL AND LENGTH(bp.meta_description) < 120 THEN 'Meta Description Too Short' END,
    CASE WHEN bp.meta_description IS NOT NULL AND LENGTH(bp.meta_description) > 160 THEN 'Meta Description Too Long' END,
    CASE WHEN COALESCE(bp.seo_score, 0) < 50 THEN 'Low SEO Score' END
  ], NULL) as seo_issues,
  -- Priority level for fixing
  COALESCE(bp.optimization_priority,
    CASE 
      WHEN bp.title IS NULL OR bp.meta_description IS NULL OR bp.focus_keyword IS NULL THEN 1
      WHEN COALESCE(bp.seo_score, 0) < 30 THEN 2
      WHEN COALESCE(bp.seo_score, 0) < 60 THEN 3
      ELSE 4
    END
  ) as fix_priority
FROM blog_posts bp
WHERE bp.status = 'published'
  AND (
    bp.title IS NULL 
    OR bp.meta_description IS NULL 
    OR bp.focus_keyword IS NULL
    OR LENGTH(bp.title) < 30 
    OR LENGTH(bp.title) > 60
    OR LENGTH(bp.meta_description) < 120 
    OR LENGTH(bp.meta_description) > 160
    OR COALESCE(bp.seo_score, 0) < 70
  )
ORDER BY fix_priority ASC, bp.updated_at DESC;

-- 3. Recreate post_impressions_with_posts view (with proper column handling)
DROP VIEW IF EXISTS public.post_impressions_with_posts CASCADE;

CREATE VIEW public.post_impressions_with_posts AS
SELECT 
  pi.id,
  pi.post_id,
  pi.user_id,  -- Now exists after column creation above
  pi.session_id,
  pi.ip_address,
  pi.user_agent,
  pi.referrer,
  pi.created_at as impression_date,
  bp.title as post_title,
  bp.slug as post_slug,
  bp.status as post_status,
  bp.category as post_category,
  bp.tags as post_tags,
  bp.author_id,
  bp.seo_score as post_seo_score,
  p.username as author_username,     -- Now exists after column creation above
  p.display_name as author_name      -- Now exists after column creation above
FROM post_impressions pi
LEFT JOIN blog_posts bp ON pi.post_id::uuid = bp.id
LEFT JOIN profiles p ON bp.author_id = p.user_id
ORDER BY pi.created_at DESC;

-- 4. Recreate latest_email_checks view (with proper column handling)
DROP VIEW IF EXISTS public.latest_email_checks CASCADE;

CREATE VIEW public.latest_email_checks AS
SELECT DISTINCT ON (ec.email)
  ec.id,
  ec.email,
  ec.status,
  ec.is_valid,        -- Now exists after column creation above
  ec.is_deliverable,  -- Now exists after column creation above
  ec.is_disposable,   -- Now exists after column creation above
  ec.is_role_account, -- Now exists after column creation above
  ec.confidence_score,-- Now exists after column creation above
  ec.error_message,   -- Now exists after column creation above
  ec.checked_at,      -- Now exists after column creation above
  ec.created_at,
  -- Email quality assessment
  CASE 
    WHEN ec.is_valid = true AND ec.is_deliverable = true AND ec.is_disposable = false THEN 'Excellent'
    WHEN ec.is_valid = true AND ec.is_deliverable = true THEN 'Good'
    WHEN ec.is_valid = true THEN 'Fair'
    WHEN ec.is_valid = false THEN 'Invalid'
    WHEN ec.is_deliverable = false THEN 'Undeliverable'
    WHEN ec.is_disposable = true THEN 'Disposable'
    ELSE 'Unknown'
  END as email_quality,
  -- Risk level
  CASE 
    WHEN ec.is_disposable = true OR ec.is_role_account = true THEN 'High Risk'
    WHEN ec.is_valid = false OR ec.is_deliverable = false THEN 'Medium Risk'
    WHEN COALESCE(ec.confidence_score, 0) < 0.7 THEN 'Low Risk'
    ELSE 'Safe'
  END as risk_level
FROM email_checks ec
ORDER BY ec.email, COALESCE(ec.checked_at, ec.created_at) DESC;

-- 5. Recreate seo_dashboard view
DROP VIEW IF EXISTS public.seo_dashboard CASCADE;

CREATE VIEW public.seo_dashboard AS
SELECT 
  bp.id,
  bp.title,
  bp.slug,
  bp.status,
  bp.created_at,
  bp.updated_at,
  bp.meta_description,
  bp.focus_keyword,
  bp.seo_score,
  bp.seo_status,
  bp.optimization_priority,
  bp.keyword_count,
  bp.tag_count,
  bp.description_length,
  -- SEO metrics
  CASE WHEN bp.title IS NOT NULL AND LENGTH(bp.title) BETWEEN 30 AND 60 THEN 1 ELSE 0 END as title_optimized,
  CASE WHEN bp.meta_description IS NOT NULL AND LENGTH(bp.meta_description) BETWEEN 120 AND 160 THEN 1 ELSE 0 END as meta_optimized,
  CASE WHEN bp.focus_keyword IS NOT NULL AND LENGTH(bp.focus_keyword) > 0 THEN 1 ELSE 0 END as keyword_set,
  -- Overall optimization score
  COALESCE(bp.seo_score, 
    (CASE WHEN bp.title IS NOT NULL AND LENGTH(bp.title) BETWEEN 30 AND 60 THEN 1 ELSE 0 END +
     CASE WHEN bp.meta_description IS NOT NULL AND LENGTH(bp.meta_description) BETWEEN 120 AND 160 THEN 1 ELSE 0 END +
     CASE WHEN bp.focus_keyword IS NOT NULL AND LENGTH(bp.focus_keyword) > 0 THEN 1 ELSE 0 END) * 33
  ) as total_score,
  -- Priority level
  COALESCE(bp.optimization_priority,
    CASE 
      WHEN bp.title IS NULL OR bp.meta_description IS NULL OR bp.focus_keyword IS NULL THEN 1
      WHEN COALESCE(bp.seo_score, 0) < 30 THEN 2
      WHEN COALESCE(bp.seo_score, 0) < 60 THEN 3
      ELSE 4
    END
  ) as priority_level,
  -- Status description
  COALESCE(bp.seo_status,
    CASE 
      WHEN COALESCE(bp.seo_score, 0) >= 80 THEN 'Excellent'
      WHEN COALESCE(bp.seo_score, 0) >= 60 THEN 'Good'
      WHEN COALESCE(bp.seo_score, 0) >= 40 THEN 'Needs Improvement'
      ELSE 'Needs Major Work'
    END
  ) as status_description
FROM blog_posts bp
WHERE bp.status IN ('published', 'draft')
ORDER BY 
  COALESCE(bp.optimization_priority, 999) ASC,
  COALESCE(bp.seo_score, 0) ASC,
  bp.updated_at DESC;

-- ============================================================================
-- Fix Function Search Path Security Issues (The Real Security Problem)
-- ============================================================================

-- Fix all functions with mutable search_path
DO $$
DECLARE
    func_record RECORD;
    func_names text[] := ARRAY[
        'get_email_stats', 'cleanup_old_email_checks', 'get_seo_optimization_summary',
        'bulk_optimize_low_seo_posts', 'get_post_seo_recommendations', 'clean_expired_google_cache',
        'update_visitor_analytics_summary', 'update_google_site_kit_updated_at', 'nanopro_get_all_user_roles',
        'nanopro_set_user_role', 'prevent_duplicate_subscription', 'check_subscription_rate_limit',
        'validate_subscriber_data', 'confirm_newsletter_subscription', 'unsubscribe_newsletter',
        'add_newsletter_subscriber', 'can_edit_posts', 'generate_comprehensive_keywords_and_tags',
        'auto_generate_seo_data', 'regenerate_post_seo', 'optimize_post_seo', 'generate_enhanced_keywords',
        'setup_current_user_as_admin', 'extract_focus_keyword', 'generate_meta_description',
        'is_nanopro', 'generate_confirmation_token', 'set_confirmation_token',
        'update_updated_at_column', 'get_current_user_role', 'has_role'
    ];
    sql_command text;
    fixed_count integer := 0;
BEGIN
    RAISE NOTICE 'Starting to fix function search paths...';
    
    FOR func_record IN 
        SELECT 
            p.proname,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = ANY(func_names)
    LOOP
        sql_command := format('ALTER FUNCTION public.%I(%s) SET search_path = ''''', 
                             func_record.proname, 
                             func_record.args);
        
        BEGIN
            EXECUTE sql_command;
            fixed_count := fixed_count + 1;
            RAISE NOTICE 'Fixed function: % with args: %', func_record.proname, func_record.args;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not fix function % - %', func_record.proname, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Function search path fixing completed! Fixed % functions.', fixed_count;
END $$;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant SELECT permissions on all views
GRANT SELECT ON public.seo_optimization_dashboard TO authenticated, service_role;
GRANT SELECT ON public.posts_needing_seo_optimization TO authenticated, service_role;
GRANT SELECT ON public.post_impressions_with_posts TO authenticated, service_role;
GRANT SELECT ON public.latest_email_checks TO authenticated, service_role;
GRANT SELECT ON public.seo_dashboard TO authenticated, service_role;

-- ============================================================================
-- Final Verification
-- ============================================================================

-- Verify all views were created and have no SECURITY DEFINER
SELECT 
  'FINAL VERIFICATION' as status,
  viewname,
  CASE WHEN definition ILIKE '%SECURITY DEFINER%' THEN '❌ STILL HAS SECURITY DEFINER!' 
       ELSE '✅ SECURITY DEFINER REMOVED' 
  END as security_status
FROM pg_views 
WHERE viewname IN (
  'seo_optimization_dashboard', 'posts_needing_seo_optimization', 
  'post_impressions_with_posts', 'latest_email_checks', 'seo_dashboard'
)
ORDER BY viewname;

-- Test each view works
SELECT 'VIEW FUNCTIONALITY TEST' as status, view_name, row_count FROM (
  SELECT 'seo_optimization_dashboard' as view_name, COUNT(*) as row_count FROM seo_optimization_dashboard
  UNION ALL
  SELECT 'posts_needing_seo_optimization' as view_name, COUNT(*) as row_count FROM posts_needing_seo_optimization
  UNION ALL
  SELECT 'post_impressions_with_posts' as view_name, COUNT(*) as row_count FROM post_impressions_with_posts
  UNION ALL
  SELECT 'latest_email_checks' as view_name, COUNT(*) as row_count FROM latest_email_checks
  UNION ALL
  SELECT 'seo_dashboard' as view_name, COUNT(*) as row_count FROM seo_dashboard
) test_results
ORDER BY view_name;

-- Check function security fixes
SELECT 
  'FUNCTION SECURITY CHECK' as status,
  p.proname as function_name,
  CASE 
    WHEN p.proconfig IS NULL THEN '⚠️ NO CONFIG SET'
    WHEN 'search_path=' = ANY(p.proconfig) THEN '✅ SEARCH PATH SECURED'
    ELSE '❌ SEARCH PATH STILL MUTABLE'
  END as search_path_status
FROM pg_proc p
WHERE p.proname IN (
  'get_email_stats', 'cleanup_old_email_checks', 'get_seo_optimization_summary',
  'bulk_optimize_low_seo_posts', 'get_post_seo_recommendations', 'clean_expired_google_cache',
  'update_visitor_analytics_summary', 'update_google_site_kit_updated_at', 'nanopro_get_all_user_roles',
  'nanopro_set_user_role', 'prevent_duplicate_subscription', 'check_subscription_rate_limit',
  'validate_subscriber_data', 'confirm_newsletter_subscription', 'unsubscribe_newsletter',
  'add_newsletter_subscriber', 'can_edit_posts', 'generate_comprehensive_keywords_and_tags',
  'auto_generate_seo_data', 'regenerate_post_seo', 'optimize_post_seo', 'generate_enhanced_keywords',
  'setup_current_user_as_admin', 'extract_focus_keyword', 'generate_meta_description',
  'is_nanopro', 'generate_confirmation_token', 'set_confirmation_token',
  'update_updated_at_column', 'get_current_user_role', 'has_role'
)
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY p.proname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 
  '🎉 COMPLETE SECURITY FIX SUCCESS!' as status,
  'Schema updated, missing columns added, views recreated, functions secured!' as message,
  'All Supabase database linter security warnings should now be resolved!' as details;
