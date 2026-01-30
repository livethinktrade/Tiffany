# Kokoro TTS Manual Installation Guide

## Overview
This guide will set up local TTS using Kokoro (open-source, runs offline).

## Step 1: Create Virtual Environment

```bash
cd /home/michael/tiffany-pai/.claude/voice-server
uv venv .venv --seed
```

## Step 2: Install Dependencies

Run this command (it will download ~1.5GB of packages including PyTorch):

```bash
cd /home/michael/tiffany-pai/.claude/voice-server
.venv/bin/pip install kokoro soundfile
```

**Note:** This downloads:
- PyTorch (~915MB)
- NVIDIA CUDA libraries (~500MB+)
- spaCy, transformers, numpy, etc.

If it times out, you can retry - pip will resume from cache.

## Step 3: Verify espeak-ng (Already Installed)

espeak-ng is already installed on your system. Verify with:

```bash
espeak-ng --version
```

## Step 4: Test Kokoro Installation

After pip install completes, test it works:

```bash
cd /home/michael/tiffany-pai/.claude/voice-server
.venv/bin/python -c "import kokoro; print('Kokoro imported successfully!')"
```

## Step 5: Download Voice Model (First Run)

The first time Kokoro runs, it will download the voice model from HuggingFace (~50MB).
This happens automatically when you first generate speech.

## Quick Test Script

Once installed, test TTS works:

```bash
cd /home/michael/tiffany-pai/.claude/voice-server
.venv/bin/python << 'EOF'
from kokoro import KPipeline
import soundfile as sf

# Initialize (downloads model on first run)
pipeline = KPipeline(lang_code='a')  # 'a' = American English

# Generate speech
generator = pipeline("Hello Daniel, Kokoro TTS is working!", voice='af_heart')
for i, (gs, ps, audio) in enumerate(generator):
    sf.write('/tmp/test_kokoro.wav', audio, 24000)
    print(f"Audio saved to /tmp/test_kokoro.wav")
    break
EOF
```

Then play it:
```bash
aplay /tmp/test_kokoro.wav
# or
ffplay -autoexit /tmp/test_kokoro.wav
```

---

## When Done

Once you've verified Kokoro works, let me know and I'll:
1. Create the `tts-local.py` script
2. Update `server.ts` to support local TTS
3. Configure the environment variables
