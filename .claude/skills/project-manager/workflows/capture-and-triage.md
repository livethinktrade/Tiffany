# Capture and Triage Notes

**Purpose:** Process post-session brain dumps by capturing all ideas, organizing by relevance, and triaging into appropriate project folders or backlog

**When to Use:**
- User dumps notes after work session
- User has multiple ideas to organize
- User says "brain dump", "dump my notes", "capture these ideas"
- Post-session idea organization needed

**Prerequisites:**
- Access to projects directory: `D:\Program Files\Obsidian\projects\`
- Access to telos file: `D:\Program Files\Obsidian\telos\michael_telos.md`
- Backlog file exists: `0_Tiffany Improvements Backlog.md`

---

## Workflow Steps

### Step 1: Capture All Ideas

**Description:** Listen to user's complete brain dump and extract all discrete ideas

**Actions:**
- Let user finish complete thought dump without interruption
- Identify distinct ideas, projects, tasks, or thoughts
- Number each idea for tracking
- Note any context or rationale provided

**Expected Outcome:** Complete list of ideas captured

**Example:**
```
User brain dump:
"I had an idea for automating LinkedIn posts, thought about building a habit tracker,
need to update my resume, and saw a cool AI diagram tool"

Captured ideas:
1. Automate LinkedIn posts
2. Build habit tracking dashboard
3. Update resume
4. Explore AI diagram tool
```

---

### Step 2: Initial Categorization

**Description:** Categorize each idea by type and potential scope

**Categories:**
- **New Project:** Requires dedicated project folder (substantial work)
- **Addition to Existing Project:** Enhances current project
- **Backlog Item:** Quick idea capture, not ready for full project
- **Immediate Action:** Quick task, doesn't need project structure
- **Discard:** Doesn't align with telos, clear distraction

**For each idea:**
```
Idea: [Description]
Type: [New Project / Existing Project / Backlog / Action / Discard]
Related Project: [If applicable]
Estimated Scope: [Small / Medium / Large]
```

**Expected Outcome:** All ideas categorized by type

---

### Step 3: Telos Alignment Check

**Description:** Map each idea to telos elements and assess alignment

**For each idea, check:**
1. **Which mission does this serve?** (M1, M2, M3)
2. **Which goal does this advance?** (G1-G6)
3. **Which strategy does this support?** (S1-S4)
4. **Which challenge does this address?** (C1-C4)
5. **Does it align with 90-day sprint focus?**

**Alignment Scoring:**
- **Strong:** Maps to current 90-day sprint (S1) or active goals
- **Moderate:** Supports 2026-2030 goals or infrastructure
- **Weak:** Interesting but no clear telos connection
- **None:** Distraction, doesn't serve missions

**Expected Outcome:** Telos mapping for each idea

---

### Step 4: Priority Assignment (Preliminary)

**Description:** Assign preliminary priority level using decision tree

**Decision Tree:**
```
Does it generate revenue THIS QUARTER?
  YES → P1
  NO  → Continue

Does it unblock current 90-day sprint (S1)?
  YES → P1
  NO  → Continue

Does it create reusable system or automation?
  YES → P2
  NO  → Continue

Does it build capacity for 2026-2030 goals?
  YES → P2
  NO  → P3 (Backlog)
```

**For each idea:**
```
Idea: [Description]
Telos Mapping: [Mission/Goal/Strategy/Challenge]
Priority: P1 / P2 / P3
Rationale: [Why this priority?]
```

**Expected Outcome:** Priority assignment with clear rationale

---

### Step 5: Check for P1 Conflicts

**Description:** If any ideas are P1, check if user already has active P1 projects

**Actions:**
```bash
ls -la "D:\Program Files\Obsidian\projects\" | grep "P1_.*_ACTIVE"
```

**If active P1 projects exist AND new idea is P1:**
- Flag for reality check
- Ask user to confirm priority
- Note potential focus dilution

**If no P1 conflicts:**
- Proceed to routing

**Expected Outcome:** P1 conflict check complete, reality check triggered if needed

---

### Step 6: Route Ideas to Destinations

**Description:** Move each idea to its appropriate destination

**Routing Logic:**

**Type: New Project (P1 or P2)**
→ Create project folder using create-project.md workflow
→ Generate README with telos mapping

**Type: New Project (P3)**
→ Add detailed entry to backlog file
→ Include telos mapping and scope estimate

**Type: Addition to Existing Project**
→ Append to existing project's README or task list
→ Update project metadata if needed

**Type: Backlog Item**
→ Add to `0_Tiffany Improvements Backlog.md`
→ Use format: `N. [Idea] - [One-line description]`

**Type: Immediate Action**
→ Create todo item or remind user
→ Don't create project structure

**Type: Discard**
→ Explain why it doesn't align
→ Offer to save in separate "ideas_archive" if user wants

**Expected Outcome:** All ideas routed to appropriate locations

---

### Step 7: Generate Triage Summary

**Description:** Provide clear summary of what happened to each idea

**Summary Format:**
```markdown
# Idea Triage Summary - [Date]

## Ideas Captured: [N]

### New Projects Created ([N])
1. **[Project Name]** - P[X] - [Status]
   - Telos: [Mapping]
   - Location: [Folder path]
   - Rationale: [Why this priority]

### Added to Existing Projects ([N])
1. **[Idea]** → [Existing Project Name]
   - Location: [Where added]

### Added to Backlog ([N])
1. **[Idea]** - [One line description]
   - Potential Priority: P[X]
   - Telos: [Mapping]
   - Next Step: [When to revisit]

### Immediate Actions ([N])
1. **[Action]** - [What to do]

### Discarded ([N])
1. **[Idea]** - [Why discarded]

## Focus Recommendations

**Current P1 Projects:** [List]
**Recommended Next Actions:** [Specific steps]
**Deferred Until:** [What to wait for before revisiting P2/P3 ideas]

## Reality Checks Triggered

[If any P1 conflicts or focus dilution concerns, note here]
```

**Expected Outcome:** Complete triage summary provided to user

---

## Outputs

**What this workflow produces:**
- Triage summary (markdown report)
- New project folders (if applicable)
- Updated backlog file
- Updated existing project files
- Reality check prompts (if P1 conflicts)

**Where outputs are stored:**
- Project folders: `D:\Program Files\Obsidian\projects\P[X]_*\`
- Backlog: `D:\Program Files\Obsidian\projects\0_Tiffany Improvements Backlog.md`
- Triage summary: Returned to user in conversation

---

## Related Workflows

- **create-project.md** - Use for new P1/P2 project ideas that need full project structure
- **manage-backlog.md** - Use when adding P3 ideas to backlog
- **priority-check.md** - Use when reality check is needed for P1 conflicts

---

## Examples

**Example 1: Mixed Idea Types**

Input:
```
"I had three ideas today:
1. Build an AI tool to analyze my sales calls
2. Update the KPI dashboard with new metrics
3. Try out that new note-taking app everyone's using"
```

Process:
1. Captured 3 ideas
2. Categorized:
   - Idea 1: New Project (substantial work)
   - Idea 2: Existing Project addition (KPI dashboard exists)
   - Idea 3: Backlog (exploration, low priority)
3. Telos mapping:
   - Idea 1 → S1 (90-day sales sprint), G3 ($5M by 2030) → P1
   - Idea 2 → S1 (tracks progress) → Existing P1 project
   - Idea 3 → No clear mapping → P3
4. Check P1 conflicts: Yes, KPI dashboard already P1
5. Reality check triggered for Idea 1
6. Routing:
   - Idea 1: Ask user to confirm priority (new P1 while existing P1 active)
   - Idea 2: Add to KPI dashboard project README
   - Idea 3: Add to backlog

Output:
```
# Idea Triage Summary

## New Projects Created (0 - Pending User Confirmation)
1. **AI Sales Call Analysis** - P1 (PENDING) - PLANNED
   - Telos: S1 (90-day sales sprint), G3 ($5M by 2030)
   - Rationale: Directly improves sales effectiveness
   - ⚠️ REALITY CHECK: You have active P1 (KPI Dashboard). Confirm priority?

## Added to Existing Projects (1)
1. **New KPI metrics** → P1_25-12-10_kpi-telegram-dashboard_ACTIVE
   - Location: Added to README task list

## Added to Backlog (1)
1. **Try new note-taking app** - Exploration, no immediate telos alignment
   - Potential: P3
   - Next Step: Revisit after 90-day sprint completes

## Reality Checks Triggered

🚨 FOCUS CHECK: You're considering new P1 work while existing P1 is active.
Current P1: KPI Telegram Dashboard (S1 - tracks sales sprint)
New P1 Idea: AI Sales Call Analysis (S1 - improves sales)

Both align with 90-day sprint. Questions:
1. Can you work on both simultaneously?
2. Which has higher impact on $60k income goal?
3. Should one wait until the other completes?

Recommendation: Complete KPI dashboard first (nearly done Phase 2-3), then start call analysis.
```

**Example 2: Pure Backlog Additions**

Input:
```
"Random thoughts: Maybe learn Rust, explore that AI image generator,
read that business book on acquisitions"
```

Process:
1. Captured 3 ideas (all exploratory)
2. All categorized as Backlog items
3. Weak telos alignment (learning, not immediate mission support)
4. All assigned P3
5. No P1 conflicts
6. All routed to backlog file

Output:
```
# Idea Triage Summary

## Added to Backlog (3)
1. **Learn Rust** - Programming language exploration
   - Telos: S3 (tech stack exploration) - weak alignment
   - Next Step: Consider after achieving P1/P2 milestones

2. **AI image generator tool** - Creative tool exploration
   - Telos: Could support content creation (weak)
   - Next Step: Evaluate when content creation becomes priority

3. **Business book on acquisitions** - Learning resource
   - Telos: M3 ($5M via acquisitions) - moderate alignment
   - Next Step: Good reading for downtime, not active project

## Focus Recommendations

All ideas added to backlog for future consideration. Your current focus should remain:
- P1: Personal Finance Analysis (C3 - foundational habits)
- S1: 90-day sales sprint → $60k income

Consider exploring these P3 ideas AFTER hitting $60k milestone or during scheduled learning time.
```

---

## Notes

**Critical Success Factors:**
1. Capture EVERYTHING - don't filter during initial dump
2. ALWAYS check telos alignment - no exceptions
3. Trigger reality checks for P1 conflicts - protect focus
4. Be honest about discarding misaligned ideas
5. Provide clear routing summary - user knows where everything went

**Common Pitfalls:**
- ❌ Accepting all ideas as P1 (priority inflation)
- ❌ Skipping telos check (creates misalignment)
- ❌ Not challenging user on distractions (enabler, not scrum master)
- ❌ Creating projects for small tasks (over-engineering)

**Scrum Master Mindset:**
- Your job: Protect focus, enforce priorities, challenge distractions
- Not your job: Accept everything, be agreeable, avoid hard questions
- Remember: User hired you to be honest, not nice

---

**Last Updated:** 2025-12-01
