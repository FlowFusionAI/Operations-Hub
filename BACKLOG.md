# Operations Hub MVP — Task Dashboard

> Quick-scan progress tracker. For detailed task specs, see `docs/backlog/phase-*.md`.
> For the current task being worked on, see `docs/backlog/ACTIVE.md`.

**Statuses**: `todo` | `active` | `done` | `blocked`

---

## Progress

| Phase | Done | Total | Status |
|-------|------|-------|--------|
| 1. Foundation | 1 | 4 | In progress |
| 2. Templates | 0 | 3 | Not started |
| 3. Employees + Onboarding | 0 | 6 | Not started |
| 4. Dashboard + Visibility | 0 | 4 | Not started |
| 5. Portal + Settings + Invites | 0 | 3 | Not started |
| 6. Automation + Email | 0 | 2 | Not started |
| 7. Metrics + Polish | 0 | 2 | Not started |
| **Total** | **1** | **24** | |

---

## All Tasks

| ID | Task | Phase | Status | Depends On |
|----|------|-------|--------|------------|
| T-001 | Project Infrastructure Setup | 1 | done | none |
| T-002 | Auth Pages (Signup + Login) | 1 | todo | T-001 |
| T-003 | Org Creation Flow | 1 | todo | T-002 |
| T-004 | Protected App Layout + Navigation | 1 | todo | T-003 |
| T-005 | Templates List Page | 2 | todo | T-004 |
| T-006 | Template Create + Edit | 2 | todo | T-005 |
| T-007 | Template Detail + Dry-Run Preview | 2 | todo | T-006 |
| T-008 | Employees List + Create | 3 | todo | T-004 |
| T-009 | Employee Detail + Edit | 3 | todo | T-008 |
| T-010 | Start Onboarding (Materialization) | 3 | todo | T-009, T-007 |
| T-011 | Bulk Start Onboarding | 3 | todo | T-010 |
| T-012 | Task Completion Flow | 3 | todo | T-010 |
| T-013 | Onboarding Instance Management | 3 | todo | T-010 |
| T-014 | Dashboard — Today View | 4 | todo | T-010, T-012 |
| T-015 | Onboarding Instances List Page | 4 | todo | T-010 |
| T-016 | Audit Log Page | 4 | todo | T-004 |
| T-017 | Workflow Runs Page + Retry | 4 | todo | T-004 |
| T-018 | Employee Onboarding Portal | 5 | todo | T-010 |
| T-019 | Settings + Team Management | 5 | todo | T-004 |
| T-020 | Invite Flow | 5 | todo | T-019 |
| T-021 | Email Status Webhook Endpoint | 6 | todo | T-004 |
| T-022 | n8n Health Monitoring | 6 | todo | T-014 |
| T-023 | Metrics / ROI Dashboard Widget | 7 | todo | T-014, T-012 |
| T-024 | UI Polish + Empty/Loading States | 7 | todo | all previous |

---

## How to Use This File

1. Scan the table above to find the next `todo` task whose dependencies are all `done`
2. Open `docs/backlog/phase-N-*.md` to read the full task spec
3. Copy the task into `docs/backlog/ACTIVE.md` and set status to `active`
4. Create a git branch and start working
5. When done: mark `done` here, clear ACTIVE.md, update the Progress table
6. When a full phase is done, move its file to `docs/backlog/archive/`
