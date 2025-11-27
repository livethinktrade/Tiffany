# PAI Session Tracking & History System

**Understanding how PAI tracks your work, conversations, and session history**

---

## Overview

PAI automatically tracks every Claude Code session, capturing conversations, file changes, command outputs, and session summaries. This creates a searchable knowledge base of your work over time.

All tracking data lives in `.claude/` subdirectories and is managed automatically by hooks.

---

## Directory Structure

```
.claude/
├── 📁 history/              # Main session history and learnings
│   ├── sessions/            # Session summaries (markdown)
│   ├── learnings/           # Extracted knowledge and patterns
│   └── raw-outputs/         # Raw JSONL event streams
│
├── 📁 debug/                # Full conversation transcripts per session
│   ├── <session-id>.txt     # Complete session transcript
│   └── latest -> <id>.txt   # Symlink to most recent session
│
├── 📁 file-history/         # File change history per session
│   └── <session-id>/        # Files modified in that session
│       └── <filename>.v1    # Version snapshots
│
├── 📁 projects/             # Per-project session data
│   └── <project-path>/      # Sanitized path name
│       └── sessions.json    # Session metadata for this project
│
├── 📁 todos/                # Todo list persistence
│   └── <session-id>.json    # Todo state per session
│
├── 📁 shell-snapshots/      # Shell environment snapshots
│   └── snapshot-bash-*.sh   # Shell state before commands
│
├── 📁 plugins/              # MCP plugins and integrations
│   └── <plugin-name>/       # Plugin-specific data
│
├── 📁 statsig/              # Analytics and feature flags
│   └── config.json          # Feature toggles
│
├── history.jsonl            # Legacy flat history file
└── agent-sessions.json      # Maps session IDs to agent types
```

---

## How Tracking Works

### 1. Session Start (SessionStart Hook)

**Hook:** `.claude/hooks/initialize-pai-session.ts`

When you start a Claude Code session:

```typescript
// 1. Check if this is a subagent (skip tracking if true)
const isSubagent = process.env.CLAUDE_AGENT_TYPE !== undefined;

// 2. Set terminal title
process.stderr.write(`\x1b]0;${daName} Ready\x07`);

// 3. Send voice notification
await fetch('http://localhost:8888/notify', {
  body: JSON.stringify({
    title: `${daName} Systems Initialized`,
    message: `${daName} here, ready to go.`,
    voice_id: process.env.DA_VOICE_ID
  })
});

// 4. Load core PAI context (via load-core-context.ts)
```

**Creates:**
- New session entry in `agent-sessions.json`
- Debug transcript file in `debug/<session-id>.txt`
- Shell snapshot if needed

---

### 2. During Session (Automatic Tracking)

**What Gets Tracked:**

#### A. Every Tool Use
Captured in `history/raw-outputs/YYYY-MM/YYYY-MM-DD_all-events.jsonl`:
```jsonl
{"type":"tool","name":"Read","path":"/file.ts","timestamp":"2025-11-27T03:42:11Z","session_id":"69dc74c9..."}
{"type":"tool","name":"Edit","path":"/file.ts","timestamp":"2025-11-27T03:42:15Z","session_id":"69dc74c9..."}
{"type":"tool","name":"Bash","command":"git status","timestamp":"2025-11-27T03:42:20Z","session_id":"69dc74c9..."}
```

#### B. File Changes
Before editing a file, a backup is created:
```
file-history/69dc74c9-46a5-48f5-ba98-75269eddd8cc/
├── server.ts.v1        # Version before first edit
├── server.ts.v2        # Version before second edit
└── settings.json.v1
```

This creates a per-session git-like history without actually using git.

#### C. Full Conversation
Everything (your messages + AI responses) goes to:
```
debug/69dc74c9-46a5-48f5-ba98-75269eddd8cc.txt
```

**Format:**
```
[2025-11-27 03:42:11] USER:
Complete Voice Server Directory Analysis

[2025-11-27 03:42:15] ASSISTANT:
Perfect! I've reviewed the entire voice-server directory...
```

#### D. Todo Lists
Current todo state saved to:
```
todos/69dc74c9-46a5-48f5-ba98-75269eddd8cc.json
```

**Format:**
```json
{
  "session_id": "69dc74c9-46a5-48f5-ba98-75269eddd8cc",
  "timestamp": "2025-11-27T03:42:30Z",
  "todos": [
    {"content": "Fix audio issue", "status": "completed", "activeForm": "Fixing audio issue"},
    {"content": "Document solution", "status": "in_progress", "activeForm": "Documenting solution"}
  ]
}
```

---

### 3. Session End (SessionEnd Hook)

**Hook:** `.claude/hooks/capture-session-summary.ts`

When you close Claude Code or end a session:

```typescript
// 1. Analyze what was accomplished
const sessionInfo = await analyzeSession(conversationId);

// 2. Extract key activities
const activities = extractToolUses(rawOutputs);
// - Files modified: 3
// - Commands run: 15
// - Web searches: 2

// 3. Generate summary document
const summary = `
# Session Summary: ${focus}

**Date:** ${date}
**Duration:** ${duration}
**Focus:** ${focus}

## What Was Accomplished
- Fixed voice server audio on WSL2
- Added DA_VOICE_ID to settings.json
- Created troubleshooting documentation

## Files Modified
- .claude/voice-server/server.ts
- .claude/settings.json
- .claude/voice-server/TROUBLESHOOTING.md

## Commands Executed
- Restarted voice server
- Tested audio output
- Checked PulseAudio configuration
`;

// 4. Save to history/sessions/
writeFileSync(`history/sessions/2025-11/2025-11-27-034230_SESSION_voice-fix.md`);
```

**Creates:**
```
history/sessions/2025-11/
└── 2025-11-27-034230_SESSION_voice-fix.md
```

---

## Understanding Each Directory

### 📁 `history/` - Main History Database

**Purpose:** Long-term searchable history and knowledge extraction

**Structure:**
```
history/
├── sessions/
│   └── 2025-11/
│       ├── 2025-11-25-143522_SESSION_skill-migration.md
│       ├── 2025-11-26-091033_SESSION_hook-debugging.md
│       └── 2025-11-27-034230_SESSION_voice-fix.md
│
├── learnings/
│   └── 2025-11/
│       ├── voice-server-wsl-audio.md      # Extracted knowledge
│       └── session-hook-patterns.md       # Patterns discovered
│
└── raw-outputs/
    └── 2025-11/
        ├── 2025-11-25_all-events.jsonl    # All tool uses, day by day
        ├── 2025-11-26_tool-outputs.jsonl  # Command outputs only
        └── 2025-11-27_all-events.jsonl
```

**How to Use:**

```bash
# Find all sessions about voice server
grep -r "voice" .claude/history/sessions/

# See what commands you ran on 2025-11-27
cat .claude/history/raw-outputs/2025-11/2025-11-27_all-events.jsonl | grep Bash

# Review a specific session
cat .claude/history/sessions/2025-11/2025-11-27-034230_SESSION_voice-fix.md
```

---

### 📁 `debug/` - Full Session Transcripts

**Purpose:** Complete conversation logs for debugging and review

**Why Separate from history/sessions?**
- `debug/` = RAW, COMPLETE transcript (every message)
- `history/sessions/` = SUMMARIZED, READABLE document (key points only)

**Use Cases:**
- Debug hook failures
- Review exact AI responses
- Understand decision-making process
- Recover lost context

**Example:**
```bash
# See current session transcript
cat .claude/debug/latest

# Search across all sessions
grep -r "error" .claude/debug/

# Compare two sessions
diff .claude/debug/session-1.txt .claude/debug/session-2.txt
```

---

### 📁 `file-history/` - Version Control Per Session

**Purpose:** Track file changes within each session (not across sessions)

**How It Works:**
1. You start session `abc-123`
2. AI reads `server.ts`
3. AI edits `server.ts` → saved to `file-history/abc-123/server.ts.v1`
4. AI edits `server.ts` again → saved to `file-history/abc-123/server.ts.v2`
5. Session ends
6. Next session gets new folder `def-456/`

**Restore a File Version:**
```bash
# List versions from a session
ls .claude/file-history/69dc74c9-46a5-48f5-ba98-75269eddd8cc/

# Restore previous version
cp .claude/file-history/69dc74c9.../server.ts.v1 .claude/voice-server/server.ts
```

**Why Per-Session?**
- Keeps each session's changes isolated
- Easy to rollback session-specific changes
- Doesn't interfere with git history
- Complements (not replaces) version control

---

### 📁 `projects/` - Cross-Session Project Data

**Purpose:** Track which sessions worked on which projects

**Structure:**
```
projects/
├── -home-michael-tiffany-pai/      # This repo (path sanitized)
│   └── sessions.json               # All sessions for this project
│
└── -mnt-d-Program-Files-Obsidian/  # Another project
    └── sessions.json
```

**sessions.json Format:**
```json
{
  "project_path": "/home/michael/tiffany-pai",
  "sessions": [
    {
      "id": "69dc74c9-46a5-48f5-ba98-75269eddd8cc",
      "started": "2025-11-27T03:30:00Z",
      "ended": "2025-11-27T04:15:00Z",
      "focus": "voice-server-audio-fix",
      "files_modified": 3,
      "commands_run": 18
    }
  ]
}
```

**Use Cases:**
```bash
# See all sessions for current project
cat .claude/projects/-home-michael-tiffany-pai/sessions.json

# Find when you last worked on voice-server
jq '.sessions[] | select(.focus | contains("voice"))' sessions.json
```

---

### 📁 `todos/` - Todo List Persistence

**Purpose:** Save todo state per session for recovery

**Why?**
- If session crashes, recover todo list
- Review what was planned vs completed
- Track progress over time

**Format:**
```json
{
  "session_id": "69dc74c9-46a5-48f5-ba98-75269eddd8cc",
  "timestamp": "2025-11-27T03:45:00Z",
  "todos": [
    {
      "content": "Fix DA_VOICE_ID in settings",
      "status": "completed",
      "activeForm": "Fixing DA_VOICE_ID in settings"
    },
    {
      "content": "Document tracking system",
      "status": "in_progress",
      "activeForm": "Documenting tracking system"
    }
  ]
}
```

---

### 📁 `shell-snapshots/` - Environment Preservation

**Purpose:** Capture shell environment before executing commands

**Why?**
- Some commands depend on environment variables
- Helps reproduce issues
- Debugging tool execution problems

**Example:**
```bash
# snapshot-bash-1764235896688-34qb94.sh
export PATH=/home/michael/.bun/bin:/usr/local/bin:...
export PAI_DIR=/home/michael/tiffany-pai/.claude
export PULSE_SERVER=unix:/mnt/wslg/PulseServer
cd /home/michael/tiffany-pai
```

**Used by:** Claude Code's Bash tool to maintain consistent environment

---

### 📁 `plugins/` - MCP Server Data

**Purpose:** Storage for MCP (Model Context Protocol) plugins

**Examples:**
- `plugins/n8n-mcp/` - n8n workflow automation cache
- `plugins/context7/` - Library documentation cache
- `plugins/cloudflare/` - Cloudflare docs cache

**Why Separate?**
- Plugins may cache large amounts of data
- Easy to clear plugin data without affecting history
- Some plugins need persistent state

---

### 📁 `statsig/` - Feature Flags & Analytics

**Purpose:** Control experimental features

**config.json Example:**
```json
{
  "features": {
    "history_tracking": true,
    "voice_notifications": true,
    "session_summaries": true,
    "learning_extraction": false
  },
  "experiments": {
    "enhanced_context": "variant_a"
  }
}
```

**Why?**
- Enable/disable tracking features
- A/B test new capabilities
- Gradual rollout of features

---

## Configuration & Control

### Disable Tracking

**Turn off specific features:**

Edit `.claude/statsig/config.json`:
```json
{
  "features": {
    "history_tracking": false,      // Stop raw event logging
    "session_summaries": false,     // Skip SessionEnd summary
    "file_history": false,          // Don't backup file versions
    "voice_notifications": true     // Keep voice (independent)
  }
}
```

**Or remove hooks:**

Edit `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [
      // Comment out or remove hooks you don't want
      // "~/.claude/hooks/initialize-pai-session.ts"
    ],
    "SessionEnd": [
      // "~/.claude/hooks/capture-session-summary.ts"
    ]
  }
}
```

### Clean Up Old Data

```bash
# Remove old debug transcripts (keep last 30 days)
find .claude/debug -type f -mtime +30 -delete

# Clear file history for completed sessions
rm -rf .claude/file-history/old-session-id/

# Archive old session summaries
tar -czf history-2024.tar.gz .claude/history/sessions/2024-*/
```

### Backup Important Data

```bash
# Backup entire history
tar -czf pai-history-$(date +%Y%m%d).tar.gz .claude/history/

# Backup only session summaries
tar -czf pai-sessions-$(date +%Y%m%d).tar.gz .claude/history/sessions/

# Sync to cloud
rclone sync .claude/history/ remote:pai-backup/history/
```

---

## Searching & Querying Your History

### Find Sessions About a Topic

```bash
# Search session summaries
grep -r "audio\|voice" .claude/history/sessions/

# Search full transcripts
grep -r "voice-server" .claude/debug/

# Find when you modified a file
grep -r "settings.json" .claude/file-history/
```

### Analyze Your Work Patterns

```bash
# Count sessions per month
ls .claude/history/sessions/ | sort | uniq -c

# See most-modified files
cat .claude/history/raw-outputs/2025-11/*_all-events.jsonl | \
  grep Edit | jq -r .path | sort | uniq -c | sort -rn | head

# Most-used commands
cat .claude/history/raw-outputs/2025-11/*_all-events.jsonl | \
  grep Bash | jq -r .command | cut -d' ' -f1 | sort | uniq -c | sort -rn
```

### Build Knowledge Base

```bash
# Extract all error solutions
grep -A 20 "Error\|Fix" .claude/history/sessions/2025-*/*.md > errors-fixed.md

# Compile learning documents
cat .claude/history/learnings/2025-*/*.md > all-learnings.md

# Create topic index
grep -h "^#" .claude/history/sessions/2025-*/*.md | sort | uniq > topics.txt
```

---

## Privacy & Security

### What Gets Tracked

**✅ Tracked:**
- File paths and names
- Command names and arguments
- Tool uses (Read, Edit, Bash, etc.)
- Conversation messages
- AI responses
- Session metadata (timestamps, duration)

**❌ NOT Tracked Externally:**
- Everything stays LOCAL in `.claude/`
- No data sent to Anthropic beyond normal API calls
- No analytics sent to external services
- Credentials never stored (they're in .credentials.json which is .gitignored)

### Protecting Sensitive Data

**1. Add to .gitignore:**
```gitignore
# Already ignored by PAI
.claude/debug/
.claude/history/
.claude/file-history/
.claude/.credentials.json
.claude/todos/
.claude/shell-snapshots/
```

**2. Encrypt history:**
```bash
# Encrypt entire history folder
tar -czf - .claude/history | gpg -c > history-encrypted.tar.gz.gpg

# Decrypt when needed
gpg -d history-encrypted.tar.gz.gpg | tar -xzf -
```

**3. Exclude sensitive paths:**

Edit `.claude/hooks/capture-session-summary.ts` to filter:
```typescript
// Skip tracking for certain directories
const EXCLUDED_PATHS = [
  '/secrets/',
  '/.env',
  '/credentials/'
];
```

---

## Advanced: Custom Tracking

### Add Your Own Tracking Hook

Create `.claude/hooks/my-tracker.ts`:

```typescript
#!/usr/bin/env bun
import { writeFileSync } from 'fs';
import { join } from 'path';

const data = await Bun.stdin.text();
const event = JSON.parse(data);

// Custom tracking logic
if (event.type === 'tool_use' && event.tool === 'Edit') {
  const log = `${new Date().toISOString()} - Edited: ${event.path}\n`;
  writeFileSync(
    join(process.env.PAI_DIR!, 'my-custom-log.txt'),
    log,
    { flag: 'a' }
  );
}
```

Register in `.claude/settings.json`:
```json
{
  "hooks": {
    "ToolUse": ["~/.claude/hooks/my-tracker.ts"]
  }
}
```

---

## Summary Table

| Directory | Purpose | When Created | Retention |
|-----------|---------|--------------|-----------|
| `history/sessions/` | Session summaries | SessionEnd hook | Keep forever |
| `history/raw-outputs/` | Raw event log (JSONL) | Per tool use | Monthly files |
| `history/learnings/` | Extracted knowledge | Manual/automatic | Keep forever |
| `debug/` | Full transcripts | SessionStart | Clean after 30d |
| `file-history/` | File version backups | Before Edit | Clean after session |
| `projects/` | Project session index | First session in project | Keep forever |
| `todos/` | Todo snapshots | When TodoWrite used | Clean after session |
| `shell-snapshots/` | Shell environment | Before Bash command | Clean after 1d |
| `plugins/` | MCP plugin data | Plugin-specific | Plugin-managed |
| `statsig/` | Feature flags | At install | Keep forever |

---

**Last Updated:** 2025-11-27
**Version:** 1.0 (Post-November-2024 architecture update)
