# Phase 6: Automation + Email

> Email webhook handling and n8n health monitoring.
> Note: The events utility (`lib/events.ts`) was created in T-001.
> Note: n8n workflows themselves are configured outside this codebase.

---

## T-021: Email Status Webhook Endpoint
- **Status**: todo
- **Branch**: `feat/email-webhook`
- **Depends on**: T-004
- **Description**: Create the `/api/webhooks/email-status` POST endpoint that receives delivery/bounce callbacks from the email provider (Resend/Postmark/SendGrid). On bounce: update task_instance email_status to "bounced", create audit log entry. On delivered: update to "delivered". Verify webhook signatures for security.
- **Acceptance criteria**:
  - [ ] `/api/webhooks/email-status` endpoint handles POST requests
  - [ ] Parses delivery and bounce events from provider payload
  - [ ] Updates task_instance `email_status` field
  - [ ] Audit log entry on bounce (`onboarding.task_bounced`)
  - [ ] Webhook signature verification (configurable via env var)
  - [ ] Returns appropriate HTTP status codes
  - [ ] `npm run build` passes
- **Files likely touched**: `app/api/webhooks/email-status/route.ts`, `lib/actions/email.ts`

---

## T-022: n8n Health Monitoring (Dashboard Integration)
- **Status**: todo
- **Branch**: `feat/heartbeat`
- **Depends on**: T-014
- **Description**: Add a health indicator to the dashboard that checks the heartbeats table. If the latest heartbeat is older than 90 minutes, show an amber/red warning banner: "Automation engine may be offline -- last heartbeat [time ago]." If healthy, show a small green indicator. The actual n8n heartbeat workflow that writes to the table will be built in n8n separately — this task just builds the dashboard component that reads from it.
- **Acceptance criteria**:
  - [ ] Dashboard shows automation health indicator
  - [ ] Green when heartbeat < 90 min old
  - [ ] Warning banner when heartbeat is stale or no heartbeats exist
  - [ ] Shows time of last heartbeat
  - [ ] `npm run build` passes
- **Files likely touched**: `components/dashboard/heartbeat-indicator.tsx`, `lib/queries/dashboard.ts`
