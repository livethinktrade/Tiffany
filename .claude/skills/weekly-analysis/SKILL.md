---
name: weekly-analysis
description: |
  Automated weekly analysis generation with Obsidian linking, 15-pattern fabric pipeline,
  MINS tracking, and 3 Monkeys Framework lens for personal reflection and goal alignment.

  USE WHEN user says "weekly analysis", "generate weekly analysis", "link daily notes",
  "run weekly analysis", "analyze this week", "MINS check", or any request to process
  daily journals into weekly summaries.
---

## Workflow Routing (SYSTEM PROMPT)

**CRITICAL: Weekly analysis uses a 15-pattern fabric pipeline and applies the 3 Monkeys Framework lens.**

**When user requests linking daily notes to weekly analysis:**
Examples: "link daily notes", "add weekly links to daily notes", "connect daily journals to weekly analysis"
→ **READ:** ${PAI_DIR}/skills/weekly-analysis/workflows/link-daily-to-weekly.md
→ **EXECUTE:** Bash script to add Obsidian wiki-links from daily notes to corresponding weekly analysis files

**When user requests generating weekly analysis:**
Examples: "generate weekly analysis", "create weekly analysis", "analyze this week", "run weekly analysis for W02"
→ **READ:** ${PAI_DIR}/skills/weekly-analysis/workflows/generate-weekly-analysis.md
→ **EXECUTE:** Run 15-pattern fabric pipeline on daily notes, create comprehensive weekly analysis

**When user requests full weekly workflow (link + generate):**
Examples: "full weekly analysis", "complete weekly workflow", "process week end-to-end"
→ **READ:** ${PAI_DIR}/skills/weekly-analysis/workflows/full-weekly-workflow.md
→ **EXECUTE:** Link daily notes AND generate analysis for missing weeks

**When user requests MINS tracking check:**
Examples: "MINS check", "check MINS progress", "how am I doing on MINS", "job search progress"
→ **READ:** ${PAI_DIR}/skills/weekly-analysis/workflows/mins-tracking.md
→ **EXECUTE:** Evaluate progress toward job search goal by March 31, 2026

---

## When to Activate This Skill

### Direct Weekly Analysis Requests
- "weekly analysis" or "run weekly analysis"
- "generate weekly analysis", "create weekly analysis"
- "analyze this week", "analyze week [number]"
- "process weekly journals"

### Obsidian Linking Requests
- "link daily notes to weekly"
- "add weekly links to daily notes"
- "connect daily journals to weekly analysis"
- "update daily note links"

### MINS & Goal Tracking
- "MINS check", "MINS progress"
- "job search progress", "track job search goal"
- "am I on track for March deadline"
- "goal alignment check"

### 3 Monkeys Framework
- "3 monkeys analysis", "balance check"
- "explorer worker accountant analysis"
- "monkey framework review"

### Week-Specific Requests
- "analyze W02-2026", "weekly for W35-2025"
- "create missing weekly analysis"
- "generate analysis for [week]"

---

## Core Concepts

### MINS (Most Important Next Steps)
- Primary goal: Job search success by March 31, 2026
- Daily focus evaluation: Are entries aligned with MINS?
- Progress tracking toward employment goal
- Source: `/mnt/d/Program Files/Obsidian/projects/2026_vision.md`

### 3 Monkeys Framework
A balance analysis lens from Daniel's mental models:

| Monkey | Role | Key Question |
|--------|------|--------------|
| **Explorer** | Curiosity | Am I learning and exploring new ideas? |
| **Worker** | Productivity | Am I executing and getting things done? |
| **Accountant** | Caution | Am I being financially responsible? |

Source: `/mnt/d/Program Files/Obsidian/telos/mental_models.md`

### 15-Pattern Fabric Pipeline
Sequential fabric patterns for comprehensive analysis:

1. `t_check_metrics` - Check KPI progress
2. `t_find_neglected_goals` - Identify ignored goals
3. `extract_patterns` - Find behavioral patterns
4. `analyze_mistakes` - Review errors and lessons
5. `t_find_blindspots` - Uncover blind spots
6. `extract_insights` - Pull key insights
7. `extract_primary_problem` - Identify main challenges
8. `t_red_team_thinking` - Challenge assumptions
9. `t_give_encouragement` - Positive reinforcement
10. `summarize` - Create summary
11. `extract_wisdom` - Extract wisdom nuggets
12. `extract_recommendations` - Generate recommendations
13. `analyze_claims` - Validate claims made
14. `extract_questions` - Surface unanswered questions
15. `rate_content` - Quality assessment

---

## File Locations

**Daily Notes Directory:**
- `/mnt/d/Program Files/Obsidian/daily_notes/`
- Format: `W[week]-[year]-[month]-[day].md` (e.g., `W02-2026-01-14.md`)

**Weekly Analysis Directory:**
- `/mnt/d/Program Files/Obsidian/weekly_analysis/`
- Format: `combined_W[week]-[year]-[month]-[day].md`

**Reference Files:**
- Vision: `/mnt/d/Program Files/Obsidian/projects/2026_vision.md`
- Mental Models: `/mnt/d/Program Files/Obsidian/telos/mental_models.md`
- Model Improvements: `/mnt/d/Program Files/Obsidian/weekly_analysis/0_Weekly Analysis Model Improvements.md`

---

## Workflow Overview

### link-daily-to-weekly.md
Adds Obsidian wiki-links from daily notes to corresponding weekly analysis files.
- Scans all daily notes in `daily_notes/` directory
- Matches each to corresponding weekly analysis file
- Prepends wiki-link at top of file
- Reports files without matching weekly analysis

### generate-weekly-analysis.md
Creates comprehensive weekly analysis using 15-pattern fabric pipeline.
- Aggregates all daily notes for specified week
- Runs 15 fabric patterns sequentially
- Applies MINS tracking lens
- Applies 3 Monkeys Framework balance analysis
- Outputs to `combined_W[week]-[date].md`

### full-weekly-workflow.md
End-to-end weekly processing: link all daily notes, then generate any missing weekly analyses.

### mins-tracking.md
Focused evaluation of job search progress toward March 31, 2026 deadline.

---

## Examples

**Example 1: Link Daily Notes**

User: "Link all my daily notes to their weekly analysis files"

Skill Response:
1. Routes to link-daily-to-weekly.md
2. Runs bash script to scan daily notes
3. Adds wiki-links like: `> **Weekly Analysis:** [[../weekly_analysis/combined_W02-2026-01-11|Week W02-2026 Summary]]`
4. Reports: "Updated 152 files, skipped 10 (no weekly analysis found)"

**Example 2: Generate Missing Weekly Analysis**

User: "Generate weekly analysis for W35-2025"

Skill Response:
1. Routes to generate-weekly-analysis.md
2. Aggregates daily notes from W35-2025
3. Runs 15-pattern fabric pipeline
4. Creates `/mnt/d/Program Files/Obsidian/weekly_analysis/combined_W35-2025-08-31.md`
5. Applies MINS and 3 Monkeys analysis
6. Reports: "Created 48KB comprehensive weekly analysis"

**Example 3: Full Weekly Workflow**

User: "Run the full weekly workflow for my Obsidian vault"

Skill Response:
1. Routes to full-weekly-workflow.md
2. Links all daily notes to weekly analysis (Step 1)
3. Identifies weeks without analysis files
4. Generates missing weekly analyses using fabric pipeline (Step 2)
5. Reports completion status

---

## Model Improvements Tracking

From `0_Weekly Analysis Model Improvements.md`:
1. Measure progress on key KPIs (MINS)
2. View through 3 Monkeys Framework lens
3. Audit time allocation
4. Call out deviations from personal values
5. Update TELOS on challenges faced
6. Quarterly digest for TELOS integration (condensed summaries)

---

## Related Documentation

- `${PAI_DIR}/skills/CORE/workflows/youtube-transcript-workflow.md` - YouTube processing patterns
- `${PAI_DIR}/skills/fabric/SKILL.md` - Fabric pattern selection
- `${PAI_DIR}/skills/idea-processing/SKILL.md` - Similar review workflow patterns

**Last Updated:** 2026-01-15
