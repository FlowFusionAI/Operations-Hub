# Operations Hub Development Workflow Guide

## The Big Picture

Think of building Operations Hub like building a house:

1. **The PRD** = your blueprint (what you're building)
2. **The backlog** = your construction schedule (what order to build in)
3. **Each task** = one job for one worker (pour foundation, frame walls, etc.)
4. **Claude Code** = your worker — give it one clear job, it does it, you inspect, move on

The key insight: **Claude Code works best when it knows exactly what to do, what's already done, and what NOT to touch.** The entire system below is designed to give it that clarity.

---

## File Structure

```
BACKLOG.md                          <-- Dashboard: quick status scan (50 lines)
CLAUDE.md                           <-- Conventions Claude Code follows
WORKFLOW_GUIDE.md                   <-- This file (for you)

docs/
  PRD-v1.md                         <-- Full product requirements
  backlog/
    ACTIVE.md                       <-- Current task (what Claude Code reads)
    ICEBOX.md                       <-- Future ideas, post-MVP
    phase-1-foundation.md           <-- Detailed tasks for Phase 1
    phase-2-templates.md            <-- Detailed tasks for Phase 2
    phase-3-onboarding.md           <-- Detailed tasks for Phase 3
    phase-4-dashboard.md            <-- Detailed tasks for Phase 4
    phase-5-portal-settings.md      <-- Detailed tasks for Phase 5
    phase-6-automation.md           <-- Detailed tasks for Phase 6
    phase-7-polish.md               <-- Detailed tasks for Phase 7
    archive/                        <-- Completed phases move here
```

### What each file does

| File | Who reads it | Purpose |
|------|-------------|---------|
| `BACKLOG.md` | You | Quick scan: what's done, what's next (30 seconds) |
| `docs/backlog/ACTIVE.md` | Claude Code | Full spec of the current task (the only task context CC needs) |
| `docs/backlog/phase-*.md` | You | Detailed specs when picking or reviewing tasks |
| `docs/backlog/ICEBOX.md` | You | Park future ideas without cluttering the backlog |
| `docs/backlog/archive/` | Nobody (until needed) | Completed phases, out of sight |
| `CLAUDE.md` | Claude Code | Tech stack, conventions, rules |
| `docs/PRD-v1.md` | You / Claude Code (if needed) | Full product requirements |

---

## Your Daily Workflow

### Step 1: Pick a task (30 seconds)

Open `BACKLOG.md`. Scan the table. Find the next `todo` task whose dependencies are all `done`.

### Step 2: Read the task spec (1 minute)

Open the relevant `docs/backlog/phase-*.md` file. Read the task's description and acceptance criteria.

### Step 3: Activate the task (1 minute)

1. Copy the task spec into `docs/backlog/ACTIVE.md`
2. Update the task status to `active` in `BACKLOG.md`
3. Create a git branch:

```bash
git checkout master && git pull
git checkout -b feat/infrastructure   # use the branch name from the task
```

### Step 4: Start Claude Code

Use this prompt:

```
I'm working on task T-001 from docs/backlog/ACTIVE.md.
Read ACTIVE.md and CLAUDE.md for full context. Build what the task asks for.
```

That's it. Claude Code reads ACTIVE.md (one task, ~30 lines) + CLAUDE.md (conventions). It has everything it needs.

### Step 5: Review (5 minutes)

- Does it match the acceptance criteria?
- Does `npm run build` pass?
- Quick manual test in the browser

If something's wrong, tell Claude Code specifically: "The form doesn't validate that day_offset is a number" not "it's broken."

### Step 6: Complete the task

```bash
git add .
git commit -m "feat: project infrastructure setup (T-001)"
git checkout master
git merge feat/infrastructure
```

Then update the backlog:
1. Mark `done` in `BACKLOG.md` table
2. Update the Progress section counts
3. Clear `docs/backlog/ACTIVE.md` back to its empty state
4. Commit: `git commit -am "chore: complete T-001"`

### Step 7: Repeat

Pick the next task. When an entire phase is done, move its file to `docs/backlog/archive/`.

---

## Running Parallel Claude Code Instances

You can run 2-3 instances on different tasks IF they don't touch the same files.

**Can run in parallel:**
- T-005 (template list) + T-008 (employee list) — different pages
- T-016 (audit log page) + T-019 (settings page) — independent features

**Cannot run in parallel:**
- T-006 (template form) + T-007 (template detail) — both touch templates
- T-012 (task completion) + T-013 (instance management) — both touch onboarding

Each instance should be on its own branch. Merge one at a time back to master.

---

## How to Handle Problems

**Claude Code builds something wrong:**
Tell it specifically what's wrong. "The due date calculation doesn't skip weekends" not "it's wrong."

**A task is too big (>2 hours):**
Split it into subtasks in the phase file. Add the new tasks to BACKLOG.md. Finish the simpler part first.

**You're not sure how something should work:**
Check the PRD first. If the PRD doesn't cover it, make a decision, document it in CLAUDE.md under a "Decisions" section.

**Something is broken after merging:**
Create a hotfix task (T-XXX-fix) at the top of BACKLOG.md. Fix it before moving on.

**A new idea comes up:**
Add it to `docs/backlog/ICEBOX.md`. Don't let it derail the current phase.

---

## Rules for Maximum Efficiency

### For you (the human):
1. **One task, one branch, one session.** Never give Claude Code multiple tasks at once.
2. **Always start with "Read ACTIVE.md and CLAUDE.md."** This is the context injection that makes everything work.
3. **Review before merging.** 5 minutes reading what Claude Code built prevents bugs downstream.
4. **Keep BACKLOG.md updated.** It's your project management system.
5. **Archive completed phases.** Keeps the working directory clean.

### For Claude Code (enforced via CLAUDE.md):
1. Read ACTIVE.md for the current task spec
2. Stay in scope — only build what the task asks for
3. Follow existing patterns in the codebase
4. Run `npm run build` before saying it's done
5. Create audit log entries for every business action
