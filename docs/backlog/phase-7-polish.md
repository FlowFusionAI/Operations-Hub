# Phase 7: Metrics + Polish

> ROI metrics and final UI polish pass.
> These tasks are done last because they depend on all features being in place.

---

## T-023: Metrics / ROI Dashboard Widget
- **Status**: todo
- **Branch**: `feat/metrics`
- **Depends on**: T-014, T-012
- **Description**: Create a server action or query function that computes key metrics from existing data: average onboarding completion time (days), on-time task completion rate (%), tasks requiring reminders (%), overdue rate (%), active onboardings count, overall completion rate. Display these as a metrics widget/section on the dashboard.
- **Acceptance criteria**:
  - [ ] Metrics computed from onboarding and task data
  - [ ] Dashboard widget showing key metrics
  - [ ] Handles edge cases (no data, division by zero)
  - [ ] `npm run build` passes
- **Files likely touched**: `lib/queries/metrics.ts`, `components/dashboard/metrics-widget.tsx`

---

## T-024: UI Polish + Empty States + Loading States
- **Status**: todo
- **Branch**: `feat/polish`
- **Depends on**: all previous tasks
- **Description**: Go through every page and ensure: loading states (skeleton/spinner while data fetches), empty states (helpful messages when no data exists), consistent error handling (toast notifications for failures), responsive layout (works on tablet/desktop — mobile is nice-to-have), consistent styling and spacing. Fix any visual inconsistencies.
- **Acceptance criteria**:
  - [ ] Every page has loading states
  - [ ] Every list has empty states
  - [ ] Errors shown as toast notifications
  - [ ] Consistent spacing, typography, color usage
  - [ ] No broken layouts on tablet/desktop
  - [ ] `npm run build` and `npm run lint` pass clean
- **Files likely touched**: all page and component files
