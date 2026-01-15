# MINS Tracking

Focused evaluation of progress toward the Most Important Next Steps - specifically the job search goal by March 31, 2026.

## Overview

MINS (Most Important Next Steps) represents the primary focus metric from the 2026 vision. This workflow evaluates daily/weekly entries specifically through the MINS lens.

## Context Source

**File:** `/mnt/d/Program Files/Obsidian/projects/2026_vision.md`

**Primary MINS Goal:** Job search success by March 31, 2026

## Workflow Steps

### Step 1: Load MINS Context

Read 2026_vision.md to understand:
- Specific job search targets
- Key milestones and deadlines
- Success metrics

### Step 2: Analyze Recent Entries

Scan daily notes for MINS alignment:

**Positive Indicators:**
- Interview preparation activities
- SQL practice sessions
- Recruiter outreach/responses
- Mock interview sessions
- Application submissions
- Networking activities

**Neutral Activities:**
- General productivity work
- Learning (if career-relevant)
- System building (if supports job search)

**Distraction Indicators:**
- Excessive time on non-MINS projects
- Avoidance behaviors mentioned
- Procrastination patterns

### Step 3: Generate MINS Report

```markdown
# MINS Progress Report

**Goal:** Job Search Success by March 31, 2026
**Days Remaining:** [calculated]
**Report Date:** [today]

## This Week's MINS Activity

### Direct MINS Actions
- [List activities directly supporting job search]

### MINS-Adjacent Activities
- [List activities that indirectly support goal]

### Time Allocation
- MINS activities: X hours
- Other activities: Y hours
- MINS ratio: X/(X+Y) = Z%

## Progress Assessment

**On Track:** [Yes/No/At Risk]

**Key Wins:**
- [Positive progress items]

**Concerns:**
- [Areas needing attention]

## Recommendations

1. [Specific action to improve MINS focus]
2. [Resource or strategy suggestion]
3. [Accountability measure]

## Emotional State Check

From daily notes:
- Current feelings about job search
- Confidence level
- Anxiety/stress indicators
- Support needs identified
```

### Step 4: Apply Fabric Patterns (Optional)

For deeper analysis, run specific patterns:

```bash
cat /tmp/week_aggregate.md | fabric -p t_check_metrics
cat /tmp/week_aggregate.md | fabric -p t_find_neglected_goals
cat /tmp/week_aggregate.md | fabric -p extract_primary_problem
```

## Integration Points

**Daily Check:**
- Quick MINS alignment scan of today's entry
- Flag if day had zero MINS activity

**Weekly Integration:**
- MINS section in weekly analysis
- Part of 15-pattern fabric pipeline output

**Monthly Review:**
- Trend analysis across weeks
- Progress toward March 31 deadline

## Example Daily Note Entries (MINS Relevant)

```
**03:55** - Recruiter reached out about Snowflake position today. That was a huge win!
→ MINS: Positive - recruiter outreach received

**17:14** - I am scared of technical interviews which tells me I'm not prepared yet
→ MINS: Awareness - identifies preparation gap

**17:15** - I'm slowly making momentum. Getting back interviews and getting better at SQL
→ MINS: Progress - skill development and interview activity
```

## Success Metrics

Track across weeks:
- Number of applications submitted
- Recruiter responses received
- Interviews scheduled
- Mock interviews completed
- Hours spent on SQL/technical prep
- Networking conversations held

## Related Files

- `2026_vision.md` - Primary MINS source
- `generate-weekly-analysis.md` - Full analysis including MINS
- Weekly analysis files - Historical MINS progress
