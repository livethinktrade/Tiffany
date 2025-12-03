# Update Project Status

**Purpose:** Update project status and folder naming - handle transitions between IDEA/PLANNED/ACTIVE/HOLD/DONE

**When to Use:**
- User requests status change for existing project
- Project transitions to new phase
- User says "mark as complete", "put on hold", "start this project"
- Status no longer matches reality

**Prerequisites:**
- Access to projects directory: `D:\Program Files\Obsidian\projects\`
- Existing project folder to update
- New status to apply

---

## Workflow Steps

### Step 1: Identify Target Project

**Description:** Find the project that needs status update

**Ask user:**
- Which project do you want to update?
- What's the current status?
- What should the new status be?

**Locate project:**
```bash
ls "D:\Program Files\Obsidian\projects\" | grep "[project-name]"
```

**Capture:**
```
Project Name: [name]
Current Folder: P[X]_[DATE]_[name]_[CURRENT_STATUS]
Current Status: [ACTIVE/PLANNED/IDEA/HOLD]
New Status: [ACTIVE/PLANNED/IDEA/HOLD/DONE/COMPLETED]
Reason: [Why status is changing]
```

**Expected Outcome:** Project identified and status change defined

---

### Step 2: Validate Status Transition

**Description:** Ensure status transition makes sense

**Valid Transitions:**

**IDEA → PLANNED:**
- When: Dependencies ready, time allocated
- Check: Is planning complete? Are prerequisites met?

**IDEA → ACTIVE:**
- When: Starting immediately (rare - usually goes through PLANNED)
- Check: Is user really starting work this week?

**PLANNED → ACTIVE:**
- When: Work has begun, time is being spent
- Check: Is user actively working on this?

**ACTIVE → HOLD:**
- When: Blocked, paused, or deprioritized
- Check: What's blocking this? When will it resume?

**ACTIVE → DONE/COMPLETED:**
- When: All success criteria met
- Check: Are success criteria actually complete?

**HOLD → PLANNED:**
- When: Blocker removed, ready to restart
- Check: What unblocked this?

**HOLD → ACTIVE:**
- When: Resuming work immediately
- Check: Is blocker truly resolved?

**Any → DONE/COMPLETED:**
- When: Project finished or abandoned
- Check: Success criteria met OR decision to abandon?

**Ask validation questions based on transition:**
```
From: [CURRENT_STATUS]
To: [NEW_STATUS]

Validation Question: [Specific question for this transition]
User Answer: [Capture response]

Valid: [Yes/No]
```

**If invalid transition:**
- Explain why it doesn't make sense
- Recommend intermediate status
- Ask user to clarify

**Expected Outcome:** Status transition validated

---

### Step 3: Check for Priority Change

**Description:** Determine if status change should also change priority

**Scenarios requiring priority check:**

**Status: IDEA or HOLD → Priority might drop**
- If project is paused/held, should it be demoted to P2 or P3?
- Ask: "This project is on HOLD. Should it remain P[X] or be deprioritized?"

**Status: → ACTIVE → Priority might rise**
- If starting work on P2/P3, should it be promoted to P1?
- Ask: "You're activating this P[X] project. Does it need to be P1?"

**Status: → DONE → Priority irrelevant**
- Completed projects don't need priority
- Will be archived or kept for reference

**Ask user if priority should change:**
```
Current Priority: P[X]
New Status: [NEW_STATUS]

Question: Should priority change?
  - Keep as P[X]
  - Change to P[Y] (if so, why?)

User Decision: [Keep/Change]
New Priority: P[X] or P[Y]
Rationale: [Why this priority]
```

**Expected Outcome:** Priority confirmed or updated

---

### Step 4: Update Project Folder Name

**Description:** Rename folder to reflect new status (and priority if changed)

**Build new folder name:**
```
Priority: P[X or updated]
Due Date: [Unchanged - YY-MM-DD or NODUE]
Project Name: [Unchanged - kebab-case]
Status: [NEW_STATUS]

New Folder Name: P[X]_[DATE]_[name]_[NEW_STATUS]
```

**Rename folder:**
```bash
# On Windows (via WSL):
mv "/mnt/d/Program Files/Obsidian/projects/P[X]_[DATE]_[name]_[OLD_STATUS]" \
   "/mnt/d/Program Files/Obsidian/projects/P[X]_[DATE]_[name]_[NEW_STATUS]"
```

**Verify rename:**
```bash
ls "/mnt/d/Program Files/Obsidian/projects/" | grep "[project-name]"
```

**Expected Outcome:** Folder renamed with new status

---

### Step 5: Update Project README

**Description:** Update README.md to reflect new status and capture transition context

**Read current README:**
```bash
cat "/mnt/d/Program Files/Obsidian/projects/P[X]_[DATE]_[name]_[NEW_STATUS]/README.md"
```

**Update these sections:**

**1. Header section (Priority/Status/Due):**
```markdown
**Priority:** P[X or updated]
**Status:** [NEW_STATUS]
**Due Date:** [Unchanged or updated if needed]
**Last Status Change:** [YYYY-MM-DD]
```

**2. Add status change log entry:**
```markdown
## Status History

- **[YYYY-MM-DD]:** [OLD_STATUS] → [NEW_STATUS] - [Reason for change]
- [Previous entries...]
```

**3. Update Next Actions (if relevant):**
- If ACTIVE: Ensure next actions are current
- If HOLD: Add "Blocked by: [reason]" and "Resume when: [condition]"
- If DONE: Mark all success criteria complete, note completion date

**Example status log entry:**
```markdown
## Status History

- **2025-12-01:** PLANNED → ACTIVE - Started work on Phase 1, time allocated
- **2025-11-28:** IDEA → PLANNED - Dependencies ready, planning complete
- **2025-11-25:** Created as IDEA - Initial concept captured
```

**Write updated README back to file**

**Expected Outcome:** README reflects new status with context

---

### Step 6: Handle DONE/COMPLETED Projects

**Description:** If status is DONE or COMPLETED, decide on archival

**Ask user:**
```
This project is now DONE/COMPLETED.

Options:
A) Leave in projects directory (keep visible)
B) Move to archive/ directory (clean up active list)
C) Delete entirely (if failed/abandoned and not worth keeping)

What would you like to do?
```

**If option B (archive):**
```bash
# Create archive directory if it doesn't exist
mkdir -p "/mnt/d/Program Files/Obsidian/projects/archive"

# Move project to archive
mv "/mnt/d/Program Files/Obsidian/projects/P[X]_[DATE]_[name]_DONE" \
   "/mnt/d/Program Files/Obsidian/projects/archive/"
```

**If option C (delete):**
```bash
# Confirm with user first!
rm -rf "/mnt/d/Program Files/Obsidian/projects/P[X]_[DATE]_[name]_DONE"
```

**Expected Outcome:** Completed project handled appropriately

---

### Step 7: Check P1 Balance After Update

**Description:** If status change affects P1 projects, check overall P1 balance

**Scenarios:**

**Promoted to P1 (PLANNED/IDEA → ACTIVE at P1):**
- Count current active P1 projects
- If > 2-3 P1 projects: Warn about focus dilution
- Trigger reality check if needed

**Demoted from P1 (ACTIVE P1 → HOLD or lower priority):**
- Note that P1 capacity is freed
- Suggest reviewing backlog for P2 → P1 promotion

**P1 Completed (ACTIVE P1 → DONE):**
- Celebrate completion
- Note freed P1 capacity
- Suggest what to work on next from P2 pipeline

**Check active P1 count:**
```bash
ls "/mnt/d/Program Files/Obsidian/projects/" | grep "P1_.*_ACTIVE" | wc -l
```

**If > 3 active P1 projects:**
```
⚠️ FOCUS WARNING ⚠️

You now have [N] active P1 projects:
[List projects]

Recommendation: 2-3 P1 projects maximum for effective focus.
Consider: Which P1 can be demoted to P2 or put on HOLD?
```

**Expected Outcome:** P1 balance checked, warnings issued if needed

---

### Step 8: Provide Status Update Summary

**Description:** Confirm status change and provide context

**Summary Format:**
```markdown
✅ Project Status Updated

**Project:** [Project Name]
**Old Status:** [OLD_STATUS]
**New Status:** [NEW_STATUS]
**Priority:** P[X] [if changed: (changed from P[Y])]

**Reason for Change:** [User's rationale]

**Updated Location:**
D:\Program Files\Obsidian\projects\P[X]_[DATE]_[name]_[NEW_STATUS]/

**What Changed:**
- Folder renamed to reflect new status
- README updated with status change log
- [If archived]: Moved to archive/
- [If P1 balance affected]: P1 count updated

**Current P1 Projects:** [N]
[If relevant: List active P1 projects]

[If ACTIVE:]
**Next Actions:**
1. [First action from README]
2. [Second action]
3. [Third action]

[If HOLD:]
**Blocked By:** [Blocker]
**Resume When:** [Condition to restart]

[If DONE:]
**Completion Date:** [Date]
**Success Criteria Met:** [Y/N - list which ones]
**Archived:** [Yes/No]

[If P1 completed:]
🎉 **P1 Completed! Focus capacity freed.**
**Recommendations for next P1:**
[Suggest P2 projects to promote or next priorities]
```

**Expected Outcome:** User has clear confirmation and context

---

## Outputs

**What this workflow produces:**
- Renamed project folder
- Updated README with status log
- Status update summary
- P1 balance check (if relevant)
- Archived project (if DONE)

**Where outputs are stored:**
- Project folder: `D:\Program Files\Obsidian\projects\P[X]_[DATE]_[name]_[NEW_STATUS]/`
- Archive: `D:\Program Files\Obsidian\projects/archive/` (if archived)
- Summary: Returned to user in conversation

---

## Related Workflows

- **create-project.md** - Creates projects with initial status
- **review-projects.md** - Shows all project statuses
- **priority-check.md** - Validates priority changes

---

## Examples

**Example 1: PLANNED → ACTIVE**

Input: "Mark the sales CRM project as active, I'm starting work on it this week"

Output:
```
✅ Project Status Updated

**Project:** Sales CRM for Stacy's Firm
**Old Status:** PLANNED
**New Status:** ACTIVE
**Priority:** P1

**Reason for Change:** Starting work this week, time allocated

**Updated Location:**
D:\Program Files\Obsidian\projects\P1_26-01-15_sales-crm-stacy-firm_ACTIVE/

**What Changed:**
- Folder renamed: P1_26-01-15_sales-crm-stacy-firm_ACTIVE
- README updated with status change log:
  - 2025-12-01: PLANNED → ACTIVE - Started work, time allocated

**Current P1 Projects:** 2
1. P1_25-12-01_personal-finance-analysis_ACTIVE (ongoing)
2. P1_26-01-15_sales-crm-stacy-firm_ACTIVE (just activated)

**Next Actions:**
1. Set up database schema for CRM
2. Design UI wireframes
3. Interview Stacy about sales workflow needs

✅ Healthy P1 balance (2 projects). Focus split between ongoing finance tracking and new CRM build.
```

**Example 2: ACTIVE → HOLD (with blocker)**

Input: "Put the habit dashboard on hold, I need to finish the CRM first"

Output:
```
✅ Project Status Updated

**Project:** Habit Tracking Dashboard
**Old Status:** ACTIVE
**New Status:** HOLD
**Priority:** P2 (unchanged)

**Reason for Change:** Deprioritized to focus on P1 CRM project

**Updated Location:**
D:\Program Files\Obsidian\projects\P2_NODUE_habit-tracking-dashboard_HOLD/

**What Changed:**
- Folder renamed: P2_NODUE_habit-tracking-dashboard_HOLD
- README updated with status change log:
  - 2025-12-01: ACTIVE → HOLD - Deprioritized for P1 focus (Sales CRM)
- README updated with blocker info

**Blocked By:** Focus needed on P1 Sales CRM project
**Resume When:** After Sales CRM reaches Phase 2 or Q1 2026

**Current P1 Projects:** 2
1. P1_25-12-01_personal-finance-analysis_ACTIVE
2. P1_26-01-15_sales-crm-stacy-firm_ACTIVE

✅ Good decision - protecting P1 focus by pausing P2 work.
```

**Example 3: ACTIVE → DONE (with archival)**

Input: "Mark the KPI dashboard as completed, all phases done"

Output:
```
✅ Project Status Updated

**Project:** KPI Telegram Dashboard
**Old Status:** ACTIVE
**New Status:** COMPLETED
**Priority:** P1 (completed)

**Reason for Change:** All success criteria met, Phases 2-3 complete

**Updated Location:**
D:\Program Files\Obsidian\projects\archive\P1_25-12-10_kpi-telegram-dashboard_COMPLETED/

**What Changed:**
- Folder renamed: P1_25-12-10_kpi-telegram-dashboard_COMPLETED
- README updated with completion date (2025-12-01)
- Project moved to archive/ directory
- README updated with status change log:
  - 2025-12-01: ACTIVE → COMPLETED - All phases delivered

**Completion Date:** 2025-12-01
**Success Criteria Met:** ✅ All 5 criteria complete
- ✅ Phase 1: Basic tracking
- ✅ Phase 2: Telegram integration
- ✅ Phase 3: Advanced metrics
- ✅ Phase 4: Automation
- ✅ Phase 5: Dashboard visualization

**Archived:** Yes (moved to archive/)

🎉 **P1 Completed! Focus capacity freed.**

**Current P1 Projects:** 1
1. P1_25-12-01_personal-finance-analysis_ACTIVE

**Recommendations for next P1:**
You now have capacity for another P1 project. Consider:
1. P1_26-01-15_sales-crm-stacy-firm_PLANNED (already planned, ready to activate)
2. Review P2 pipeline for promotion opportunities
3. Continue focused work on remaining P1 (personal finance)

Recommendation: Activate Sales CRM as your new P1 focus.
```

---

## Notes

**Critical Success Factors:**
1. Validate status transitions make sense
2. Update folder name AND README
3. Check P1 balance after changes
4. Document reason for status change
5. Handle archival for completed projects

**Common Pitfalls:**
- ❌ Updating folder but not README (inconsistent state)
- ❌ Not documenting WHY status changed (lose context)
- ❌ Skipping P1 balance check (focus dilution)
- ❌ Not archiving completed projects (cluttered directory)
- ❌ Invalid status transitions (IDEA → DONE without work)

**Status Change Philosophy:**
- Status should reflect REALITY, not aspiration
- ACTIVE means time is allocated THIS WEEK
- PLANNED means starting THIS MONTH
- HOLD means temporarily paused with clear resume condition
- DONE means success criteria met OR decision to abandon

**When to challenge user:**
- Marking as DONE without meeting success criteria
- Too many projects transitioning to ACTIVE (P1 overload)
- Putting P1 on HOLD without clear blocker
- Rapidly cycling statuses (indecision)

---

**Last Updated:** 2025-12-01
