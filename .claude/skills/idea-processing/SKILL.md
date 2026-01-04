---
name: idea-processing
description: |
  Process ideas captured via Telegram into Obsidian vault with human-in-the-loop review.
  Automates YouTube transcript extraction, content appending to telos files, and file creation with style matching.

  USE WHEN user says "process Megan ideas", "process ideas", "execute ideas from Megan",
  "process Random Ideas", "work on Megan's ideas", or any request to process captured ideas into Obsidian.
---

## Workflow Routing (SYSTEM PROMPT)

**CRITICAL: Git commit BEFORE any processing. ALL outputs go to _REVIEW files for human approval.**

**When user requests processing YouTube content to mental models:**
Examples: "process YouTube to mental models", "add this YouTube video to mental models", "extract concepts from video", "get transcript and add to mental models"
→ **READ:** ${PAI_DIR}/skills/idea-processing/workflows/youtube-to-mental-models.md
→ **EXECUTE:** Extract YouTube transcript with Fabric, create _REVIEW file for mental models addition

**When user requests processing YouTube content to telos habits:**
Examples: "add this to habits", "process YouTube to habits", "extract habit from video", "add this habit to telos"
→ **READ:** ${PAI_DIR}/skills/idea-processing/workflows/youtube-to-telos-habits.md
→ **EXECUTE:** Extract YouTube transcript with Fabric, create _REVIEW file for habits addition

**When user requests adding content to 2025 review:**
Examples: "add to 2025 review", "add this reflection to year review", "add to my yearly review"
→ **READ:** ${PAI_DIR}/skills/idea-processing/workflows/content-to-2025-review.md
→ **EXECUTE:** Create _REVIEW file for 2025 review addition

**When user requests adding content to obituary:**
Examples: "add to obituary", "add to my obituary file", "obituary addition", "what I want said at my funeral"
→ **READ:** ${PAI_DIR}/skills/idea-processing/workflows/content-to-obituary.md
→ **EXECUTE:** Create _REVIEW file for obituary addition

**When user requests adding content to telos file:**
Examples: "add to telos", "append to telos file", "add this to my life goals", "add to personal files"
→ **READ:** ${PAI_DIR}/skills/idea-processing/workflows/content-to-telos-file.md
→ **EXECUTE:** Create _REVIEW file for telos content addition

**When user requests creating new telos file:**
Examples: "create telos file", "new file in telos", "create decision log", "create lessons file in telos"
→ **READ:** ${PAI_DIR}/skills/idea-processing/workflows/create-telos-file.md
→ **EXECUTE:** Read existing telos files for style matching, create _REVIEW file

---

## When to Activate This Skill

### Direct Idea Processing Requests
- "process Megan ideas" or "process ideas from Megan"
- "execute ideas", "run idea processing", "process Random Ideas"
- "work on Megan's ideas", "process captured ideas"
- "process the ideas file", "execute ideas from file"

### YouTube Content Integration
- "add YouTube video to mental models"
- "extract concepts from this video"
- "get transcript and add to [mental models/habits/telos]"
- "process this YouTube link"

### Content Addition to Telos Files
- "add this to my 2025 review"
- "add to obituary", "add to my obituary file"
- "add this reflection to [telos file]"
- "append this to my [habits/goals/life achievements]"

### File Creation in Telos
- "create new telos file"
- "create decision log in telos"
- "create lessons file"
- "new file in telos directory"

### Review & Approval Workflow
- "review processed ideas"
- "merge reviewed content"
- "approve idea processing changes"

---

## Core Capabilities

**Human-in-the-Loop Processing:**
- All outputs go to `_REVIEW_*.md` files first
- User reviews and approves before merging to main files
- Git commit checkpoint BEFORE any processing
- Mark completed items with `## ✅ REVIEW` tag (never delete)

**YouTube Content Integration:**
- Extract transcripts using yt-transcript CLI
- Process with Fabric patterns: **extract_wisdom, summarize, extract_insights** (user preference - use all three)
- Add summary at top of transcript
- Route to mental models, habits, or other telos files

**Telos File Management:**
- Content appending with style matching
- New file creation matching existing telos formatting
- Support for: mental models, habits, 2025 review, obituary, goals, decisions, lessons

**Version Control:**
- Git commit before processing (version control checkpoint)
- All changes reviewable before integration
- Rollback capability if needed

---

## Workflow Overview

### YouTube Processing Workflows
- **youtube-to-mental-models.md** - Extract transcript, run Fabric, create _REVIEW file for mental models
- **youtube-to-telos-habits.md** - Extract transcript, run Fabric, create _REVIEW file for habits

### Content Addition Workflows
- **content-to-2025-review.md** - Append reflection to yearly review (via _REVIEW file)
- **content-to-obituary.md** - Add legacy/values statement to obituary (via _REVIEW file)
- **content-to-telos-file.md** - General telos file content addition (via _REVIEW file)

### File Creation Workflows
- **create-telos-file.md** - Create new telos file with style matching (via _REVIEW file)

---

## File Locations

**Source File (Telegram → Markdown):**
- `/mnt/d/Program Files/Obsidian/projects/Random_Ideas_From_Megan.md`

**Telos Directory:**
- `/mnt/d/Program Files/Obsidian/telos/`
- Key files: `mental_models.md`, `habits.md`, `michael_telos.md`, `wishlist.csv`

**YouTube Transcripts:**
- `/mnt/d/Program Files/Obsidian/projects/youtube_transcripts/`

**2025 Review:**
- `/mnt/d/Program Files/Obsidian/projects/youtube_transcripts/2025_Year_End_Review_and_2026_Planning.md`

**Review Files (Temporary):**
- Created in same directory as target file
- Format: `_REVIEW_[description].md`
- Deleted after user approval and merge

---

## Processing Workflow

**Standard Process:**
1. **Git Checkpoint** - Commit Random_Ideas_From_Megan.md before processing
2. **Parse Directive** - Extract `##` command and parameters
3. **Execute Workflow** - Run appropriate workflow from above
4. **Create _REVIEW File** - Output goes to temporary review file
5. **Tag Original** - Add `## ✅ REVIEW` to processed entry
6. **User Reviews** - User examines _REVIEW file
7. **User Approves** - User runs merge command or manually integrates
8. **Cleanup** - Delete _REVIEW file after successful merge

**Established Workflows:**
- Once a workflow pattern is tested and approved, it can run automatically
- New/ambiguous workflows require clarifying questions first

---

## Examples

**Example 1: YouTube to Mental Models**

User: "Process this YouTube video to mental models: https://youtu.be/abc123"

Skill Response:
1. Git commit Random_Ideas_From_Megan.md
2. Routes to youtube-to-mental-models.md
3. Extracts transcript with yt-transcript
4. Runs Fabric extract_wisdom pattern
5. Creates `/mnt/d/Program Files/Obsidian/telos/_REVIEW_mental_models_addition.md`
6. Tags entry with `## ✅ REVIEW`
7. User reviews _REVIEW file
8. User approves → content merged to mental_models.md

**Example 2: Add to 2025 Review**

User: "Add this reflection to my 2025 review: I learned that speed and consistency are everything"

Skill Response:
1. Git commit Random_Ideas_From_Megan.md
2. Routes to content-to-2025-review.md
3. Creates `_REVIEW_2025_review_addition.md` with formatted reflection
4. Tags entry with `## ✅ REVIEW`
5. User reviews → approves → merges to 2025 review file

**Example 3: Create New Telos File**

User: "Create a decision log file in telos"

Skill Response:
1. Git commit Random_Ideas_From_Megan.md
2. Routes to create-telos-file.md
3. Reads existing telos files for style matching
4. Creates `_REVIEW_new_telos_decision_log.md`
5. User reviews → approves → file created in telos directory

---

## Integration Points

**Required CLIs:**
- `yt` - YouTube transcript extraction (yt-dlp wrapper)
- `fabric` - Pattern extraction (extract_wisdom, summarize, etc.)
- `git` - Version control checkpoints

**File System:**
- Windows paths via WSL: `/mnt/d/Program Files/Obsidian/`
- Read/Edit/Write tools for file operations

**Related Skills:**
- `research` - For YouTube transcript extraction workflows
- `CORE` - For git workflow patterns and file organization

---

## Related Documentation

- `${PAI_DIR}/skills/CORE/workflows/git-update-repo.md` - Git workflow patterns
- `${PAI_DIR}/skills/research/workflows/youtube-extraction.md` - YouTube transcript extraction
- `${PAI_DIR}/skills/CORE/workflows/file-organization-detailed.md` - File organization and review patterns

**Last Updated:** 2025-12-19
