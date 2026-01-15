# Generate Weekly Analysis

Creates comprehensive weekly analysis using the 15-pattern fabric pipeline with MINS tracking and 3 Monkeys Framework lens.

## Prerequisites

- Daily notes for target week in `/mnt/d/Program Files/Obsidian/daily_notes/`
- Fabric CLI installed with custom patterns
- Reference files accessible:
  - `/mnt/d/Program Files/Obsidian/projects/2026_vision.md` (MINS context)
  - `/mnt/d/Program Files/Obsidian/telos/mental_models.md` (3 Monkeys Framework)

## Workflow Steps

### Step 1: Identify Target Week

Determine week to analyze:
- User specifies: "W35-2025", "W02-2026"
- Auto-detect: Find weeks with daily notes but no weekly analysis

```bash
# Find daily notes for target week (e.g., W02-2026)
WEEK_PREFIX="W02-2026"
ls "/mnt/d/Program Files/Obsidian/daily_notes/${WEEK_PREFIX}"*.md
```

### Step 2: Aggregate Daily Notes

Concatenate all daily notes for the week:

```bash
WEEK_PREFIX="W02-2026"
DAILY_DIR="/mnt/d/Program Files/Obsidian/daily_notes"
OUTPUT_DIR="/mnt/d/Program Files/Obsidian/weekly_analysis"

# Create temporary aggregated file
TEMP_FILE="/tmp/week_aggregate.md"
cat "$DAILY_DIR/${WEEK_PREFIX}"*.md > "$TEMP_FILE"
```

### Step 3: Load Context Files

Read MINS and 3 Monkeys context for analysis lens:

**MINS Context (from 2026_vision.md):**
- Primary goal: Job search success by March 31, 2026
- Key metrics to track
- Most Important Next Steps focus

**3 Monkeys Framework (from mental_models.md):**
- Explorer: Curiosity and learning
- Worker: Productivity and execution
- Accountant: Caution and financial responsibility

### Step 4: Run 15-Pattern Fabric Pipeline

Execute patterns sequentially on aggregated daily notes:

```bash
TEMP_FILE="/tmp/week_aggregate.md"
RESULTS_DIR="/tmp/fabric_results"
mkdir -p "$RESULTS_DIR"

# Pattern 1-15 execution
cat "$TEMP_FILE" | fabric -p t_check_metrics > "$RESULTS_DIR/01_metrics.md"
cat "$TEMP_FILE" | fabric -p t_find_neglected_goals > "$RESULTS_DIR/02_neglected_goals.md"
cat "$TEMP_FILE" | fabric -p extract_patterns > "$RESULTS_DIR/03_patterns.md"
cat "$TEMP_FILE" | fabric -p analyze_mistakes > "$RESULTS_DIR/04_mistakes.md"
cat "$TEMP_FILE" | fabric -p t_find_blindspots > "$RESULTS_DIR/05_blindspots.md"
cat "$TEMP_FILE" | fabric -p extract_insights > "$RESULTS_DIR/06_insights.md"
cat "$TEMP_FILE" | fabric -p extract_primary_problem > "$RESULTS_DIR/07_primary_problem.md"
cat "$TEMP_FILE" | fabric -p t_red_team_thinking > "$RESULTS_DIR/08_red_team.md"
cat "$TEMP_FILE" | fabric -p t_give_encouragement > "$RESULTS_DIR/09_encouragement.md"
cat "$TEMP_FILE" | fabric -p summarize > "$RESULTS_DIR/10_summary.md"
cat "$TEMP_FILE" | fabric -p extract_wisdom > "$RESULTS_DIR/11_wisdom.md"
cat "$TEMP_FILE" | fabric -p extract_recommendations > "$RESULTS_DIR/12_recommendations.md"
cat "$TEMP_FILE" | fabric -p analyze_claims > "$RESULTS_DIR/13_claims.md"
cat "$TEMP_FILE" | fabric -p extract_questions > "$RESULTS_DIR/14_questions.md"
cat "$TEMP_FILE" | fabric -p rate_content > "$RESULTS_DIR/15_rating.md"
```

### Step 5: Apply Analysis Lenses

**MINS Tracking Section:**
- Evaluate: Are daily entries aligned with job search goal?
- Progress indicators toward March 31, 2026 deadline
- Time allocation to MINS vs. other activities

**3 Monkeys Balance Section:**
- Explorer balance: Learning new skills, exploring opportunities
- Worker balance: Applying, interviewing, completing tasks
- Accountant balance: Financial planning, bill concerns, budgeting

### Step 6: Compile Weekly Analysis

Create final output file with structure:

```markdown
# Weekly Analysis: W02-2026

**Period:** January 6-12, 2026
**Generated:** [timestamp]

## Executive Summary
[10_summary.md output]

## MINS Progress (Job Search by March 31, 2026)
[Assessment of alignment with primary goal]

## 3 Monkeys Framework Balance
### Explorer (Curiosity)
[Assessment]
### Worker (Productivity)
[Assessment]
### Accountant (Caution)
[Assessment]

## Key Metrics Check
[01_metrics.md output]

## Neglected Goals
[02_neglected_goals.md output]

## Behavioral Patterns
[03_patterns.md output]

## Mistakes & Lessons
[04_mistakes.md output]

## Blind Spots
[05_blindspots.md output]

## Insights
[06_insights.md output]

## Primary Problem
[07_primary_problem.md output]

## Red Team Analysis
[08_red_team.md output]

## Encouragement
[09_encouragement.md output]

## Wisdom Extracted
[11_wisdom.md output]

## Recommendations
[12_recommendations.md output]

## Claims Analysis
[13_claims.md output]

## Open Questions
[14_questions.md output]

## Content Rating
[15_rating.md output]

---
*Generated with weekly-analysis skill using 15-pattern fabric pipeline*
```

### Step 7: Write Output File

```bash
WEEK_PREFIX="W02-2026"
START_DATE="01-06"  # First day of week
OUTPUT_FILE="/mnt/d/Program Files/Obsidian/weekly_analysis/combined_${WEEK_PREFIX}-${START_DATE}.md"

# Write compiled analysis to output file
```

## Output Format

Final file: `combined_W[week]-[year]-[month]-[day].md`

Example: `combined_W02-2026-01-06.md`

## Verification

After generation:
1. Verify file created in weekly_analysis directory
2. Check all 15 fabric pattern sections populated
3. Verify MINS and 3 Monkeys sections present
4. Link daily notes to new weekly analysis (if not already linked)

## Agent Usage Note

For context preservation, delegate to sub-agent:
- Use `Task` tool with `subagent_type=engineer`
- Provide full context: week prefix, file locations, fabric pipeline
- Sub-agent executes fabric patterns and compiles output
