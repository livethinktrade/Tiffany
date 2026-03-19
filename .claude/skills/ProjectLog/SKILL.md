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

## Step 4: Create Session Log File (REQUIRED)

**Location:** `session-logs/` directory in the project

**Naming:** `YYYYMMDD_HHMMSS_short-slug.md` (use `120000` when time unknown)

**Template:**
```markdown
# Session Log: [Title]

**Date**: YYYY-MM-DD
**Agent**: [Agent name] ([Model])
**Triggered By**: [What prompted this work]

---

## Problem / Request

[What was the user's request or the problem being solved]

## What Was Done

- [Action 1]
- [Action 2]

## Files Modified

| File | Change |
|------|--------|
| `/path/to/file` | [What changed] |

## Verification

- [Check performed] ✅

## Pending / Follow-up

- [ ] [Unfinished item]
```

**Rules:**
1. **REQUIRED** — every session MUST have a session log file
2. Be specific — include IDs, paths, counts, versions
3. Include Verification section with ✅ checkmarks
4. Include Pending section if work is incomplete
5. All technical detail goes HERE, not in the context log

---

## Step 5: Add Entry to "Change Log" Table

**Location:** Add at TOP of `## Change Log` table (after header row)

**Format:**
```markdown
| YYYY-MM-DD | **[Bold Title]**: [One sentence with `backtick` IDs and key details.] | [[session-log-link]] |
```

**Session log link is REQUIRED** — every Change Log row must link to a session log file.

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

**2. Session Log File (in session-logs/):**
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
   - `session-logs/` directory for detailed session logs
   - Change Log table

2. **Update this skill** or create project-specific variant pointing to correct file path

3. **Key sections to include:**
   - `## Current Status Summary` — Component status table
   - `session-logs/` — Detailed session log files
   - `## Change Log` — One-liner history table
   - `## Useful Commands` — Command reference (optional)
   - `## Known Issues & Blockers` — Issue tracking (optional)

---

## Quick Reference

| Element | Location | Key Format |
|---------|----------|------------|
| Last Updated | Line 4 | `**Last Updated**: YYYY-MM-DD (summary)` |
| Session Log | `session-logs/YYYYMMDD_HHMMSS_slug.md` | Full markdown with categories |
| Change Log | Top of `## Change Log` table | `\| date \| **Title**: details \| link \|` |
| Commands | `## Useful Commands` | Bash code blocks with comments |

**Golden Rules:**
1. Specific IDs, paths, counts — never vague
2. Always include Verification section with ✅
3. Use `backticks` for technical values
4. Session log = detailed; Change Log = condensed summary with [[link]]
5. Future AI agents are the primary audience
