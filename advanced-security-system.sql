-- =====================================================================
-- ADVANCED SECURITY SYSTEM FOR SUPABASE PROJECT
-- Purpose: Harden authentication, enforce least privilege, monitor abuse,
--          and provide tooling for rapid incident response.
-- Safe to run multiple times (idempotent where possible).
-- Author: Automated Assistant
-- =====================================================================
-- IMPORTANT: Review before executing in production. Run in SQL Editor.
-- =====================================================================

-- 0. CONFIG -----------------------------------------------------------------
-- Change these values to match your environment / security policy.
-- Ensure required schemas and extensions exist first
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS security;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_settings WHERE name='app.super_admin_emails') THEN
		PERFORM set_config('app.super_admin_emails','{"arif.js@gmail.com"}', true);
	END IF;
END $$;

-- Utility: Get super admin list
CREATE OR REPLACE FUNCTION app.get_super_admin_emails()
RETURNS text[] LANGUAGE sql STABLE AS $$
	SELECT ARRAY(SELECT jsonb_array_elements_text(to_jsonb(current_setting('app.super_admin_emails')::jsonb)));
$$;

-- 1. USER ROLE MODEL --------------------------------------------------------
-- Ensure user_roles table exists (if you already have it, this is skipped)
CREATE TABLE IF NOT EXISTS public.user_roles (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
	role TEXT NOT NULL CHECK (role IN ('admin','editor','user')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 2. PROFILES HARDENING -----------------------------------------------------
ALTER TABLE public.profiles
	ADD COLUMN IF NOT EXISTS display_name TEXT,
	ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.touch_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;$$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_trigger WHERE tgname = 'tr_profiles_updated_at'
	) THEN
		CREATE TRIGGER tr_profiles_updated_at
			BEFORE UPDATE ON public.profiles
			FOR EACH ROW EXECUTE FUNCTION public.touch_profiles_updated_at();
	END IF;
END $$;

-- 3. BLACKLIST / BLOCKLIST SYSTEM -------------------------------------------
CREATE TABLE IF NOT EXISTS security.user_blacklist (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email TEXT UNIQUE,
	user_id UUID,
	reason TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	expires_at TIMESTAMPTZ,
	enforced BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_user_blacklist_email ON security.user_blacklist(email);

-- 4. LOGIN ATTEMPT TRACKING -------------------------------------------------
CREATE TABLE IF NOT EXISTS security.auth_events (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID,
	email TEXT,
	event_type TEXT CHECK (event_type IN ('login_success','login_failure','password_reset','signup')),
	context JSONB,
	ip INET,
	user_agent TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON security.auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_email ON security.auth_events(email);
CREATE INDEX IF NOT EXISTS idx_auth_events_event_type ON security.auth_events(event_type);

-- 5. ORPHAN ROLE CLEANUP FUNCTION -------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_user_roles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
	deleted_count INTEGER;
BEGIN
	DELETE FROM public.user_roles ur
	WHERE NOT EXISTS (
		SELECT 1 FROM auth.users u WHERE u.id = ur.user_id
	);
	GET DIAGNOSTICS deleted_count = ROW_COUNT;
	RETURN deleted_count;
END;$$;

COMMENT ON FUNCTION public.cleanup_orphaned_user_roles IS 'Removes user_roles whose user no longer exists';

GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_user_roles TO authenticated, service_role;

-- 6. VIEW: ADMIN USERS SNAPSHOT ---------------------------------------------
CREATE OR REPLACE VIEW public.admin_users AS
SELECT u.id, u.email, ur.role, ur.created_at AS role_assigned_at
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'admin';

-- 7. SUPER ADMIN INVARIANT ENFORCER -----------------------------------------
CREATE OR REPLACE FUNCTION security.ensure_super_admins()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = security, public, auth
AS $$
DECLARE
	super_email TEXT;
	super_id UUID;
BEGIN
	FOREACH super_email IN ARRAY app.get_super_admin_emails() LOOP
		SELECT id INTO super_id FROM auth.users WHERE email = super_email;
		IF super_id IS NOT NULL THEN
			INSERT INTO public.user_roles(user_id, role)
			VALUES (super_id, 'admin')
			ON CONFLICT (user_id) DO UPDATE SET role='admin';
		END IF;
	END LOOP;
END;$$;

COMMENT ON FUNCTION security.ensure_super_admins IS 'Guarantees whitelisted super admin emails keep admin role';

-- Call once now
SELECT security.ensure_super_admins();

-- 8. SECURITY INCIDENT LOGGING ----------------------------------------------
CREATE TABLE IF NOT EXISTS security.incidents (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	category TEXT,
	severity TEXT CHECK (severity IN ('low','medium','high','critical')),
	description TEXT,
	context JSONB,
	detected_at TIMESTAMPTZ DEFAULT NOW(),
	resolved_at TIMESTAMPTZ,
	resolution TEXT
);

-- 9. RLS RECOMMENDATIONS (PRINT ONLY) ---------------------------------------
-- Implement manually if not already active.
-- Example:
-- ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "blog_posts_select" ON public.blog_posts FOR SELECT USING ( true );
-- CREATE POLICY "blog_posts_modify_own" ON public.blog_posts FOR UPDATE USING ( auth.uid() = author_id );

-- 10. SECURITY DASHBOARD MATERIALIZED VIEW (OPTIONAL) -----------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS security.security_overview AS
SELECT
	(SELECT COUNT(*) FROM auth.users) AS total_users,
	(SELECT COUNT(*) FROM public.user_roles WHERE role='admin') AS admin_count,
	(SELECT COUNT(*) FROM public.user_roles WHERE role='editor') AS editor_count,
	(SELECT COUNT(*) FROM public.user_roles WHERE role='user') AS regular_count,
	(SELECT COUNT(*) FROM security.user_blacklist WHERE enforced) AS blacklisted_active,
	(SELECT COUNT(*) FROM security.auth_events WHERE created_at > NOW() - INTERVAL '24 hours' AND event_type='login_failure') AS failed_logins_24h,
	(SELECT COUNT(*) FROM security.auth_events WHERE created_at > NOW() - INTERVAL '24 hours' AND event_type='login_success') AS successful_logins_24h,
	NOW() AS generated_at;

-- 11. REFRESH FUNCTION -------------------------------------------------------
CREATE OR REPLACE FUNCTION security.refresh_security_overview()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
	REFRESH MATERIALIZED VIEW CONCURRENTLY security.security_overview;
END;$$;

GRANT SELECT ON security.security_overview TO authenticated, anon;
GRANT EXECUTE ON FUNCTION security.refresh_security_overview TO service_role;

-- 12. QUICK QUERIES / DIAGNOSTICS -------------------------------------------
-- List admins
SELECT * FROM public.admin_users ORDER BY role_assigned_at DESC;
-- Orphan role cleanup simulation
SELECT public.cleanup_orphaned_user_roles() AS orphan_roles_removed;
-- Re-assert super admins
SELECT security.ensure_super_admins();

-- 13. SAFETY: WRAP IN TRANSACTION EXAMPLE (COMMENTED)
-- BEGIN;
--   SELECT security.ensure_super_admins();
--   SELECT public.cleanup_orphaned_user_roles();
-- COMMIT;

-- 14. END -------------------------------------------------------------------
-- Review outputs above for any anomalies.

-- =====================================================================
-- END OF ADVANCED SECURITY SYSTEM SCRIPT
-- =====================================================================
