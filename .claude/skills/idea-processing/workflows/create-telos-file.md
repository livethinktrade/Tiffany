# Create Telos File Workflow

**Purpose:** Create new file in telos directory with style matching existing telos files

**When to Use:**
- Request to "create telos file"
- "Create decision log in telos"
- "Create lessons file"
- Processing directive: `## create a file in my telos directory that logs all of the decisions I make`

**Prerequisites:**
- File purpose and name identified
- Access to existing telos files for style matching
- Target directory: `/mnt/d/Program Files/Obsidian/telos/`

---

## Workflow Steps

### Step 1: Git Checkpoint

**Description:** Commit Random_Ideas_From_Megan.md before any processing

**Actions:**
```bash
cd "/mnt/d/Program Files/Obsidian/projects"
git add Random_Ideas_From_Megan.md
git commit -m "checkpoint: before creating telos file"
```

**Expected Outcome:** Version control checkpoint created

---

### Step 2: Determine File Name and Purpose

**Description:** Clarify what file to create and why

**Ask User (if not specified):**
- What should this file be called?
- What will be stored in this file?
- Should it match the style of an existing telos file?

**Naming Convention:**
- Descriptive kebab-case: `decision-log.md`, `lessons-learned.md`
- OR match existing pattern: `michael_[purpose].md`
- CSV for tabular data: `wishlist.csv`, `decisions.csv`

**Expected Outcome:** Clear file name and purpose

---

### Step 3: Read Existing Telos Files for Style

**Description:** Study existing telos files to match formatting

**Files to Read:**
1. `michael_telos.md` - Primary life document (Missions & Goals style)
2. `mental_models.md` - Concept organization style
3. `habits.md` - Behavioral pattern style (if exists)
4. Any other relevant telos files

**Extract Style Elements:**
- Heading structure (# vs ## vs ###)
- Bullet point format (-, *, numbered)
- Metadata/front matter
- Section organization
- Tone and perspective (first-person vs third-person)
- Date format
- Content density

**Expected Outcome:** Style template identified

---

### Step 4: Design File Structure

**Description:** Create initial structure for new file

**Common Telos File Structures:**

**For Decision Log:**
```markdown
# Decision Log

Track all decisions made to identify patterns and learn from outcomes.

## [Year] Decisions

### [Month]

**[Date] - [Decision Title]**
- **Context:** What situation required a decision
- **Options Considered:** What choices were available
- **Decision Made:** What was chosen
- **Reasoning:** Why this choice
- **Outcome:** (Fill in later) What happened
- **Lesson:** (Fill in later) What was learned

---
```

**For Lessons Learned:**
```markdown
# Lessons Learned

Capture lessons from experiences to avoid repeating failures.

## [Year]

### [Month]

**[Date] - [Lesson Title]**
- **Experience:** What happened
- **Mistake/Challenge:** What went wrong or was difficult
- **Lesson:** What I learned
- **Action:** How to apply this in the future

---
```

**For General Telos File:**
```markdown
# [File Name]

[Purpose statement - what this file is for]

## [Section 1]

[Content structure matching telos style]

## [Section 2]

[Content structure matching telos style]

---
```

**Expected Outcome:** File structure designed

---

### Step 5: Create _REVIEW File

**Description:** Create temporary review file with new telos file content

**File Path:** `/mnt/d/Program Files/Obsidian/telos/_REVIEW_new_telos_[filename].md`

**Format:**
```markdown
# New Telos File - [filename]

**Target File:** /mnt/d/Program Files/Obsidian/telos/[filename]
**Purpose:** [Description of what this file is for]
**Date Created:** [Date]
**Style Matched From:** [Source telos file used as template]

---

## File Content

```markdown
[Complete content of new telos file]
```
```

---

## Integration Instructions

1. Review the file structure and content below
2. Make any edits or refinements needed
3. When satisfied, create the file at:
   /mnt/d/Program Files/Obsidian/telos/[filename]
4. Delete this _REVIEW file after creation

---

## Style Notes

- Matched formatting from: [source file]
- Heading structure: [# / ## / ###]
- Bullet style: [- / * / numbered]
- Tone: [first-person / third-person]
- Date format: [format used]

---

## Initial Content

[The actual file content ready to be created]

```

**Expected Outcome:** _REVIEW file with complete new telos file content

---

### Step 6: Tag Original Entry

**Description:** Mark the original idea entry as processed

**Actions:**
1. Read Random_Ideas_From_Megan.md
2. Find the entry with this directive
3. Add `## ✅ REVIEW` tag BEFORE the directive line

**Expected Outcome:** Entry tagged, preserved for history

---

### Step 7: Report to User

**Description:** Inform user of completion and next steps

**Report Format:**
```
✅ New telos file designed and ready for review

📄 Review File Created:
/mnt/d/Program Files/Obsidian/telos/_REVIEW_new_telos_[filename].md

📂 Target Location:
/mnt/d/Program Files/Obsidian/telos/[filename]

📋 Purpose: [File purpose]

📋 Style Matched From: [Source file]

📋 Next Steps:
1. Review the _REVIEW file
2. Edit/refine structure and initial content as needed
3. When satisfied, create the actual file in telos directory
4. Delete _REVIEW file after creation

🏷️ Original entry tagged with "## ✅ REVIEW"

💡 Tip: You can start using this file immediately once created
```

**Expected Outcome:** User knows how to proceed

---

## Outputs

**Primary Output:**
- `_REVIEW_new_telos_[filename].md` - Temporary file with new telos file content

**Secondary Outputs:**
- Git commit in Random_Ideas_From_Megan.md
- `## ✅ REVIEW` tag added to original entry

**Where outputs are stored:**
- Review file: `/mnt/d/Program Files/Obsidian/telos/`
- Final file (after user approval): `/mnt/d/Program Files/Obsidian/telos/[filename]`

---

## Related Workflows

- **content-to-telos-file.md** - After file is created, use this to add content
- **youtube-to-telos-habits.md** - Specific telos file creation (habits)

---

## Examples

**Example 1: Decision Log**

Input:
```markdown
## create a file in my telos directory that logs all of the decisions I make
**01:37** - Start keeping a log of decisions I make. That way I can track to see how often I'm making a decision and also if a decision is bad and in the future I can reflect
```

Process:
1. Git commit
2. Read michael_telos.md for style
3. Design decision log structure with fields: Context, Options, Decision, Reasoning, Outcome, Lesson
4. Create `_REVIEW_new_telos_decision-log.md`
5. Tag original entry
6. User reviews, creates file as `decision-log.md` in telos

**Example 2: Lessons File**

Input:
```markdown
## Find lessons to add to my lessons log that will be located in my telos directory
**02:11** - Go through my journal entries, looking for lessons. Add it to a lessons folder.
```

Process:
1. Git commit
2. Read telos files for style
3. Design lessons structure
4. Create `_REVIEW_new_telos_lessons.md`
5. User reviews, creates `lessons.md` in telos
6. Future workflow: Extract lessons from journal entries

**Example 3: Obituary File (First Time)**

Input:
```markdown
## we're going to create a file that is where we're going to write my own obituary
**19:30** - He was a husband that was supportive and pushed his wife and kids.
```

Process:
1. Git commit
2. Read michael_telos.md for tone
3. Design obituary structure (Character, Relationships, Achievements, Impact)
4. Create `_REVIEW_new_telos_obituary.md` with initial content
5. User reviews, creates `obituary.md`

---

**Last Updated:** 2025-12-19
