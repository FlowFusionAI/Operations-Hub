# Phase 3: Employees + Onboarding

> Employee management, onboarding materialization, task completion, and instance lifecycle.
> This is the core business logic of the product.

---

## T-008: Employees List + Create
- **Status**: todo
- **Branch**: `feat/employees`
- **Depends on**: T-004
- **Description**: Build employees list page at `/employees` and create form. List shows: name, email, start date, role title, assigned manager, onboarding status (none/active/completed). "Add Employee" button opens create form or page. Create form fields: name (required), email (required), start_date (required), role_title (optional), assigned_manager dropdown (populated from org members with manager/admin/owner roles). Creating an employee does NOT start onboarding — that's a separate action.
- **Acceptance criteria**:
  - [ ] `/employees` page shows employee list for current org
  - [ ] Each row shows name, email, start date, role title, manager, onboarding status
  - [ ] "Add Employee" button opens create form
  - [ ] Manager dropdown populated from org members with manager+ roles
  - [ ] Form validation (name, email, start_date required)
  - [ ] Audit log entry on employee creation
  - [ ] Click on employee navigates to `/employees/[id]`
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/employees/`, `components/employees/`, `lib/actions/employees.ts`

---

## T-009: Employee Detail + Edit
- **Status**: todo
- **Branch**: `feat/employee-detail`
- **Depends on**: T-008
- **Description**: Build employee detail page at `/employees/[id]`. Shows employee info at the top with an Edit button to update name, email, start_date, role_title, and assigned_manager. Below, shows all onboarding instances for this employee (current + historical). Each instance shows: template name, template version, status, progress (X of Y tasks completed), created date. Include a "Start Onboarding" button that opens a dialog to select an active template. For instances in progress, show the task list with statuses and due dates.
- **Acceptance criteria**:
  - [ ] `/employees/[id]` shows employee info
  - [ ] Edit button opens inline form or edit page for employee details
  - [ ] Audit log entry on employee update
  - [ ] Lists all onboarding instances (with progress bars)
  - [ ] "Start Onboarding" button with template selection dialog
  - [ ] Task list visible for each instance (expandable or inline)
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/employees/[id]/page.tsx`, `components/employees/`, `components/onboarding/`, `lib/actions/employees.ts`

---

## T-010: Start Onboarding (Materialization)
- **Status**: todo
- **Branch**: `feat/start-onboarding`
- **Depends on**: T-009, T-007
- **Description**: Implement the core "Start Onboarding" business logic. When admin selects an employee + template and confirms: create onboarding_instance (status=active, snapshot template_version, generate portal_token), materialize all task_instances from template_tasks (copy title, description, assignee_type, resolve assignee_email, compute due_at from start_date + day_offset respecting weekends and org timezone, set blocked_by_task_instance_id from template dependencies, copy attachments). Insert event `onboarding.instance_created`. Insert audit log entry. This is a server action, not an n8n workflow — the app handles materialization synchronously.
- **Acceptance criteria**:
  - [ ] Selecting employee + template creates onboarding_instance
  - [ ] Instance snapshots template_version and generates portal_token
  - [ ] Task instances materialized with correct due_at dates
  - [ ] due_at computation: start_date + day_offset, 09:00 org timezone, skip weekends if enabled
  - [ ] Assignee emails resolved correctly (employee/manager/custom)
  - [ ] blocked_by_task_instance_id mapped from template task dependencies
  - [ ] Attachments copied as JSONB
  - [ ] Event `onboarding.instance_created` inserted (via `lib/events.ts`)
  - [ ] Audit log entry created
  - [ ] Employee detail page shows the new instance with tasks
  - [ ] `npm run build` passes
- **Files likely touched**: `lib/actions/onboarding.ts`, `lib/utils/scheduling.ts`

---

## T-011: Bulk Start Onboarding
- **Status**: todo
- **Branch**: `feat/bulk-onboarding`
- **Depends on**: T-010
- **Description**: Add ability to start onboarding for multiple employees at once. On the employees list page, add checkboxes and a "Start Onboarding" bulk action. Admin selects employees, picks a template, confirms. System loops through each employee, creating instances independently. Show results: "3 of 5 started successfully, 2 failed (see errors)." Partial failures don't roll back successful ones.
- **Acceptance criteria**:
  - [ ] Checkboxes on employee list
  - [ ] Bulk "Start Onboarding" action with template picker
  - [ ] Creates instances for each selected employee independently
  - [ ] Shows success/failure results per employee
  - [ ] Partial failures handled gracefully
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/employees/page.tsx`, `components/employees/`, `lib/actions/onboarding.ts`

---

## T-012: Task Completion Flow
- **Status**: todo
- **Branch**: `feat/task-completion`
- **Depends on**: T-010
- **Description**: Allow admin/manager to mark task instances as completed. On the employee detail page (within an onboarding instance's task list), each pending/sent task has a "Mark Complete" button. On click: update task status to completed, set completed_at and completed_by_user_id. Check if any tasks are blocked by this task — if unblocked and due, they become eligible for next dispatch. If ALL tasks in the instance are completed, auto-transition the instance to completed status. Create audit log entries for task completion and (if applicable) instance completion. Insert `onboarding.instance_completed` event when instance completes.
- **Acceptance criteria**:
  - [ ] "Mark Complete" button on pending/sent tasks
  - [ ] Updates task status, completed_at, completed_by_user_id
  - [ ] Unblocks dependent tasks
  - [ ] Auto-completes instance when all tasks done
  - [ ] Audit log for task completion
  - [ ] Audit log + event for instance completion
  - [ ] UI refreshes to show updated status
  - [ ] `npm run build` passes
- **Files likely touched**: `lib/actions/onboarding.ts`, `components/onboarding/task-list.tsx`

---

## T-013: Onboarding Instance Management (Pause/Resume/Cancel)
- **Status**: todo
- **Branch**: `feat/instance-management`
- **Depends on**: T-010
- **Description**: Add pause, resume, and cancel actions to onboarding instances. On the employee detail page, each active instance shows Pause and Cancel buttons. Paused instances show Resume and Cancel. Cancelled and completed instances show no actions. Pausing stops future task delivery but preserves everything. Cancelling is irreversible. Each action creates an audit log entry.
- **Acceptance criteria**:
  - [ ] Pause button on active instances -> status becomes paused
  - [ ] Resume button on paused instances -> status becomes active
  - [ ] Cancel button on active/paused instances -> status becomes cancelled
  - [ ] Cancelled instances cannot be reactivated
  - [ ] Audit log entries for each action
  - [ ] UI shows correct buttons per status
  - [ ] `npm run build` passes
- **Files likely touched**: `lib/actions/onboarding.ts`, `components/onboarding/`
