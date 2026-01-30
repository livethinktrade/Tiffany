# Plan: Replace ElevenLabs TTS with Local Kokoro-82M

## Goal
Replace the paid ElevenLabs API in Tiffany's voice server with the open-source Kokoro-82M TTS model running locally on CPU. Zero ongoing cost, sub-second audio generation.

## Why Kokoro-82M
- **82M params** - tiny model, runs great on CPU (no GPU needed)
- **Ranked #1-2 on TTS Arena** despite being 200x smaller than competitors
- **<0.3s generation** for typical voice notification text (12 words max)
- **26 built-in voices**, 8 languages, Apache 2.0 license
- **Your hardware (Ryzen 5 3600, 16GB RAM, no usable GPU)** is a perfect fit

## Hardware Context
- CPU: AMD Ryzen 5 3600 6-Core (12 threads)
- RAM: 16GB (13GB available)
- GPU: AMD Radeon R9 390 (no ROCm support, too old)
- Disk: 948GB free
- Platform: WSL2 Ubuntu 24.04

## Architecture: Minimal Change

The integration point is clean. Only `server.ts` needs modification.

**Current flow:**
```
Hook sends POST /notify → server.ts → generateSpeech() calls ElevenLabs API → MP3 buffer → playAudio() → mpg123
```

**New flow:**
```
Hook sends POST /notify → server.ts → generateSpeechLocal() spawns Python script → WAV file → playAudio() → mpg123
```

## Implementation Steps

### Step 1: Install Dependencies
```bash
pip install kokoro>=0.9.4 soundfile
sudo apt-get install -y espeak-ng
```

### Step 2: Create Python TTS Script
**File:** `/home/michael/tiffany-pai/.claude/voice-server/tts-local.py`

A CLI script that:
- Takes text as argument, output path as argument
- Loads Kokoro pipeline (American English)
- Generates audio and writes WAV to the output path
- Uses a good female voice from the 26 built-in options (e.g., `af_heart` or `af_bella`)
- Exits cleanly

Key design: First invocation downloads the model (~160MB). Subsequent runs use cached model. To avoid cold-start latency on every call, we can optionally add a "warm server" mode later, but for v1 the CLI approach is simplest.

### Step 3: Modify `server.ts`
**File:** `/home/michael/tiffany-pai/.claude/voice-server/server.ts`

Changes:
1. Add `TTS_ENGINE` env var check (`local` or `elevenlabs`, default `local`)
2. Add `generateSpeechLocal(text)` function that:
   - Spawns `python3 tts-local.py --text "..." --output /tmp/voice-{timestamp}.wav`
   - Returns the path to the generated WAV file
3. Modify `sendNotification()` to branch on `TTS_ENGINE`:
   - If `local`: call `generateSpeechLocal()`, get WAV path, play directly
   - If `elevenlabs`: use existing `generateSpeech()` flow (keeps as fallback)
4. Update `/health` endpoint to report which TTS engine is active
5. `playAudio()` already works with WAV files via mpg123 (handles both MP3 and WAV)

### Step 4: Update Environment
**File:** `~/.env`

Add:
```
TTS_ENGINE=local
```

### Step 5: Test
1. Restart voice server: `cd /home/michael/tiffany-pai/.claude/voice-server && ./restart.sh`
2. Test with curl: `curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{"message": "Hello, this is Tiffany testing local voice"}'`
3. Verify audio plays through PulseAudio
4. Test via actual Claude Code session (trigger stop hook)

### Step 6: (Optional) Warm Server Mode
If cold-start latency is noticeable (first run downloads model), create a simple Python HTTP wrapper that keeps the model loaded in memory. But try the CLI approach first - Kokoro is small enough that loading may be fast.

## Files Modified
| File | Change |
|------|--------|
| `voice-server/tts-local.py` | **NEW** - Python CLI for local TTS |
| `voice-server/server.ts` | Add local TTS engine support, TTS_ENGINE switch |
| `~/.env` | Add `TTS_ENGINE=local` |

## Rollback
Set `TTS_ENGINE=elevenlabs` in `~/.env` and restart voice server. ElevenLabs code stays intact.

## Verification
1. `curl http://localhost:8888/health` → should show `"voice_system": "Kokoro (local)"`
2. `curl -X POST http://localhost:8888/notify -d '{"message":"Test"}'` → should hear audio
3. Run a Claude Code session, trigger stop → voice notification plays
4. Check latency: generation should be <1 second for typical 12-word COMPLETED lines
