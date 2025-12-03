# Review Projects

**Purpose:** Generate project dashboard showing P1/P2/P3 breakdown and recommendations

**When to Use:**
- User requests project review
- User says "what am I working on", "show projects", "project status"
- Weekly/monthly review cadence
- Need to see overall project health

**Prerequisites:**
- Access to projects directory: `D:\Program Files\Obsidian\projects\`
- Access to telos file for alignment context
- Access to backlog file for complete picture

---

## Workflow Steps

### Step 1: Scan Projects Directory

**Description:** Get complete list of all projects

**List all projects:**
```bash
ls "D:\Program Files\Obsidian\projects\" | grep "P[1-3]_"
```

**For each project, extract:**
- Priority: P[1-3]
- Due date: YY-MM-DD or NODUE
- Project name: kebab-case
- Status: ACTIVE/PLANNED/IDEA/HOLD/DONE

**Parse folder names into structured data:**
```
Project 1:
  Priority: P[X]
  Due: [Date or NODUE]
  Name: [name]
  Status: [STATUS]
  Path: [Full folder path]

Project 2:
  ...
```

**Expected Outcome:** Complete structured project list

---

### Step 2: Read Project READMEs

**Description:** Extract key details from each project's README

**For each project, read README:**
```bash
cat "D:\Program Files\Obsidian\projects\P[X]_[DATE]_[name]_[STATUS]/README.md"
```

**Extract:**
- Telos alignment (Mission/Goal/Strategy/Challenge)
- Success criteria (and completion %)
- Next actions
- Estimated effort
- Last updated date

**Augment project data:**
```
Project 1:
  [Previous data]
  Telos: M[X], G[X], S[X], C[X]
  Success Criteria: [List with completion status]
  Next Actions: [List]
  Effort: [Hours/days/weeks]
  Last Updated: [Date]
```

**Expected Outcome:** Rich project data including telos and status

---

### Step 3: Categorize Projects by Priority and Status

**Description:** Group projects for dashboard display

**Create buckets:**

**P1 - Critical:**
- ACTIVE (working on this week)
- PLANNED (starting soon)
- HOLD (blocked but high priority)
- DONE (recently completed)

**P2 - Important:**
- ACTIVE
- PLANNED
- IDEA
- HOLD
- DONE

**P3 - Backlog:**
- IDEA (captured for future)
- PLANNED (rare for P3)
- ACTIVE (rare - usually promoted to P2 if active)
- HOLD

**Count projects in each bucket:**
```
P1 Total: [N] (ACTIVE: [N], PLANNED: [N], HOLD: [N], DONE: [N])
P2 Total: [N] (ACTIVE: [N], PLANNED: [N], IDEA: [N], HOLD: [N])
P3 Total: [N] (IDEA: [N], etc.)
```

**Expected Outcome:** Projects categorized and counted

---

### Step 4: Analyze Project Health

**Description:** Identify issues, risks, and opportunities

**Health Checks:**

**P1 Health:**
- **Ideal:** 1-3 active P1 projects
- **Warning:** > 3 active P1 (focus dilution)
- **Critical:** 0 active P1 (not working on telos priorities)
- **Risk:** P1 projects on HOLD (blocked critical work)

**P2 Health:**
- **Ideal:** 3-5 planned/active P2 (healthy pipeline)
- **Warning:** > 8 P2 (too many infrastructure projects)
- **Opportunity:** 0 P2 (no future capacity building)

**P3 Health:**
- **Ideal:** Several IDEAS captured (exploration pipeline)
- **Warning:** > 10 P3 (backlog bloat)
- **Note:** P3 ACTIVE is unusual (consider promoting to P2)

**Status Health:**
- **Red Flag:** Many HOLD projects (blockers or overcommitment)
- **Good Sign:** Regular DONE completions (shipping cadence)
- **Risk:** Many PLANNED, few ACTIVE (planning > execution)
- **Risk:** Many IDEA, none promoted (not starting work)

**Telos Alignment Health:**
- How many projects map to current focus (S1)?
- How many address current challenges (C1-C4)?
- Any projects with NO telos alignment? (should be pruned)

**Generate health assessment:**
```
## Project Health Assessment

**P1 Focus:** [Healthy / Warning / Critical]
- Active P1 Count: [N] [OK / Too many / Too few]
- [Specific concerns if any]

**P2 Pipeline:** [Healthy / Warning / Opportunity]
- Total P2: [N]
- [Specific observations]

**P3 Backlog:** [Healthy / Warning / Opportunity]
- Total P3: [N]
- [Specific observations]

**Status Distribution:** [Healthy / Warning]
- ACTIVE: [N] (Should be working on these NOW)
- PLANNED: [N] (Starting soon)
- HOLD: [N] [If > 3: WARNING - too many blockers]
- DONE: [N] (Recent completions)

**Telos Alignment:** [Strong / Moderate / Weak]
- S1 aligned: [N] projects
- C1-C4 addressed: [N] projects
- No alignment: [N] projects [If > 0: REVIEW for pruning]

**Overall Health Score:** [1-10]
```

**Expected Outcome:** Health assessment with specific concerns flagged

---

### Step 5: Generate Recommendations

**Description:** Provide specific next-step recommendations based on analysis

**Recommendation Categories:**

**Focus Recommendations:**
- If > 3 active P1: "Reduce active P1 to 2-3 for better focus"
- If 0 active P1: "You have no active P1 work! Start [specific P1 project]"
- If many PLANNED, few ACTIVE: "Move [specific project] from PLANNED to ACTIVE"

**Pipeline Recommendations:**
- If 0 P2: "Build P2 pipeline - consider promoting [backlog items]"
- If many P2 IDEAS: "Move [specific P2] from IDEA to PLANNED"
- If P2 ACTIVE blocks P1: "Consider pausing [P2] to focus on [P1]"

**Completion Recommendations:**
- If projects near completion: "Push [project] across finish line"
- If stalled projects: "Review [project] - complete or put on HOLD?"
- If HOLD projects: "Resolve blocker for [project] or deprioritize to P2/P3"

**Telos Alignment Recommendations:**
- If project has no telos: "Review [project] for telos alignment or prune"
- If weak S1 alignment: "Your focus should be [S1 projects], consider pausing [other project]"
- If addressing challenges: "Good - [project] addresses [challenge]"

**Backlog Recommendations:**
- If backlog bloated: "Prune backlog - remove stale ideas"
- If backlog empty: "Capture exploration ideas in backlog"
- If promotion opportunities: "Consider promoting [backlog item] to P2"

**Generate recommendations:**
```
## Recommendations

### Immediate Actions (This Week)
1. [Specific action with project name]
2. [Specific action]
3. [Specific action]

### Short-Term Actions (This Month)
1. [Specific action]
2. [Specific action]

### Strategic Actions (This Quarter)
1. [Specific action]
2. [Specific action]

### Focus Protection
[If needed: Specific warnings about focus dilution or misalignment]

### What to Stop Doing
[If needed: Projects to pause, deprioritize, or prune]
```

**Expected Outcome:** Specific, actionable recommendations

---

### Step 6: Generate Dashboard

**Description:** Create visual project dashboard for user

**Dashboard Format:**

```markdown
# PROJECT DASHBOARD
**Date:** [YYYY-MM-DD]
**Total Projects:** [N]
**Active Work:** [N] projects
**Overall Health:** [Score]/10

---

## 🔴 P1 - CRITICAL ([N] projects)

### ✅ ACTIVE ([N])
**[Project Name]** - Due: [Date]
- Telos: [M/G/S/C mapping]
- Progress: [X]% complete
- Next: [Next action]
- Status: [Brief status note]

### 📋 PLANNED ([N])
**[Project Name]** - Due: [Date]
- Telos: [Mapping]
- Next: [Next action]

### ⏸️ HOLD ([N])
**[Project Name]** - Due: [Date]
- Blocked by: [Blocker]
- Resume when: [Condition]

### ✅ DONE ([N] - Recent Completions)
**[Project Name]** - Completed: [Date]
- Telos: [Mapping]
- Outcome: [Brief summary]

---

## 🟡 P2 - IMPORTANT ([N] projects)

### 🏃 ACTIVE ([N])
**[Project Name]** - Due: [Date or NODUE]
- Telos: [Mapping]
- Progress: [Status]
- Next: [Next action]

### 📋 PLANNED ([N])
[Similar format]

### 💡 IDEA ([N])
[Similar format - captured but not started]

### ⏸️ HOLD ([N])
[Similar format]

---

## 🔵 P3 - BACKLOG ([N] projects)

### 💡 IDEAS ([N])
**[Project Name]**
- Concept: [Brief description]
- Potential: [Telos mapping]
- Status: Captured for future

[List all P3 ideas]

---

## 📊 DASHBOARD SUMMARY

**P1 Focus:**
- Active P1 work: [N] projects
- P1 Status: [Healthy / Warning / Critical]
- [Specific observation]

**P2 Pipeline:**
- Total P2: [N] projects
- P2 Status: [Healthy / Warning]
- [Specific observation]

**P3 Backlog:**
- Total P3: [N] ideas
- Backlog Status: [Healthy / Bloated]

**Telos Alignment:**
- S1 (90-day sprint) projects: [N]
- Challenge-addressing projects: [N]
- Overall alignment: [Strong / Moderate / Weak]

**Health Score:** [X]/10
- [Scoring rationale]

---

## 🎯 RECOMMENDATIONS

### This Week
1. [Immediate action]
2. [Immediate action]
3. [Immediate action]

### This Month
1. [Short-term action]
2. [Short-term action]

### This Quarter
1. [Strategic action]

### ⚠️ Focus Warnings
[If any: Specific warnings about focus dilution, misalignment, or blockers]

### 🚫 Stop Doing
[If any: Projects to pause or prune]

---

## 📅 NEXT REVIEW

**Cadence:**
- Daily: Check P1 next actions (morning time-blocking)
- Weekly: Update dashboard, adjust priorities (Friday)
- Monthly: Full review, telos alignment check, backlog promotion (First Sunday)
- Quarterly: Major review, strategy update, archive sprint work

**Next Scheduled Review:** [Date based on cadence]

---

**Generated:** [YYYY-MM-DD HH:MM]
```

**Expected Outcome:** Complete project dashboard with health and recommendations

---

### Step 7: Include Backlog Context

**Description:** Add backlog summary to complete the picture

**Read backlog:**
```bash
cat "D:\Program Files\Obsidian\projects\0_Tiffany Improvements Backlog.md"
```

**Count backlog items and note recent additions**

**Add to dashboard:**
```
## 📝 BACKLOG ITEMS

**Total Items:** [N]
**Last Reviewed:** [Date]

**Recent Additions:**
- [Most recent item]
- [Second recent]
- [Third recent]

**Promotion Candidates:**
- [Item that might be ready for P2]
- [Another candidate]

**Next Backlog Review:** [Date]
```

**Expected Outcome:** Dashboard includes backlog context

---

## Outputs

**What this workflow produces:**
- Complete project dashboard
- Project health assessment
- Specific recommendations
- Backlog summary

**Where outputs are stored:**
- Dashboard returned to user in conversation
- Optionally: Save to `PROJECT_DASHBOARD.md` for historical tracking

---

## Related Workflows

- **create-project.md** - Create projects recommended in dashboard
- **update-status.md** - Update statuses based on dashboard review
- **manage-backlog.md** - Review backlog items shown in dashboard
- **priority-check.md** - Validate new priorities identified in review

---

## Examples

**Example: Weekly Project Review**

Input: "Review my projects"

Output:
```
# PROJECT DASHBOARD
**Date:** 2025-12-01
**Total Projects:** 5
**Active Work:** 3 projects
**Overall Health:** 7/10

---

## 🔴 P1 - CRITICAL (2 projects)

### ✅ ACTIVE (2)

**Personal Finance Analysis**
- Due: Ongoing (monthly process)
- Telos: C3 (Foundational habit discipline - radical transparency)
- Progress: Active, completed November analysis
- Next: Run December analysis (due 2025-12-07)
- Status: Ongoing P1 habit - finance transparency and burn rate tracking

**Sales CRM for Stacy's Firm**
- Due: 2026-01-15
- Telos: S1 (90-day sales sprint → $60k), G3 ($5M by 2030)
- Progress: 20% complete (database schema done)
- Next: Design UI wireframes for lead tracking
- Status: Active development, on track for Q1 delivery

### ✅ DONE (1 - Recent Completion)

**KPI Telegram Dashboard** - Completed: 2025-11-28
- Telos: S1 (tracks 90-day sprint progress), C2 (action vs avoidance)
- Outcome: Phases 2-3 delivered, dashboard operational
- Impact: Now tracking sales metrics in real-time via Telegram

---

## 🟡 P2 - IMPORTANT (2 projects)

### 📋 PLANNED (1)

**Job Search Backup Plan**
- Due: 2026-01-15
- Telos: Risk management (income security if partnership fails)
- Progress: Idea stage - resume needs updating
- Next: Update resume, identify target companies
- Status: Planned for Q1 2026, safety net strategy

### 💡 IDEA (1)

**Git Workflow Automation**
- Due: NODUE
- Telos: S3 (tech stack optimization), efficiency
- Progress: Captured concept - automate commit/push workflows
- Next: Define specific automation needs
- Status: Infrastructure idea, low urgency

---

## 🔵 P3 - BACKLOG (1 project)

### 💡 IDEAS (1)

**Claude Skills Learning**
- Concept: Deep dive into Claude skills development
- Potential: S3 (tech stack), future leverage
- Status: Exploration idea, no immediate timeline

---

## 📊 DASHBOARD SUMMARY

**P1 Focus:**
- Active P1 work: 2 projects (Personal Finance, Sales CRM)
- P1 Status: ✅ HEALTHY
- Good focus - both P1 projects directly support 90-day sprint (S1) and challenge work (C3, C2)
- Recent P1 completion (KPI Dashboard) shows shipping momentum

**P2 Pipeline:**
- Total P2: 2 projects (Job Search, Git Automation)
- P2 Status: ✅ HEALTHY
- Pipeline includes risk management (job search) and infrastructure (git automation)
- Neither P2 blocks P1 work - good prioritization

**P3 Backlog:**
- Total P3: 1 idea (Claude Skills)
- Backlog Status: ✅ LEAN
- Minimal P3 projects indicates strong focus on execution vs. idea capture

**Telos Alignment:**
- S1 (90-day sprint) projects: 2 (Finance, Sales CRM)
- Challenge-addressing projects: 2 (C3: Finance, C2: KPI Dashboard done)
- Overall alignment: ⭐ STRONG
- All active work maps to current strategy and challenges

**Health Score:** 7/10

Scoring:
- ✅ Strong P1 focus (2 active, both telos-aligned): +3
- ✅ Recent P1 completion (shipping cadence): +1
- ✅ Healthy P2 pipeline (infrastructure + risk mgmt): +2
- ✅ Lean P3 backlog (focus > idea capture): +1
- ✅ Strong telos alignment across all projects: +2
- ⚠️ Multiple active P1s (slight focus split): -1
- ⚠️ One P2 still in IDEA stage (not progressing): -1

---

## 🎯 RECOMMENDATIONS

### This Week
1. **Continue Personal Finance Analysis** - Run December analysis by 2025-12-07
2. **Progress Sales CRM** - Complete UI wireframes, start lead tracking implementation
3. **Protect P1 focus** - Defer P2/P3 work until P1 milestones hit

### This Month
1. **Push Sales CRM to Phase 1 completion** - Basic lead tracking operational by end of December
2. **Start Job Search materials** - Update resume, create target company list (Q1 prep)
3. **Monthly review** - Run telos alignment check on first Sunday of January

### This Quarter
1. **Complete Sales CRM** - Deliver to Stacy by 2026-01-15 deadline
2. **Prepare job search backup** - Resume, LinkedIn, applications ready if needed
3. **Review for P2 promotions** - If capacity opens after CRM, consider git automation

### ⚠️ Focus Warnings
- You have 2 active P1 projects. Ensure both get adequate time:
  - Finance Analysis: Monthly cadence (2-3 hours/month)
  - Sales CRM: Daily/weekly work (10-15 hours/week)
- Avoid starting new P1 work until CRM completes or reaches stable state
- Don't let P2 ideas distract from P1 execution

### 🚫 Stop Doing
- No projects need to be paused or pruned
- Current portfolio is healthy and telos-aligned
- Continue execution focus

---

## 📝 BACKLOG ITEMS

**Total Items:** 11
**Last Reviewed:** 2025-11-20

**Recent Additions:**
- AI LinkedIn post generator (added 2025-11-28)
- Learning Rust (added 2025-11-25)
- Financial dashboard automation (added 2025-11-18)

**Promotion Candidates:**
- Financial dashboard automation - Could become P2 (reduces finance analysis time)
- Sales pipeline tracker - Could support S1 sprint

**Next Backlog Review:** 2026-01-05 (first Sunday of month)

---

## 📅 NEXT REVIEW

**Cadence:**
- Daily: Check P1 next actions (morning time-blocking)
- Weekly: Update dashboard, adjust priorities (Friday)
- Monthly: Full review, telos alignment check, backlog promotion (First Sunday)
- Quarterly: Major review, strategy update, archive sprint work

**Next Scheduled Review:** 2025-12-08 (weekly), 2026-01-05 (monthly)

---

**Generated:** 2025-12-01 17:00 PST
```

---

## Notes

**Critical Success Factors:**
1. COMPLETE project scan - don't miss projects
2. Read READMEs for context - not just folder names
3. Honest health assessment - call out issues
4. SPECIFIC recommendations - not generic advice
5. Include backlog for full picture

**Common Pitfalls:**
- ❌ Missing projects in scan
- ❌ Not reading READMEs (incomplete context)
- ❌ Generic recommendations ("work on P1") - be specific
- ❌ Ignoring backlog in review
- ❌ Not flagging focus dilution or misalignment

**Dashboard Philosophy:**
- Purpose: Single source of truth for project status
- Cadence: Weekly minimum, monthly preferred
- Action-oriented: Always end with specific next steps
- Telos-driven: Every recommendation ties to missions/goals/strategies
- Honest: Call out problems, don't sugarcoat

**When to challenge user:**
- Too many active P1s (focus dilution)
- No active P1s (not working on priorities)
- Projects with no telos alignment (distractions)
- Many HOLD projects (overcommitment or blockers)
- Planning without executing (PLANNED > ACTIVE ratio too high)

---

**Last Updated:** 2025-12-01
