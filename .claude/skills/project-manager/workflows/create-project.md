# Create Project

**Purpose:** Complete project intake workflow with telos alignment, priority assignment, folder creation, and README generation

**When to Use:**
- User requests creating a new project
- Triage workflow promotes backlog item to full project
- User says "make this a project", "create project for X"
- Idea is substantial enough to need dedicated project folder

**Prerequisites:**
- Access to projects directory: `D:\Program Files\Obsidian\projects\`
- Access to telos file: `D:\Program Files\Obsidian\telos\michael_telos.md`
- Access to PROJECT_SYSTEM.md for templates

---

## Workflow Steps

### Step 1: Gather Project Information

**Description:** Ask user clarifying questions to understand project scope

**Questions to Ask:**
1. **What is this project?** (Core capability/outcome)
2. **Why now?** (What triggered this need?)
3. **What does success look like?** (Concrete success criteria)
4. **When is it due?** (External deadline or self-imposed)
5. **What's the estimated effort?** (Hours/days/weeks)
6. **Any dependencies?** (Tools, people, prerequisites)

**Capture:**
```
Project Name: [Brief descriptive name in kebab-case]
Description: [1-2 sentence description]
Why Now: [Rationale for starting this project]
Success Criteria: [3-5 concrete outcomes that define "done"]
Due Date: [YYYY-MM-DD or "no deadline"]
Estimated Effort: [Time estimate]
Dependencies: [List of blockers or prerequisites]
```

**Expected Outcome:** Complete project context captured

---

### Step 2: Telos Alignment Analysis

**Description:** Map project to telos framework and validate alignment

**Read telos file:**
```
D:\Program Files\Obsidian\telos\michael_telos.md
```

**For this project, determine:**

**Mission Mapping:**
- **M1:** Build communities that mentor and connect people
- **M2:** Generate business success to fund medical missions
- **M3:** Build wealth through technology-enabled business acquisitions

Which mission(s) does this project serve?

**Goal Mapping:**
- **G1:** 10,000+ member community by 2030
- **G2:** $200K annual medical mission budget by 2030
- **G3:** $5M net worth by Oct 10, 2030
- **G4:** Business-focused friend group (10+ people)
- **G5:** 15% body fat by 2028
- **G6:** 4 international destinations by 2030

Which goal(s) does this advance?

**Strategy Mapping:**
- **S1:** 90-day sales sprint → $60k annual income (current focus)
- **S2:** Reduce restaurant hours as partnership revenue increases
- **S3:** Build acquisition knowledge via Stacy's operations
- **S4:** Hybrid model after $60k (60% sales, 40% content)

Which strategy does this support?

**Challenge Mapping:**
- **C1:** Emotional energy management
- **C2:** Action vs. avoidance
- **C3:** Foundational habit discipline
- **C4:** Leadership and motivation

Which challenge does this address?

**Telos Alignment Output:**
```
Mission: M[X] - [Mission statement]
Goal: G[X] - [Goal statement]
Strategy: S[X] - [Strategy statement]
Challenge: C[X] - [Challenge statement]

Alignment Strength: Strong / Moderate / Weak
Rationale: [Why this project matters for telos]
```

**If alignment is WEAK:**
- Challenge user: Is this a distraction?
- Ask: What makes this more important than telos-aligned work?
- Recommend: Defer to backlog unless user has strong rationale

**Expected Outcome:** Telos mapping complete with alignment score

---

### Step 3: Priority Assignment

**Description:** Assign P1/P2/P3 priority using decision tree

**Decision Tree (from PROJECT_SYSTEM.md lines 329-353):**
```
New project idea
    ↓
Does it generate revenue THIS QUARTER?
  YES → P1
  NO  → Continue
    ↓
Does it unblock current 90-day sprint (S1)?
  YES → P1
  NO  → Continue
    ↓
Does it create reusable system or automation?
  YES → P2
  NO  → Continue
    ↓
Does it build capacity for 2026-2030 goals?
  YES → P2
  NO  → P3 (Backlog)
```

**Walk through decision tree:**
1. Revenue this quarter? → [Yes/No] → [If Yes: P1]
2. Unblocks 90-day sprint (S1)? → [Yes/No] → [If Yes: P1]
3. Creates reusable system? → [Yes/No] → [If Yes: P2]
4. Builds 2026-2030 capacity? → [Yes/No] → [If Yes: P2]
5. Otherwise → P3

**Priority Assignment:**
```
Priority: P1 / P2 / P3
Decision Path: [Which question led to this priority?]
Rationale: [Specific reason for this priority]
```

**Expected Outcome:** Priority assigned with clear rationale

---

### Step 4: Check for P1 Conflicts (If P1)

**Description:** If assigning P1, check for existing active P1 projects

**Actions:**
```bash
ls "D:\Program Files\Obsidian\projects\" | grep "P1_.*_ACTIVE"
```

**If active P1 projects exist:**

Trigger reality check:
```
🚨 FOCUS CHECK 🚨

You're about to create: [PROJECT NAME] - P1

But you already have active P1 projects:
[List of existing P1 projects with telos mapping]

Question: Can you handle multiple P1 projects simultaneously?

Options:
A) Create as P1 and work on both (explain capacity)
B) Create as P2 and promote later (defer for now)
C) Replace existing P1 (deprioritize current work)

Recommendation: [Based on telos alignment and capacity]
```

**Ask user to confirm:**
- How will you balance multiple P1 projects?
- Which has higher impact on 90-day sprint?
- Should existing P1 be demoted?

**If no P1 conflicts OR user confirms:**
- Proceed to folder creation

**Expected Outcome:** P1 conflict resolved or confirmed

---

### Step 5: Determine Due Date

**Description:** Assign due date based on priority and user input

**Logic:**

**If user provided specific date:**
→ Use provided date (YYYY-MM-DD format)

**If P1 with external deadline:**
→ Use external deadline

**If P1 without deadline:**
→ Recommend: End of current 90-day sprint (calculate from sprint start)
→ Ask user to confirm or adjust

**If P2:**
→ If blocks other work: Assign reasonable milestone
→ If infrastructure: Use NODUE

**If P3:**
→ Always NODUE

**Due Date Output:**
```
Due Date: YY-MM-DD or NODUE
Rationale: [Why this date?]
```

**Expected Outcome:** Due date determined

---

### Step 6: Determine Initial Status

**Description:** Assign starting status

**Status Options:**
- **ACTIVE:** Starting work this week (has time allocated)
- **PLANNED:** Starting soon (this month, dependencies ready)
- **IDEA:** Captured but not started (no time allocated yet)

**Logic:**

**ACTIVE:**
- User is starting immediately
- P1 priority with urgent deadline
- Time is already allocated

**PLANNED:**
- Starting within 30 days
- Dependencies are ready
- Planning to allocate time soon

**IDEA:**
- Capturing for future
- Dependencies not ready
- No immediate time allocation

**Ask user:** "When do you plan to start this project?"
- This week → ACTIVE
- This month → PLANNED
- Later → IDEA

**Status Assignment:**
```
Initial Status: ACTIVE / PLANNED / IDEA
Rationale: [Why this status?]
```

**Expected Outcome:** Initial status assigned

---

### Step 7: Create Project Folder

**Description:** Create project folder following naming convention

**Naming Convention:**
```
P[1-3]_[YY-MM-DD|NODUE]_project-name_[STATUS]/
```

**Build folder name:**
```
Priority: P[X]
Due Date: [YY-MM-DD] or NODUE
Project Name: [kebab-case]
Status: [ACTIVE/PLANNED/IDEA]

Folder Name: P[X]_[DATE]_[name]_[STATUS]
```

**Create folder:**
```bash
mkdir "D:\Program Files\Obsidian\projects\P[X]_[DATE]_[project-name]_[STATUS]"
```

**Verify creation:**
```bash
ls "D:\Program Files\Obsidian\projects\" | grep "[project-name]"
```

**Expected Outcome:** Project folder created with correct name

---

### Step 8: Generate Project README

**Description:** Create README.md inside project folder with complete project context

**Template (from PROJECT_SYSTEM.md lines 237-274):**

```markdown
# [Project Name]

**Priority:** P[1-3]
**Status:** [ACTIVE/PLANNED/IDEA]
**Due Date:** [YY-MM-DD or NODUE]
**Created:** [YYYY-MM-DD]

---

## Telos Alignment

**Mission:** M[X] - [Mission statement]
**Goal:** G[X] - [Goal statement]
**Strategy:** S[X] - [Strategy statement]
**Challenge Addressed:** C[X] - [Challenge statement]

**Impact Score:** [1-10]
- Revenue potential: [1-10]
- Time saved: [1-10]
- Skill building: [1-10]
- Mission alignment: [1-10]

---

## Project Overview

[What this project does - 2-3 paragraphs]

**Problem:** [What problem does this solve?]

**Solution:** [How does this project solve it?]

**Value:** [Why is this valuable?]

---

## Why Now?

[Why this is the right priority level and timing]

[Specific rationale based on telos alignment and current focus]

---

## Success Criteria

- [ ] [Concrete outcome 1 - measurable]
- [ ] [Concrete outcome 2 - measurable]
- [ ] [Concrete outcome 3 - measurable]
- [ ] [Concrete outcome 4 - measurable]
- [ ] [Concrete outcome 5 - measurable]

---

## Next Actions

- [ ] [Immediate first action]
- [ ] [Second action]
- [ ] [Third action]

---

## Dependencies

**Required:**
- [Dependency 1]
- [Dependency 2]

**Nice to Have:**
- [Optional dependency 1]

---

## Estimated Effort

**Time:** [Hours/Days/Weeks]
**Complexity:** [Low/Medium/High]

---

## Notes

[Any additional context, links, or references]

---

**Last Updated:** [YYYY-MM-DD]
```

**Write README:**
```bash
[Create file at project folder path]/README.md
```

**Expected Outcome:** Complete README generated in project folder

---

### Step 9: Provide Creation Summary

**Description:** Inform user of project creation with next steps

**Summary Format:**
```markdown
✅ Project Created Successfully

**Project:** [Project Name]
**Location:** D:\Program Files\Obsidian\projects\P[X]_[DATE]_[name]_[STATUS]/
**Priority:** P[X] - [Priority Type Name]
**Status:** [STATUS]
**Due:** [Date or NODUE]

**Telos Alignment:**
- Mission: M[X]
- Goal: G[X]
- Strategy: S[X]
- Challenge: C[X]

**Alignment Strength:** [Strong/Moderate/Weak]
**Rationale:** [Why this project matters]

**Success Criteria:**
1. [Criterion 1]
2. [Criterion 2]
3. [Criterion 3]

**Next Actions:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Immediate Next Step:** [What to do first]

[If P1 and conflicts exist:]
⚠️ REMINDER: You now have [N] active P1 projects. Ensure you can maintain focus on both.
```

**Expected Outcome:** User has clear summary and knows next steps

---

## Outputs

**What this workflow produces:**
- Project folder with naming convention
- Complete README.md with telos mapping
- Project creation summary

**Where outputs are stored:**
- Project folder: `D:\Program Files\Obsidian\projects\P[X]_[DATE]_[name]_[STATUS]/`
- README: Inside project folder
- Summary: Returned to user in conversation

---

## Related Workflows

- **capture-and-triage.md** - Captures ideas that may become projects
- **priority-check.md** - Validates priority assignment
- **update-status.md** - Changes project status after creation

---

## Examples

**Example 1: Creating P1 Project**

Input: "Create project for building a sales call analysis AI tool"

Process:
1. Gathered info:
   - Project: Sales call analysis with AI
   - Why: Improve sales effectiveness for 90-day sprint
   - Success: Analyze 100+ calls, identify patterns, improve close rate
   - Due: End of 90-day sprint (2026-01-15)
   - Effort: 2-3 weeks
   - Dependencies: Call recordings, AI API

2. Telos mapping:
   - Mission: M3 (business acquisitions)
   - Goal: G3 ($5M by 2030)
   - Strategy: S1 (90-day sales sprint → $60k)
   - Challenge: C2 (action vs avoidance - forces data-driven improvement)
   - Alignment: STRONG

3. Priority: P1 (directly drives revenue this quarter, supports S1)

4. P1 check: 1 existing P1 (KPI dashboard)
   - Reality check triggered
   - User confirmed: KPI dashboard nearly done, can start call analysis

5. Due date: 26-01-15 (end of sprint)

6. Status: PLANNED (starting next week)

7. Folder created: `P1_26-01-15_sales-call-ai-analysis_PLANNED/`

8. README generated with full telos mapping

Output:
```
✅ Project Created Successfully

**Project:** Sales Call AI Analysis
**Location:** D:\Program Files\Obsidian\projects\P1_26-01-15_sales-call-ai-analysis_PLANNED/
**Priority:** P1 - Critical (Active Strategies)
**Status:** PLANNED
**Due:** 2026-01-15

**Telos Alignment:**
- Mission: M3 (Build wealth via acquisitions)
- Goal: G3 ($5M by 2030)
- Strategy: S1 (90-day sales sprint → $60k)
- Challenge: C2 (Action vs avoidance)

**Alignment Strength:** Strong
**Rationale:** Directly improves sales effectiveness during critical 90-day sprint, generating revenue to fund partnership validation and future acquisition down payment.

**Success Criteria:**
1. Analyze 100+ sales calls with AI transcription
2. Identify top 5 winning patterns from successful calls
3. Identify top 5 losing patterns from failed calls
4. Improve close rate by 10% using insights
5. Document best practices for Stacy's firm

**Next Actions:**
1. Set up AI transcription service (Otter.ai or equivalent)
2. Collect past call recordings (if available)
3. Define analysis framework (what to look for)

**Immediate Next Step:** Research AI transcription APIs and select tool

⚠️ REMINDER: You now have 2 active P1 projects (KPI Dashboard, Call Analysis).
KPI dashboard is in Phase 2-3 completion. Plan to finish dashboard before heavy focus on call analysis.
```

---

## Notes

**Critical Success Factors:**
1. ALWAYS map to telos - no exceptions
2. Use decision tree correctly - don't skip steps
3. Trigger reality checks for P1 conflicts
4. Generate complete README - this is project source of truth
5. Challenge weak telos alignment - be honest

**Common Pitfalls:**
- ❌ Creating projects for small tasks (use todos instead)
- ❌ Accepting all projects as P1 (priority inflation)
- ❌ Skipping telos alignment (creates misalignment later)
- ❌ Not checking for P1 conflicts (dilutes focus)
- ❌ Incomplete README (loses context over time)

**README Quality:**
- Success criteria must be MEASURABLE (not vague)
- Next actions must be SPECIFIC (not generic)
- Telos mapping must be HONEST (not forced)

---

**Last Updated:** 2025-12-01
