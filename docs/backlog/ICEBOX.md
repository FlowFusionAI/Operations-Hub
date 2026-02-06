# Icebox — Future Ideas & Post-MVP

> Tasks and ideas that are out of scope for MVP but worth tracking.
> Move items from here into a phase file when they become prioritized.

---

## Post-MVP Enhancements

### Employee Self-Completion via Portal
- Allow employees to mark tasks as "completed" directly from the portal
- Adds a button + simple mutation to the read-only portal
- PRD labels this as stretch goal

### Org Switcher (Multi-Org Users)
- If a user belongs to multiple orgs, add an org switcher to the sidebar
- PRD mentions this but defers it
- Current assumption: one user = one org for MVP

### Document Signing Integration
- DocuSign/HelloSign integration for tasks that require signatures
- Tracked as a future module enhancement in PRD

### Conditional Task Logic
- If employee role = X, include task Y in the template
- Requires template branching — explicitly excluded from MVP

### Custom Notification Channels
- Slack, SMS, in-app notifications beyond email
- Requires integration registry expansion

### Advanced Task Dependencies
- Full DAG support (multiple blockers, parallel paths)
- MVP only supports simple linear `blocked_by` chains

### Employee Search + Filtering
- Advanced search/filter on employees list (by start date range, manager, onboarding status)
- Basic list works for MVP; this becomes important at scale

### Template Version History Page
- Dedicated page showing version diffs for a template
- PRD mentions "version history (which version, when changed)"
- MVP tracks version numbers; full diff view is post-MVP

### Email Template Customization UI
- MVP stores email templates in code
- Future: admin-editable email templates with variable substitution

### Per-Department Permissions
- Scope manager visibility to specific departments/teams
- MVP: managers see all employees they're assigned to

### Metrics Export / PDF Reports
- Export ROI metrics as PDF or CSV for client presentations
- Useful for sales and retention

### Webhook on Instance Completion
- Fire a webhook to external systems (HRIS, payroll) when onboarding completes
- Event already emitted (`onboarding.instance_completed`), just needs webhook delivery
