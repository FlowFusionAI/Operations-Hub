-- Operations Hub MVP: Complete database schema
-- All timestamps in UTC (timestamptz), UUIDs for all PKs, org-scoped data

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'manager', 'member');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired');
CREATE TYPE template_status AS ENUM ('active', 'inactive');
CREATE TYPE instance_status AS ENUM ('pending', 'active', 'paused', 'cancelled', 'completed');
CREATE TYPE task_status AS ENUM ('pending', 'sent', 'completed');
CREATE TYPE assignee_type AS ENUM ('employee', 'manager', 'custom_email');
CREATE TYPE email_delivery_status AS ENUM ('sent', 'delivered', 'bounced');
CREATE TYPE event_status AS ENUM ('pending', 'processing', 'done', 'failed');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Organizations
CREATE TABLE organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  timezone    text NOT NULL DEFAULT 'Europe/London',
  skip_weekends boolean NOT NULL DEFAULT true,
  escalation_threshold_days integer NOT NULL DEFAULT 3,
  settings    jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Memberships (user <-> org with role)
CREATE TABLE memberships (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                    uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role                      membership_role NOT NULL DEFAULT 'member',
  notification_preferences  jsonb NOT NULL DEFAULT '{"overdue_email": true, "daily_summary": false, "escalation_email": false}',
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

CREATE INDEX idx_memberships_org_id ON memberships(org_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);

-- Invites
CREATE TABLE invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        membership_role NOT NULL DEFAULT 'member',
  token       text NOT NULL UNIQUE,
  status      invite_status NOT NULL DEFAULT 'pending',
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);

CREATE INDEX idx_invites_org_id ON invites(org_id);
CREATE INDEX idx_invites_token ON invites(token);

-- Events (queue-lite pattern for automation)
CREATE TABLE events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type             text NOT NULL,
  payload          jsonb NOT NULL DEFAULT '{}',
  status           event_status NOT NULL DEFAULT 'pending',
  idempotency_key  text UNIQUE,
  picked_up_at     timestamptz,
  retry_count      integer NOT NULL DEFAULT 0,
  max_retries      integer NOT NULL DEFAULT 3,
  error            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_org_id ON events(org_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type_status ON events(type, status);

-- Workflow Runs (execution logs for automation)
CREATE TABLE workflow_runs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id      uuid REFERENCES events(id) ON DELETE SET NULL,
  workflow_key  text NOT NULL,
  status        text NOT NULL DEFAULT 'running',
  started_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  logs          jsonb NOT NULL DEFAULT '[]',
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_runs_org_id ON workflow_runs(org_id);
CREATE INDEX idx_workflow_runs_event_id ON workflow_runs(event_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);

-- Audit Log
CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action        text NOT NULL,
  entity_type   text NOT NULL,
  entity_id     uuid,
  meta          jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_org_id ON audit_log(org_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Heartbeats (n8n health monitoring)
CREATE TABLE heartbeats (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid REFERENCES organizations(id) ON DELETE CASCADE,
  source      text NOT NULL DEFAULT 'n8n',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_heartbeats_source_created ON heartbeats(source, created_at DESC);

-- ============================================================
-- ONBOARDING MODULE TABLES
-- ============================================================

-- Onboarding Templates
CREATE TABLE onboarding_templates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              text NOT NULL,
  role_description  text,
  status            template_status NOT NULL DEFAULT 'active',
  version           integer NOT NULL DEFAULT 1,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_templates_org_id ON onboarding_templates(org_id);
CREATE INDEX idx_onboarding_templates_status ON onboarding_templates(org_id, status);

-- Template Tasks
CREATE TABLE template_tasks (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id                 uuid NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  title                       text NOT NULL,
  description                 text,
  day_offset                  integer NOT NULL DEFAULT 0,
  due_offset                  integer NOT NULL DEFAULT 1,
  assignee_type               assignee_type NOT NULL DEFAULT 'employee',
  custom_email                text,
  send_channel                text NOT NULL DEFAULT 'email',
  requires_ack                boolean NOT NULL DEFAULT false,
  sort_order                  integer NOT NULL DEFAULT 0,
  blocked_by_template_task_id uuid REFERENCES template_tasks(id) ON DELETE SET NULL,
  attachments                 jsonb NOT NULL DEFAULT '[]',
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_tasks_template_id ON template_tasks(template_id);
CREATE INDEX idx_template_tasks_org_id ON template_tasks(org_id);

-- Employees
CREATE TABLE employees (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                text NOT NULL,
  email               text NOT NULL,
  start_date          date NOT NULL,
  role_title          text,
  assigned_manager_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_org_id ON employees(org_id);
CREATE INDEX idx_employees_email ON employees(org_id, email);

-- Onboarding Instances
CREATE TABLE onboarding_instances (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  template_id       uuid NOT NULL REFERENCES onboarding_templates(id) ON DELETE RESTRICT,
  template_version  integer NOT NULL,
  status            instance_status NOT NULL DEFAULT 'active',
  portal_token      text NOT NULL UNIQUE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_instances_org_id ON onboarding_instances(org_id);
CREATE INDEX idx_onboarding_instances_employee_id ON onboarding_instances(employee_id);
CREATE INDEX idx_onboarding_instances_status ON onboarding_instances(org_id, status);
CREATE INDEX idx_onboarding_instances_portal_token ON onboarding_instances(portal_token);

-- Task Instances
CREATE TABLE task_instances (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  onboarding_instance_id      uuid NOT NULL REFERENCES onboarding_instances(id) ON DELETE CASCADE,
  title                       text NOT NULL,
  description                 text,
  assignee_type               assignee_type NOT NULL,
  assignee_email              text NOT NULL,
  due_at                      timestamptz NOT NULL,
  status                      task_status NOT NULL DEFAULT 'pending',
  sent_at                     timestamptz,
  completed_at                timestamptz,
  completed_by_user_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email_status                email_delivery_status,
  blocked_by_task_instance_id uuid REFERENCES task_instances(id) ON DELETE SET NULL,
  sort_order                  integer NOT NULL DEFAULT 0,
  attachments                 jsonb NOT NULL DEFAULT '[]',
  last_reminder_sent_at       timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_instances_org_id ON task_instances(org_id);
CREATE INDEX idx_task_instances_onboarding_instance_id ON task_instances(onboarding_instance_id);
CREATE INDEX idx_task_instances_status ON task_instances(status);
CREATE INDEX idx_task_instances_due_at ON task_instances(due_at);
CREATE INDEX idx_task_instances_dispatch ON task_instances(status, due_at)
  WHERE status = 'pending';

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_onboarding_templates_updated_at
  BEFORE UPDATE ON onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_template_tasks_updated_at
  BEFORE UPDATE ON template_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_onboarding_instances_updated_at
  BEFORE UPDATE ON onboarding_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_task_instances_updated_at
  BEFORE UPDATE ON task_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instances ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: Check if current user is a member of an org
-- ============================================================

CREATE OR REPLACE FUNCTION is_org_member(check_org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = check_org_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_org_admin(check_org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = check_org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES: organizations
-- ============================================================

-- Users can read orgs they belong to
CREATE POLICY "Members can view their orgs"
  ON organizations FOR SELECT
  USING (is_org_member(id));

-- Only admins/owners can update org settings
CREATE POLICY "Admins can update their orgs"
  ON organizations FOR UPDATE
  USING (is_org_admin(id))
  WITH CHECK (is_org_admin(id));

-- Any authenticated user can create an org (they become owner)
CREATE POLICY "Authenticated users can create orgs"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- RLS POLICIES: memberships
-- ============================================================

-- Members can see other members in their org
CREATE POLICY "Members can view org memberships"
  ON memberships FOR SELECT
  USING (is_org_member(org_id));

-- Only admins can insert memberships (invite acceptance)
CREATE POLICY "Admins can create memberships"
  ON memberships FOR INSERT
  WITH CHECK (is_org_admin(org_id));

-- Only admins can update memberships
CREATE POLICY "Admins can update memberships"
  ON memberships FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

-- Only admins can remove members
CREATE POLICY "Admins can delete memberships"
  ON memberships FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: invites
-- ============================================================

CREATE POLICY "Members can view org invites"
  ON invites FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can create invites"
  ON invites FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can update invites"
  ON invites FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can delete invites"
  ON invites FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: events
-- ============================================================

CREATE POLICY "Members can view org events"
  ON events FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: workflow_runs
-- ============================================================

CREATE POLICY "Members can view org workflow runs"
  ON workflow_runs FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can create workflow runs"
  ON workflow_runs FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can update workflow runs"
  ON workflow_runs FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: audit_log
-- ============================================================

CREATE POLICY "Members can view org audit log"
  ON audit_log FOR SELECT
  USING (is_org_member(org_id));

-- Insert allowed for any member (system writes audit entries via service role,
-- but members trigger auditable actions too)
CREATE POLICY "Members can create audit entries"
  ON audit_log FOR INSERT
  WITH CHECK (is_org_member(org_id));

-- ============================================================
-- RLS POLICIES: heartbeats
-- ============================================================

-- Heartbeats with org_id: members can read
CREATE POLICY "Members can view heartbeats"
  ON heartbeats FOR SELECT
  USING (org_id IS NULL OR is_org_member(org_id));

-- Heartbeat inserts come from service role (n8n), allow for admins too
CREATE POLICY "Admins can create heartbeats"
  ON heartbeats FOR INSERT
  WITH CHECK (org_id IS NULL OR is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: onboarding_templates (admin-only write)
-- ============================================================

CREATE POLICY "Members can view org templates"
  ON onboarding_templates FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can create templates"
  ON onboarding_templates FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can update templates"
  ON onboarding_templates FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can delete templates"
  ON onboarding_templates FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: template_tasks (admin-only write)
-- ============================================================

CREATE POLICY "Members can view org template tasks"
  ON template_tasks FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can create template tasks"
  ON template_tasks FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can update template tasks"
  ON template_tasks FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can delete template tasks"
  ON template_tasks FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: employees (admin-only write)
-- ============================================================

CREATE POLICY "Members can view org employees"
  ON employees FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can create employees"
  ON employees FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can delete employees"
  ON employees FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: onboarding_instances (admin-only write)
-- ============================================================

CREATE POLICY "Members can view org onboarding instances"
  ON onboarding_instances FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can create onboarding instances"
  ON onboarding_instances FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Admins can update onboarding instances"
  ON onboarding_instances FOR UPDATE
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

-- ============================================================
-- RLS POLICIES: task_instances
-- ============================================================

CREATE POLICY "Members can view org task instances"
  ON task_instances FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can create task instances"
  ON task_instances FOR INSERT
  WITH CHECK (is_org_admin(org_id));

-- Admins and managers can update task instances (mark complete, etc.)
CREATE POLICY "Members can update task instances"
  ON task_instances FOR UPDATE
  USING (is_org_member(org_id))
  WITH CHECK (is_org_member(org_id));

-- ============================================================
-- PORTAL ACCESS: onboarding_instances and task_instances
-- The employee portal uses portal_token for access without auth.
-- These are accessed via service role in the portal API route,
-- so no additional RLS policy is needed — service role bypasses RLS.
-- ============================================================
