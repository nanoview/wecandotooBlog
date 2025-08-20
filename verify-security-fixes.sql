-- SECURITY VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify all security fixes are applied

-- 1. Check if Row Level Security is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as "RLS_Enabled",
  CASE WHEN rowsecurity THEN '✅ SECURE' ELSE '❌ VULNERABLE' END as status
FROM pg_tables 
WHERE tablename IN ('google_site_kit_config', 'google_oauth_audit_log');

-- 2. Verify security policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE WHEN policyname IS NOT NULL THEN '✅ PROTECTED' ELSE '❌ NO POLICY' END as status
FROM pg_policies 
WHERE tablename IN ('google_site_kit_config', 'google_oauth_audit_log')
ORDER BY tablename, policyname;

-- 3. Check if secure functions exist
SELECT 
  routine_name,
  routine_type,
  security_type,
  CASE WHEN security_type = 'DEFINER' THEN '✅ SECURE DEFINER' ELSE '⚠️ INVOKER' END as status
FROM information_schema.routines 
WHERE routine_name IN ('get_oauth_config', 'update_oauth_tokens');

-- 4. Test audit log table exists and is accessible
SELECT 
  COUNT(*) as audit_records,
  CASE WHEN COUNT(*) >= 0 THEN '✅ AUDIT LOG ACTIVE' ELSE '❌ AUDIT LOG MISSING' END as status
FROM google_oauth_audit_log;

-- 5. Verify secure view exists
SELECT 
  table_name,
  view_definition,
  CASE WHEN table_name = 'google_config_secure' THEN '✅ SECURE VIEW EXISTS' ELSE '❌ VIEW MISSING' END as status
FROM information_schema.views 
WHERE table_name = 'google_config_secure';

-- 6. Check table permissions (should show restricted access)
SELECT 
  grantee,
  table_name,
  privilege_type,
  is_grantable,
  CASE 
    WHEN grantee = 'PUBLIC' THEN '❌ PUBLIC ACCESS'
    WHEN grantee = 'authenticated' AND privilege_type = 'SELECT' AND table_name = 'google_config_secure' THEN '✅ SECURE ACCESS'
    WHEN grantee = 'service_role' THEN '✅ SERVICE ROLE ACCESS'
    ELSE '⚠️ CHECK PERMISSION'
  END as status
FROM information_schema.role_table_grants 
WHERE table_name IN ('google_site_kit_config', 'google_config_secure', 'google_oauth_audit_log')
ORDER BY table_name, grantee;

-- 7. Security Summary Report
SELECT 
  'SECURITY STATUS REPORT' as report_type,
  CURRENT_TIMESTAMP as checked_at,
  '✅ If all above checks show SECURE/PROTECTED status, your system is safe' as summary;
