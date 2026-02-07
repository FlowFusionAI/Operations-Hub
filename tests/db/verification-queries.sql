-- =============================================================
-- QA Database Verification Queries
-- Run these via Supabase MCP (execute_sql) during QA checks
-- =============================================================

-- 1. Verify audit log entries exist for org creation
-- Expected: at least one 'org.created' action
SELECT id, org_id, action, entity_type, entity_id, created_at
FROM audit_log
WHERE action = 'org.created'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verify memberships exist with correct roles
-- Expected: every org has at least one 'owner' membership
SELECT m.id, m.org_id, m.user_id, m.role, m.created_at,
       o.name AS org_name
FROM memberships m
JOIN organizations o ON o.id = m.org_id
ORDER BY m.created_at DESC
LIMIT 10;

-- 3. Check for orphaned orgs (orgs with no memberships)
-- Expected: empty result (every org should have at least one member)
SELECT o.id, o.name, o.created_at
FROM organizations o
LEFT JOIN memberships m ON m.org_id = o.id
WHERE m.id IS NULL;

-- 4. Verify RLS policies are in place on key tables
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Check that all org-scoped tables have org_id column
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'org_id'
ORDER BY table_name;

-- 6. Verify no users exist without confirmed emails
-- (helps catch signup flow issues)
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 7. Count records per table (quick health check)
SELECT 'organizations' AS table_name, COUNT(*) AS row_count FROM organizations
UNION ALL
SELECT 'memberships', COUNT(*) FROM memberships
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log
UNION ALL
SELECT 'events', COUNT(*) FROM events;
