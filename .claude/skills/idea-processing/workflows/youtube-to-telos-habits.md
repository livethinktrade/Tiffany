# YouTube to Telos Habits Workflow

**Purpose:** Extract habit/behavior concepts from YouTube video and create review file for habits addition

**When to Use:**
- User has YouTube URL with habit content
- Request to "add this habit to telos"
- "Extract habit from this video"
- Processing directive: `## Add this to my telos directory and create a habits file`

**Prerequisites:**
- YouTube URL (youtube.com/watch or youtu.be format)
- `yt` CLI installed (YouTube transcript extraction)
- `fabric` CLI installed
- Target file: `/mnt/d/Program Files/Obsidian/telos/habits.md` (create if doesn't exist)

---

## Workflow Steps

### Step 1: Git Checkpoint

**Description:** Commit Random_Ideas_From_Megan.md before any processing

**Actions:**
```bash
cd "/mnt/d/Program Files/Obsidian/projects"
git add Random_Ideas_From_Megan.md
git commit -m "checkpoint: before processing YouTube to habits"
```

**Expected Outcome:** Clean git status, version control checkpoint created

---

### Step 2: Extract Habit Concepts

**Description:** Extract transcript focusing on behavior and habit patterns

**Actions:**
```bash
# Extract transcript and identify habit patterns
yt "https://youtube.com/watch?v=VIDEO_ID" | fabric -p extract_wisdom > /tmp/youtube_habits.md
```

**Focus Areas:**
- Behavioral patterns mentioned
- Daily/weekly routines described
- Habit formation techniques
- Systems and processes

**Expected Outcome:** Transcript extracted with habit focus

---

### Step 3: Check if habits.md Exists

**Description:** Verify target file exists, read existing style if present

**Actions:**
1. Check if `/mnt/d/Program Files/Obsidian/telos/habits.md` exists
2. If exists: Read file to understand formatting and style
3. If not exists: Use standard telos formatting (will be created after review)

**Expected Outcome:** Style template identified for consistency

---

### Step 4: Create _REVIEW File

**Description:** Create temporary review file with extracted habits

**File Path:** `/mnt/d/Program Files/Obsidian/telos/_REVIEW_habits_addition.md`

**Format:**
```markdown
# Habits Addition - [Video Title or Description]

**Source:** [YouTube URL]
**Processed:** [Date]
**Pattern Used:** [Fabric pattern name]

---

## Summary
[Brief overview of the habit/behavior]

---

## Habit Description

**Habit:** [Name of the habit]

**Why It Matters:** [Purpose and benefit]

**How to Implement:** [Actionable steps]

**Frequency:** [Daily/Weekly/Monthly]

**Trigger:** [What prompts this habit]

**Reward:** [What benefit you get]

---

## Integration Notes
- Review and refine habit description
- Ensure it matches your telos style
- Check for duplicates in existing habits.md
- Adapt language to first-person perspective
```

**Expected Outcome:** _REVIEW file created with structured habit content

---

### Step 5: Tag Original Entry

**Description:** Mark the original idea entry as processed

**Actions:**
1. Read Random_Ideas_From_Megan.md
2. Find the entry with this directive
3. Add `## ✅ REVIEW` tag BEFORE the directive line

**Expected Outcome:** Entry tagged with `## ✅ REVIEW`, preserved for history

---

### Step 6: Report to User

**Description:** Inform user of completion and next steps

**Report Format:**
```
✅ Habit concepts extracted from YouTube

📄 Review File Created:
/mnt/d/Program Files/Obsidian/telos/_REVIEW_habits_addition.md

📋 Next Steps:
1. Review the _REVIEW file
2. Refine habit description and implementation steps
3. When ready, manually merge to habits.md (or create habits.md if new)
4. Delete _REVIEW file after merging

🏷️ Original entry tagged with "## ✅ REVIEW"
```

**Expected Outcome:** User knows next actions

---

## Outputs

**Primary Output:**
- `_REVIEW_habits_addition.md` - Temporary file with extracted habit

**Secondary Outputs:**
- Git commit in Random_Ideas_From_Megan.md
- `## ✅ REVIEW` tag added to original entry

**Where outputs are stored:**
- Review file: `/mnt/d/Program Files/Obsidian/telos/`
- Final destination (after user approval): `/mnt/d/Program Files/Obsidian/telos/habits.md`

---

## Related Workflows

- **youtube-to-mental-models.md** - Similar YouTube processing workflow
- **create-telos-file.md** - If habits.md doesn't exist, use this to create it

---

## Examples

**Example 1: New Habit**

Input:
```markdown
## Add this to my telos directory and create a habits file
**10:15** - The habit of eliminating distractions
```

Process:
1. Git commit
2. Extract concepts (if URL provided) or use provided text
3. Create `_REVIEW_habits_addition.md` with structured habit
4. Tag original entry
5. User reviews and integrates

**Example 2: Habit from YouTube**

Input: YouTube video about daily routines

Process:
1. Git commit
2. Extract: `yt "URL" | fabric -p extract_wisdom`
3. Identify behavior patterns
4. Create _REVIEW file with habit structure
5. User refines and adds to habits.md

---

**Last Updated:** 2025-12-19
