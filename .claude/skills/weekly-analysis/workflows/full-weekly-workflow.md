# Full Weekly Workflow

End-to-end weekly processing: link all daily notes to weekly analysis, then generate any missing weekly analyses.

## Overview

This workflow combines:
1. `link-daily-to-weekly.md` - Add wiki-links from daily notes
2. `generate-weekly-analysis.md` - Create missing weekly analyses

## Workflow Steps

### Step 1: Git Checkpoint

```bash
cd "/mnt/d/Program Files/Obsidian"
git add daily_notes/ weekly_analysis/
git commit -m "checkpoint: before full weekly workflow"
```

### Step 2: Link Daily Notes

Execute `link-daily-to-weekly.md` workflow:
- Scan all daily notes
- Add wiki-links to corresponding weekly analysis
- Collect list of weeks without weekly analysis

### Step 3: Identify Missing Weekly Analyses

From Step 2 output, identify week prefixes that have daily notes but no weekly analysis file.

Example output:
```
Missing weeks: W00-2026 W35-2025
```

### Step 4: Generate Missing Weekly Analyses

For each missing week, execute `generate-weekly-analysis.md`:

**Option A: Sequential (preserves context)**
Generate each week one at a time.

**Option B: Parallel (faster, uses sub-agents)**
Deploy multiple engineer sub-agents, one per missing week:

```
Task(subagent_type=engineer):
  "Generate weekly analysis for W35-2025 using 15-pattern fabric pipeline.
   Daily notes: /mnt/d/Program Files/Obsidian/daily_notes/W35-2025*.md
   Output: /mnt/d/Program Files/Obsidian/weekly_analysis/combined_W35-2025-08-25.md
   Apply MINS tracking and 3 Monkeys Framework lens."
```

### Step 5: Update Links for New Analyses

After generating missing analyses, re-run link workflow for affected weeks:

```bash
# Only update daily notes for newly generated weeks
for week in W00-2026 W35-2025; do
    # Add wiki-links to daily notes for this week
done
```

### Step 6: Final Verification

Verify:
1. All daily notes have wiki-links
2. All weeks with daily notes have weekly analysis
3. Links navigate correctly in Obsidian

### Step 7: Git Commit

```bash
cd "/mnt/d/Program Files/Obsidian"
git add daily_notes/ weekly_analysis/
git commit -m "weekly-analysis: linked daily notes and generated missing analyses"
```

## Expected Output

```
=== Full Weekly Workflow Complete ===

Daily Notes Linked:
- Updated: 152 files
- Already linked: 10 files

Weekly Analyses Generated:
- W00-2026: combined_W00-2026-01-01.md (26KB)
- W35-2025: combined_W35-2025-08-31.md (48KB)

All daily notes now linked to weekly analysis.
```

## When to Use

- Initial vault setup (first time running skill)
- After extended period without analysis
- Weekly maintenance routine
- Before quarterly review (ensure all weeks analyzed)

## Related Workflows

- `link-daily-to-weekly.md` - Step 2 details
- `generate-weekly-analysis.md` - Step 4 details
- `mins-tracking.md` - MINS-focused analysis subset
