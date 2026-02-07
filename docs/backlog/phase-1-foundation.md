# Phase 1: Foundation

> Infrastructure, authentication, org creation, and app layout.
> These tasks establish the base that everything else builds on.

---

## T-001: Project Infrastructure Setup
- **Status**: done
- **Branch**: `feat/infrastructure`
- **Depends on**: none (database migration already applied)
- **Description**: Install and configure all core dependencies. Create Supabase client utilities (server, browser, and service-role). Create shared utilities for audit logging and event insertion that all future tasks will use. Set up shadcn/ui and toast notification infrastructure.
- **Acceptance criteria**:
  - [x] shadcn/ui initialized with default config
  - [x] `@supabase/ssr` and `@supabase/supabase-js` installed
  - [x] `lib/supabase/server.ts` — server-side Supabase client (uses cookies)
  - [x] `lib/supabase/client.ts` — browser-side Supabase client
  - [x] `lib/supabase/service.ts` — service-role client (server-only, for portal)
  - [x] `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - [x] `middleware.ts` refreshes auth session on every request
  - [x] `lib/audit.ts` — `createAuditEntry(orgId, action, entityType, entityId, meta?, actorUserId?)` utility
  - [x] `lib/events.ts` — `insertEvent(type, orgId, payload, idempotencyKey?)` utility
  - [x] Toast notification component set up (shadcn/ui Sonner or Toast)
  - [x] `npm run build` passes
- **Files likely touched**: `lib/supabase/`, `lib/audit.ts`, `lib/events.ts`, `middleware.ts`, `.env.local`, `package.json`, `components/ui/`
- **Notes**: The audit and events utilities are created here because nearly every future task depends on them. The service-role client is needed later for the employee portal (T-018).

---

## T-002: Auth Pages (Signup + Login)
- **Status**: done
- **Branch**: `feat/auth`
- **Depends on**: T-001
- **Description**: Build signup and login pages using Supabase Auth with email + password. Signup page at `/signup`, login page at `/login`. After successful signup, redirect to `/create-org`. After successful login, redirect to `/dashboard`. Include basic form validation and error messages. Add links between login and signup pages.
- **Acceptance criteria**:
  - [x] `/signup` page with email + password + confirm password
  - [x] `/login` page with email + password
  - [x] Successful signup creates Supabase auth user and redirects to `/create-org`
  - [x] Successful login redirects to `/dashboard`
  - [x] Invalid credentials show error message (toast)
  - [x] Links between signup and login pages
  - [x] `npm run build` passes
- **Additional completed**:
  - [x] `lib/actions/auth.ts` — server actions for signup and login
  - [x] `app/(auth)/layout.tsx` — centered auth layout with dot-grid background
  - [x] shadcn/ui components installed (button, input, label, card)
- **Files likely touched**: `app/(auth)/signup/`, `app/(auth)/login/`, `lib/actions/auth.ts`
- **Bug fix (fix/signup-flow)**: Signup redirected to `/create-org` immediately, but with Supabase email confirmation enabled the user had no session yet, causing "You must be logged in" error on org creation. Fix: signup now redirects to `/login?confirmed=pending` with a banner prompting the user to confirm their email first. Login action also now checks for org membership and routes to `/create-org` if the user has none.

---

## T-003: Org Creation Flow + Design System
- **Status**: active
- **Branch**: `feat/org-creation`
- **Depends on**: T-002
- **Description**: After signup, user lands on `/create-org` page. They enter an org name and timezone (default Europe/London with a dropdown). On submit, create the organization row AND a membership row (role = owner) in a single server action. Then redirect to `/dashboard`. If a logged-in user already has an org membership, skip this page and go straight to dashboard. Audit log entry on org creation. Use `/frontend-design` skill and framer-motion for smooth professional feel. Default theme is dark for the whole site.
- **Acceptance criteria**:
  **Design System Setup:**
  - [x] `framer-motion` installed
  - [x] `lib/motion.ts` created with reusable animation presets (transitions, page/card/list/modal/toast variants)
  - [x] `app/globals.css` updated with dark-first indigo-blue OKLCH palette
  - [x] Glass-morphism utility classes added (`glass`, `glass-elevated`, `glow-primary`, `hover-glow`)
  - [x] `app/layout.tsx` sets dark mode as default (`className="dark"` on html)
  - [x] `docs/DESIGN.md` created with full design system documentation
  - [x] `components/background-animation.tsx` — floating gradient orbs
  - [x] `components/page-transition.tsx` — route transition wrapper
  - [x] `components/staggered-list.tsx` — staggered list animation
  - [x] `components/ui/animated-card.tsx` — animated card component
  **Auth Layout Enhancement:**
  - [x] `app/(auth)/layout.tsx` updated with `BackgroundAnimation` component
  - [x] Login/signup pages verified with dark theme
  **Org Creation Page:**
  - [x] `/create-org` page with animated card entrance (used `/frontend-design` skill)
  - [x] Org name input with validation
  - [x] Timezone dropdown with 25 common timezones (Europe/London default)
  - [x] Submit creates organization + membership (role=owner) atomically
  - [x] Redirect to `/dashboard` after creation
  - [x] If user already has org membership, redirect away from `/create-org`
  - [x] Background animation on page (floating gradient orbs)
  - [x] Loading state animation on submit (spinner + text)
  - [x] Audit log entry: `org.created`
  **Quality:**
  - [x] `npm run build` passes
- **Files touched**: `app/(auth)/create-org/page.tsx`, `lib/actions/org.ts`, `lib/motion.ts`, `app/globals.css`, `app/layout.tsx`, `app/(auth)/layout.tsx`, `components/background-animation.tsx`, `components/page-transition.tsx`, `components/staggered-list.tsx`, `components/ui/animated-card.tsx`, `components/ui/select.tsx`, `docs/DESIGN.md`

---

## T-004: Protected App Layout + Navigation
- **Status**: done
- **Branch**: `feat/app-layout`
- **Depends on**: T-003
- **Description**: Create a protected layout for all authenticated app pages. If not logged in, redirect to `/login`. If logged in but no org membership, redirect to `/create-org`. Layout includes a sidebar with navigation links: Dashboard, Employees, Templates, Onboarding, Runs, Audit Log, Settings. Include org name in the sidebar header and a logout button. Dashboard page shows org name and a placeholder "Welcome to Operations Hub" message for now.
- **Acceptance criteria**:
  - [x] Protected layout redirects unauthenticated users to `/login`
  - [x] Protected layout redirects users without org to `/create-org`
  - [x] Sidebar navigation with all 7 links (Dashboard, Employees, Templates, Onboarding, Runs, Audit Log, Settings)
  - [x] Active page highlighted in sidebar
  - [x] Org name displayed in sidebar header
  - [x] Logout button works (clears session, redirects to `/login`)
  - [x] `/dashboard` shows basic welcome page with org name
  - [x] `npm run build` passes
- **Files touched**: `app/(protected)/layout.tsx`, `app/(protected)/dashboard/page.tsx`, `components/sidebar.tsx`, `components/dashboard/dashboard-content.tsx`, `lib/actions/auth.ts`
