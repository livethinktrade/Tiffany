# Content to Telos File Workflow

**Purpose:** Add content to any telos file with appropriate formatting and style matching

**When to Use:**
- Request to "add to telos"
- "Add this to my life goals"
- "Append to telos file"
- Processing directive targeting telos directory: `## We're going to add this to my telos file...`

**Prerequisites:**
- Target file in `/mnt/d/Program Files/Obsidian/telos/` directory
- Content to add (goal, achievement, decision, lesson, etc.)
- Understanding of target file's structure

---

## Workflow Steps

### Step 1: Git Checkpoint

**Description:** Commit Random_Ideas_From_Megan.md before any processing

**Actions:**
```bash
cd "/mnt/d/Program Files/Obsidian/projects"
git add Random_Ideas_From_Megan.md
git commit -m "checkpoint: before adding to telos file"
```

**Expected Outcome:** Version control checkpoint created

---

### Step 2: Identify Target Telos File

**Description:** Determine which telos file to update

**Common Telos Files:**
- `michael_telos.md` - Life goals, missions, achievements
- `mental_models.md` - Concepts and frameworks
- `habits.md` - Behavioral patterns
- `decisions.md` - Decision log
- `lessons.md` - Lessons learned
- `wishlist.csv` - Desired items/experiences
- Other user-created files

**Ask User if Unclear:** "Which telos file should this go in?"

**Expected Outcome:** Target file identified

---

### Step 3: Read Target File for Style Matching

**Description:** Understand existing structure and formatting

**Actions:**
1. Read target telos file: `/mnt/d/Program Files/Obsidian/telos/[filename]`
2. Identify:
   - Section structure
   - Bullet point style
   - Heading levels
   - Formatting conventions
   - Tone (first-person, third-person, etc.)

**Expected Outcome:** Style template identified

---

### Step 4: Identify Section for Content

**Description:** Determine where in the file the content should go

**For michael_telos.md example:**
- **Missions & Goals** - High-level life objectives
- **Unrefined Life Achievements** - Things to accomplish in lifetime
- **Values** - Core principles
- **Personal Qualities** - Character traits

**Ask User if Section Unclear:** "Which section of [file] should this go in?"

**Expected Outcome:** Section identified

---

### Step 5: Format Content to Match Style

**Description:** Transform raw idea to match telos file formatting

**Formatting Rules:**
1. Match existing bullet point style (-, *, numbered)
2. Match heading levels
3. Match tone and perspective
4. Follow existing content density and detail level
5. Preserve authentic voice

**Example (for michael_telos.md):**
```
Input: "I want to be able to say that I made a million dollars in sales"

Formatted:
"- I want to be able to say that I made a million dollars in sales."
```

**Expected Outcome:** Content formatted and ready

---

### Step 6: Create _REVIEW File

**Description:** Create temporary review file with formatted content

**File Path:** `/mnt/d/Program Files/Obsidian/telos/_REVIEW_[filename]_addition.md`

**Format:**
```markdown
# Telos File Addition - [filename]

**Target File:** /mnt/d/Program Files/Obsidian/telos/[filename]
**Section:** [Section Name]
**Date Added:** [Date]
**Source Entry:** [Timestamp/context from Random Ideas]

---

## Content to Add

[Formatted content matching telos file style]

---

## Integration Instructions

1. Open: /mnt/d/Program Files/Obsidian/telos/[filename]
2. Navigate to: [Section Name] section
3. Add the content below
4. Preserve existing formatting and style
5. Ensure content flows with existing entries

---

## Suggested Addition

**Section:** [Section Name]

```
[Formatted content ready to paste]
```

**Context:**
[Any additional context about why this content is important]
```

**Expected Outcome:** _REVIEW file created with integration instructions

---

### Step 7: Tag Original Entry

**Description:** Mark the original idea entry as processed

**Actions:**
1. Read Random_Ideas_From_Megan.md
2. Find the entry with this directive
3. Add `## ✅ REVIEW` tag BEFORE the directive line

**Expected Outcome:** Entry tagged, preserved for history

---

### Step 8: Report to User

**Description:** Inform user of completion and next steps

**Report Format:**
```
✅ Content formatted for telos file addition

📄 Review File Created:
/mnt/d/Program Files/Obsidian/telos/_REVIEW_[filename]_addition.md

📂 Target File:
/mnt/d/Program Files/Obsidian/telos/[filename]

📋 Section: [Section Name]

📋 Next Steps:
1. Review the _REVIEW file
2. Open the target telos file
3. Navigate to the [Section] section
4. Add/paste the content
5. Delete _REVIEW file after merging

🏷️ Original entry tagged with "## ✅ REVIEW"
```

**Expected Outcome:** User has clear integration path

---

## Outputs

**Primary Output:**
- `_REVIEW_[filename]_addition.md` - Temporary file with formatted content

**Secondary Outputs:**
- Git commit in Random_Ideas_From_Megan.md
- `## ✅ REVIEW` tag added to original entry

**Where outputs are stored:**
- Review file: `/mnt/d/Program Files/Obsidian/telos/`
- Final destination (after user approval): `/mnt/d/Program Files/Obsidian/telos/[target file]`

---

## Related Workflows

- **create-telos-file.md** - If target file doesn't exist
- **content-to-2025-review.md** - Similar content addition workflow
- **content-to-obituary.md** - Similar content addition workflow

---

## Examples

**Example 1: Adding to Unrefined Life Achievements**

Input:
```markdown
## We're going to add this to my telos file, but we're going to create a new section. The new section is going to be called "Unrefined Life Achievements"
**01:34** - You know I've done a lot of things in my life, but there are a couple of things that I want to accomplish in my lifetime:
- I want to be able to say that I made a million dollars in sales.
- I want to be able to say that I was able to cold call, built an audience, and was able to influence people and generate business from online.
```

Process:
1. Git commit
2. Identify target: `michael_telos.md`
3. Read existing style (Missions & Goals section)
4. Format content matching style
5. Create _REVIEW file with new section and content
6. Tag original entry
7. User reviews and adds to file

**Example 2: Adding to Wishlist**

Input:
```markdown
## Add to my wishlist D:\Program Files\Obsidian\telos\wishlist.csv
**14:10** - I want to add a standing desk to my list of things I want on my wishlist
```

Process:
1. Git commit
2. Target: `wishlist.csv`
3. Read CSV format
4. Format as CSV row: `"Standing desk","[date]","[category]","[priority]"`
5. Create _REVIEW file
6. User adds to CSV

---

**Last Updated:** 2025-12-19
