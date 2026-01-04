# Content to 2025 Review Workflow

**Purpose:** Add reflections, lessons, or insights to 2025 Year End Review file

**When to Use:**
- Request to "add to 2025 review"
- "Add this reflection to yearly review"
- Processing directive: `## Add this to my 2025 review - "filepath"`

**Prerequisites:**
- Target file: `/mnt/d/Program Files/Obsidian/projects/youtube_transcripts/2025_Year_End_Review_and_2026_Planning.md`
- Content to add (reflection, lesson, insight, challenge, etc.)

---

## Workflow Steps

### Step 1: Git Checkpoint

**Description:** Commit Random_Ideas_From_Megan.md before any processing

**Actions:**
```bash
cd "/mnt/d/Program Files/Obsidian/projects"
git add Random_Ideas_From_Megan.md
git commit -m "checkpoint: before adding to 2025 review"
```

**Expected Outcome:** Version control checkpoint created

---

### Step 2: Read Existing 2025 Review

**Description:** Understand structure and formatting of year-end review

**Actions:**
1. Read `/mnt/d/Program Files/Obsidian/projects/youtube_transcripts/2025_Year_End_Review_and_2026_Planning.md`
2. Identify sections (Lessons, Challenges, Skills Lacking, Reflections, etc.)
3. Note formatting style

**Expected Outcome:** Style template identified for consistency

---

### Step 3: Categorize Content

**Description:** Determine which section the content belongs to

**Categories:**
- **Lessons Learned** - "I learned that...", "One thing I learned..."
- **Challenges** - "struggled with...", "difficulty with..."
- **Skills Lacking** - "skill I lack...", "need to improve..."
- **Reflections** - "feeling of...", "realized that..."
- **Goals/Vision** - "learning to pick...", "want to achieve..."
- **Execution** - "think too much", "not executing enough"

**Ask User if Ambiguous:** "Which section should this go in: [options]?"

**Expected Outcome:** Clear categorization for placement

---

### Step 4: Create _REVIEW File

**Description:** Create temporary review file with formatted content

**File Path:** `/mnt/d/Program Files/Obsidian/projects/youtube_transcripts/_REVIEW_2025_review_addition.md`

**Format:**
```markdown
# 2025 Review Addition

**Category:** [Lessons Learned / Challenges / Skills Lacking / etc.]
**Date Added:** [Date]
**Source Entry:** [Timestamp/context from Random Ideas]

---

## Content to Add

[Formatted content matching the style of 2025 review file]

---

## Integration Instructions

1. Open: /mnt/d/Program Files/Obsidian/projects/youtube_transcripts/2025_Year_End_Review_and_2026_Planning.md
2. Navigate to: [Category] section
3. Add the content below in appropriate location
4. Preserve existing formatting and style

---

## Suggested Placement

**Section:** [Category Name]

**Content:**
```
[The actual content formatted and ready to paste]
```

**Example:**
```
## Lessons Learned

**11:17** - Learning to pick the right goals and vision was a struggle this year
```
```

**Expected Outcome:** _REVIEW file created with clear integration instructions

---

### Step 5: Tag Original Entry

**Description:** Mark the original idea entry as processed

**Actions:**
1. Read Random_Ideas_From_Megan.md
2. Find the entry with this directive
3. Add `## ✅ REVIEW` tag BEFORE the directive line

**Example:**
```markdown
## ✅ REVIEW Add this to my 2025 review - "filepath"
**11:17** - Learning to pick the right goals and vision was a struggle this year
```

**Expected Outcome:** Entry tagged, preserved for history

---

### Step 6: Report to User

**Description:** Inform user of completion and next steps

**Report Format:**
```
✅ Content prepared for 2025 Review addition

📄 Review File Created:
/mnt/d/Program Files/Obsidian/projects/youtube_transcripts/_REVIEW_2025_review_addition.md

📂 Target File:
/mnt/d/Program Files/Obsidian/projects/youtube_transcripts/2025_Year_End_Review_and_2026_Planning.md

📋 Category: [Category Name]

📋 Next Steps:
1. Review the _REVIEW file
2. Open the 2025 review file
3. Navigate to the [Category] section
4. Add/paste the content
5. Delete _REVIEW file after merging

🏷️ Original entry tagged with "## ✅ REVIEW"
```

**Expected Outcome:** User has clear instructions for integration

---

## Outputs

**Primary Output:**
- `_REVIEW_2025_review_addition.md` - Temporary file with formatted content

**Secondary Outputs:**
- Git commit in Random_Ideas_From_Megan.md
- `## ✅ REVIEW` tag added to original entry

**Where outputs are stored:**
- Review file: `/mnt/d/Program Files/Obsidian/projects/youtube_transcripts/`
- Final destination (after user approval): `2025_Year_End_Review_and_2026_Planning.md`

---

## Related Workflows

- **content-to-obituary.md** - Similar content addition workflow
- **content-to-telos-file.md** - General telos content addition

---

## Examples

**Example 1: Lesson Learned**

Input:
```markdown
## Add this to my 2025 review
**22:46** - I learned this year that I think too much and not execute enough
```

Process:
1. Git commit
2. Read 2025 review structure
3. Categorize as "Lessons Learned"
4. Create _REVIEW file with formatted lesson
5. Tag original entry
6. User reviews and adds to 2025 review

**Example 2: Skill Lacking**

Input:
```markdown
## Add this to my 2025 review
**11:00** - Skill I lack that should be added to my 2025 review is the discipline of eliminating shiny objects
```

Process:
1. Git commit
2. Categorize as "Skills Lacking"
3. Create _REVIEW file
4. User adds to appropriate section

---

**Last Updated:** 2025-12-19
