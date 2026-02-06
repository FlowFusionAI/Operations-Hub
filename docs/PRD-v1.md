# Operations Hub MVP — Core Platform + Onboarding Module

## 0) Intention & Client Impact

### What this product is
Operations Hub is an operations platform that makes business processes **visible, accountable, and reliable**. It provides:
- A **process layer** (stages, owners, due dates, progress, audit trail)
- A **dashboard layer** (what's done, what's stuck, what's overdue)
- An **automation execution layer** (n8n runs tasks in the background)

Automation is **not** the product. It is an implementation detail. Users interact with process state, not "zaps".

### Why clients would buy this
Most SMEs run onboarding through scattered emails, documents, and people memory. That causes:
- missed steps
- delayed start readiness
- inconsistent training/compliance
- manager time waste
- zero visibility / "where are we at?" questions

Operations Hub solves this by turning onboarding into a **tracked workflow**:
- every employee has a known onboarding plan (template-based)
- tasks are scheduled and delivered automatically
- progress is visible to managers/admin
- reminders/escalations prevent tasks falling through cracks
- an audit log provides accountability

### MVP success definition
A client can:
1) Create an onboarding template for a role  
2) Add a new employee and assign onboarding  
3) Automatically send tasks/documents via email on schedule  
4) Track completion and overdue items in a dashboard  
5) See run history + audit trail for confidence and troubleshooting  
6) Share a read-only onboarding portal link with new employees

---

## 1) MVP Scope Summary

### Includes (MVP)
**Core Platform**
- Multi-tenant organizations (one org = one client)
- Role-based access (owner/admin/manager/member)
- Basic invite flow (email invite → join org) with defined edge cases
- Integrations registry (Google/Slack placeholders; MVP ships with transactional email via Resend/Postmark/SendGrid)
- Events + workflow runs tracking (visibility + debugging)
- Audit log (who did what, when)
- Basic settings page per org
- n8n health monitoring (heartbeat + dashboard alert)

**Module 1: Onboarding**
- Template builder (tasks with assignee types, documents as attachments, schedule offsets, optional simple dependencies)
- Template versioning (auto-increment on edit, version stored on instances)
- Employee onboarding instances (created from templates, supports multiple per employee)
- Automatic task scheduling and delivery (email via transactional provider)
- Task completion tracking (by admin/manager; employee portal as stretch)
- Overdue detection + reminders with escalation
- Manager dashboards (progress, overdue, by employee, "today" view)
- Employee onboarding portal (read-only, token-secured)
- Dry-run template preview
- Bulk onboarding start
- Email delivery status tracking (sent/delivered/bounced)

**Automation Engine**
- n8n self-hosted (recommended) orchestrating scheduled sends/reminders
- Supabase as source of truth for all state
- Standard event types and run logging
- Idempotency guarantees on all workflows
- Heartbeat monitoring

### Excludes (Out of Scope for MVP)
- Multi-department modules beyond onboarding (lead handling, approvals, etc.)
- Advanced workflow builder (branching, conditions, approvals)
- Complex permissions (custom roles, per-department permissions)
- In-app chat, commenting, employee Q&A
- Full document signing integration (DocuSign) — can be added later
- AI features (summaries, recommendations) — explicitly postponed
- Complex task dependency graphs (only simple `blocked_by` supported)

---

## 2) Key Product Principles (Non-negotiable)

1) **State-first design**
   - All operational truth lives in Supabase (Postgres).
   - n8n executes actions and writes results back, but does not own business state.

2) **Template → Instance immutability**
   - Templates can evolve (versioned), but each onboarding instance snapshots tasks at creation time.
   - Changing a template must not silently alter existing employee onboarding plans.
   - Each instance records which template version it was created from.

3) **Visibility and recovery**
   - Every automation action produces a `workflow_run` record.
   - Failures are visible in UI and can be retried (retry emits a new event).
   - n8n health is monitored via heartbeat; stale heartbeats surface in the dashboard.

4) **Multi-tenancy by default**
   - All data is scoped by `org_id`.
   - Enforce using Supabase RLS policies with the `SET` variable pattern for performance.

5) **Idempotency by default**
   - All automation workflows must be safe to re-run.
   - Status guards and idempotency keys prevent duplicate processing.

6) **Timezone correctness**
   - All timestamps stored in UTC.
   - Conversion to org timezone at display time and scheduling time.
   - Scheduling logic accounts for weekends (configurable).

---

## 3) Roles & Permissions

### Roles
- **Owner/Admin**
  - Manage org settings
  - Create/edit templates
  - Add employees and start onboarding
  - View all dashboards, runs, audit logs
  - Manage integrations
- **Manager**
  - View assigned employees and onboarding progress
  - Mark tasks complete (if needed)
  - View overdue items for their scope
  - Receive escalation notifications (configurable)
- **Member**
  - (MVP) Read-only access to dashboards or none, depending on implementation
  - Can be used for internal staff viewers later

> MVP simplifying assumption: Implement Owner/Admin + Manager. Member is optional.

### Notification Preferences
Each membership record includes a `notification_preferences` JSONB column:
- `overdue_email`: boolean (default true for managers)
- `daily_summary`: boolean (default false)
- `escalation_email`: boolean (default true for admins)

This prevents notification spam for managers who prefer checking the dashboard.

---

## 4) Core Data Model (Conceptual)

### Core Platform Entities
- **Organization**: name, timezone (default Europe/London), settings
- **Membership**: user ↔ org with role + notification_preferences (JSONB)
- **Invite**: email, role, token, status (pending/accepted/expired), expires_at
- **Integration**: connected service metadata
- **Event**: automation trigger with idempotency support
- **Workflow Run**: execution log
- **Audit Log**: business actions
- **Heartbeat**: n8n health tracking

### Onboarding Module Entities
- **Onboarding Template**: name, role_description, status (active/inactive), version (integer, auto-increment on edit)
- **Template Task**: title, description, day_offset, due_offset, assignee_type (employee/manager/custom_email), custom_email (nullable), send_channel, requires_ack, sort_order, blocked_by_template_task_id (nullable), attachments (JSONB array of {name, url})
- **Employee**: name, email, start_date, role_title (optional), assigned_manager_id (optional)
- **Onboarding Instance**: employee_id, template_id, template_version, status, created_at, completed_at, portal_token
- **Task Instance**: onboarding_instance_id, title, description, assignee_type, assignee_email, due_at, status, sent_at, completed_at, completed_by_user_id, email_status (sent/delivered/bounced), blocked_by_task_instance_id (nullable), sort_order, attachments (JSONB)

> **Design decision: Documents merged into tasks.** Rather than maintaining separate Document/DocumentInstance entities, documents are stored as attachments on tasks (JSONB array of `{name, url}`). This eliminates entity proliferation and ambiguity around document lifecycle. A task can have zero or many attachments.

---

## 5) Business Logic — Core Platform

### 5.1 Organization & Membership
**Create org**
- When a user signs up, they can create an org (becomes Owner/Admin).
- Minimal org settings: name, timezone (default Europe/London), skip_weekends (default true).

**Invite member**
- Admin inputs email + role.
- System creates `invite` token and sends email.
- Invite tokens expire in 7 days.
- Expired invites can be re-sent (updates existing invite rather than creating duplicate).
- If the invitee already has an account, they log in and accept; if not, they sign up first.
- Accepting an invite to Org B does not affect existing membership in Org A.
- Duplicate invites to the same email within the same org update the existing invite.
- Invite link allows signup/login and acceptance.
- On acceptance: create membership row, mark invite as accepted.

**RLS requirement**
- Any read/write must validate membership in org.
- Use the Supabase `SET` variable pattern for performance:
  - At the start of each request, set `app.current_org_id` to the user's active org.
  - RLS policies use `USING (org_id = current_setting('app.current_org_id')::uuid)`.
  - This avoids the slow subquery pattern on every row access.
- Admin-only endpoints (template CRUD, employee creation, runs viewing, audit viewing).

---

### 5.2 Events (Trigger Mechanism)
Operations Hub uses an `events` table as a "queue-lite" and integration boundary.

**Event fields**
- `id` (uuid)
- `type` (string)
- `org_id`
- `payload` (json)
- `status`: pending → processing → done/failed
- `idempotency_key` (string, unique, nullable) — prevents duplicate processing
- `picked_up_at` (timestamp, nullable) — set when n8n starts processing
- `retry_count` (integer, default 0)
- `max_retries` (integer, default 3)
- `error` (text, nullable)
- `created_at`, `updated_at`

**Event lifecycle**
1) App inserts event = `pending` (with optional idempotency_key)
2) n8n picks up pending events by type, sets `picked_up_at` and status = `processing`
3) n8n performs actions
4) n8n updates state + creates workflow_run + sets event `done` or `failed`
5) If failed and `retry_count < max_retries`, event can be retried (increment retry_count)

**Duplicate prevention**
- Before picking up an event, check that `picked_up_at` is NULL or older than a timeout threshold (e.g., 10 minutes — indicates a crashed worker).
- If `idempotency_key` is set, reject duplicate inserts.

**MVP rule**
- Every automation workflow must create a `workflow_run` row with:
  - workflow_key, status, timestamps, logs/error

---

### 5.3 n8n Health Monitoring
**Heartbeat mechanism**
- n8n runs a simple cron (every 30 minutes) that writes a row to a `heartbeats` table:
  - `source`: "n8n"
  - `timestamp`: now()
- The dashboard checks the most recent heartbeat.
- If the latest heartbeat is older than 90 minutes, display a warning banner: "Automation engine may be offline."
- Audit log entry: `system.heartbeat_stale` (emitted once when staleness detected).

---

### 5.4 Audit Log (Accountability)
Every meaningful business action creates an audit record:
- Template created/updated (with version number)
- Employee created
- Onboarding started/paused/resumed/completed/cancelled
- Task sent
- Task completed
- Task email bounced
- Reminder sent
- Escalation sent
- Workflow failure recorded
- Retry triggered
- Heartbeat stale detected

Audit entries include:
- `actor_user_id` (nullable for system)
- `action` string
- `entity_type` + `entity_id`
- `meta` json (small payload summary)
- `org_id`
- `created_at`

---

## 6) Business Logic — Onboarding Module

### 6.1 Templates
**Template purpose**
A template is a reusable onboarding plan per role (e.g., "Receptionist v1").

**Template composition**
- Tasks: title, description, day_offset, due_offset, assignee_type, custom_email (if assignee_type = custom_email), send_channel, requires_ack, sort_order, blocked_by_template_task_id (nullable), attachments (JSONB array of {name, url})

**Assignee types (per task)**
- `employee` — task is sent to the new hire (default)
- `manager` — task is sent to the assigned manager (e.g., "Prepare laptop")
- `custom_email` — task is sent to a specific email address (e.g., IT team: it@company.com)

**Template versioning**
- Each template has a `version` integer field, starting at 1.
- Every edit (save) increments the version.
- When an onboarding instance is created, it records `template_version`.
- This enables debugging: "Employee X got tasks from Receptionist template v3, Employee Y from v5."

**Template rules**
- A template can be set Active/Inactive.
- Only Active templates can be used to start new onboarding instances.
- Updating a template only affects **future instances**, not existing ones.

**Dry-run preview**
- Admin can preview a template against a hypothetical start date.
- System computes the full task schedule (titles, due dates, assignees) and displays it.
- This is a pure frontend/API computation — no records are created.
- Helps catch scheduling mistakes before real onboarding begins.

---

### 6.2 Employees
**Employee creation**
- Admin adds employee record: name, email, start_date, role title (optional), assigned manager (optional).
- This does not start onboarding automatically unless explicitly selected.
- An employee can have **multiple simultaneous onboarding instances** (e.g., role change, department transfer). The relationship is `employee → [onboarding_instances]`.

---

### 6.3 Starting Onboarding (Template → Instance)

**Single start**
- Admin selects employee + template → "Start onboarding"

**Bulk start**
- Admin selects multiple employees + one template → "Start onboarding for all"
- System loops through each employee and creates instances independently.
- Partial failures are reported (e.g., "3 of 5 started successfully; 2 failed — see errors").

**When onboarding starts (per employee)**
- System creates:
  - `onboarding_instance` (status = `active`, template_version = current template version, portal_token = secure random token)
  - `task_instances` materialized from template_tasks
- System emits event: `onboarding.instance_created`

**Onboarding instance lifecycle**
```
pending → active → completed
                 ↘ paused → active (resume)
                          ↘ cancelled
active → cancelled
```

- `active`: tasks are being delivered and tracked
- `paused`: no further task delivery; existing sent tasks remain; can be resumed
- `cancelled`: terminal state; no further delivery; audit trail preserved
- `completed`: all tasks done; auto-transitions when last task completes

**Pause rules**: pausing stops the daily dispatch from sending new tasks for this instance but does not recall already-sent tasks.

**Cancel rules**: cancelling is irreversible. The instance and all task records remain for audit purposes. Future tasks are not sent.

**Task instance materialization rules**
- Each task instance copies title/description/sort_order/assignee_type/attachments from template for immutability.
- `assignee_email` is resolved at materialization:
  - If `assignee_type = employee` → employee.email
  - If `assignee_type = manager` → manager's email (from employee.assigned_manager_id → user email)
  - If `assignee_type = custom_email` → template_task.custom_email
- `due_at` is computed from:
  - `employee.start_date + task.day_offset` (in calendar days)
  - Plus time-of-day rule (default 09:00 org timezone)
  - If `org.skip_weekends = true` and computed date falls on Saturday/Sunday, push to next Monday
- `blocked_by_task_instance_id` is resolved from template task dependency graph
- Initial status = `pending`

**Timezone & scheduling rules**
- All `due_at` timestamps stored as UTC.
- Computation: take `employee.start_date` (date), add `day_offset` days, set time to 09:00 in org timezone, convert to UTC.
- Weekend skip: if the resulting local date is Saturday, add 2 days; if Sunday, add 1 day.

---

### 6.4 Task Delivery (Email)
**Delivery mechanism**
- n8n runs daily scheduler (cron) at a fixed time (e.g., 08:00 org timezone)
- It selects tasks with:
  - parent onboarding instance status = `active`
  - status = `pending`
  - `due_at` <= now (in UTC)
  - `blocked_by_task_instance_id` is NULL or the blocking task has status = `completed`
- For each task, send email to `assignee_email` via transactional email provider
- Update task status: `pending` → `sent`, set `sent_at`
- Set `email_status` = `sent` (updated to `delivered` or `bounced` via provider webhook callback)
- Emit audit log: `onboarding.task_sent`

**Idempotency rule**
- Only send tasks where `status = 'pending'` — the status update to `sent` is performed atomically.
- If the cron runs twice, tasks already marked `sent` are skipped.
- Each dispatch run generates a single `workflow_run` record summarizing tasks processed.

**Email content**
- Must include: task title, description, due date, contact info, attachments (as links), and completion instructions.
- Completion mechanism (MVP): Admin/Manager marks complete in portal.
- Stretch: Employee clicks secure link "I completed this" from the employee portal.

**Email delivery tracking**
- Use transactional email provider webhooks (Resend/Postmark/SendGrid all support this).
- On `delivered` webhook → update `email_status` = `delivered`
- On `bounced` webhook → update `email_status` = `bounced`, emit audit log `onboarding.task_bounced`
- Bounced tasks are flagged in the dashboard for admin attention.

**Email provider selection (MVP)**
- Use a transactional email service (Resend, Postmark, or SendGrid) — NOT raw SMTP.
- Raw SMTP from a new domain will land in spam. Transactional providers handle deliverability, SPF/DKIM, and provide webhook callbacks.
- Budget: ~$20/month for MVP volume.
- Store email templates in code for now.

---

### 6.5 Task Completion
**Completion rule**
- A task is "complete" when:
  - status set to `completed`
  - `completed_at` set
  - `completed_by_user_id` set (if completed internally)

**On completion**
- Write audit log: `onboarding.task_completed`
- Check if any tasks are blocked by this task → if the blocked task is now unblocked and `due_at` has passed, it becomes eligible for next dispatch.
- If all tasks in the instance are completed:
  - onboarding_instance status becomes `completed`
  - `completed_at` set
  - emit audit log: `onboarding.instance_completed`
  - emit event: `onboarding.instance_completed` (available for future webhook/integration use)

---

### 6.6 Overdue & Reminders
**Overdue definition**
- If `now > due_at` AND status in (`pending`, `sent`) → task is considered overdue.
- Overdue is a computed state, not a stored status. Tasks remain in their current status (`pending`/`sent`) — the UI flags them as overdue based on the time comparison.

**Reminder scheduler**
- n8n runs daily:
  - finds tasks where `now > due_at` AND status in (`pending`, `sent`) AND parent instance is `active`
  - sends reminder email to assignee
  - logs workflow_run + audit entry: `onboarding.reminder_sent`

**Escalation (MVP)**
- After N days overdue (configurable, default 3), also email the assigned manager and/or admin.
- Escalation respects notification preferences on membership records.
- Audit entry: `onboarding.escalation_sent`

**Reminder idempotency**
- Track `last_reminder_sent_at` on task instances.
- Only send a reminder if `last_reminder_sent_at` is NULL or older than 24 hours.
- This prevents duplicate reminders if the cron runs multiple times.

---

### 6.7 Employee Onboarding Portal
**Purpose**: A simple, read-only page for the new employee to see their onboarding progress. High perceived value, low implementation cost.

**Access mechanism**
- Each onboarding instance has a `portal_token` (secure random string, generated at creation).
- Portal URL: `https://app.Operations Hub.com/portal/{portal_token}`
- No authentication required — the token itself provides access (similar to shared Google Docs links).

**Portal content**
- Employee name, role, start date
- Onboarding progress bar (% of tasks completed)
- Task list with status indicators (pending, sent, completed, overdue)
- Due dates for upcoming tasks
- Attachments/document links for completed/sent tasks
- Contact info for their manager

**Security**
- Portal tokens are long (32+ characters), random, and unguessable.
- Portal is read-only — no state mutations.
- Optionally: tokens can be revoked (set to null) when onboarding is cancelled.

**Stretch (post-MVP)**: Allow employees to mark tasks as "completed" via the portal (adds a button + simple mutation).

---

## 7) UI / Pages (MVP)

### Authentication
- Login / Signup (Supabase Auth)
- Org selection (if user belongs to multiple orgs — can be postponed)

### Core Platform
1) **Dashboard (Org Overview) — "Today" view as default**
   - **Today section** (top priority):
     - Tasks due today (count + list)
     - Tasks newly overdue (became overdue in last 24h)
     - Onboardings starting this week
     - Tasks with bounced emails requiring attention
   - **Summary section**:
     - Active onboarding count
     - Overdue tasks count
     - Recent activity (audit log preview, last 10 entries)
     - Recent failures (workflow runs with errors)
   - **Health indicator**: n8n heartbeat status (green/amber/red)

2) **Employees**
   - List employees (with search/filter)
   - Create employee
   - Employee detail: all onboarding instances (current + historical), progress per instance, task table with status/assignee/due date, attachments

3) **Onboarding Templates**
   - List templates (with version numbers)
   - Create/edit template (tasks with assignee types + day offsets + attachments + optional blocked_by)
   - Activate/deactivate template
   - **Dry-run preview**: select a hypothetical start date → see computed schedule
   - Version history (which version, when changed)

4) **Onboarding Instances**
   - List active instances
   - Filter by status (active/completed/paused/cancelled)
   - Quick view: progress %, overdue count, template version
   - **Bulk start**: select employees + template → start all
   - Actions: pause, resume, cancel

5) **Runs (Automation Visibility)**
   - Workflow run list: status, workflow_key, time, error snippet
   - Filter by failed
   - "Retry" on failed runs (emits an event)

6) **Audit Log**
   - Timeline list
   - Filter by action/entity type/date range

7) **Settings**
   - Org name, timezone
   - Skip weekends toggle (default: on)
   - Overdue escalation threshold (default: 3 days)
   - Integration placeholders (show connected status)

8) **Employee Portal** (public, token-secured)
   - See section 6.7 above

---

## 8) API Contracts / Event Types (MVP)

### Event types (minimum)
- `onboarding.instance_created`
  - payload: `{ onboarding_instance_id }`
- `onboarding.instance_completed`
  - payload: `{ onboarding_instance_id, employee_id }`
  - (available for future webhook/external integration)
- `onboarding.daily_dispatch`
  - payload: `{ org_id, run_date }` (optional, cron can call directly)
- `onboarding.reminder_dispatch`
  - payload: `{ org_id, run_date }` (optional)
- `system.retry_workflow_run`
  - payload: `{ workflow_run_id }` OR `{ event_id }`
- `system.heartbeat`
  - payload: `{ source: "n8n" }`

> Keep events as small pointers (IDs) and load full context from DB.

### Workflow keys (for run history)
- `onboarding_materialize_tasks`
- `onboarding_send_due_tasks`
- `onboarding_send_overdue_reminders`
- `system_retry`
- `system_heartbeat`

### Webhook callbacks (inbound)
- `POST /api/webhooks/email-status` — receives delivery/bounce notifications from email provider
  - Updates `email_status` on task instances
  - Emits audit log on bounce

---

## 9) n8n Workflows (MVP)

### Workflow A: Handle onboarding.instance_created
Input: event with onboarding_instance_id  
Steps:
1) Load instance + employee + template tasks
2) Materialize task_instances (if not already done by app)
   - **Recommended**: App does materialization synchronously, n8n handles messaging only
3) Create workflow_run success/failure
4) Mark event done/failed

### Workflow B: Daily send due tasks (cron)
Steps:
1) For each org:
   - Find tasks where: status = `pending`, `due_at` <= now, parent instance status = `active`, blocking task (if any) is `completed`
2) Send emails via transactional provider
3) Update task status `pending` → `sent` (atomic — idempotency guard)
4) Write audit logs per task
5) Write workflow_run (one per org per run)

### Workflow C: Overdue reminders (cron)
Steps:
1) Detect overdue tasks: `now > due_at` AND status in (`pending`, `sent`) AND `last_reminder_sent_at` is NULL or > 24h ago
2) Send reminder emails to assignee
3) For tasks overdue > N days (org config, default 3): escalation email to manager/admin (respecting notification preferences)
4) Update `last_reminder_sent_at`
5) Write workflow_run + audit logs

### Workflow D: Heartbeat (cron, every 30 minutes)
Steps:
1) Write row to `heartbeats` table with current timestamp
2) (Optional) Verify DB connectivity and email provider connectivity

---

## 10) Implementation Decisions (MVP Defaults)

### Tech stack (MVP)
- **Frontend**: Next.js (App Router)
- **Backend/DB**: Supabase (Postgres + Auth + Storage optional)
- **Automation**: n8n self-hosted (VPS)
- **Email**: Transactional email provider (Resend, Postmark, or SendGrid — NOT raw SMTP)
  - Budget ~$20/month
  - Webhook callback for delivery/bounce tracking
  - Store email templates in code for now

### Operational defaults
- Org timezone: Europe/London default
- Daily dispatch time: 08:00 local org time
- Task email time: 09:00 local org time
- Overdue escalation threshold: 3 days (configurable per org)
- Skip weekends: true (configurable per org)
- Invite token expiry: 7 days
- n8n heartbeat interval: 30 minutes
- Heartbeat staleness threshold: 90 minutes
- Reminder cooldown: 24 hours (tracked via `last_reminder_sent_at`)
- Event max retries: 3
- Event pickup timeout: 10 minutes (for crashed worker recovery)

### RLS pattern
- Use `SET app.current_org_id` at request start
- All RLS policies: `USING (org_id = current_setting('app.current_org_id')::uuid)`
- This avoids the slow subquery pattern

### Avoid in MVP
- Complex branching workflows
- Per-task custom automations
- Fancy WYSIWYG builders
- AI
- Full DAG task dependencies (only simple linear `blocked_by` chains)
- Raw SMTP email delivery

---

## 11) Acceptance Criteria (Testable)

### Core
- [ ] User can sign up, create org, and become admin
- [ ] Admin can invite a manager; manager can log in and see org data
- [ ] Invite tokens expire after 7 days; expired invites can be re-sent
- [ ] Duplicate invites to same email update existing invite
- [ ] Data is isolated between orgs (RLS enforced)
- [ ] n8n heartbeat is visible on dashboard; stale heartbeat shows warning

### Templates
- [ ] Admin can create onboarding template with tasks, assignee types, day offsets, and attachments
- [ ] Admin can assign tasks to employee, manager, or custom email
- [ ] Admin can set simple task dependencies (blocked_by)
- [ ] Admin can activate/deactivate templates
- [ ] Editing template increments version number
- [ ] Editing template does not change existing onboarding instances
- [ ] Dry-run preview shows computed schedule for a hypothetical start date

### Onboarding
- [ ] Admin can create employee and start onboarding from template
- [ ] Admin can bulk-start onboarding for multiple employees
- [ ] System creates onboarding instance (with template version) and task instances with computed due dates
- [ ] Due dates skip weekends when org setting is enabled
- [ ] Daily dispatch sends emails for due tasks (respecting dependencies) and logs workflow runs
- [ ] Dispatch is idempotent — running twice does not send duplicate emails
- [ ] Admin/Manager can mark tasks completed
- [ ] Completing a task unblocks dependent tasks
- [ ] Overdue tasks are flagged and reminders sent (max once per 24h)
- [ ] Escalation emails sent after configurable overdue threshold
- [ ] Onboarding instance completes automatically when all tasks complete
- [ ] Instance completed event is emitted
- [ ] Admin can pause, resume, and cancel onboarding instances
- [ ] Cancelled instances preserve audit trail but stop further delivery

### Employee Portal
- [ ] Employee portal page is accessible via secure token URL (no login required)
- [ ] Portal shows onboarding progress, task list with statuses, due dates, and attachments
- [ ] Portal is read-only

### Email Delivery
- [ ] Emails sent via transactional provider (not raw SMTP)
- [ ] Email delivery/bounce status tracked via webhook callbacks
- [ ] Bounced emails flagged in dashboard and audit log

### Visibility
- [ ] Audit log records key actions (create template, start onboarding, send tasks, complete tasks, bounces, escalations, pauses, cancellations)
- [ ] Workflow runs page shows success/failure and error details
- [ ] Retry button creates a retry event and re-runs automation
- [ ] Dashboard "today" view shows tasks due today, newly overdue, and upcoming onboardings

---

## 12) Metrics & ROI Reporting

Even for MVP, capture data that proves ROI to clients. These are computed from existing data (no new tables needed):

### Key metrics (API endpoint: `GET /api/orgs/:id/metrics`)
- **Average onboarding completion time** (days from instance created to completed)
- **On-time task completion rate** (% of tasks completed before due_at)
- **Tasks requiring reminders** (% of tasks where a reminder was sent before completion)
- **Overdue rate** (% of tasks that were ever overdue)
- **Active onboardings** (current count)
- **Completion rate** (completed instances / total instances)

These metrics serve as:
- Retention tool: clients see the platform is working
- Sales tool: "Our clients see 95% on-time completion vs. industry average of ~60%"
- Upselling trigger: high volume → suggest additional modules

---

## 13) Future Modules (Not Implemented, but Designed For)

The core platform must later support additional modules by reusing:
- organizations/memberships
- events/workflow_runs
- audit log
- integrations registry

Next modules (examples):
- Lead handling pipeline
- Approvals & purchase requests
- Client delivery tracking

Design goal: adding a module should mostly be adding new tables + new events + new dashboards, not rewriting core.

### Future enhancements to Onboarding module
- Employee self-completion via portal
- Document signing integration (DocuSign/HelloSign)
- Webhook/callback on instance completion (for payroll/HRIS integration)
- Conditional task logic (if role = X, include task Y)
- Per-department templates and permissions
- Custom notification channels (Slack, SMS)