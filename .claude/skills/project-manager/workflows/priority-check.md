# Priority Check

**Purpose:** Telos alignment analysis with reality check - determine if new work aligns or distracts from current focus

**When to Use:**
- User asks "should I work on this"
- User asks "is this worth doing"
- User wants validation before starting work
- Scrum master needs to challenge potential distraction

**Prerequisites:**
- Access to telos file: `D:\Program Files\Obsidian\telos\michael_telos.md`
- Access to projects directory to check current P1 work
- Context about what user wants to work on

---

## Workflow Steps

### Step 1: Capture the Proposed Work

**Description:** Understand what user wants to work on

**Ask clarifying questions:**
1. What specifically do you want to work on?
2. Why does this feel important right now?
3. How much time do you think this will take?
4. What would happen if you didn't do this?

**Capture:**
```
Proposed Work: [Description]
Motivation: [Why user wants to do this]
Estimated Time: [Hours/days/weeks]
Urgency: [What drives the timing]
```

**Expected Outcome:** Clear understanding of proposed work

---

### Step 2: Map to Telos Framework

**Description:** Determine how (or if) this work aligns with telos

**Read telos file:**
```
D:\Program Files\Obsidian\telos\michael_telos.md
```

**For proposed work, answer:**

**Mission Alignment:**
Does this serve M1 (communities), M2 (medical missions), or M3 (acquisitions)?
- YES → Which one? How?
- NO → Mark as "no mission alignment"

**Goal Alignment:**
Does this advance G1-G6?
- YES → Which goal? By how much?
- NO → Mark as "no goal alignment"

**Strategy Alignment:**
Does this support current strategies (S1-S4)?
- **S1:** 90-day sales sprint → $60k (CURRENT FOCUS)
- **S2:** Reduce restaurant hours
- **S3:** Build acquisition knowledge via Stacy's
- **S4:** Hybrid model (60% sales, 40% content)
- YES → Which strategy? How?
- NO → Mark as "no strategy alignment"

**Challenge Addressed:**
Does this help overcome C1-C4?
- YES → Which challenge? How?
- NO → Mark as "no challenge addressed"

**Telos Mapping Output:**
```
Mission: M[X] - [How it aligns] OR "No alignment"
Goal: G[X] - [How it aligns] OR "No alignment"
Strategy: S[X] - [How it aligns] OR "No alignment"
Challenge: C[X] - [How it helps] OR "No challenge addressed"

Overall Alignment: Strong / Moderate / Weak / None
```

**Expected Outcome:** Complete telos mapping with alignment score

---

### Step 3: Apply Priority Decision Tree

**Description:** Use decision tree to determine appropriate priority

**Decision Tree:**
```
Proposed work
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
  NO  → P3
```

**Walk through each question:**
```
Q1: Generates revenue this quarter?
  Answer: [Yes/No]
  Explanation: [How or why not]
  Result: [P1 or continue]

Q2: Unblocks 90-day sprint (S1)?
  Answer: [Yes/No]
  Explanation: [How or why not]
  Result: [P1 or continue]

Q3: Creates reusable system/automation?
  Answer: [Yes/No]
  Explanation: [How or why not]
  Result: [P2 or continue]

Q4: Builds capacity for 2026-2030 goals?
  Answer: [Yes/No]
  Explanation: [How or why not]
  Result: [P2 or P3]

FINAL PRIORITY: P[X]
```

**Expected Outcome:** Priority assigned with decision path documented

---

### Step 4: Check Current P1 Projects

**Description:** See what P1 work is already active

**List active P1 projects:**
```bash
ls "D:\Program Files\Obsidian\projects\" | grep "P1_.*_ACTIVE\|P1_.*_PLANNED"
```

**For each P1 project, note:**
- Project name
- Due date
- Telos mapping
- Current status

**P1 Summary:**
```
Active P1 Projects: [N]

1. [Project Name] - Due: [Date] - Telos: [Mapping]
2. [Project Name] - Due: [Date] - Telos: [Mapping]
```

**Expected Outcome:** Clear view of current P1 commitments

---

### Step 5: Reality Check Analysis

**Description:** Determine if proposed work creates focus conflict

**Scenarios:**

**Scenario A: Proposed work is P3, active P1 exists**
→ RECOMMEND: Defer to backlog
→ RATIONALE: P1 work takes precedence, P3 is distraction

**Scenario B: Proposed work is P2, active P1 exists**
→ RECOMMEND: Defer unless P2 unblocks P1
→ RATIONALE: Infrastructure can wait until P1 stabilizes

**Scenario C: Proposed work is P1, NO active P1 exists**
→ RECOMMEND: Proceed
→ RATIONALE: This becomes your primary focus

**Scenario D: Proposed work is P1, active P1 already exists**
→ TRIGGER REALITY CHECK (most critical scenario)
→ Questions:
  1. Can you handle multiple P1 projects?
  2. Which P1 has higher telos impact?
  3. Should existing P1 be demoted?
  4. Can they be sequenced instead of parallel?

**Reality Check Output:**
```
Scenario: [A/B/C/D]
Current P1 Count: [N]
Proposed Priority: P[X]

Conflict: [Yes/No]
Conflict Type: [Description if yes]

Recommendation: [Proceed / Defer / Replace / Sequence]
Rationale: [Detailed reasoning]
```

**Expected Outcome:** Clear recommendation with rationale

---

### Step 6: Generate Priority Check Response

**Description:** Provide comprehensive answer to "should I work on this?"

**Response Format:**

```markdown
# Priority Check: [Proposed Work]

## Telos Alignment Analysis

**Mission:** [M[X] - Alignment OR "No clear mission alignment"]
**Goal:** [G[X] - Alignment OR "No clear goal alignment"]
**Strategy:** [S[X] - Alignment OR "No clear strategy alignment"]
**Challenge:** [C[X] - Addressed OR "No challenge addressed"]

**Overall Alignment:** Strong / Moderate / Weak / None

**Alignment Score:** [X]/10
- Mission relevance: [1-10]
- Goal advancement: [1-10]
- Strategy support: [1-10]
- Challenge addressed: [1-10]

---

## Priority Assignment

**Decision Tree Results:**

Q1: Generates revenue this quarter?
→ [Yes/No] - [Explanation]

Q2: Unblocks 90-day sprint (S1)?
→ [Yes/No] - [Explanation]

Q3: Creates reusable system/automation?
→ [Yes/No] - [Explanation]

Q4: Builds capacity for 2026-2030 goals?
→ [Yes/No] - [Explanation]

**Recommended Priority:** P[X]
**Rationale:** [Why this priority level]

---

## Current P1 Context

**Active P1 Projects:** [N]

[List of active P1 projects with telos mapping]

---

## Reality Check

[If conflict exists:]
🚨 FOCUS CHECK 🚨

You're about to work on: [Proposed Work] - P[X]

But you already have active P1 work:
[List P1 projects with details]

**Questions for You:**
1. [Specific question about capacity]
2. [Specific question about priority]
3. [Specific question about sequencing]

**Options:**
A) Work on [Proposed Work] now (explain: [trade-off])
B) Finish [Current P1] first, then start [Proposed Work] (sequence it)
C) Demote [Current P1] to P2 and work on [Proposed Work] instead (reprioritize)
D) Defer [Proposed Work] to backlog (protect focus)

---

## Recommendation

**Should you work on this?** [YES / NO / MAYBE]

**Recommendation:** [Specific guidance]

[If YES:]
✅ **PROCEED** - This work aligns strongly with your current telos focus
**Next Step:** [What to do first]

[If NO:]
❌ **DEFER** - This work distracts from higher-priority telos goals
**Instead:** [What to focus on instead]
**Defer Until:** [When to revisit this idea]

[If MAYBE:]
⚠️ **CONDITIONAL** - This work has merit but timing is questionable
**Condition:** [What needs to be true to proceed]
**Alternative:** [How to capture this without working on it now]

---

## Why This Matters

[Explanation of telos impact - be honest and direct]

[If weak alignment:]
This work feels important because [psychological reason], but it doesn't
materially advance your 90-day sprint or 2030 goals. Your current focus
should be [what actually matters].

[If strong alignment:]
This work directly supports [specific telos element] and will move you
closer to [specific goal]. It's a good use of time right now.

[If conflict exists:]
Working on multiple P1 projects simultaneously dilutes focus and slows
progress on both. Better to finish one, then start the other.

---

## Scrum Master Commentary

[Your honest, direct feedback as scrum master]

[Be supportive but honest:]
- If it's a distraction: Call it out
- If it's avoidance: Name it
- If it's legitimate: Validate it
- If timing is wrong: Say when would be right

[Remember: Your job is to protect focus, not be agreeable]
```

**Expected Outcome:** Complete priority check with clear recommendation

---

## Outputs

**What this workflow produces:**
- Telos alignment analysis
- Priority assignment with rationale
- Reality check (if conflicts exist)
- Clear recommendation (proceed/defer/conditional)
- Scrum master commentary

**Where outputs are stored:**
- Returned to user in conversation
- Optionally: Add to project notes if project is created

---

## Related Workflows

- **create-project.md** - If user proceeds, create the project
- **capture-and-triage.md** - If user defers, add to backlog
- **review-projects.md** - See full P1 context for decision making

---

## Examples

**Example 1: Clear Distraction (P3 while P1 active)**

Input: "I want to learn Rust, seems like a cool language. Should I work on this?"

Output:
```
# Priority Check: Learn Rust

## Telos Alignment Analysis

**Mission:** No clear mission alignment (doesn't serve M1, M2, or M3)
**Goal:** No clear goal alignment (doesn't advance G1-G6)
**Strategy:** Weak S3 alignment (tech stack exploration, but not critical)
**Challenge:** No challenge addressed

**Overall Alignment:** Weak

**Alignment Score:** 2/10
- Mission relevance: 0/10
- Goal advancement: 0/10
- Strategy support: 2/10 (tech exploration)
- Challenge addressed: 0/10

---

## Priority Assignment

Q1: Generates revenue this quarter?
→ NO - Learning Rust doesn't create revenue

Q2: Unblocks 90-day sprint (S1)?
→ NO - Sales sprint doesn't require Rust

Q3: Creates reusable system/automation?
→ NO - Learning phase, no immediate system created

Q4: Builds capacity for 2026-2030 goals?
→ MAYBE - Could be useful for future tech work, but not critical

**Recommended Priority:** P3 (Backlog)
**Rationale:** Exploratory learning with no immediate telos impact

---

## Current P1 Context

**Active P1 Projects:** 2

1. P1_25-12-01_personal-finance-analysis_ACTIVE
   Due: Ongoing - Telos: C3 (Foundational habit discipline)

2. P1_26-01-15_sales-crm-stacy-firm_PLANNED
   Due: 2026-01-15 - Telos: S1 (90-day sales sprint → $60k)

---

## Reality Check

🚨 FOCUS CHECK 🚨

You're about to work on: Learn Rust - P3

But you have active P1 work:
1. Personal Finance Analysis (ongoing transparency habit)
2. Sales CRM for Stacy (critical for $60k income goal)

**Questions for You:**
1. What makes Rust learning more urgent than building revenue?
2. How will learning Rust help you hit $60k annual income?
3. Could this wait until after 90-day sprint completes?

**Options:**
A) Learn Rust now (takes time away from P1 work)
B) Finish Sales CRM first, then learn Rust (sequence it)
C) Defer Rust to P3 backlog (protect P1 focus)

---

## Recommendation

**Should you work on this?** NO

**Recommendation:** ❌ **DEFER to Backlog**

This is classic "shiny object syndrome." Rust is interesting, but it doesn't
serve your current 90-day sprint focus. Learning Rust won't get you to $60k
annual income. Building the Sales CRM will.

**Instead:** Focus on Sales CRM for Stacy's firm (P1)
**Defer Until:** After achieving $60k milestone or during scheduled learning time

**Add to backlog:** Yes - capture the idea for future exploration

---

## Why This Matters

You're 2 months into a 90-day sales sprint with a concrete goal: $60k annual
income by validating Stacy's partnership. Every hour spent on Rust is an hour
NOT spent on sales activities that generate revenue.

Your telos is clear: G3 requires $5M by 2030, which requires income now.
S1 is the path to that income. Rust doesn't fit S1.

---

## Scrum Master Commentary

This feels like avoidance behavior (C2). When sales work gets hard or
uncomfortable, it's easy to pivot to "learning" that feels productive but
doesn't move the needle.

I'm calling it out: Learning Rust right now is a distraction.

If you're feeling stuck on sales work, let's debug THAT problem, not escape
into a shiny new language.

Recommendation: Defer Rust, focus on Sales CRM, and revisit this idea AFTER
you hit $60k or complete the 90-day sprint.
```

**Example 2: Strong Alignment (P1 with no conflicts)**

Input: "I want to build an AI tool to analyze my sales calls and find patterns. Should I work on this?"

Output:
```
# Priority Check: AI Sales Call Analysis

## Telos Alignment Analysis

**Mission:** M3 (Build wealth via acquisitions - sales skills support this)
**Goal:** G3 ($5M by 2030 - requires revenue now)
**Strategy:** S1 (90-day sales sprint → $60k) - DIRECT SUPPORT
**Challenge:** C2 (Action vs avoidance - forces data-driven improvement)

**Overall Alignment:** Strong

**Alignment Score:** 9/10
- Mission relevance: 9/10 (business growth → wealth)
- Goal advancement: 9/10 (revenue → $5M goal)
- Strategy support: 10/10 (directly improves sales effectiveness)
- Challenge addressed: 8/10 (forces action via data)

---

## Priority Assignment

Q1: Generates revenue this quarter?
→ YES - Improves sales close rate → more revenue

**Recommended Priority:** P1
**Rationale:** Directly drives revenue during critical 90-day sprint

---

## Current P1 Context

**Active P1 Projects:** 1

1. P1_25-12-10_kpi-telegram-dashboard_COMPLETED
   Due: Completed - Telos: S1 (tracking sprint progress)

---

## Reality Check

✅ NO CONFLICTS

You currently have 1 P1 project that's COMPLETED (KPI Dashboard).
This new P1 would become your primary active focus.

---

## Recommendation

**Should you work on this?** YES

**Recommendation:** ✅ **PROCEED**

This work aligns perfectly with your 90-day sales sprint (S1). Analyzing
sales calls will help you identify what works, what doesn't, and improve
your close rate. Higher close rate = more revenue = faster path to $60k.

**Next Step:** Create project using create-project.md workflow
**Suggested Priority:** P1
**Suggested Timeline:** Complete by end of 90-day sprint (2026-01-15)

---

## Why This Matters

You're in a 90-day sales sprint with a concrete revenue goal. Every percentage
point improvement in close rate translates to more partnership revenue. This
tool gives you data-driven insights to improve faster.

This is NOT busywork. This is meta-work that makes your primary work (sales)
more effective. That's exactly what P1 infrastructure looks like.

---

## Scrum Master Commentary

This is a GREAT idea and perfectly timed.

You've completed the KPI dashboard (tracking metrics), and now you want to
analyze the sales process itself to find improvement opportunities. That's
exactly the kind of compound leverage you should be building during a sprint.

✅ Strong telos alignment
✅ Directly supports current strategy (S1)
✅ Addresses challenge (C2 - action via data)
✅ No P1 conflicts

Recommendation: Create this as P1, start ASAP, complete by sprint end.
```

---

## Notes

**Critical Success Factors:**
1. ALWAYS use decision tree - don't skip steps
2. Be HONEST about alignment - don't force connections
3. Trigger reality checks when needed - protect focus
4. Provide CLEAR recommendation - no ambiguity
5. Challenge distractions directly - scrum master role

**Common Pitfalls:**
- ❌ Being too agreeable (enabler, not scrum master)
- ❌ Forcing weak telos connections (dishonest alignment)
- ❌ Skipping reality check when P1 conflict exists
- ❌ Vague recommendations (user still unsure what to do)

**Scrum Master Mindset:**
- Your job: Protect focus, enforce priorities, challenge distractions
- Not your job: Validate everything, avoid hard conversations
- Remember: Honest > Nice

**When to be harsh:**
- Clear avoidance behavior (C2)
- Shiny object syndrome
- Priority inflation ("everything is P1")
- Working on P3 while P1 languishes

**When to be supportive:**
- Strong telos alignment
- Well-reasoned priority shifts
- Infrastructure that unblocks P1
- Legitimate capacity for multiple P1s

---

**Last Updated:** 2025-12-01
