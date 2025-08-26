-- ============================================================================
-- Fix All Missing Columns That Cause Security Script Errors
-- Date: 2025-08-27
-- 
-- This script adds all missing columns before running security fixes
-- ============================================================================

-- Fix missing columns that cause errors in security scripts
DO $$
BEGIN
    RAISE NOTICE 'Starting comprehensive column fixes...';
    
    -- ========================================================================
    -- Fix post_impressions table
    -- ========================================================================
    
    -- Ensure post_impressions table exists
    CREATE TABLE IF NOT EXISTS public.post_impressions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add all missing columns to post_impressions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'ip_address' AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN ip_address INET;
        RAISE NOTICE '✅ Added ip_address to post_impressions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'user_agent' AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN user_agent TEXT;
        RAISE NOTICE '✅ Added user_agent to post_impressions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'referrer' AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN referrer TEXT;
        RAISE NOTICE '✅ Added referrer to post_impressions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'session_id' AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN session_id TEXT;
        RAISE NOTICE '✅ Added session_id to post_impressions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'user_id' AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN user_id UUID;
        RAISE NOTICE '✅ Added user_id to post_impressions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_impressions' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE public.post_impressions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at to post_impressions';
    END IF;
    
    -- ========================================================================
    -- Fix profiles table  
    -- ========================================================================
    
    -- Ensure profiles table exists
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add missing role column (this is critical for security policies)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
        
        -- Add constraint for valid roles
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('user', 'author', 'editor', 'admin', 'super_admin'));
        
        RAISE NOTICE '✅ Added role column to profiles with valid constraints';
    END IF;
    
    -- Add user_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'user_id' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN user_id UUID;
        RAISE NOTICE '✅ Added user_id to profiles';
    END IF;
    
    -- Add other commonly needed profile columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'username' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
        RAISE NOTICE '✅ Added username to profiles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_name' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
        RAISE NOTICE '✅ Added display_name to profiles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
        RAISE NOTICE '✅ Added email to profiles';
    END IF;
    
    -- ========================================================================
    -- Fix blog_posts table (ensure required columns exist)
    -- ========================================================================
    
    -- Ensure blog_posts table exists
    CREATE TABLE IF NOT EXISTS public.blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT,
        content TEXT,
        status TEXT DEFAULT 'draft',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add author_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'author_id' AND table_schema = 'public') THEN
        ALTER TABLE public.blog_posts ADD COLUMN author_id UUID;
        RAISE NOTICE '✅ Added author_id to blog_posts';
    END IF;
    
    -- ========================================================================
    -- Add foreign key constraints if they don't exist
    -- ========================================================================
    
    -- Add foreign key for post_impressions.user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'post_impressions' 
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        BEGIN
            ALTER TABLE public.post_impressions 
            ADD CONSTRAINT post_impressions_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id);
            RAISE NOTICE '✅ Added foreign key constraint for post_impressions.user_id';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Could not add foreign key for post_impressions.user_id (auth.users may not exist)';
        END;
    END IF;
    
    -- Add foreign key for profiles.user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'profiles' 
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        BEGIN
            ALTER TABLE public.profiles 
            ADD CONSTRAINT profiles_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id);
            RAISE NOTICE '✅ Added foreign key constraint for profiles.user_id';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Could not add foreign key for profiles.user_id (auth.users may not exist)';
        END;
    END IF;
    
    RAISE NOTICE '🎉 All missing columns have been added successfully!';
    RAISE NOTICE '📋 Now you can run the critical-security-fixes.sql script without column errors!';
END $$;

-- ============================================================================
-- Verify all required columns exist
-- ============================================================================

-- Check post_impressions columns
SELECT 
  'POST_IMPRESSIONS COLUMNS' as table_check,
  column_name,
  data_type,
  '✅ EXISTS' as status
FROM information_schema.columns 
WHERE table_name = 'post_impressions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check profiles columns
SELECT 
  'PROFILES COLUMNS' as table_check,
  column_name,
  data_type,
  CASE WHEN column_name = 'role' THEN '✅ CRITICAL FOR SECURITY' ELSE '✅ EXISTS' END as status
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check blog_posts columns
SELECT 
  'BLOG_POSTS COLUMNS' as table_check,
  column_name,
  data_type,
  '✅ EXISTS' as status
FROM information_schema.columns 
WHERE table_name = 'blog_posts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- Success message
-- ============================================================================

SELECT 
  '🎉 COLUMN FIXES COMPLETED!' as status,
  'All missing columns have been added to tables' as message,
  'You can now run critical-security-fixes.sql without errors!' as next_step;
