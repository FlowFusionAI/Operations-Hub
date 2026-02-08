# Phase 2: Templates

> Template CRUD, task builder, detail view, and dry-run preview.
> Templates are the reusable onboarding plans that drive everything in Phase 3.

---

## T-005: Templates List Page
- **Status**: done
- **Branch**: `feat/template-list`
- **Depends on**: T-004
- **Description**: Build the templates list page at `/templates`. Shows a table/list of all onboarding templates for the current org. Displays: name, status (active/inactive badge), version number, task count, created date. Include an "Active only" filter toggle (default on) and a "New Template" button that links to the create page. Empty state message when no templates exist.
- **Acceptance criteria**:
  - [x] `/templates` page shows list of templates for current org
  - [x] Each row shows name, status badge, version, task count, created date
  - [x] "Active only" toggle filters to active templates (default on)
  - [x] "New Template" button links to `/templates/new`
  - [x] Empty state with helpful message when no templates exist
  - [x] Click on template row navigates to `/templates/[id]`
  - [x] `npm run build` passes
- **Files likely touched**: `app/(protected)/templates/page.tsx`, `components/templates/`, `lib/queries/templates.ts`

---

## T-006a: Template Form — Create & Edit Pages
- **Status**: todo
- **Branch**: `feat/template-form`
- **Depends on**: T-005
- **Description**: Build create (`/templates/new`) and edit (`/templates/[id]/edit`) pages for onboarding template metadata. Form fields: template name (required), role description (optional), status toggle (active/inactive, default active). On save: create/update template, increment version on edit, create audit log entry. Validate required fields. Does NOT include the task builder — just template metadata.
- **Acceptance criteria**:
  - [ ] `/templates/new` creates a template (name, role_description, status)
  - [ ] `/templates/[id]/edit` loads and updates an existing template
  - [ ] Version increments on every edit save
  - [ ] Audit log on create and update
  - [ ] Validation: name required
  - [ ] Redirect to detail page after save
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/templates/new/page.tsx`, `app/(protected)/templates/[id]/edit/page.tsx`, `components/templates/template-form.tsx`, `lib/actions/templates.ts`
- **Delegation note**: Create `lib/actions/templates.ts` with `createTemplate` and `updateTemplate` server actions. Follow the pattern in `lib/actions/org.ts`. The form component should accept an optional `template` prop for edit mode.

---

## T-006b: Task Builder
- **Status**: todo
- **Branch**: `feat/template-tasks`
- **Depends on**: T-006a
- **Description**: Add the inline task builder to the template form. Extend `template-form.tsx` with a "Tasks" section below the metadata fields. Dynamic task list: add task, remove task, reorder with up/down buttons. Each task row: title (required), description (optional), day_offset (required, integer >= 0), assignee_type dropdown (employee/manager/custom_email), custom_email input (shown only when assignee_type = custom_email). sort_order auto-computed from position. Attachments: each task can have external URL pairs (name + url), add/remove dynamically. Update server actions to handle task creation/deletion alongside template save. blocked_by deferred to a later task.
- **Acceptance criteria**:
  - [ ] Can add and remove tasks from the template form
  - [ ] Each task has title, description, day_offset, assignee_type fields
  - [ ] custom_email field shows conditionally when assignee_type = "custom_email"
  - [ ] Up/down buttons reorder tasks (sort_order auto-computed)
  - [ ] Can add/remove attachment URL pairs (name + url) per task
  - [ ] Validation: task title required, day_offset >= 0
  - [ ] Tasks persist correctly on create and edit
  - [ ] `npm run build` passes
- **Files likely touched**: `components/templates/template-form.tsx`, `lib/actions/templates.ts`
- **Delegation note**: Read the existing `template-form.tsx` and `lib/actions/templates.ts` from T-006a and extend them. Use `useState` for the local task list. On save, pass tasks array to the server action. The server action should delete existing tasks and re-insert (simpler than diffing). Follow existing form patterns (useTransition, toast errors).

---

## T-007: Template Detail + Dry-Run Preview + Delete
- **Status**: todo
- **Branch**: `feat/template-detail`
- **Depends on**: T-006b
- **Description**: Build template detail page at `/templates/[id]`. Shows template info (name, status, version, role description) and a read-only list of tasks with all their fields. Include Edit and Activate/Deactivate buttons. Delete button with confirmation dialog. Add a "Preview Schedule" feature: admin picks a hypothetical start date, and the page computes and displays the full task schedule with computed due dates (accounting for day_offsets and weekend skipping if enabled). Build shared `lib/dates.ts` with `addBusinessDays` utility (reused in Phase 3). This is a frontend-only computation — no records created.
- **Acceptance criteria**:
  - [ ] `/templates/[id]` shows template details and full task list (read-only)
  - [ ] Edit button links to edit page
  - [ ] Activate/Deactivate toggle changes template status with audit log
  - [ ] Delete button with confirmation dialog removes template and redirects to `/templates`
  - [ ] "Preview Schedule" date picker computes and shows task schedule
  - [ ] Preview accounts for weekend skipping (based on org `skip_weekends` setting)
  - [ ] Audit log on status change and delete
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/templates/[id]/page.tsx`, `components/templates/template-detail.tsx`, `lib/actions/templates.ts`, `lib/queries/templates.ts`, `lib/dates.ts`
- **Delegation note**: Create `lib/dates.ts` as a shared utility. The `addBusinessDays` function takes a Date, an offset in days, and a boolean for weekend skipping. Add `toggleTemplateStatus` and `deleteTemplate` server actions to `lib/actions/templates.ts`. Add `getTemplateWithTasks` query to `lib/queries/templates.ts`. Use existing card/animation patterns from the dashboard for layout.
