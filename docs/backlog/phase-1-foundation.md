# Phase 1: Foundation

> Infrastructure, authentication, org creation, and app layout.
> These tasks establish the base that everything else builds on.

---

## T-001: Project Infrastructure Setup
- **Status**: todo
- **Branch**: `feat/infrastructure`
- **Depends on**: none (database migration already applied)
- **Description**: Install and configure all core dependencies. Create Supabase client utilities (server, browser, and service-role). Create shared utilities for audit logging and event insertion that all future tasks will use. Set up shadcn/ui and toast notification infrastructure.
- **Acceptance criteria**:
  - [ ] shadcn/ui initialized with default config
  - [ ] `@supabase/ssr` and `@supabase/supabase-js` installed
  - [ ] `lib/supabase/server.ts` — server-side Supabase client (uses cookies)
  - [ ] `lib/supabase/client.ts` — browser-side Supabase client
  - [ ] `lib/supabase/service.ts` — service-role client (server-only, for portal)
  - [ ] `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `middleware.ts` refreshes auth session on every request
  - [ ] `lib/audit.ts` — `createAuditEntry(orgId, action, entityType, entityId, meta?, actorUserId?)` utility
  - [ ] `lib/events.ts` — `insertEvent(type, orgId, payload, idempotencyKey?)` utility
  - [ ] Toast notification component set up (shadcn/ui Sonner or Toast)
  - [ ] `npm run build` passes
- **Files likely touched**: `lib/supabase/`, `lib/audit.ts`, `lib/events.ts`, `middleware.ts`, `.env.local`, `package.json`, `components/ui/`
- **Notes**: The audit and events utilities are created here because nearly every future task depends on them. The service-role client is needed later for the employee portal (T-018).

---

## T-002: Auth Pages (Signup + Login)
- **Status**: todo
- **Branch**: `feat/auth`
- **Depends on**: T-001
- **Description**: Build signup and login pages using Supabase Auth with email + password. Signup page at `/signup`, login page at `/login`. After successful signup, redirect to `/create-org`. After successful login, redirect to `/dashboard`. Include basic form validation and error messages. Add links between login and signup pages.
- **Acceptance criteria**:
  - [ ] `/signup` page with email + password + confirm password
  - [ ] `/login` page with email + password
  - [ ] Successful signup creates Supabase auth user and redirects to `/create-org`
  - [ ] Successful login redirects to `/dashboard`
  - [ ] Invalid credentials show error message (toast)
  - [ ] Links between signup and login pages
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(auth)/signup/`, `app/(auth)/login/`, `lib/actions/auth.ts`

---

## T-003: Org Creation Flow
- **Status**: todo
- **Branch**: `feat/org-creation`
- **Depends on**: T-002
- **Description**: After signup, user lands on `/create-org` page. They enter an org name and timezone (default Europe/London with a dropdown). On submit, create the organization row AND a membership row (role = owner) in a single server action. Then redirect to `/dashboard`. If a logged-in user already has an org membership, skip this page and go straight to dashboard. Audit log entry on org creation.
- **Acceptance criteria**:
  - [ ] `/create-org` page with org name input and timezone dropdown
  - [ ] Submit creates organization + membership (role=owner) atomically
  - [ ] Redirect to `/dashboard` after creation
  - [ ] If user already has org membership, redirect away from `/create-org`
  - [ ] Timezone dropdown includes common timezones (Europe/London as default)
  - [ ] Audit log entry: `org.created`
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(auth)/create-org/`, `lib/actions/org.ts`

---

## T-004: Protected App Layout + Navigation
- **Status**: todo
- **Branch**: `feat/app-layout`
- **Depends on**: T-003
- **Description**: Create a protected layout for all authenticated app pages. If not logged in, redirect to `/login`. If logged in but no org membership, redirect to `/create-org`. Layout includes a sidebar with navigation links: Dashboard, Employees, Templates, Onboarding, Runs, Audit Log, Settings. Include org name in the sidebar header and a logout button. Dashboard page shows org name and a placeholder "Welcome to Operations Hub" message for now.
- **Acceptance criteria**:
  - [ ] Protected layout redirects unauthenticated users to `/login`
  - [ ] Protected layout redirects users without org to `/create-org`
  - [ ] Sidebar navigation with all 7 links (Dashboard, Employees, Templates, Onboarding, Runs, Audit Log, Settings)
  - [ ] Active page highlighted in sidebar
  - [ ] Org name displayed in sidebar header
  - [ ] Logout button works (clears session, redirects to `/login`)
  - [ ] `/dashboard` shows basic welcome page with org name
  - [ ] `npm run build` passes
- **Files likely touched**: `app/(protected)/layout.tsx`, `app/(protected)/dashboard/`, `components/sidebar.tsx`
