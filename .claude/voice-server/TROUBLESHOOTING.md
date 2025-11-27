# Voice Server Troubleshooting Guide

This document covers common issues and solutions for the PAI Voice Server system.

---

## Issue: No Audio Output on WSL2/Linux

### Symptoms
- Voice server starts successfully
- ElevenLabs API generates speech
- No errors in logs
- But you can't hear any audio

### Root Cause
mpg123 needs to be explicitly told to use PulseAudio output on Linux/WSL2.

### Solution (2025-11-27)

**1. Verify WSLg PulseAudio is Available**
```bash
echo $PULSE_SERVER
# Should output: unix:/mnt/wslg/PulseServer

mpg123 --list-devices
# Should show: RDPSink or similar pulse device
```

**2. Update Voice Server Configuration**

Edit `.claude/voice-server/server.ts` (around line 123-125):

```typescript
} else {
  // Linux/WSL - use mpg123 with pulse output
  audioPlayer = '/usr/bin/mpg123';
  args = ['-o', 'pulse', '-q', tempFile]; // ← Add '-o', 'pulse'
}
```

**3. Restart Voice Server**
```bash
# Stop current server
kill $(cat /tmp/pai-voice-server.pid)

# Start with new configuration
~/.claude/voice-server/start-voice-server.sh
```

**4. Test Audio**
```bash
curl -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","message":"Can you hear me?","voice_enabled":true,"voice_id":"s3TPKV1kjDlVtZbl4Ksh"}'
```

---

## Issue: Session Startup Hook Error - Invalid Voice ID

### Symptoms
```
Error: ElevenLabs API error: 400 - invalid_uid 'default-voice-id'
```

### Root Cause
The initialize-pai-session.ts hook uses `process.env.DA_VOICE_ID`, but this variable wasn't set in Claude Code's environment.

### Solution (2025-11-27)

**Add DA_VOICE_ID to settings.json:**

Edit `.claude/settings.json`:
```json
{
  "env": {
    "PAI_DIR": "/home/michael/tiffany-pai/.claude",
    "DA": "PAI",
    "DA_VOICE_ID": "s3TPKV1kjDlVtZbl4Ksh",  // ← Add this line
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "64000"
  }
}
```

**Why this works:**
- Hooks only see env vars from settings.json
- They don't read ~/.env file (that's only for the voice server)
- DA_VOICE_ID must be in BOTH places:
  - `~/.env` → Voice server reads this
  - `.claude/settings.json` → Hooks read this

---

## Issue: Voice Server Won't Start on Boot

### WSL2 Auto-Start Configuration

**Current Setup (2025-11-27):**
Voice server starts automatically via `~/.bashrc`:

```bash
# At end of ~/.bashrc
/home/michael/tiffany-pai/.claude/voice-server/start-voice-server.sh 2>&1 | head -1
```

**Limitations:**
- Only runs when you open a new shell
- Doesn't run if you start Claude Code directly without opening terminal first

**Better Solution (systemd service):**

Create `~/.config/systemd/user/pai-voice-server.service`:
```ini
[Unit]
Description=PAI Voice Server
After=network.target

[Service]
Type=simple
ExecStart=/home/michael/.bun/bin/bun run /home/michael/tiffany-pai/.claude/voice-server/server.ts
Restart=always
RestartSec=10
Environment="PATH=/home/michael/.bun/bin:/usr/local/bin:/usr/bin:/bin"
StandardOutput=append:/tmp/pai-voice-server.log
StandardError=append:/tmp/pai-voice-server.log

[Install]
WantedBy=default.target
```

Enable and start:
```bash
systemctl --user enable pai-voice-server
systemctl --user start pai-voice-server
systemctl --user status pai-voice-server
```

---

## Issue: Audio Works But Wrong Voice

### Check Voice ID Configuration

**1. Verify ElevenLabs Voice ID:**
```bash
# Check your configured voice
grep ELEVENLABS_VOICE_ID ~/.env

# List available voices via API
curl -X GET https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: $(grep ELEVENLABS_API_KEY ~/.env | cut -d= -f2)"
```

**2. Voice IDs in PAI System:**
- Default (Kai): `s3TPKV1kjDlVtZbl4Ksh`
- Researcher: `AXdMgz6evoL7OPd7eU12`
- Engineer: `fATgBRI8wg5KkDFg8vBd`

**3. Update Voice ID:**
```bash
# Update ~/.env
echo "ELEVENLABS_VOICE_ID=your_new_voice_id" >> ~/.env

# Update settings.json
# Edit .claude/settings.json and change DA_VOICE_ID value

# Restart voice server
kill $(cat /tmp/pai-voice-server.pid)
~/.claude/voice-server/start-voice-server.sh
```

---

## Issue: Rate Limiting or API Errors

### Check API Status
```bash
# Health check
curl http://localhost:8888/health | python3 -m json.tool

# Check logs
tail -f /tmp/pai-voice-server.log
```

### Common API Errors

**Error 400 - Invalid Model:**
```
ElevenLabs API error: Invalid model "eleven_monolingual_v1"
```

**Solution:** Update model in ~/.env:
```bash
echo "ELEVENLABS_MODEL=eleven_multilingual_v2" >> ~/.env
```

**Error 401 - Invalid API Key:**
```
ElevenLabs API error: 401 - Unauthorized
```

**Solution:** Check API key:
```bash
grep ELEVENLABS_API_KEY ~/.env
# Get new key from: https://elevenlabs.io/app/settings/api-keys
```

**Error 429 - Rate Limit:**
```
ElevenLabs API error: 429 - Too Many Requests
```

**Solution:**
- Free tier: 10,000 characters/month
- Wait or upgrade plan
- Check usage: https://elevenlabs.io/app/usage

---

## Debugging Tips

### 1. Check if Server is Running
```bash
ps aux | grep "bun.*voice-server"
cat /tmp/pai-voice-server.pid
```

### 2. Monitor Real-Time Logs
```bash
tail -f /tmp/pai-voice-server.log
```

### 3. Test Audio Output Directly
```bash
# Test mpg123 with pulse
mpg123 -o pulse -t /path/to/test.mp3

# Check pulse server
echo $PULSE_SERVER

# List audio devices
mpg123 --list-devices
```

### 4. Manual Server Start (for debugging)
```bash
cd ~/.claude/voice-server
bun run server.ts
# Watch console output for errors
```

### 5. Check Environment Variables
```bash
# In hook context
env | grep -E "DA|PAI_DIR|ELEVENLABS"

# In voice server context
source ~/.env && env | grep ELEVENLABS
```

---

## Platform-Specific Notes

### macOS
- Uses `afplay` (built-in, no config needed)
- LaunchAgent auto-starts on login
- SwiftBar menu bar indicator available

### Linux/WSL2
- Requires PulseAudio/WSLg
- Must explicitly use `-o pulse` flag for mpg123
- Auto-start via ~/.bashrc or systemd user service
- No menu bar indicator (Linux equivalent: polybar/i3bar integration)

---

## Getting Help

If you encounter issues not covered here:

1. Check logs: `tail -50 /tmp/pai-voice-server.log`
2. Test API key: `curl http://localhost:8888/health`
3. Verify PulseAudio: `echo $PULSE_SERVER`
4. Check voice server code: `.claude/voice-server/server.ts`
5. Review session hooks: `.claude/hooks/initialize-pai-session.ts`

---

**Last Updated:** 2025-11-27
**Fixed In This Session:** WSL2 audio output + session hook voice ID error
