# Link Daily Notes to Weekly Analysis

Adds Obsidian wiki-links from daily notes to their corresponding weekly analysis files.

## Prerequisites

- Daily notes directory: `/mnt/d/Program Files/Obsidian/daily_notes/`
- Weekly analysis directory: `/mnt/d/Program Files/Obsidian/weekly_analysis/`
- Daily notes format: `W[week]-[year]-[month]-[day].md`
- Weekly analysis format: `combined_W[week]-[year]-[month]-[day].md`

## Workflow Steps

### Step 1: Git Checkpoint
Commit current state before modifying files:
```bash
cd "/mnt/d/Program Files/Obsidian"
git add daily_notes/ weekly_analysis/
git commit -m "checkpoint: before weekly analysis linking"
```

### Step 2: Run Linking Script

```bash
DAILY_NOTES_DIR="/mnt/d/Program Files/Obsidian/daily_notes"
WEEKLY_ANALYSIS_DIR="/mnt/d/Program Files/Obsidian/weekly_analysis"

updated=0
skipped=0
skipped_weeks=""

for daily_file in "$DAILY_NOTES_DIR"/W*.md; do
    filename=$(basename "$daily_file")

    # Extract week prefix (e.g., W02-2026)
    week_prefix=$(echo "$filename" | grep -oP 'W\d+-\d+')

    # Find matching weekly analysis file
    weekly_file=$(ls "$WEEKLY_ANALYSIS_DIR"/combined_${week_prefix}-*.md 2>/dev/null | head -1)

    if [[ -z "$weekly_file" ]]; then
        skipped=$((skipped + 1))
        skipped_weeks="$skipped_weeks $week_prefix"
        continue
    fi

    # Check if link already exists
    if grep -q "Weekly Analysis:" "$daily_file" 2>/dev/null; then
        continue
    fi

    # Get weekly analysis basename for link
    weekly_basename=$(basename "$weekly_file" .md)

    # Prepend wiki-link to daily note
    {
        echo "> **Weekly Analysis:** [[../weekly_analysis/$weekly_basename|Week $week_prefix Summary]]"
        echo ""
        cat "$daily_file"
    } > "${daily_file}.tmp"

    mv "${daily_file}.tmp" "$daily_file"
    updated=$((updated + 1))
done

echo "Updated: $updated files"
echo "Skipped: $skipped files (no weekly analysis)"
echo "Missing weeks: $skipped_weeks"
```

### Step 3: Report Results

Output should include:
- Number of files updated
- Number of files skipped (no matching weekly analysis)
- List of week prefixes without weekly analysis (for follow-up generation)

## Link Format

The wiki-link is added at the very top of each daily note:

```markdown
> **Weekly Analysis:** [[../weekly_analysis/combined_W02-2026-01-11|Week W02-2026 Summary]]

**05:10** - Michael: [original daily note content...]
```

## Verification

After running, verify:
1. Daily notes have wiki-links at top
2. Links navigate correctly in Obsidian
3. No duplicate links added

## Next Steps

If weeks are reported as missing weekly analysis:
→ Run `generate-weekly-analysis.md` workflow for those weeks
