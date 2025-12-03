# Manage Backlog

**Purpose:** Backlog file management - add items, review for promotion, prune outdated ideas

**When to Use:**
- User wants to add idea to backlog
- User says "add to backlog", "backlog this"
- Reviewing backlog for promotion to projects
- Cleaning up stale backlog items

**Prerequisites:**
- Access to backlog file: `D:\Program Files\Obsidian\projects\0_Tiffany Improvements Backlog.md`
- Access to telos file for alignment checks

---

## Workflow Steps

### Step 1: Determine Operation Type

**Description:** Understand what user wants to do with backlog

**Operations:**

**ADD:** Add new item to backlog
- When: User has idea not ready for full project
- Trigger: "add to backlog", "backlog this idea"

**REVIEW:** Review backlog for promotion opportunities
- When: User wants to see what's in backlog
- Trigger: "review backlog", "what's in backlog"

**PROMOTE:** Promote backlog item to full project
- When: Backlog item becomes priority
- Trigger: "promote X from backlog", "make X a project"

**PRUNE:** Remove outdated/misaligned items
- When: Cleaning up stale ideas
- Trigger: "clean up backlog", "remove old items"

**Ask user (if unclear):**
```
What would you like to do with the backlog?
A) Add new item
B) Review items for promotion
C) Promote specific item to project
D) Prune outdated items
```

**Expected Outcome:** Operation type determined

---

### Step 2A: Add Item to Backlog

**Description:** Capture new idea and add to backlog file (if operation = ADD)

**Gather item details:**
```
Idea: [Brief description]
Context: [Why this came up, any background]
Potential Value: [What this could accomplish]
Rough Scope: [Small/Medium/Large estimate]
```

**Quick telos check:**
- Which mission/goal/strategy might this support?
- Is this aligned or a distraction?
- If distraction: Challenge user or note as "exploration"

**Backlog entry format:**
```
N. [Idea Title] - [One-line description] - [Potential telos mapping] - Added [YYYY-MM-DD]
```

**Read current backlog:**
```bash
cat "D:\Program Files\Obsidian\projects\0_Tiffany Improvements Backlog.md"
```

**Append new item:**
```
[Next number]. [Idea] - [Description] - Potential: [Telos mapping] - Added [Date]
```

**Example:**
```
12. AI-powered meeting summarizer - Auto-generate summaries from sales calls - Potential: S1 (sales efficiency) - Added 2025-12-01
```

**Write updated backlog back to file**

**Provide confirmation:**
```
✅ Added to Backlog (#[N])

**Item:** [Idea Title]
**Description:** [One-line description]
**Potential Telos:** [Mapping]
**Estimated Scope:** [Small/Medium/Large]

Added to: 0_Tiffany Improvements Backlog.md

This idea is captured for future consideration. It will be reviewed during
monthly backlog review or when capacity opens for new P2/P3 work.
```

**Expected Outcome:** Item added to backlog with context

---

### Step 2B: Review Backlog for Promotion

**Description:** Analyze backlog items for promotion opportunities (if operation = REVIEW)

**Read backlog:**
```bash
cat "D:\Program Files\Obsidian\projects\0_Tiffany Improvements Backlog.md"
```

**For each backlog item, evaluate:**

**1. Telos alignment check:**
- Does this support current 90-day sprint (S1)?
- Does this advance 2026-2030 goals (G1-G6)?
- Does this address current challenges (C1-C4)?

**2. Timing check:**
- Is this more relevant now than when added?
- Have circumstances changed to make this priority?
- Are dependencies now met?

**3. Value check:**
- High impact potential?
- Low effort for high return?
- Unblocks other work?

**Categorize each item:**
```
Item [N]: [Title]

Telos Alignment: Strong / Moderate / Weak / None
Current Relevance: High / Medium / Low
Estimated Value: High / Medium / Low

Recommendation: Promote to P[X] / Keep in backlog / Prune

Rationale: [Why this recommendation]
```

**Generate review summary:**
```markdown
# Backlog Review - [Date]

## Total Items: [N]

## Promote to Projects ([N] items)
### High Priority (Promote to P1 or P2)
1. **[Item Title]** - [Description]
   - Telos: [Strong alignment to which element]
   - Value: [Why promote now]
   - Recommendation: Create as P[X] project

[Continue for all high-priority items]

### Consider for Later (Keep in backlog, revisit next quarter)
1. **[Item Title]** - [Description]
   - Telos: [Moderate alignment]
   - Value: [Why keep but defer]
   - Recommendation: Revisit in [timeframe]

## Prune Candidates ([N] items)
### Outdated or Misaligned
1. **[Item Title]** - [Description]
   - Reason: [Why prune - no longer relevant, telos misalignment, etc.]
   - Recommendation: Remove from backlog

## Keep in Backlog ([N] items)
[Items that should remain for future consideration]

## Summary

**Promotions Recommended:** [N] items
**Prune Recommended:** [N] items
**Keep in Backlog:** [N] items

**Next Step:** Would you like to promote any items to projects?
```

**Expected Outcome:** Complete backlog analysis with recommendations

---

### Step 2C: Promote Backlog Item to Project

**Description:** Convert backlog item into full project (if operation = PROMOTE)

**Ask user which item:**
```
Which backlog item would you like to promote to a project?
[List backlog items with numbers]
```

**Read backlog item details**

**Trigger create-project workflow:**
→ Use create-project.md with backlog item as seed
→ All project intake steps apply (telos alignment, priority assignment, etc.)
→ Gather additional details needed for project

**After project created:**

**Remove from backlog file:**
- Delete the promoted item from backlog
- Update numbering of remaining items
- Note in backlog: "Item [N] promoted to P[X]_[project-name] on [date]"

**Provide confirmation:**
```
✅ Backlog Item Promoted

**Original Backlog Item:** #[N] - [Title]
**New Project:** P[X]_[DATE]_[project-name]_[STATUS]

**Removed from backlog** ✅
**Created as project** ✅

See create-project summary for full project details.
```

**Expected Outcome:** Backlog item becomes project, removed from backlog

---

### Step 2D: Prune Backlog Items

**Description:** Remove outdated or misaligned items (if operation = PRUNE)

**Review backlog for prune candidates:**

**Prune criteria:**
- Added > 6 months ago with no action
- No longer aligns with current telos
- Circumstances changed (no longer relevant)
- Better solution already exists
- User explicitly wants to remove

**For each candidate, ask:**
```
Item [N]: [Title] - Added [Date]

Prune reasons:
- [Reason 1]
- [Reason 2]

Remove from backlog? (Yes/No)
```

**If user confirms prune:**
- Remove item from backlog file
- Update numbering
- Optionally: Save pruned items to archive file

**If user wants to keep:**
- Update item context/description
- Note why it's still valuable
- Set review date

**Provide prune summary:**
```markdown
# Backlog Pruned - [Date]

## Items Removed: [N]

1. **[Item Title]** - Added [original date]
   - Removed: [YYYY-MM-DD]
   - Reason: [Why pruned]

2. **[Item Title]** - Added [original date]
   - Removed: [YYYY-MM-DD]
   - Reason: [Why pruned]

[Continue for all pruned items]

## Items Kept: [N]

Backlog now contains [N] items focused on telos-aligned opportunities.

**Recommended:** Review backlog quarterly to keep it fresh and relevant.
```

**Expected Outcome:** Stale items removed, backlog lean and focused

---

### Step 3: Update Backlog Metadata

**Description:** Update backlog file header with review info

**Backlog header template:**
```markdown
# Tiffany Improvements Backlog

**Last Reviewed:** [YYYY-MM-DD]
**Total Items:** [N]
**Last Added:** [Most recent item date]

**Purpose:** Quick capture for ideas not yet ready for full project structure.
Ideas here are P3 priority unless promoted to P1/P2 projects.

**Review Cadence:** Monthly (first Sunday of month)

---

## Backlog Items

[Numbered list of items]
```

**Update "Last Reviewed" and "Total Items" after any backlog operation**

**Expected Outcome:** Backlog file metadata current

---

## Outputs

**What this workflow produces:**
- Updated backlog file with new items
- Backlog review summary (if reviewing)
- Promoted projects (if promoting)
- Pruned items list (if pruning)
- Updated metadata

**Where outputs are stored:**
- Backlog file: `D:\Program Files\Obsidian\projects\0_Tiffany Improvements Backlog.md`
- Promoted projects: In projects directory
- Pruned items: Optionally in archive or discarded

---

## Related Workflows

- **create-project.md** - Used when promoting backlog item to project
- **capture-and-triage.md** - Often adds items to backlog
- **review-projects.md** - Monthly review includes backlog review

---

## Examples

**Example 1: Add Item to Backlog**

Input: "Add an idea to the backlog: AI tool to generate LinkedIn posts from my blog articles"

Output:
```
✅ Added to Backlog (#12)

**Item:** AI LinkedIn Post Generator
**Description:** Auto-generate LinkedIn posts from blog articles for consistent social presence
**Potential Telos:** S4 (hybrid model - content amplification), M1 (community building)
**Estimated Scope:** Medium (API integration, template design)

Added to: 0_Tiffany Improvements Backlog.md

This idea is captured for future consideration. It supports your hybrid model strategy (S4)
and community building mission (M1), but it's not critical for current 90-day sprint (S1).

Recommend: Review this after achieving $60k milestone, when content strategy becomes priority.
```

**Example 2: Review Backlog with Promotions**

Input: "Review my backlog and see what should be promoted"

Output:
```
# Backlog Review - 2025-12-01

## Total Items: 11

## Promote to Projects (2 items)

### High Priority (Promote to P2)

1. **Financial dashboard automation** - Auto-pull transaction data instead of manual CSV upload
   - Telos: C3 (foundational habits - reduces friction), S1 (supports sprint tracking)
   - Value: Reduces monthly finance analysis time from 2 hours to 15 minutes
   - Current Relevance: HIGH - you're doing finance analysis monthly, automation saves time
   - Recommendation: Create as P2 project, delivers ongoing value

2. **Sales pipeline tracker** - Track leads, follow-ups, and conversion rates
   - Telos: S1 (90-day sales sprint - critical tracking), G3 ($5M by 2030)
   - Value: Improves sales effectiveness, prevents lead drop-off
   - Current Relevance: HIGH - directly supports active P1 work
   - Recommendation: Create as P2 project (or P1 if capacity exists)

### Consider for Later (3 items)

3. **Blog automation workflow** - One-command publish to multiple platforms
   - Telos: S4 (hybrid model - content efficiency), M1 (community building)
   - Value: Medium - useful but not urgent until content becomes priority
   - Recommendation: Revisit Q2 2026 when hybrid model activates

4. **Habit tracking dashboard** - Visual dashboard for daily habits
   - Telos: C3 (foundational habits)
   - Value: Medium - nice to have, not essential
   - Recommendation: Keep in backlog, low priority

5. **Learning Rust** - Explore new programming language
   - Telos: S3 (tech stack exploration) - weak alignment
   - Value: Low - interesting but no immediate application
   - Recommendation: Keep in backlog for long-term learning

## Prune Candidates (2 items)

6. **Try new note-taking app** - Added 2025-10-15
   - Reason: Obsidian is working well, no longer exploring alternatives
   - Recommendation: Remove - no longer relevant

7. **Explore cryptocurrency trading** - Added 2025-09-20
   - Reason: Misaligned with telos, high risk, not wealth-building strategy (M3)
   - Recommendation: Remove - distraction from telos

## Keep in Backlog (4 items)

8-11. [Various exploration ideas with future potential]

## Summary

**Promotions Recommended:** 2 items (Financial dashboard automation, Sales pipeline tracker)
**Prune Recommended:** 2 items (Note-taking app, Crypto trading)
**Keep in Backlog:** 7 items

**Next Step:** Would you like to:
A) Promote financial dashboard automation to P2 project
B) Promote sales pipeline tracker to P1/P2 project
C) Prune the 2 outdated items
D) All of the above
```

**Example 3: Promote Item to Project**

Input: "Promote the financial dashboard automation to a P2 project"

Output:
```
✅ Backlog Item Promoted

**Original Backlog Item:** #1 - Financial dashboard automation
**New Project:** P2_NODUE_finance-dashboard-automation_PLANNED

**Project Created:**
Priority: P2 (infrastructure - creates reusable system)
Status: PLANNED (starting next month)
Telos: C3 (reduces friction in foundational habits)

**Success Criteria:**
1. Auto-pull transaction data from bank API
2. Reduce monthly analysis time from 2 hours to 15 minutes
3. Schedule monthly automation with error notifications
4. Handle 3+ bank accounts automatically
5. Generate analysis report with one command

**Removed from backlog** ✅
**Created as project** ✅

Location: D:\Program Files\Obsidian\projects\P2_NODUE_finance-dashboard-automation_PLANNED/

**Next Actions:**
1. Research bank API options (Plaid, Yodlee, etc.)
2. Evaluate cost vs. manual process
3. Design automation workflow

This P2 project will deliver ongoing value by automating your monthly finance analysis habit (C3).
```

**Example 4: Prune Outdated Items**

Input: "Clean up the backlog, remove anything outdated"

Output:
```
# Backlog Pruned - 2025-12-01

## Items Removed: 3

1. **Try new note-taking app** - Added 2025-10-15
   - Removed: 2025-12-01
   - Reason: Obsidian is working well, no longer exploring alternatives

2. **Explore cryptocurrency trading** - Added 2025-09-20
   - Removed: 2025-12-01
   - Reason: Misaligned with telos wealth-building strategy (M3), high risk

3. **Weekend trip to Vegas** - Added 2025-08-10
   - Removed: 2025-12-01
   - Reason: Not a project, was a one-time event that already happened

## Items Kept: 8

Backlog now contains 8 items focused on telos-aligned opportunities:
- 2 infrastructure ideas (finance automation, sales pipeline)
- 3 content/community ideas (blog automation, LinkedIn tool, etc.)
- 3 learning/exploration ideas (Rust, AI tools, etc.)

✅ Backlog is now lean and focused.

**Recommended:** Review backlog again in Q1 2026 or when P1 work completes.
```

---

## Notes

**Critical Success Factors:**
1. Keep backlog LEAN - quality over quantity
2. Prune regularly - don't let it become junk drawer
3. Quick telos check when adding - don't capture distractions
4. Review monthly - fresh eyes on old ideas
5. Promote when ready - don't let good ideas languish

**Common Pitfalls:**
- ❌ Backlog becomes dumping ground (hundreds of items)
- ❌ Never pruning (stale ideas accumulate)
- ❌ Never promoting (good ideas stuck in backlog)
- ❌ Skipping telos check (capturing distractions)
- ❌ Too much process (backlog should be lightweight)

**Backlog Philosophy:**
- Backlog = P3 ideas not yet ready for project structure
- Purpose: Capture so you can forget, not to create work
- Items should be reviewed quarterly, not daily
- Promotion happens when capacity opens OR idea becomes critical
- Pruning is healthy - ideas have shelf life

**When to challenge user:**
- Adding too many items at once (brain dump without triage)
- Never pruning (hoarding ideas)
- Promoting everything (defeats purpose of backlog)
- Weak telos alignment on new items (enabling distractions)

---

**Last Updated:** 2025-12-01
