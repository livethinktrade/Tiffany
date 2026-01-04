# Content to Obituary Workflow

**Purpose:** Add legacy statements, values, or desired remembrances to obituary file

**When to Use:**
- Request to "add to obituary"
- "What I want said at my funeral"
- Processing directive: `## add this to my obituary`

**Prerequisites:**
- Target file location: `/mnt/d/Program Files/Obsidian/telos/` (filename TBD, may need to create)
- Content describing legacy, values, how user wants to be remembered

---

## Workflow Steps

### Step 1: Git Checkpoint

**Description:** Commit Random_Ideas_From_Megan.md before any processing

**Actions:**
```bash
cd "/mnt/d/Program Files/Obsidian/projects"
git add Random_Ideas_From_Megan.md
git commit -m "checkpoint: before adding to obituary"
```

**Expected Outcome:** Version control checkpoint created

---

### Step 2: Check if Obituary File Exists

**Description:** Verify obituary file exists and read structure

**Actions:**
1. Search for obituary file in `/mnt/d/Program Files/Obsidian/telos/`
2. Possible names: `obituary.md`, `legacy.md`, `michael_obituary.md`
3. If exists: Read to understand formatting
4. If not exists: Note that file needs to be created (use create-telos-file.md workflow)

**Expected Outcome:** File location identified or creation needed

---

### Step 3: Format Content for Obituary

**Description:** Transform raw idea into obituary-style statement

**Formatting Guidelines:**
- Third person perspective ("He was...", "Michael...")
- Focus on character, impact, relationships, values
- Authentic and personal (not generic/corporate)
- What people would actually say at funeral

**Example Transformation:**
```
Input: "I want to be known as someone who loved to dance and knew everybody"

Output: "He was someone who loved to dance and knew everybody because
he was so consistent. He was their rock. People could depend on him and
come to him."
```

**Expected Outcome:** Content formatted in obituary style

---

### Step 4: Categorize Content

**Description:** Determine which aspect of legacy this addresses

**Categories:**
- **Character Traits** - "undetermined", "curious", "giver not taker"
- **Relationships** - "husband", "cheerleader", "deep friendships"
- **Achievements** - "salesperson", "marketer", "leader"
- **Impact on Others** - "helped them grow", "challenged intellectually"
- **Personal Qualities** - "loved to dance", "consistent", "everyone's rock"

**Expected Outcome:** Clear categorization

---

### Step 5: Create _REVIEW File

**Description:** Create temporary review file with formatted obituary content

**File Path:** `/mnt/d/Program Files/Obsidian/telos/_REVIEW_obituary_addition.md`

**Format:**
```markdown
# Obituary Addition

**Category:** [Character / Relationships / Achievements / Impact / Qualities]
**Date Added:** [Date]
**Source Entry:** [Timestamp/context from Random Ideas]

---

## Content to Add

[Formatted obituary statement]

---

## Integration Instructions

1. If obituary file exists: Open /mnt/d/Program Files/Obsidian/telos/[filename]
2. If doesn't exist: Create new obituary.md file first
3. Add content to appropriate section
4. Preserve third-person perspective
5. Ensure authentic, personal tone

---

## Suggested Statement

**Category:** [Category Name]

```
[Formatted obituary content ready to add]
```

**Examples from existing entries:**
```
"He was a husband that was supportive and pushed his wife and kids.
Being their biggest cheerleader along with anyone else's cheerleader."

"I challenge people intellectually and have built deep relationships
with a group of men and women that I view almost like my family."

"He was undetermined and was so curious, and he explored that curiosity
until the point he became the expert."
```
```

**Expected Outcome:** _REVIEW file with formatted obituary statement

---

### Step 6: Tag Original Entry

**Description:** Mark the original idea entry as processed

**Actions:**
1. Read Random_Ideas_From_Megan.md
2. Find the entry with this directive
3. Add `## ✅ REVIEW` tag BEFORE the directive line

**Example:**
```markdown
## ✅ REVIEW add this to my obituary
**01:29** - At my obituary, I would love for someone to tell me how much they thought I was a great salesperson, a marketer, a leader that really helped them grow as a person.
```

**Expected Outcome:** Entry tagged, preserved for history

---

### Step 7: Report to User

**Description:** Inform user of completion and next steps

**Report Format:**
```
✅ Obituary content formatted and prepared

📄 Review File Created:
/mnt/d/Program Files/Obsidian/telos/_REVIEW_obituary_addition.md

📂 Target File:
/mnt/d/Program Files/Obsidian/telos/[obituary.md or TBD]

📋 Category: [Category Name]

📋 Next Steps:
1. Review the _REVIEW file
2. If obituary file exists: Add content to appropriate section
3. If doesn't exist: Create obituary.md file first (or use preferred name)
4. Delete _REVIEW file after merging

🏷️ Original entry tagged with "## ✅ REVIEW"

💡 Note: Obituary file may need to be created first
```

**Expected Outcome:** User has clear path forward

---

## Outputs

**Primary Output:**
- `_REVIEW_obituary_addition.md` - Temporary file with formatted content

**Secondary Outputs:**
- Git commit in Random_Ideas_From_Megan.md
- `## ✅ REVIEW` tag added to original entry

**Where outputs are stored:**
- Review file: `/mnt/d/Program Files/Obsidian/telos/`
- Final destination (after user approval): `/mnt/d/Program Files/Obsidian/telos/obituary.md` (or user-specified filename)

---

## Related Workflows

- **create-telos-file.md** - If obituary file doesn't exist, create it first
- **content-to-telos-file.md** - General telos content addition
- **content-to-2025-review.md** - Similar content addition workflow

---

## Examples

**Example 1: Character Statement**

Input:
```markdown
## add this to my obituary
**01:29** - He was undetermined and was so curious, and he explored that curiosity until the point he became the expert.
```

Process:
1. Git commit
2. Check if obituary file exists
3. Categorize as "Character Traits"
4. Create _REVIEW file with formatted statement (already in third person)
5. Tag original entry
6. User reviews and adds to obituary file

**Example 2: Relationship Statement**

Input:
```markdown
## add this to my obituary
**01:29** - I challenge people intellectually and have built deep relationships with a group of men and women that I view almost like my family.
```

Process:
1. Git commit
2. Transform to third person: "He challenged people intellectually..."
3. Categorize as "Relationships"
4. Create _REVIEW file
5. User reviews and integrates

---

**Last Updated:** 2025-12-19
