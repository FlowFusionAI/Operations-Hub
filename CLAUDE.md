# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Operations Hub is an operations management SaaS platform focused on employee onboarding automation. It enables organizations to create template-based onboarding workflows, automatically schedule and deliver tasks via email, track progress, and maintain audit trails. The product is multi-tenant and designed for SMEs.

The full product requirements are in [docs/PRD-v1.md](docs/PRD-v1.md) — treat it as the source of truth for all feature specifications.

### Backlog System

- **[BACKLOG.md](BACKLOG.md)** — task dashboard with status overview (scan this first)
- **[docs/backlog/ACTIVE.md](docs/backlog/ACTIVE.md)** — the current task being worked on (read this for task details)
- **`docs/backlog/phase-*.md`** — detailed task specs organized by phase
- **[docs/backlog/ICEBOX.md](docs/backlog/ICEBOX.md)** — future ideas, post-MVP

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss` plugin)
- **UI Components**: in `components/ui/` and use the `/frontend-design` skill
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth (email + password)
- **Client Library**: `@supabase/ssr` (NOT the old `@supabase/auth-helpers-nextjs`)
- **Automation**: n8n (self-hosted) for scheduled task dispatch, reminders, escalations
- **Email**: n8n handles all email sending (via SMTP node or provider API node).
- **Linting**: ESLint v9 flat config (`eslint.config.mjs`)

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build — ALWAYS run before marking a task done
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Database

Schema is defined in `supabase/migrations/`. The initial migration sets up all enums, tables, indexes, `updated_at` triggers, and RLS policies.

**Database types** are at `src/types/database.ts` — always import and use these for type safety. Regenerate with Supabase MCP if the schema changes.

**RLS pattern**: Uses `SECURITY DEFINER` helper functions (`is_org_member`, `is_org_admin`) that check the `memberships` table. All org-scoped tables enforce membership-based access. Admin-only write policies on templates, employees, and instances. The employee portal bypasses RLS via service role.

**Key conventions**: UUIDs for all PKs, `timestamptz` for all timestamps (UTC), every org-scoped table has an `org_id` FK to `organizations`.

**Migration rules**: Never edit existing migration files. If the schema needs to change, create a new migration file with a new timestamp.

## Architecture

### Routing & Pages (App Router)

All routes live under `app/` using Next.js App Router conventions:
- `app/(auth)/` — login, signup, create-org, invite acceptance (public/semi-public)
- `app/(protected)/` — all authenticated app pages (dashboard, employees, templates, etc.)
- `app/portal/[token]/` — public employee portal (token-secured, no auth)
- `app/api/` — webhook endpoints only (email status callbacks)

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`). Use `@/components/...`, `@/lib/...`, etc.

### Key Design Principles

1. **State-first**: All operational truth lives in Supabase (Postgres). n8n executes actions but does not own business state.
2. **Template-to-instance immutability**: Templates are versioned (auto-increment on edit). Onboarding instances snapshot tasks at creation time — editing a template never alters existing instances.
3. **Multi-tenancy**: All data scoped by `org_id`. RLS enforced on all tables.
4. **Idempotency**: All automation workflows must be safe to re-run. Status guards prevent duplicate processing.
5. **Timestamps in UTC**: All timestamps stored UTC. Conversion to org timezone at display and scheduling time. Weekend skipping is configurable per org.

### Data Model (Core Entities)

- **Organization** → Memberships (owner/admin/manager/member roles) → Invites
- **Onboarding Template** (versioned) → Template Tasks (with day_offset, assignee_type, attachments, optional blocked_by)
- **Employee** → Onboarding Instances (created from templates) → Task Instances (materialized with computed due_at)
- **Events** (queue-lite pattern) → Workflow Runs (execution logs)
- **Audit Log** (every meaningful business action) and **Heartbeats** (n8n health monitoring)

### Automation Flow

1. App inserts events into `events` table (status: pending)
2. n8n picks up pending events, processes them, writes results back
3. Every automation action produces a `workflow_run` record
4. The app NEVER sends emails directly — it writes to the events table and n8n handles delivery
5. Email delivery status tracked via provider webhooks at `/api/webhooks/email-status`

### Roles & Permissions

- **Owner/Admin**: Full access — templates, employees, onboarding, runs, audit, settings
- **Manager**: View assigned employees, mark tasks complete, receive escalations
- **Member**: Read-only (MVP: optional implementation)

## Coding Conventions

### Component Patterns
- Use **server components by default**. Only use client components (`'use client'`) when you need interactivity (forms, click handlers, useState, useEffect).
- Use **server actions** for mutations (create, update, delete). Put them in `lib/actions/`.
- Do NOT create API routes unless specifically needed (webhooks, external callbacks).
- Shared/reusable components go in `components/`.
- Page-specific components can go in `components/[feature-name]/`.
- shadcn/ui components go in `components/ui/` (managed by shadcn CLI).

### Data Fetching
- Server components fetch data directly using the Supabase server client.
- Put reusable query functions in `lib/queries/`.
- Put server actions in `lib/actions/`.
- Always handle Supabase errors gracefully — show user-friendly messages, never expose raw errors.

### Audit Logging
- Every business action must create an audit log entry. This is a hard requirement from the PRD.
- Use a shared utility: `lib/audit.ts` with `createAuditEntry(orgId, action, entityType, entityId, meta?, actorUserId?)`.

### Styling
- Use Tailwind CSS classes. No custom CSS files unless absolutely necessary.
- Do not install additional UI libraries beyond shadcn/ui.
- No emojis in the UI.

### Other Rules
- Attachments are external URLs only for MVP — no file uploads to Supabase Storage.
- All form inputs must have validation (required fields, correct types).
- Use TypeScript strictly — no `any` types, no `@ts-ignore`.

## Workflow Rules for Claude Code

### Before Starting Any Task
1. **Read `docs/backlog/ACTIVE.md`** to see the current task with full acceptance criteria.
2. **Read CLAUDE.md** (this file) for conventions and patterns.
3. **Check BACKLOG.md** for dependency status — if a dependency isn't marked `done`, stop and say so.

### While Working on a Task
1. **Stay in scope.** Only build what the current task asks for. Do not:
   - Refactor existing code that isn't part of this task
   - Add features not specified in the task
   - "Improve" or reorganize code outside the task's scope
   - Install new packages unless the task requires them
2. **Follow existing patterns.** If there's already a form component, a server action pattern, or an error handling approach in the codebase, follow it. Do not invent new patterns.
3. **Create audit log entries** for every business action (the PRD requires this).
4. **Handle errors gracefully** — try/catch on server actions, user-friendly messages in the UI.

### Before Saying You're Done
1. Run `npm run build` — fix any type errors or build failures.
2. Verify all acceptance criteria from the task are met.
3. If you had to make a judgment call not covered by the PRD, mention it so the human can review.

### Things You Must Never Do
- Never edit existing migration files — create new migrations if the schema needs to change.
- Never use the Supabase service role key in client-side code (only for the employee portal server-side query).
- Never send emails directly from the app — always insert into the events table.
- Never bypass RLS — if a query returns empty when it shouldn't, the RLS policy needs fixing, not bypassing.
- Never use `any` types or `@ts-ignore`.