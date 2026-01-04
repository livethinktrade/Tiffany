# YouTube to Mental Models Workflow

**Purpose:** Extract YouTube video transcript, process with Fabric, and create review file for mental models addition

**When to Use:**
- User has YouTube URL to add to mental models
- Request to "extract concepts from video"
- "Add this video to mental models"
- Processing directive: `## Get YouTube transcript using fabric and place transcript there...mental_models.md`

**Prerequisites:**
- YouTube URL (youtube.com/watch or youtu.be format)
- `yt` CLI installed (YouTube transcript extraction)
- `fabric` CLI installed with `extract_wisdom` pattern
- Target file: `/mnt/d/Program Files/Obsidian/telos/mental_models.md`

---

## Workflow Steps

### Step 1: Git Checkpoint

**Description:** Commit Random_Ideas_From_Megan.md before any processing

**Actions:**
```bash
cd "/mnt/d/Program Files/Obsidian/projects"
git add Random_Ideas_From_Megan.md
git commit -m "checkpoint: before processing YouTube to mental models"
```

**Expected Outcome:** Clean git status, version control checkpoint created

---

### Step 2: Extract YouTube Transcript

**Description:** Use yt CLI with Fabric to extract transcript and concepts

**Actions:**
```bash
# Extract transcript and run fabric pattern
yt "https://youtube.com/watch?v=VIDEO_ID" | fabric -p extract_wisdom > /tmp/youtube_concepts.md
```

**User Preference:** Ask user which Fabric pattern to use (first time), remember for session:
- `extract_wisdom` (default) - Extract key insights and concepts
- `summarize` - Create summary
- `extract_ideas` - Extract actionable ideas

**Expected Outcome:** Transcript extracted, concepts identified, summary at top

---

### Step 3: Create _REVIEW File

**Description:** Create temporary review file with processed content

**Actions:**
1. Read the extracted concepts from `/tmp/youtube_concepts.md`
2. Format for mental models (add metadata: source URL, date processed)
3. Write to review file

**File Path:** `/mnt/d/Program Files/Obsidian/telos/_REVIEW_mental_models_addition.md`

**Format:**
```markdown
# Mental Models Addition - [Video Title]

**Source:** [YouTube URL]
**Processed:** [Date]
**Pattern Used:** [Fabric pattern name]

---

## Summary
[Fabric-generated summary goes here]

---

## Concepts
[Extracted concepts go here]

---

## Integration Notes
- Review these concepts before adding to mental_models.md
- Check for duplicates with existing mental models
- Refine language to match your mental model style
```

**Expected Outcome:** _REVIEW file created and ready for user review

---

### Step 4: Tag Original Entry

**Description:** Mark the original idea entry as processed

**Actions:**
1. Read Random_Ideas_From_Megan.md
2. Find the entry with this YouTube URL
3. Add `## ✅ REVIEW` tag BEFORE the entry (prepend to the ## directive line)

**Example:**
```markdown
## ✅ REVIEW Get YouTube transcript using fabric and place transcript there D:\Program Files\Obsidian\telos\mental_models.md
**00:58** - https://youtube.com/shorts/O1n5iTrVTog?si=EPO-KsqOJNsszlX4
**00:58** - Add this to my mental models
```

**Expected Outcome:** Entry tagged, never deleted, preserved for history

---

### Step 5: Report to User

**Description:** Inform user of completion and next steps

**Report Format:**
```
✅ YouTube transcript processed and extracted

📄 Review File Created:
/mnt/d/Program Files/Obsidian/telos/_REVIEW_mental_models_addition.md

📋 Next Steps:
1. Review the _REVIEW file
2. Edit/refine concepts as needed
3. When ready, manually merge to mental_models.md OR run /merge-reviewed-content
4. Delete _REVIEW file after merging

🏷️ Original entry tagged with "## ✅ REVIEW" in Random_Ideas_From_Megan.md
```

**Expected Outcome:** User knows where to find review file and what to do next

---

## Outputs

**Primary Output:**
- `_REVIEW_mental_models_addition.md` - Temporary file with extracted concepts

**Secondary Outputs:**
- Git commit in Random_Ideas_From_Megan.md
- `## ✅ REVIEW` tag added to original entry
- Temporary `/tmp/youtube_concepts.md` (can be deleted after _REVIEW file created)

**Where outputs are stored:**
- Review file: `/mnt/d/Program Files/Obsidian/telos/`
- Final destination (after user approval): `/mnt/d/Program Files/Obsidian/telos/mental_models.md`

---

## Related Workflows

- **youtube-to-telos-habits.md** - Similar workflow but for habits extraction
- **research skill: youtube-extraction.md** - YouTube transcript extraction patterns
- **merge-reviewed-content.md** - Future workflow to automate merging _REVIEW files

---

## Examples

**Example 1: Standard Processing**

Input: YouTube URL `https://youtube.com/shorts/O1n5iTrVTog?si=EPO-KsqOJNsszlX4`

Process:
1. Git commit checkpoint
2. Extract: `yt "URL" | fabric -p extract_wisdom`
3. Create `_REVIEW_mental_models_addition.md` with concepts
4. Tag original entry
5. Report to user

Output: Review file ready for user approval

**Example 2: Custom Fabric Pattern**

User specifies: "Use summarize pattern instead"

Process:
1. Git commit checkpoint
2. Extract: `yt "URL" | fabric -p summarize`
3. Create _REVIEW file with summary
4. Tag original entry
5. Remember "summarize" preference for session

---

**Last Updated:** 2025-12-19
