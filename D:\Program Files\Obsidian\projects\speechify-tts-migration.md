# Speechify TTS Migration Project

**Status**: 🟡 Planned (Non-urgent, Fun Project)
**Priority**: Low
**Estimated Effort**: 2-4 hours
**Created**: 2025-12-18

---

## 🎯 Goal

Migrate PAI voice server from ElevenLabs TTS API to Speechify TTS API for cost savings, improved features, and lower latency.

---

## 💡 Why Speechify?

### Cost Savings
- **Speechify**: $10 per 1M characters (~2,000 minutes of audio)
- **ElevenLabs**: (Compare current pricing)
- **Result**: Potentially significant savings depending on usage

### Performance
- **Latency**: 300ms from input to audio generation
- **Streaming**: HTTP chunked transfer encoding for real-time audio
- **Formats**: PCM and MP3 support

### Features
- **SSML Support**: Better prosody control (pitch, rate, volume, emphasis, pauses)
- **Voice Cloning**: Create custom voices from audio samples
- **Emotion Control**: Precisely control voice emotion
- **Multilingual**: simba-turbo model with locale support

---

## 📋 Current Implementation

**File**: `/home/michael/tiffany-pai/.claude/voice-server/server.ts`

**Current Stack**:
- ElevenLabs API endpoint: `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}`
- Auth: `xi-api-key` header with Bearer token
- Model: `eleven_multilingual_v2`
- Default voice: Kai (jqcCZkN6Knx8BJ5TBdYR)
- Audio format: audio/mpeg
- Playback: afplay (macOS) / mpg123 (Linux/WSL)

**Voice Profiles** (8 agents):
- Kai: Jamie (Premium) - UK Male
- Researcher: Ava (Premium) - US Female
- Engineer: Zoe (Premium) - US Female
- Architect: Serena (Premium) - UK Female
- Designer/Artist: Isha (Premium) - Indian Female
- Pentester: Oliver (Enhanced) - UK Male
- Writer: Serena (Premium) - UK Female

---

## 🔧 Migration Checklist

### Phase 1: Setup & Research (30 min)
- [x] Get Speechify API key (already done!)
- [ ] Sign up at [console.sws.speechify.com](https://console.sws.speechify.com/)
- [ ] Test basic API request with curl
- [ ] Document API key in `~/.env` as `SPEECHIFY_API_KEY`

### Phase 2: Voice Mapping (30-45 min)
- [ ] Fetch available Speechify voices via `/v1/voices/list` endpoint
- [ ] Listen to voice samples
- [ ] Map 8 agent voices to Speechify equivalents:
  - [ ] Kai (UK Male, professional, conversational)
  - [ ] Researcher (US Female, analytical)
  - [ ] Engineer (US Female, steady, professional)
  - [ ] Architect (UK Female, strategic, sophisticated)
  - [ ] Designer/Artist (Indian Female, creative)
  - [ ] Pentester (UK Male, technical, sharp)
  - [ ] Writer (UK Female, articulate, warm)
- [ ] Update `/home/michael/tiffany-pai/.claude/voice-server/voices.json`

### Phase 3: Code Changes (1-2 hours)

#### Environment Variables
```bash
# ~/.env updates
SPEECHIFY_API_KEY=your_key_here
SPEECHIFY_VOICE_ID=default_voice_id
SPEECHIFY_MODEL=simba-turbo  # or appropriate model
```

#### Server.ts Changes

**1. Update Constants (Line 25-37)**
```typescript
const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY;
const DEFAULT_VOICE_ID = process.env.SPEECHIFY_VOICE_ID || "default_voice";
const DEFAULT_MODEL = process.env.SPEECHIFY_MODEL || "simba-turbo";
```

**2. Update generateSpeech() function (Line 69-104)**
- Change endpoint: `https://api.sws.speechify.com/v1/audio/speech`
- Update auth header: `Authorization: Bearer ${SPEECHIFY_API_KEY}`
- Update request body format (verify exact parameters from Speechify docs)
- Handle new response format

**3. Optional: Add OAuth Token Refresh**
```typescript
// Implement token refresh logic if using OAuth instead of API key
async function getAccessToken(): Promise<string> {
  const response = await fetch('https://api.sws.speechify.com/v1/auth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SPEECHIFY_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=audio:speech'
  });
  const data = await response.json();
  return data.access_token;
}
```

**4. Update Health Check (Line 330-345)**
```typescript
voice_system: "Speechify",
model: DEFAULT_MODEL,
api_key_configured: !!SPEECHIFY_API_KEY
```

### Phase 4: Testing (1 hour)
- [ ] Test basic notification with default voice
- [ ] Test all 8 agent voice profiles
- [ ] Compare audio quality vs ElevenLabs
- [ ] Test error handling
- [ ] Test rate limiting
- [ ] Verify macOS and Linux/WSL playback
- [ ] Test streaming endpoint (optional)

### Phase 5: Documentation (15 min)
- [ ] Update `/home/michael/tiffany-pai/.claude/voice-server/README.md`
- [ ] Update `/home/michael/tiffany-pai/.claude/voice-server/QUICKSTART.md`
- [ ] Document voice ID mappings
- [ ] Update troubleshooting guide if needed

---

## 📚 API Reference

### Authentication
```bash
# API Key (Simple - Recommended for server-side)
Authorization: Bearer YOUR_API_KEY

# OAuth Access Token (Advanced - Better for production)
curl -X POST https://api.sws.speechify.com/v1/auth/token \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&scope=audio:speech"
```

### Core Endpoints
- `POST /v1/audio/speech` - Generate complete audio file
- `POST /v1/audio/stream` - Stream audio with chunked transfer
- `GET /v1/voices/list` - List available voices
- `POST /v1/voices/create` - Create custom voice from audio sample
- `POST /v1/auth/token` - Generate OAuth access token

### OAuth Scopes
- `audio:speech` - Generate speech audio
- `audio:stream` - Stream speech audio
- `audio:all` - All audio operations
- `voices:read` - List available voices
- `voices:create` - Create personal voices
- `voices:delete` - Delete personal voices
- `voices:all` - All voice operations

---

## ⚠️ Considerations

### Before Migration
1. **Voice Quality**: Test Speechify voices to ensure they meet quality standards
2. **Latency**: Verify 300ms claim in real-world usage
3. **Reliability**: Speechify API is newer than ElevenLabs - monitor uptime
4. **Voice Availability**: Confirm all 8 agent voice equivalents exist

### During Migration
1. **Keep ElevenLabs as Fallback**: Don't delete ElevenLabs code initially
2. **Feature Flag**: Add environment variable to switch between providers
3. **Gradual Rollout**: Test with one voice profile first, then expand

### Post-Migration
1. **Monitor Usage**: Track actual cost savings
2. **Quality Feedback**: Gather feedback on voice quality
3. **Performance**: Measure actual latency improvements
4. **Reliability**: Monitor API uptime and error rates

---

## 🔗 Resources

### Documentation
- [Speechify API Overview](https://docs.sws.speechify.com/)
- [Authentication Guide](https://docs.sws.speechify.com/v1/docs/get-started/authentication)
- [TTS Documentation](https://docs.speechify.ai/tts/overview)
- [API Console](https://console.sws.speechify.com/)

### Current Implementation
- Voice Server: `/home/michael/tiffany-pai/.claude/voice-server/server.ts:69-104`
- Voice Config: `/home/michael/tiffany-pai/.claude/voice-server/voices.json`
- Installation: `/home/michael/tiffany-pai/.claude/voice-server/README.md`

---

## 🎨 Optional Enhancements

### SSML Support (adds 1 hour)
Enable advanced prosody control:
```xml
<speak>
  <prosody rate="fast" pitch="high">This is fast and high-pitched.</prosody>
  <break time="500ms"/>
  <prosody rate="slow" volume="soft">This is slow and soft.</prosody>
</speak>
```

### Custom Voice Cloning (adds 2 hours)
Create personalized voices:
1. Record 30-60 seconds of audio
2. POST to `/v1/voices/create` with audio sample
3. Use returned voice_id in notifications

### Streaming Implementation (adds 2 hours)
Reduce perceived latency with HTTP chunked transfer:
1. Switch to `/v1/audio/stream` endpoint
2. Handle chunked response
3. Stream directly to audio player

### Multi-Provider Fallback (adds 2 hours)
Build resilient system:
1. Abstract TTS interface
2. Implement ElevenLabs and Speechify providers
3. Auto-fallback on errors
4. Load balancing between providers

---

## 🎯 Success Criteria

- [ ] All 8 voice profiles working with Speechify
- [ ] Audio quality meets or exceeds ElevenLabs
- [ ] Latency is ≤300ms (measure actual)
- [ ] Cost per character is $10/1M chars
- [ ] Zero downtime during migration
- [ ] Fallback to ElevenLabs if needed
- [ ] Documentation updated

---

## 📝 Notes

- API key already obtained and configured
- This is a non-urgent, fun project - no deadline pressure
- Keep it simple: Start with API key auth, not OAuth
- Test thoroughly before fully switching
- Consider keeping both providers as options

---

**Next Action**: When ready to start, begin with Phase 2 (Voice Mapping) to find equivalent voices.
