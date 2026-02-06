# Phase 2: Templates

> Template CRUD, task builder, detail view, and dry-run preview.
> Templates are the reusable onboarding plans that drive everything in Phase 3.

---

## T-005: Templates List Page
- **Status**: todo
- **Branch**: `feat/template-list`
- **Depends on**: T-004
- **Description**: Build the templates list page at `/templates`. Shows a table/list of all onboarding templates for the current org. Displays: name, status (active/inactive badge), version number, task count, created date. Include an "Active only" filter toggle (default on) and a "New Template" button that links to the create page. Empty state message when no templates exist.
- **Acceptance criteria**:
  - [ ] `/templates` page shows list of templates for current org
  - [ ] Each row shows name, status badge, version, task count, created date
  - [ ] "Active only" toggle filters to active templates (default on)
  - [ ] "New Template" button links to `/templates/new`
  - [ ] Empty state with helpful message when no templates exist
  - [ ] Click on template row navigates to `/templates/[id]`
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/templates/page.tsx`, `components/templates/`, `lib/queries/templates.ts`

---

## T-006: Template Create + Edit
- **Status**: todo
- **Branch**: `feat/template-form`
- **Depends on**: T-005
- **Description**: Build create (`/templates/new`) and edit (`/templates/[id]/edit`) pages for onboarding templates. Form fields: template name (required), role description (optional), status toggle (active/inactive, default active). Below the form, a "Tasks" section where admin can add/remove/reorder template tasks. Each task has: title (required), description, day_offset (required, integer >= 0), assignee_type dropdown (employee/manager/custom_email), custom_email input (shown only when assignee_type = custom_email), sort_order (auto from position), attachments (add external URLs with name + url pairs). On save: create/update template, increment version on edit, create audit log entry. Validate required fields. blocked_by can be deferred to a later task.
- **Acceptance criteria**:
  - [ ] `/templates/new` creates a new template with tasks
  - [ ] `/templates/[id]/edit` loads and edits existing template
  - [ ] Can add, remove, and reorder tasks (drag or up/down buttons)
  - [ ] Assignee type dropdown works, shows custom_email field conditionally
  - [ ] Can add attachment URLs (name + url) to each task
  - [ ] Version increments on every edit save
  - [ ] Audit log entry on create and update
  - [ ] Form validation (name required, day_offset >= 0, etc.)
  - [ ] Redirect to template detail page after save
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/templates/new/`, `app/(protected)/templates/[id]/edit/`, `components/templates/template-form.tsx`, `lib/actions/templates.ts`

---

## T-007: Template Detail + Dry-Run Preview
- **Status**: todo
- **Branch**: `feat/template-detail`
- **Depends on**: T-006
- **Description**: Build template detail page at `/templates/[id]`. Shows template info (name, status, version, role description) and a read-only list of tasks with all their fields. Include Edit and Activate/Deactivate buttons. Add a "Preview Schedule" feature: admin picks a hypothetical start date, and the page computes and displays the full task schedule with computed due dates (accounting for day_offsets and weekend skipping if enabled). This is a frontend-only computation — no records created.
- **Acceptance criteria**:
  - [ ] `/templates/[id]` shows template details and task list
  - [ ] Edit button links to edit page
  - [ ] Activate/Deactivate toggle changes template status
  - [ ] "Preview Schedule" date picker computes and shows task schedule
  - [ ] Preview accounts for weekend skipping (based on org settings)
  - [ ] Audit log entry on status change
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/templates/[id]/page.tsx`, `components/templates/`, `lib/actions/templates.ts`
