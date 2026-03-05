---
name: project-log
description: |
  Update project context log with current session work.
  Context-dependent - analyzes session to capture what was accomplished.

  USE WHEN user says "update project log", "log this session", "update context log",
  "project log update", "/project-log", or any request to document session work
  in a project context log.
---

# ProjectLog

Updates project context logs with current session work. Context-dependent - captures what was accomplished in the current session. Designed for AI agent context continuity across sessions.

## Target File

**Default (Tiffany PAI):** `/root/obsidian_vault/projects/P2_tiffany-pai-project/P2_Tiffany_PAI_PROJECT_CONTEXT_LOG.md`

**For other projects:** User will specify the project context log path, or the skill will detect from project context.

---

## The Protocol

### Why This Protocol Works

1. **AI Context Continuity** — Future AI agents can load the log and immediately understand project state
2. **Searchable History** — Change Log provides quick scanning; Session History provides depth
3. **Verification-First** — Every entry includes what was confirmed working (not just what was attempted)
4. **Specific Over General** — IDs, paths, commands, counts — not vague descriptions

---

## Step 1: Analyze Current Session

**Before writing anything, extract from the conversation:**

| Question | What to Capture |
|----------|-----------------|
| What was the main task? | 3-6 word title for the session |
| What changed? | 1-2 sentence summary |
| What was the root cause? | If debugging, what was discovered |
| What was fixed/built? | Specific changes with IDs/paths |
| What files were touched? | Full paths for created/modified files |
| What was verified? | Confirmation checks with results |
| What's pending? | Unfinished items for future sessions |

---

## Step 2: Read Current Project Log

```bash
# Read the project context log (first 200 lines for structure)
head -200 "/path/to/PROJECT_CONTEXT_LOG.md"
```

Understand the existing structure before modifying.

---

## Step 3: Update "Last Updated" Header (Line 4)

**Format:**
```markdown
**Last Updated**: YYYY-MM-DD (Main change — key detail 1, key detail 2, key detail 3.)
```

**Examples:**
```markdown
**Last Updated**: 2026-02-17 (Syncthing phone sync fixed — new device FNNUF32 added, global discovery enabled, direct IP configured. Phone now connected at 100% sync.)

**Last Updated**: 2026-02-17 (Telegram Mini App deployed at 2030destiny.srv816737.hstgr.cloud — game dashboard, folder reorganized, ART_SPECS updated to Mocha bear style.)
```

**Rules:**
- Date in YYYY-MM-DD format
- Summary in parentheses, ends with period
- Use em-dash (—) to separate title from details
- Include 2-4 key details, comma-separated
- Keep under ~150 characters

---

## Step 4: Add Entry to "Recent Session History"

**Location:** Add at TOP of `## Recent Session History` section (before existing entries)

**Full Template:**
```markdown
### YYYY-MM-DD: [Title — Optional Subtitle]

**What changed**: [1-2 sentence high-level summary of what this session accomplished]

**[Category 1]:**
- [Specific bullet with paths, IDs, commands]
- [Another bullet]

**[Category 2]:**
- [Bullet]

**Files Created/Modified:**
- `[/full/path/to/file.ext]` — [what it does]
- `[/another/file.md]` — [brief description]

**Verification:**
- [Check performed] ✅
- [Another check] ✅

**Pending:**
- [Unfinished item for future session]

---
```

### Available Categories (use what's relevant)

| Category | When to Use |
|----------|-------------|
| `**Root Cause Analysis:**` | Debugging session — what was discovered |
| `**Fix Applied:**` | Bug fixes — numbered steps |
| `**Infrastructure Changes:**` | Docker, services, configs |
| `**Configuration Changes:**` | Config file updates |
| `**Files Created/Modified:**` | ALWAYS include if files changed |
| `**Verification:**` | ALWAYS include — what was confirmed |
| `**Pending:**` | Include if work is incomplete |
| `**Backlog Created:**` | New tickets created |
| `**Session Log:**` | Link to detailed session log if created |

### Formatting Rules

1. **Be Specific** — Include IDs, paths, counts, versions
   - Good: `Added device FNNUF32-3BONEFH-FICIVH4-B4YJBB7...`
   - Bad: `Added the phone device`

2. **Use Backticks** — For technical values
   - Good: `globalAnnounceEnabled: true`
   - Bad: globalAnnounceEnabled set to true

3. **Checkmarks for Verification** — Use ✅ for confirmed items
   - `Connection status: connected: true ✅`

4. **Tables for Comparisons** — When showing before/after
   ```markdown
   | Before | After |
   |--------|-------|
   | Old value | New value |
   ```

5. **End with `---`** — Horizontal rule after each entry

---

## Step 5: Add Entry to "Change Log" Table

**Location:** Add at TOP of `## Change Log` table (after header row)

**Format:**
```markdown
| YYYY-MM-DD | **[Bold Title]**: [One sentence with `backtick` IDs and key details.] | [[session-log-link]] |
```

**If no session log:** Use `—` (em-dash) instead of link

**Examples:**
```markdown
| 2026-02-17 | **Syncthing Phone Sync Fixed**: New phone device `FNNUF32` added to VPS (old `UMT6JTH` was stale). Global discovery enabled. Direct IP `tcp://167.88.42.12:22000` configured on phone. Connection verified at 100% sync. | — |

| 2026-02-17 | **Telegram Mini App Deployed**: Game dashboard at `https://2030destiny.srv816737.hstgr.cloud`. Docker nginx container + Traefik routing. Gamification folder reorganized (4 subdirs). ART_SPECS.md rewritten for Mocha bear aesthetic. MVP_CHECKLIST.md created (6 features). n8n workflow `RQel8ShdEPHk1vR3` created (pending activation). | — |
```

**Rules:**
- Title in **bold**
- Include specific IDs/paths in `backticks`
- Include counts where relevant (6 features, 4 subdirs, 100% sync)
- Keep under ~300 characters
- Multiple sentences OK if needed for completeness

---

## Step 6: Update Other Sections (If Relevant)

### Current Status Summary Table

Update if component status changed:
```markdown
| Component | Status | Notes |
|-----------|--------|-------|
| [Component] | [NEW STATUS] | [Updated notes] |
```

### Useful Commands Section

Add new commands discovered during session:
```bash
# Description of what this command does
command --with --flags
```

### Known Issues & Blockers

- Mark resolved issues with ~~strikethrough~~ and "RESOLVED YYYY-MM-DD"
- Add new issues discovered

### Active Work Streams

Update status of work streams if changed.

---

## Example: Complete Update

**Session:** Fixed Syncthing phone sync issue

**1. Last Updated:**
```markdown
**Last Updated**: 2026-02-17 (Syncthing phone sync fixed — new device FNNUF32 added, global discovery enabled, direct IP configured. Phone now connected at 100% sync.)
```

**2. Recent Session History (at TOP):**
```markdown
### 2026-02-17: Syncthing Phone Sync Fixed — New Device Connected

**What changed**: Phone device `FNNUF32` wasn't configured on VPS Syncthing. Old device ID `UMT6JTH` was still listed as "Phone". Added correct device, enabled global discovery, configured direct IP address. Phone now connected and 100% synced.

**Root Cause Analysis:**
- VPS had old phone device ID (`UMT6JTH`) configured as "Phone"
- Michael's current phone has different device ID: `FNNUF32-3BONEFH-FICIVH4-B4YJBB7-KTUG6RY-3N3DG5P-VK6KRGF-VY4BTA7`
- Global discovery was **disabled** on VPS (`globalAnnounceEnabled: false`) — phone couldn't find VPS through discovery servers

**Fix Applied:**
1. Added new phone device `FNNUF32` to VPS via API
2. Shared `obsidian-vault` folder with new device
3. Enabled global discovery on VPS (`globalAnnounceEnabled: true`)
4. Michael added direct VPS address on phone: `tcp://167.88.42.12:22000`

**Verification:**
- Connection status: `connected: true` ✅
- Phone address: `108.201.70.116:22000` ✅
- Client version: `v2.0.11` ✅
- Sync completion: **100%** (needBytes: 0) ✅

---
```

**3. Change Log (at TOP of table):**
```markdown
| 2026-02-17 | **Syncthing Phone Sync Fixed**: New phone device `FNNUF32` added to VPS (old `UMT6JTH` was stale). Global discovery enabled. Direct IP `tcp://167.88.42.12:22000` configured on phone. Connection verified at 100% sync. | — |
```

**4. Useful Commands (added):**
```bash
# Check phone sync progress:
curl -s -H "X-API-Key: $SYNCTHING_API_KEY" "http://localhost:8384/rest/db/completion?folder=obsidian-vault&device=FNNUF32-3BONEFH-FICIVH4-B4YJBB7-KTUG6RY-3N3DG5P-VK6KRGF-VY4BTA7"
```

---

## Adapting for Other Projects

This protocol works for any project. To use with a different project:

1. **Create project context log** with same structure:
   - Last Updated header
   - Current Status Summary table
   - Recent Session History section
   - Change Log table

2. **Update this skill** or create project-specific variant pointing to correct file path

3. **Key sections to include:**
   - `## Current Status Summary` — Component status table
   - `## Recent Session History` — Detailed session entries
   - `## Change Log` — One-liner history table
   - `## Useful Commands` — Command reference (optional)
   - `## Known Issues & Blockers` — Issue tracking (optional)

---

## Quick Reference

| Element | Location | Key Format |
|---------|----------|------------|
| Last Updated | Line 4 | `**Last Updated**: YYYY-MM-DD (summary)` |
| Session Entry | Top of `## Recent Session History` | Full markdown with categories |
| Change Log | Top of `## Change Log` table | `\| date \| **Title**: details \| link \|` |
| Commands | `## Useful Commands` | Bash code blocks with comments |

**Golden Rules:**
1. Specific IDs, paths, counts — never vague
2. Always include Verification section with ✅
3. Use `backticks` for technical values
4. Session entry = detailed; Change Log = condensed
5. Future AI agents are the primary audience
