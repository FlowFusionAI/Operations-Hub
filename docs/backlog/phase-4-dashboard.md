# Phase 4: Dashboard + Visibility

> The operational views: dashboard, onboarding list, audit log, and workflow runs.
> These pages make progress and problems visible.

---

## T-014: Dashboard — Today View
- **Status**: todo
- **Branch**: `feat/dashboard`
- **Depends on**: T-010, T-012
- **Description**: Build the main dashboard at `/dashboard`. Top section ("Today"): tasks due today (count + list), tasks newly overdue (became overdue in last 24h), onboardings starting this week, tasks with bounced emails. Bottom section ("Summary"): active onboarding count, overdue tasks count, recent audit log (last 10 entries), recent failed workflow runs. All data scoped to current org. Use cards/widgets layout.
- **Acceptance criteria**:
  - [ ] "Today" section with due-today tasks, newly overdue, starting this week
  - [ ] Summary section with counts and recent activity
  - [ ] All data scoped to current org
  - [ ] Links from dashboard items to relevant detail pages
  - [ ] Empty states for each section
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/dashboard/page.tsx`, `components/dashboard/`, `lib/queries/dashboard.ts`

---

## T-015: Onboarding Instances List Page
- **Status**: todo
- **Branch**: `feat/onboarding-list`
- **Depends on**: T-010
- **Description**: Build an onboarding instances list page at `/onboarding`. Shows all instances across employees. Columns: employee name, template name, template version, status (badge), progress (X/Y tasks, percentage bar), overdue count, created date. Filter by status (active/completed/paused/cancelled, default: active). Search by employee name.
- **Acceptance criteria**:
  - [ ] `/onboarding` page with list of all instances
  - [ ] Status filter (default: active)
  - [ ] Progress bars and overdue counts
  - [ ] Search by employee name
  - [ ] Click navigates to employee detail page
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/onboarding/page.tsx`, `components/onboarding/`

---

## T-016: Audit Log Page
- **Status**: todo
- **Branch**: `feat/audit-log`
- **Depends on**: T-004
- **Description**: Build the audit log page at `/audit-log`. Shows a timeline/table of all audit entries for the current org. Columns: timestamp (formatted in org timezone), actor (user name or "System"), action, entity type, entity description. Filter by action type, entity type, and date range. Paginated (20 per page). Newest first.
- **Acceptance criteria**:
  - [ ] `/audit-log` page with paginated list
  - [ ] Columns: timestamp, actor, action, entity type, entity
  - [ ] Filter by action type and entity type
  - [ ] Date range filter
  - [ ] Pagination (20 per page)
  - [ ] Timestamps displayed in org timezone
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/audit-log/page.tsx`, `components/audit-log/`, `lib/queries/audit-log.ts`

---

## T-017: Workflow Runs Page + Retry
- **Status**: todo
- **Branch**: `feat/runs`
- **Depends on**: T-004
- **Description**: Build the workflow runs page at `/runs`. Shows a table of all workflow_run records. Columns: workflow_key, status (success/failure badge), started_at, completed_at, duration, error snippet (truncated). Filter by status (all/success/failed). Failed runs show a "Retry" button that inserts a `system.retry_workflow_run` event and creates an audit log entry. Click on a run row shows full details including logs and error.
- **Acceptance criteria**:
  - [ ] `/runs` page with workflow run list
  - [ ] Status filter (all/success/failed)
  - [ ] "Retry" button on failed runs
  - [ ] Retry inserts event + audit log entry
  - [ ] Click to expand/view full run details
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/runs/page.tsx`, `components/runs/`, `lib/actions/runs.ts`
