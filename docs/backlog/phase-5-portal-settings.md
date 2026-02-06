# Phase 5: Portal + Settings + Invites

> Employee-facing portal, org settings, team management, and invite flow.

---

## T-018: Employee Onboarding Portal
- **Status**: todo
- **Branch**: `feat/employee-portal`
- **Depends on**: T-010
- **Description**: Build a public, read-only employee portal page at `/portal/[token]`. No authentication required — the token itself provides access. Shows: employee name, role, start date, onboarding progress bar, task list with status indicators (pending/sent/completed/overdue), due dates, attachments as downloadable links, manager contact info. Use the Supabase service role client (from `lib/supabase/service.ts`) to bypass RLS since the employee isn't an authenticated user. Clean, simple design — this is what new hires see.
- **Acceptance criteria**:
  - [ ] `/portal/[token]` is publicly accessible (no login)
  - [ ] Shows employee name, role, start date
  - [ ] Progress bar (% complete)
  - [ ] Task list with status badges and due dates
  - [ ] Attachment links visible on sent/completed tasks
  - [ ] Manager contact info displayed
  - [ ] Invalid/revoked tokens show "not found" page
  - [ ] Read-only — no mutations possible
  - [ ] `npm run build` passes
- **Files likely touched**: `app/portal/[token]/page.tsx`, `components/portal/`, `lib/queries/portal.ts`

---

## T-019: Settings + Team Management
- **Status**: todo
- **Branch**: `feat/settings`
- **Depends on**: T-004
- **Description**: Build the org settings page at `/settings`. Two sections: (1) Org Settings — admin can update org name, timezone (dropdown), skip_weekends toggle, escalation_threshold_days (number input). (2) Team Members — shows list of all org members (name, email, role badge), with the ability to update notification preferences per member (overdue_email, daily_summary, escalation_email toggles). Admin/owner only. Save creates audit log entries.
- **Acceptance criteria**:
  - [ ] `/settings` page with org settings form
  - [ ] Timezone dropdown, skip_weekends toggle, escalation days input
  - [ ] Save updates org record
  - [ ] Team members list showing all org members with roles
  - [ ] Notification preferences toggles per member (overdue_email, daily_summary, escalation_email)
  - [ ] Audit log entry on settings change
  - [ ] Only admin/owner can access
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/settings/page.tsx`, `components/settings/`, `lib/actions/settings.ts`

---

## T-020: Invite Flow
- **Status**: todo
- **Branch**: `feat/invites`
- **Depends on**: T-019
- **Description**: Admin can invite new members to the org. On the settings page (Team Members section), admin enters email + role (manager or member). System creates an invite record with a token and inserts an email event (not sending directly). Invite link `/invite/[token]` allows the invitee to sign up or log in and join the org. Tokens expire after 7 days. Duplicate invites to same email update existing invite. Admin can see pending invites and re-send expired ones.
- **Acceptance criteria**:
  - [ ] Invite form (email + role selector) on settings page
  - [ ] Creates invite record with token, inserts email event
  - [ ] `/invite/[token]` page for accepting invite
  - [ ] Accepting creates membership row
  - [ ] Expired tokens show error with option to request re-send
  - [ ] Duplicate invites update existing record
  - [ ] Admin sees list of pending/accepted invites
  - [ ] Audit log entries for invite sent and accepted
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(auth)/invite/[token]/`, `app/(protected)/settings/`, `lib/actions/invites.ts`
