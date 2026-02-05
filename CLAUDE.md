# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpsHub is an operations management SaaS platform focused on employee onboarding automation. It enables organizations to create template-based onboarding workflows, automatically schedule and deliver tasks via email, track progress, and maintain audit trails. The product is multi-tenant and designed for SMEs.

The full product requirements are in [docs/PRD.md](docs/PRD.md) — treat it as the source of truth for all feature specifications.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss` plugin)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth
- **Automation**: n8n (self-hosted) for scheduled task dispatch, reminders, escalations
- **Email**: Transactional provider (Resend/Postmark/SendGrid — not raw SMTP)
- **Linting**: ESLint v9 flat config (`eslint.config.mjs`)

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint (eslint-config-next with core-web-vitals + typescript)
```

## Database

Schema is defined in `supabase/migrations/`. The initial migration (`20250205000001_initial_schema.sql`) sets up all enums, tables, indexes, `updated_at` triggers, and RLS policies.

**RLS pattern**: Uses `SECURITY DEFINER` helper functions (`is_org_member`, `is_org_admin`) that check the `memberships` table. All org-scoped tables enforce membership-based access. Admin-only write policies on templates, employees, and instances. The employee portal bypasses RLS via service role.

**Key conventions**: UUIDs for all PKs, `timestamptz` for all timestamps (UTC), every org-scoped table has an `org_id` FK to `organizations`.

## Architecture

### Routing & Pages (App Router)

All routes live under `app/` using Next.js App Router conventions. The planned structure includes:
- Auth pages (login/signup) via Supabase Auth
- Protected app routes: dashboard, employees, templates, onboarding instances, runs, audit log, settings
- Public employee portal at `/portal/[token]` (token-secured, no auth required)
- API routes under `app/api/` for all server-side business logic

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`). Use `@/components/...`, `@/lib/...`, etc.

### Key Design Principles

1. **State-first**: All operational truth lives in Supabase (Postgres). n8n executes actions but does not own business state.
2. **Template-to-instance immutability**: Templates are versioned (auto-increment on edit). Onboarding instances snapshot tasks at creation time — editing a template never alters existing instances.
3. **Multi-tenancy**: All data scoped by `org_id`. RLS enforced using the `SET app.current_org_id` variable pattern (not subqueries) for performance.
4. **Idempotency**: All automation workflows must be safe to re-run. Status guards and idempotency keys prevent duplicate processing.
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
4. Key workflows: daily task dispatch, overdue reminders/escalations, heartbeat monitoring
5. Email delivery status tracked via provider webhooks at `/api/webhooks/email-status`

### Roles & Permissions

- **Owner/Admin**: Full access — templates, employees, onboarding, runs, audit, settings
- **Manager**: View assigned employees, mark tasks complete, receive escalations
- **Member**: Read-only (MVP: optional implementation)
