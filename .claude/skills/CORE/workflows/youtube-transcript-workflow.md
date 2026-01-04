# YouTube Transcript Extraction Workflow

## Trigger Patterns

**AUTOMATICALLY EXECUTE when user provides:**
- YouTube URL (any of these formats):
  - `https://youtube.com/watch?v=...`
  - `https://www.youtube.com/watch?v=...`
  - `https://youtu.be/...`
  - `youtube.com/watch?v=...`
  - Raw video ID with context like "extract transcript for VIDEO_ID"

**Trigger phrases:**
- "Extract this YouTube video"
- "Get transcript for [URL]"
- "Pull transcript from [URL]"
- User just pastes a YouTube URL with minimal/no context

## Complete Workflow Steps

1. **Detect YouTube URL** in user message
2. **Ask for pattern preference** (first time only in session):
   - "Which analysis pattern would you like?"
   - Options: extract_wisdom (recommended), extract_insights, extract_main_idea, create_5_sentence_summary, none
   - Remember choice for rest of session
3. **Execute script**:
   ```bash
   yt-transcript "URL" --pattern CHOSEN_PATTERN
   ```
4. **Categorize transcripts** by content type and apply prefix:
   - Analyze video content to determine category
   - Rename file with appropriate category prefix
   - Available categories: [SALES], [CAREER], [FINANCE], [MENTAL_MODEL], [PERSONAL_DEV], [PLANNING], [PRODUCTIVITY], [REAL_ESTATE], [RELATIONSHIPS], [HEALTH], [TECH]
5. **Organize by processing status**:
   - Move newly extracted transcripts to `unprocessed/` folder
   - Keep previously reviewed transcripts in `processed/` folder
6. **Mark source if from ideas file**:
   - If transcript was extracted from ideas/notes file, add "## ✅ REVIEW get youtube transcript" marker before the URL
   - This helps user identify what to delete after processing
7. **Report completion** with:
   - File location (with subfolder)
   - Category assigned
   - Word count
   - Processing status (unprocessed/processed)

## Default Behavior

**If user doesn't specify pattern:**
- First YouTube link in session → Ask which pattern they want
- Subsequent links in same session → Use same pattern as before
- User says "no pattern" or "just transcript" → Skip pattern, transcript only

**Recommended default pattern:** `extract_wisdom`
- Provides comprehensive analysis
- Best for AI context in Obsidian
- Can always use different pattern if user specifies

## Category Prefix System

Apply one of these category prefixes to organize transcripts:

- **[SALES]** - Sales techniques, cold calling, closing, prospecting
- **[CAREER]** - Resume tips, interviews, career advancement, job search
- **[FINANCE]** - Personal finance, investing, money management
- **[MENTAL_MODEL]** - Mental models, frameworks, thinking patterns
- **[PERSONAL_DEV]** - Self-improvement, habits, productivity, mindset
- **[PLANNING]** - Goal setting, year planning, life planning
- **[PRODUCTIVITY]** - Tools, systems, workflows, organization
- **[REAL_ESTATE]** - Real estate sales, investing, property management
- **[RELATIONSHIPS]** - Networking, relationship advice, communication
- **[HEALTH]** - Fitness, nutrition, wellness
- **[TECH]** - Technical skills, programming, software

**Naming convention:**
```
[CATEGORY]_Cleaned_Video_Title_YYYYMMDD.txt
```

Example:
```
[SALES]_25_Years_of_Sales_Knowledge_in_34_Minutes_20260103.txt
```

## Folder Structure

```
youtube_transcripts/
├── unprocessed/          # Newly extracted, awaiting review
│   ├── [CATEGORY]_Video_Title_Date.txt
│   └── ...
├── processed/            # Reviewed and integrated
│   ├── [CATEGORY]_Video_Title_Date.txt
│   └── ...
└── _archive/            # Old or deprecated transcripts
```

**Workflow:**
1. New transcripts → saved to `unprocessed/`
2. After user reviews and integrates insights → move to `processed/`
3. Old/deprecated content → move to `_archive/`

## Marking Items in Ideas File

When extracting transcripts from a collection file (like Random_Ideas_From_Megan.md):

**Before extraction:**
```
**19:49** - https://youtube.com/shorts/ktaIy_vAa2Q

**19:49** - Sales advice that is really good
```

**After extraction:**
```
## ✅ REVIEW get youtube transcript
**19:49** - https://youtube.com/shorts/ktaIy_vAa2Q

**19:49** - Sales advice that is really good
```

This allows user to:
- Identify which items have been processed
- Delete the marked items after reviewing the transcripts
- Keep track of what still needs extraction

## Example Exchanges

### Example 1: First YouTube link
```
User: https://youtube.com/watch?v=abc123

AI: I'll extract the transcript for you. Which Fabric pattern would you like prepended to the transcript?
    - extract_wisdom (recommended) - Comprehensive analysis with summary, ideas, insights, quotes
    - extract_insights - Key insights and analysis
    - extract_main_idea - Core message and recommendation
    - create_5_sentence_summary - Ultra-concise 5-point summary
    - none - Just transcript with timestamps

User: extract_wisdom

AI: [Executes: yt-transcript "URL" --pattern extract_wisdom]
    [Categorizes as [SALES] based on content]
    [Moves to unprocessed/ folder]
    ✓ Saved to: D:\Program Files\Obsidian\projects\youtube_transcripts\unprocessed\[SALES]_Video_Title_20251208.txt
    ✓ Category: SALES
    ✓ Word count: 5,291
    ✓ Status: Unprocessed (ready for review)
```

### Example 2: Batch processing from ideas file
```
User: Let's go ahead and process the ideas that I have. Pull all the transcripts from YouTube and place them in the correct folder.

AI: [Reads ideas file, finds 10 YouTube URLs]
    [Asks for pattern preference]
    [Extracts all 10 in parallel]
    [Categorizes each transcript]
    [Moves all to unprocessed/ folder]
    [Marks each URL in ideas file with "✅ REVIEW"]

    ✓ Processed 10 transcripts:
      - [SALES]: 2 files
      - [CAREER]: 2 files
      - [REAL_ESTATE]: 2 files
      - [MENTAL_MODEL]: 2 files
      - [PERSONAL_DEV]: 1 file
      - [FINANCE]: 1 file
    ✓ All moved to unprocessed/ folder
    ✓ Ideas file marked for cleanup
```

### Example 3: Moving processed transcript
```
User: I've reviewed the sales transcript, move it to processed

AI: [Moves file from unprocessed/ to processed/]
    ✓ Moved: [SALES]_Video_Title_20260103.txt
    ✓ From: unprocessed/ → processed/
```

## Pattern Descriptions (for user selection)

**extract_wisdom** (Recommended for AI context)
- Most comprehensive
- Includes: Summary, Ideas, Insights, Quotes, Habits, Facts, References
- Best for: Important content, research, providing context to AI
- Output: ~500-2000 words of analysis

**extract_insights**
- Focused on key insights and deeper understanding
- Includes: Core insights with analysis
- Best for: Learning, understanding concepts
- Output: ~300-800 words

**extract_main_idea**
- Core message + main recommendation
- Concise but complete
- Best for: Quick understanding, decision-making
- Output: ~100-200 words

**create_5_sentence_summary**
- Ultra-concise 5-point summary
- No fluff, just essentials
- Best for: Quick reference, short videos
- Output: ~50-100 words

## File Output Format

```
Title: [Video Title from YouTube]
URL: [Full YouTube URL]
Date: [YYYY-MM-DD]

================================================================================

ANALYSIS (pattern_name)
================================================================================

[Fabric pattern output here]

================================================================================
FULL TRANSCRIPT WITH TIMESTAMPS
================================================================================

[00:00:00] First line of transcript
[00:00:01] Second line of transcript
...
```

## Script Location

**WSL Path:** `/home/michael/bin/yt-transcript`
**Windows Path:** `\\wsl.localhost\Ubuntu-24.04\home\michael\bin\yt-transcript`

## Usage

```bash
# Basic (just transcript)
yt-transcript "URL"

# With pattern
yt-transcript "URL" --pattern extract_wisdom
yt-transcript "URL" -p extract_insights

# Custom output directory
yt-transcript "URL" --pattern extract_wisdom --dir "/custom/path"

# Show help
yt-transcript
```

## Integration with Obsidian

Transcripts are automatically saved to:
- **Default location:** `D:\Program Files\Obsidian\projects\youtube_transcripts\`
- **Subfolder:** `unprocessed/` (new) or `processed/` (reviewed)
- **Filename format:** `[CATEGORY]_Video_Title_YYYYMMDD.txt`
- **Content:** Metadata + Optional Analysis + Timestamped Transcript

This allows:
- Easy reference in Obsidian notes
- AI can read context from analysis section
- Timestamps enable precise excerpt extraction
- Category prefixes enable quick searching
- Workflow tracking via folder structure
- Human-readable filenames for quick location

## Quick Reference

**Full workflow:**
1. Extract transcript with fabric pattern
2. Categorize content and apply prefix
3. Save to `unprocessed/` folder
4. Mark source file with "✅ REVIEW" (if applicable)
5. User reviews and integrates insights
6. Move to `processed/` folder
7. Delete marked items from ideas file
