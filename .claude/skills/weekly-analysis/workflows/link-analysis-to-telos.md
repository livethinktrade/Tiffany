# Link Analysis Files to TELOS

Creates bidirectional Obsidian links between raw combined files, analysis files, and TELOS History section.

## Link Chain Architecture

```
Daily Notes → Raw Combined → Analysis → TELOS History
                  ↑____________↓
             (bidirectional links)
```

## Prerequisites

- Weekly analysis files exist in `/mnt/d/Program Files/Obsidian/weekly_analysis/`
- TELOS file at `/mnt/d/Program Files/Obsidian/telos/michael_telos.md`

## Workflow Steps

### Step 1: Link Raw Files to Analysis Files

Add `**Analysis:**` link to each raw combined file after the metadata block:

```bash
cd "/mnt/d/Program Files/Obsidian/weekly_analysis"

for analysis in combined_W*_analysis.md; do
  # Skip gemini files
  [[ "$analysis" == *"gemini"* ]] && continue

  # Get the raw file name (remove _analysis)
  raw="${analysis/_analysis/}"

  if [[ -f "$raw" ]]; then
    # Check if link already exists
    if ! grep -q "^\*\*Analysis:\*\*" "$raw" 2>/dev/null; then
      analysis_link="${analysis%.md}"
      sed -i "/^\*\*Pattern Used:\*\*/a **Analysis:** [[${analysis_link}]]" "$raw"
      echo "Linked: $raw -> $analysis_link"
    fi
  fi
done
```

### Step 2: Add Backlinks from Analysis to Raw Files

Add `**Source:**` backlink to each analysis file:

```bash
cd "/mnt/d/Program Files/Obsidian/weekly_analysis"

for analysis in combined_W*_analysis.md; do
  [[ "$analysis" == *"gemini"* ]] && continue

  raw="${analysis/_analysis/}"
  raw_link="${raw%.md}"

  if [[ -f "$raw" ]]; then
    if ! grep -q "^\*\*Source:\*\*" "$analysis" 2>/dev/null; then
      if grep -q "^TELOS Context:" "$analysis"; then
        sed -i "/^TELOS Context:/a **Source:** [[${raw_link}]]" "$analysis"
      fi
      echo "Backlinked: $analysis -> $raw_link"
    fi
  fi
done
```

### Step 3: Update TELOS History Section

Add weekly analysis links to TELOS History section using Option B format (compact one-liners):

**Format for detailed weeks (W31, W32):**
```markdown
- **2025-08 (W32): First Client and Systems Mindset.** [[combined_W32-2025-08-15_analysis]] This week marked...
```

**Format for compact entries:**
```markdown
- **2025-08 (W33):** [[combined_W33-2025-08-23_analysis]] - Workplace failures, leadership challenges
```

**Entry template:**
```markdown
- **YYYY-MM (Wxx):** [[combined_Wxx-YYYY-MM-DD_analysis]] - Brief theme description
```

Mark incomplete analysis files (API errors) with `(INCOMPLETE)` suffix.

## File Locations

**Raw Combined Files:**
- Location: `/mnt/d/Program Files/Obsidian/weekly_analysis/combined_W*.md` (not _analysis)
- Link added: After `**Pattern Used:**` line

**Analysis Files:**
- Location: `/mnt/d/Program Files/Obsidian/weekly_analysis/combined_W*_analysis.md`
- Backlink added: After `TELOS Context:` line

**TELOS File:**
- Location: `/mnt/d/Program Files/Obsidian/telos/michael_telos.md`
- Section: `## 🕰️  History`

## Verification

After running:
1. Check raw files have `**Analysis:** [[...]]` link in metadata
2. Check analysis files have `**Source:** [[...]]` backlink
3. Check TELOS History section has wikilinks for all weeks
4. Open Obsidian graph view to verify connection chain

## Notes

- W31 and W35 may not have analysis files (skip in TELOS)
- Recent weeks (W52, W01, W02) may be marked INCOMPLETE if API credits ran out
- Gemini analysis files are excluded from linking (separate experiments)
