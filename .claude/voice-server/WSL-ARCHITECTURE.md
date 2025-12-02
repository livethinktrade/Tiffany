# Voice Server Architecture for WSL2/Linux

**Last Updated:** 2025-12-01
**Purpose:** Comprehensive guide to understanding how Kai's voice system works on WSL2

---

## Why This Document Exists

PAI was originally built for macOS. On WSL2, there are **critical differences** in:
- How the voice server starts
- Audio playback mechanisms
- Environment variable handling
- System integration

This document explains **the complete voice architecture** so you understand what's happening and can debug issues yourself.

---

## Table of Contents

1. [The Complete Voice Flow](#the-complete-voice-flow)
2. [Components Overview](#components-overview)
3. [WSL2 vs macOS Differences](#wsl2-vs-macos-differences)
4. [Startup Mechanisms](#startup-mechanisms)
5. [How Voice Notifications Work](#how-voice-notifications-work)
6. [Git History: What We Tried and Why](#git-history-what-we-tried-and-why)
7. [Current Solution](#current-solution)
8. [Environment Variables](#environment-variables)
9. [Troubleshooting Flow](#troubleshooting-flow)

---

## The Complete Voice Flow

Here's what happens from session start to hearing Kai's voice:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. YOU START CLAUDE CODE SESSION                                │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SessionStart Hook Fires                                       │
│    → .claude/hooks/initialize-pai-session.ts runs                │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Hook Checks: Is Voice Server Running?                        │
│    → Tries: http://localhost:8888/health                        │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────┴──────┐
                    │             │
              YES (200 OK)    NO (timeout/error)
                    │             │
                    ↓             ↓
         ┌──────────────┐  ┌──────────────────────────┐
         │ Continue     │  │ Auto-Start Voice Server  │
         └──────────────┘  │ → Runs start-voice-     │
                           │    server.sh             │
                           │ → Waits 2s for startup   │
                           │ → Verifies health check  │
                           └──────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Voice Server Now Running                                      │
│    → Listening on port 8888                                      │
│    → Connected to ElevenLabs API                                 │
│    → Ready to receive /notify requests                           │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Hook Sends "Ready" Notification                               │
│    → POST http://localhost:8888/notify                           │
│    → {"message": "Tiffany here, ready to go."}                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Voice Server Processes Request                                │
│    → Sends text to ElevenLabs API                                │
│    → Gets back MP3 audio data                                    │
│    → Saves to /tmp/voice-{timestamp}.mp3                         │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Audio Playback (WSL2-specific)                                │
│    → Runs: mpg123 -o pulse -q /tmp/voice-*.mp3                  │
│    → Uses PulseAudio via WSLg                                    │
│    → Audio plays through Windows host                            │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. YOU HEAR: "Tiffany here, ready to go."                       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                   ┌───────────────┐
                   │ Session Ready │
                   └───────────────┘


LATER... WHEN YOU STOP KAI'S RESPONSE:

┌─────────────────────────────────────────────────────────────────┐
│ 1. YOU PRESS STOP BUTTON                                         │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Stop Hook Fires                                               │
│    → .claude/hooks/stop-hook.ts runs                             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Hook Reads Transcript                                         │
│    → Parses conversation JSON                                    │
│    → Finds last assistant response                               │
│    → Extracts "🎯 COMPLETED:" line                               │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Hook Sends COMPLETED Message to Voice Server                 │
│    → POST http://localhost:8888/notify                           │
│    → {"message": "Voice server checked, started, verified"}      │
│    → {"voice_id": "jqcCZkN6Knx8BJ5TBdYR"}  (Tiffany's voice)    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Voice Server → ElevenLabs → mpg123 → YOU HEAR IT             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components Overview

### 1. Voice Server (`server.ts`)

**Location:** `.claude/voice-server/server.ts`
**Runtime:** Bun
**Port:** 8888

**What it does:**
- Runs an HTTP server that accepts `/notify` requests
- Takes text input and sends it to ElevenLabs API
- Receives MP3 audio from ElevenLabs
- Plays audio using platform-specific player (mpg123 on WSL2)
- Manages temp files and cleanup

**Key endpoints:**
- `POST /notify` - Send a voice notification
- `GET /health` - Check if server is running
- `POST /pai` - Alternative endpoint for PAI notifications

### 2. Session Initialization Hook

**Location:** `.claude/hooks/initialize-pai-session.ts`
**Trigger:** SessionStart event
**When:** Every time you start a Claude Code session

**What it does:**
1. Checks if it's a subagent (skips if yes)
2. **NEW (2025-12-01): Auto-starts voice server if not running**
3. Tests stop-hook configuration
4. Sets initial tab title
5. Sends "ready" voice notification

### 3. Stop Hook

**Location:** `.claude/hooks/stop-hook.ts`
**Trigger:** When you press Stop button
**When:** After every Kai response

**What it does:**
1. Reads the conversation transcript
2. Finds the `🎯 COMPLETED:` line from Kai's response
3. Sends that message to voice server
4. Sets terminal tab title to summarize what was done

### 4. Startup Script (WSL2-specific)

**Location:** `.claude/voice-server/start-voice-server.sh`
**Purpose:** Starts voice server in background for WSL2

```bash
#!/bin/bash
# Starts voice server, writes PID to /tmp/pai-voice-server.pid
# Logs to /tmp/pai-voice-server.log
# Runs in background, detached from terminal
```

---

## WSL2 vs macOS Differences

| Aspect | macOS | WSL2/Linux |
|--------|-------|------------|
| **Audio Player** | `afplay` (built-in) | `mpg123 -o pulse` |
| **Audio System** | CoreAudio (direct) | PulseAudio via WSLg |
| **Auto-Start** | LaunchAgent (system service) | Shell RC file (`.bashrc`) |
| **PID File** | macOS-specific location | `/tmp/pai-voice-server.pid` |
| **Log File** | `~/Library/Logs/` | `/tmp/pai-voice-server.log` |
| **Env Variables** | Both `~/.env` and settings.json | Both `~/.env` and settings.json |
| **Visual Notifications** | `osascript` (AppleScript) | None (voice only) |

---

## Startup Mechanisms

### Problem: Why Voice Server Doesn't Always Start

On **macOS**, voice server starts automatically via LaunchAgent (system service).

On **WSL2**, there's no equivalent system service, so we have to use:

#### Old Approach (Before 2025-12-01)
```bash
# In ~/.bashrc
/home/michael/tiffany-pai/.claude/voice-server/start-voice-server.sh
```

**Problem with this approach:**
- Only runs when you open a new terminal
- If you launch Claude Code without opening terminal first → no voice server
- Requires manual restart after crashes
- You had to debug this repeatedly, wasting tokens

#### New Approach (Current, 2025-12-01)

**Auto-start in SessionStart hook:**

```typescript
// In initialize-pai-session.ts
async function ensureVoiceServerRunning() {
  // 1. Check if server is responding
  const healthCheck = await fetch('http://localhost:8888/health');

  if (healthCheck?.ok) {
    return true; // Already running
  }

  // 2. Not running, start it
  spawn('start-voice-server.sh', [], { detached: true });

  // 3. Wait 2 seconds for startup
  await sleep(2000);

  // 4. Verify it started
  const verify = await fetch('http://localhost:8888/health');
  return verify?.ok;
}
```

**Why this is better:**
- **Runs on every session start** - guaranteed voice server availability
- **Zero manual intervention** - automatically recovers from crashes
- **Immediate feedback** - you see startup logs if there's an issue
- **Eliminates recurring debugging** - no more checking status, reading logs, etc.

---

## How Voice Notifications Work

### The COMPLETED Line Format

Every Kai response MUST end with:

```
🎯 COMPLETED: [12 words max summary of what was done]
```

**Example:**
```
🎯 COMPLETED: Voice server checked, started, and verified fully functional on port.
```

### The Voice Flow

1. **You press Stop** (or Kai finishes)
2. **Stop hook parses transcript**
   - Reads `.jsonl` transcript file
   - Finds last assistant message
   - Extracts text after `🎯 COMPLETED:`
3. **Hook processes the completion message**
   - Removes markdown formatting (`**`, `*`, etc.)
   - Removes special prefixes (`[AGENT:...]`)
   - Applies intelligent shortening for simple cases
4. **Hook sends to voice server**
   ```json
   POST http://localhost:8888/notify
   {
     "message": "Voice server checked, started, and verified",
     "voice_id": "jqcCZkN6Knx8BJ5TBdYR",
     "rate": 175
   }
   ```
5. **Voice server generates speech**
   ```typescript
   // server.ts
   const audioBuffer = await generateSpeech(text, voiceId);
   // → Calls ElevenLabs API
   // → Gets MP3 audio back
   ```
6. **Voice server plays audio**
   ```bash
   mpg123 -o pulse -q /tmp/voice-1234567890.mp3
   ```
7. **You hear Kai's voice**

---

## Git History: What We Tried and Why

### September 2025: First Auto-Start Attempt

**Commit:** `b6eaf2f` - "Enhance voice server integration with auto-start and Linux support"

**What was done:**
- Added auto-start to `session-start-hook.ts`
- Checked health endpoint
- Started server if not running
- Added Linux compatibility

**Why it stopped working:**
- Hook file was renamed from `session-start-hook.ts` → `initialize-pai-session.ts`
- Auto-start code was lost in the rename
- System regressed back to manual startup

### November 2025: Voice Server Fixes

**Commit:** `ee510e3` - "fix: resolve voice server startup and hook initialization issues"

**What was done:**
- Fixed SessionStart hook errors
- Updated stop-hook to connect properly
- Documented voice architecture
- Ensured auto-start via shell RC

**Why it didn't solve the problem:**
- Still relied on `~/.bashrc` for startup
- If Claude Code launched without terminal → no voice server
- Manual intervention still needed

### November 2025: WSL2 Audio Fix

**Issue:** Voice server started, ElevenLabs generated speech, but no audio output

**Root cause:** `mpg123` needs explicit PulseAudio output on WSL2

**Solution:**
```typescript
// server.ts line 125
args = ['-o', 'pulse', '-q', tempFile];
```

**Why this was needed:**
- WSL2 uses PulseAudio via WSLg (Windows Subsystem for Linux GUI)
- mpg123 defaults to wrong output device
- Must explicitly specify `-o pulse` flag

### December 2025: Current Fix

**What we did TODAY:**
- Re-added auto-start to `initialize-pai-session.ts`
- Added `ensureVoiceServerRunning()` function
- Made it run BEFORE any notification attempts
- Tested and verified it works

**Why this finally works:**
- Runs on EVERY session start (not just when terminal opens)
- Automatically recovers from crashes
- No manual intervention needed
- Eliminates recurring debugging

---

## Current Solution

### Auto-Start Implementation

**File:** `.claude/hooks/initialize-pai-session.ts`

```typescript
async function ensureVoiceServerRunning(): Promise<boolean> {
  try {
    // Check if server is responding
    const healthCheck = await fetch('http://localhost:8888/health', {
      signal: AbortSignal.timeout(1000)
    }).catch(() => null);

    if (healthCheck?.ok) {
      console.error('✅ Voice server already running');
      return true;
    }

    console.error('🔄 Voice server not responding, starting...');

    // Start voice server
    const voiceServerScript = join(PAI_DIR, 'voice-server/start-voice-server.sh');

    const child = spawn(voiceServerScript, [], {
      detached: true,
      stdio: 'ignore',
      shell: true
    });

    child.unref();

    // Wait for startup
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify startup
    const verifyCheck = await fetch('http://localhost:8888/health', {
      signal: AbortSignal.timeout(1000)
    }).catch(() => null);

    if (verifyCheck?.ok) {
      console.error('✅ Voice server started successfully');
      return true;
    } else {
      console.error('⚠️ Voice server may still be starting...');
      return false;
    }
  } catch (error) {
    console.error('⚠️ Error checking/starting voice server:', error);
    return false;
  }
}
```

**Called in main():**
```typescript
async function main() {
  // ... subagent check ...
  // ... debounce check ...

  // NEW: Auto-start voice server
  await ensureVoiceServerRunning();

  // ... rest of initialization ...
}
```

---

## Environment Variables

Voice system requires environment variables in **TWO PLACES**:

### 1. For Voice Server (`~/.env`)

```bash
# ~/.env
ELEVENLABS_API_KEY=sk_your_api_key_here
ELEVENLABS_VOICE_ID=s3TPKV1kjDlVtZbl4Ksh  # Default Kai voice
ELEVENLABS_MODEL=eleven_multilingual_v2
```

**Why:** Voice server reads `~/.env` directly when it starts.

### 2. For Hooks (`.claude/settings.json`)

```json
{
  "env": {
    "PAI_DIR": "/home/michael/tiffany-pai/.claude",
    "DA": "Tiffany",
    "DA_VOICE_ID": "jqcCZkN6Knx8BJ5TBdYR",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "64000"
  }
}
```

**Why:** Hooks only see environment variables from `settings.json`, NOT from `~/.env`.

**Critical:** `DA_VOICE_ID` must be in BOTH places:
- `~/.env` → Voice server default voice
- `settings.json` → Hook knows which voice to request

---

## Troubleshooting Flow

### Problem: No Voice Output

```
1. Is voice server running?
   → ps aux | grep "bun.*voice"

   NO → Check auto-start in hook
        → Review /tmp/pai-voice-server.log
        → Try manual start: .claude/voice-server/start-voice-server.sh

   YES → Continue to step 2

2. Is server responding?
   → curl http://localhost:8888/health

   NO → Server crashed, restart it
        → Check logs for errors

   YES → Continue to step 3

3. Is PulseAudio working?
   → echo $PULSE_SERVER
   → Should show: unix:/mnt/wslg/PulseServer

   NO → WSLg not set up, reinstall WSL2

   YES → Continue to step 4

4. Test audio directly
   → curl -X POST http://localhost:8888/notify \
        -H "Content-Type: application/json" \
        -d '{"message":"test","voice_enabled":true}'

   NO AUDIO → Check mpg123 installation
              → sudo apt install mpg123
              → Test: mpg123 --list-devices

   AUDIO WORKS → Problem is in hook/COMPLETED line

5. Check hook output
   → Look for "🎯 COMPLETED:" in Kai's response

   MISSING → You forgot to include COMPLETED line

   PRESENT → Check stop-hook logs for errors
```

### Problem: Voice Server Doesn't Auto-Start

```
1. Check hook is configured
   → cat .claude/settings.json | grep SessionStart
   → Should include: initialize-pai-session.ts

2. Check hook runs
   → Start new Claude Code session
   → Look for hook output in session start

3. Check for errors
   → Look for "🔄 Voice server not responding, starting..."
   → Look for "✅ Voice server started successfully"

4. Check startup script exists
   → ls -la .claude/voice-server/start-voice-server.sh
   → Should be executable (rwx)

5. Manual test
   → cd .claude/hooks
   → bun run initialize-pai-session.ts
   → Should auto-start server
```

---

## Key Takeaways

1. **Voice server MUST be running** before any notifications can be sent
2. **Auto-start happens in SessionStart hook** - no manual intervention needed
3. **WSL2 requires PulseAudio** via `-o pulse` flag for mpg123
4. **Environment variables in TWO places** - `~/.env` AND `settings.json`
5. **COMPLETED line is REQUIRED** - stop-hook extracts this for voice
6. **macOS and WSL2 are different** - don't expect macOS solutions to work on WSL2

---

## Files Reference

| File | Purpose | Platform |
|------|---------|----------|
| `.claude/voice-server/server.ts` | Voice server (ElevenLabs → audio) | Both |
| `.claude/voice-server/start-voice-server.sh` | Startup script | WSL2 |
| `.claude/hooks/initialize-pai-session.ts` | Auto-start + session init | Both |
| `.claude/hooks/stop-hook.ts` | Extract COMPLETED line, send voice | Both |
| `~/.env` | ElevenLabs API credentials | Both |
| `.claude/settings.json` | Hook environment variables | Both |
| `/tmp/pai-voice-server.pid` | Process ID file | WSL2 |
| `/tmp/pai-voice-server.log` | Server logs | WSL2 |

---

## Understanding the Architecture

The voice system has **three independent layers**:

### Layer 1: Voice Server (Always Running)
- HTTP server on port 8888
- Accepts text, returns audio
- Platform-agnostic (works same on macOS/WSL2)

### Layer 2: Hooks (Event-Driven)
- SessionStart → Auto-start server
- Stop → Extract COMPLETED line, send to server

### Layer 3: Audio Playback (Platform-Specific)
- macOS: afplay (simple)
- WSL2: mpg123 with PulseAudio (complex)

**Why this matters:**
- If Layer 1 fails → no voice at all
- If Layer 2 fails → voice server runs but nothing triggers it
- If Layer 3 fails → server works, notifications sent, but no audio

---

**This document is your single source of truth for voice system architecture on WSL2.**

When you forget how it works, read this. When something breaks, use the troubleshooting flow.
