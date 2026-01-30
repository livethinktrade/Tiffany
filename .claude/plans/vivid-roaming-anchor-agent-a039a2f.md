# Open-Source TTS Research for Local Voice Server (2026)

## Research Summary

Comprehensive research completed on open-source Text-to-Speech alternatives to replace ElevenLabs for local voice server deployment. Research covered 8+ specific models plus general market landscape.

## Key Findings

### Top 3 Recommendations

1. **Chatterbox** (Best Overall) - Beats ElevenLabs in 63.8% of blind tests, MIT licensed, excellent quality
2. **Kokoro-82M** (Best Performance/Size Ratio) - Lightweight 82M params, Apache 2.0, runs on CPU efficiently
3. **Fish Speech V1.5** (Best Quality) - #1 on TTS-Arena leaderboard, multilingual excellence

### Models Researched

1. Piper TTS - Fast, CPU-friendly, actively maintained
2. Coqui TTS (XTTS-v2) - Voice cloning capable, project orphaned in 2024
3. Bark (Suno) - High quality but very slow (41s for 3 sentences)
4. Fish Speech V1.5 - SOTA quality, 300K+ hours training data
5. Kokoro-82M - Ultra-lightweight, surprisingly good quality
6. F5-TTS - Good quality, moderate GPU requirements
7. Orpheus 3B - Emotional/empathetic speech, Apache 2.0
8. Chatterbox - Beats ElevenLabs, MIT license, production-ready

### Additional Discoveries

- **Qwen3-TTS** (Jan 2026) - Alibaba's newest, 97ms latency, 95% speaker similarity
- **CosyVoice2-0.5B** - 150ms streaming latency, multilingual
- **Higgs Audio V2** - 3B params, 10M hours training data, top Hugging Face
- **OpenAI TTS API** - Not open-source but cheaper ($15/1M chars vs ElevenLabs $300/1M)

## Cost Analysis

**ElevenLabs Cost:**
- Professional tier: $0.30 per 1,000 characters
- At 10M characters/month: $1,800/month

**Local TTS Cost:**
- Initial GPU investment: $500-2,000 (one-time)
- Ongoing cost: Electricity only (~$5-20/month)
- Break-even: Typically 1-3 months for high-volume users

**OpenAI TTS Alternative:**
- $15 per 1M characters (20× cheaper than ElevenLabs)
- At 10M chars/month: $150/month

## Implementation Details by Model

### Chatterbox (RECOMMENDED)
- **License:** MIT (commercial use OK)
- **Hardware:** 8GB RAM minimum, 6GB+ VRAM recommended, CPU fallback available
- **Installation:** `pip install chatterbox-tts`
- **Latency:** Real-time capable with GPU
- **Quality:** 63.8% preference over ElevenLabs in blind tests
- **Voice Cloning:** Yes, from 5 seconds of audio
- **Languages:** 17 languages
- **Integration:** Python API, REST API available
- **Maintenance:** Active (2026)

### Kokoro-82M (LIGHTWEIGHT CHAMPION)
- **License:** Apache 2.0
- **Hardware:** Runs on CPU efficiently, <1GB RAM
- **Installation:** `pip install kokoro>=0.9.4 soundfile` + `apt-get install espeak-ng`
- **Latency:** Under 0.3 seconds for most texts, 30s audio in <1 second
- **Quality:** #1 or #2 on TTS Arena despite 82M params
- **Voice Options:** 26 voices, 8 languages
- **Integration:** Simple Python API, CLI available
- **Maintenance:** Active (2026)

### Fish Speech V1.5 (HIGHEST QUALITY)
- **License:** Open source (check repo for specific license)
- **Hardware:** 8GB RAM minimum, GPU recommended
- **Installation:** Conda/UV with Python 3.12, CUDA support
- **Latency:** Real-time with GPU optimization
- **Quality:** #1 on TTS-Arena, ELO 1339, 3.5% WER
- **Training Data:** 300K+ hours (English/Chinese), 100K+ hours (Japanese)
- **Voice Cloning:** Yes, multilingual
- **Integration:** Python API, WebUI, Docker deployment
- **Maintenance:** Active (2026)

### Qwen3-TTS (NEWEST - JAN 2026)
- **License:** Open source (Alibaba/Qwen)
- **Hardware:** 8-12GB VRAM for 1.7B model, 0.6B model lighter
- **Installation:** ModelScope or Hugging Face
- **Latency:** 97ms first-packet latency
- **Quality:** 95% speaker similarity, beats ElevenLabs on benchmarks
- **Voice Cloning:** From 3 seconds of audio
- **Languages:** 10 languages
- **Integration:** Python API via Hugging Face/ModelScope
- **Maintenance:** Brand new (Jan 15, 2026)

### Piper TTS (CPU-FIRST OPTION)
- **License:** MIT (moved to OHF-Voice/piper1-gpl)
- **Hardware:** Runs on Raspberry Pi 4, pure CPU
- **Installation:** `pip install piper-tts` or download binaries
- **Latency:** 10× faster than real-time on CPU
- **Quality:** Good for CPU-only solution, not ElevenLabs-level
- **Voice Options:** Multiple ONNX models available
- **Integration:** CLI (`echo "text" | piper --model en_US-lessac-medium --output_file out.wav`)
- **Python API:** Available via PiperVoice class
- **Maintenance:** Active (moved to new repo)

### CosyVoice2-0.5B (STREAMING SPECIALIST)
- **License:** Open source (Alibaba FunAudioLLM)
- **Hardware:** Moderate GPU requirements
- **Installation:** GitHub repo
- **Latency:** 150ms first-packet (ultra-low for streaming)
- **Quality:** Near-lossless streaming quality, 5.53 MOS score
- **Languages:** Chinese (+ dialects), English, Japanese, Korean
- **Integration:** Streaming API optimized
- **Maintenance:** Active (2026)

### F5-TTS
- **License:** Open source
- **Hardware:** 6.4GB VRAM for 800 chars, 12-16GB recommended
- **Installation:** `pip install` from GitHub or ONNX runtime version
- **Latency:** RTF 0.15 (real-time capable)
- **Quality:** Excellent, voice cloning capable
- **Integration:** Python API
- **Maintenance:** Active, v1 base model released March 2025

### Orpheus 3B
- **License:** Apache 2.0
- **Hardware:** 3B model requires decent GPU
- **Versions:** 3B, 1B, 400M, 150M parameter options
- **Latency:** ~200ms streaming latency
- **Quality:** Emphasizes empathetic/emotional delivery
- **Training Data:** 100K+ hours English
- **Features:** Emotion control with simple tags
- **Integration:** Hugging Face API
- **Maintenance:** Active (Canopy AI)

### Bark (Suno)
- **License:** Research/open source
- **Hardware:** 12GB VRAM for full model, 8GB for small model
- **Installation:** Hugging Face Transformers
- **Latency:** SLOW - 41 seconds for 3 sentences (vs 1.5s for Coqui)
- **Quality:** Expressive, can laugh/cry/sing, but inconsistent
- **Limitation:** 13 second max audio output
- **Verdict:** Too slow for production use
- **Maintenance:** Active but not recommended for speed-critical apps

### Coqui TTS (XTTS-v2)
- **License:** Open source (MPL 2.0)
- **Hardware:** 4GB VRAM minimum, 8-12GB recommended
- **Installation:** `pip install coqui-tts`
- **Latency:** <150ms streaming with pure PyTorch
- **Quality:** 85-92% voice similarity
- **Voice Cloning:** From 6 seconds of audio
- **Languages:** 17 languages (XTTS-v2)
- **Status:** Company shut down in early 2024, community-maintained
- **Verdict:** Still functional but no official support

### Higgs Audio V2
- **License:** Open source
- **Hardware:** RTX 4090 recommended for 3B model
- **Installation:** GitHub repo
- **Training Data:** 10M+ hours
- **Quality:** Top trending on Hugging Face, wins emotion/question tests vs gpt-4o-mini-tts
- **Integration:** Python examples provided
- **Maintenance:** Active (Boson AI)

## Quality Rankings (TTS Arena - Jan 2026)

**Top Open-Source Models:**
1. Fish Speech V1.5 - ELO 1339
2. Kokoro-82M - #1 or #2 rank
3. Chatterbox - Beats ElevenLabs 63.8% of time

**Top Commercial Models:**
1. Vocu V3.0 - ELO 1635
2. CastleFlow v1.0 - ELO 1579
3. Inworld TTS - ELO 1576
4. ElevenLabs Flash v2.5 - Listed in top 10

## Decision Matrix

**For Maximum Quality (willing to use GPU):**
→ Fish Speech V1.5 or Qwen3-TTS

**For Best Balance (quality + ease of use):**
→ Chatterbox (beats ElevenLabs, simple setup)

**For Minimal Hardware (CPU-only):**
→ Kokoro-82M or Piper TTS

**For Ultra-Low Latency Streaming:**
→ CosyVoice2-0.5B (150ms) or Qwen3-TTS (97ms)

**For Emotional/Expressive Speech:**
→ Orpheus 3B or Higgs Audio V2

**For Voice Cloning:**
→ Fish Speech, Chatterbox, or Qwen3-TTS

**For Budget Cloud Alternative (not local):**
→ OpenAI TTS ($15/1M chars vs ElevenLabs $300/1M)

## Linux/WSL2 Compatibility

All researched models support Linux/WSL2:
- CUDA support available for GPU acceleration
- CPU fallback modes available for most
- Python 3.8-3.12 compatibility
- Both pip and conda installation methods
- Docker containers available for many

## Integration Options

Most models support:
- **Python API:** Direct integration via pip packages
- **CLI Tools:** Command-line usage for scripting
- **REST API:** FastAPI/Flask wrappers available
- **Docker:** Containerized deployment
- **WebUI:** Gradio interfaces for testing

## Output Formats

All models support:
- WAV (most common)
- MP3 (via conversion)
- Real-time streaming (advanced models)

## Recommended Implementation Path

1. **Quick Test:** Start with Kokoro-82M (fastest setup, runs on CPU)
2. **Quality Test:** Try Chatterbox (best ElevenLabs alternative)
3. **Advanced Test:** Deploy Fish Speech V1.5 or Qwen3-TTS with GPU
4. **Production:** Based on tests, containerize chosen solution with FastAPI

## Sources

All findings sourced from:
- Official GitHub repositories
- Hugging Face model pages
- TTS Arena leaderboard
- BentoML, SiliconFlow, Modal analysis articles
- Resemble AI, DigitalOcean, DataCamp guides
- Recent Medium and DEV Community articles (Jan 2026)
- OpenAI and ElevenLabs official pricing pages

## Next Steps

User should:
1. Review this research
2. Select model(s) to test based on priorities
3. Set up test environment with chosen model
4. Run quality/performance benchmarks
5. Deploy to production voice server
