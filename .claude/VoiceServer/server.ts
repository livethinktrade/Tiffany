#!/usr/bin/env bun
/**
 * Voice Server - Personal AI Voice notification server using ElevenLabs TTS
 */

import { serve } from "bun";
import { spawn } from "child_process";
import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, unlinkSync } from "fs";

const IS_LINUX = process.platform === 'linux';

// Load .env from ~/.claude directory
const envPath = join(homedir(), '.claude', '.env');
if (existsSync(envPath)) {
  const envContent = await Bun.file(envPath).text();
  envContent.split('\n').forEach(line => {
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) return;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    // Strip surrounding quotes (single or double)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && value && !key.startsWith('#')) {
      process.env[key] = value;
    }
  });
}

const PORT = parseInt(process.env.PORT || "8888");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Load voice provider config
let voiceProvider = 'elevenlabs';
let edgeTtsVoice = 'en-US-AvaNeural';
try {
  const configPath = join(homedir(), '.claude', 'VoiceServer', 'config');
  if (existsSync(configPath)) {
    const configContent = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    if (config.voiceProvider) voiceProvider = config.voiceProvider;
    if (config.edgeTts?.voice) edgeTtsVoice = config.edgeTts.voice;
  }
} catch (error) {
  console.warn('⚠️  Failed to load VoiceServer config, using defaults');
}

if (voiceProvider === 'elevenlabs' && !ELEVENLABS_API_KEY) {
  console.error('⚠️  ELEVENLABS_API_KEY not found in ~/.claude/.env');
  console.error('Add: ELEVENLABS_API_KEY=your_key_here');
}

// Load settings.json for DA identity and default voice
let daVoiceId: string | null = null;
let daVoiceProsody: ProsodySettings | null = null;
let daName = "Assistant";
try {
  const settingsPath = join(homedir(), '.claude', 'settings.json');
  if (existsSync(settingsPath)) {
    const settingsContent = readFileSync(settingsPath, 'utf-8');
    const settings = JSON.parse(settingsContent);
    if (settings.daidentity?.voiceId) {
      daVoiceId = settings.daidentity.voiceId;
      console.log(`✅ Loaded DA voice ID from settings.json`);
    }
    if (settings.daidentity?.name) {
      daName = settings.daidentity.name;
    }
    if (settings.daidentity?.voice) {
      daVoiceProsody = settings.daidentity.voice as ProsodySettings;
      console.log(`✅ Loaded DA voice prosody from settings.json`);
    }
  }
} catch (error) {
  console.warn('⚠️  Failed to load DA voice settings from settings.json');
}

if (!daVoiceId) {
  console.warn('⚠️  No voiceId configured in settings.json daidentity section');
  console.warn('   Add: "daidentity": { "voiceId": "your_elevenlabs_voice_id" }');
}

// Default voice ID from settings.json or environment variable
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || daVoiceId || "";

// Voice configuration types
interface ProsodySettings {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
  use_speaker_boost: boolean;
  volume?: number;  // Playback volume (0.0-1.0), optional
}

interface VoiceConfig {
  voice_id: string;
  voice_name: string;
  stability: number;
  similarity_boost: number;
  style?: number;
  speed?: number;
  use_speaker_boost?: boolean;
  prosody?: ProsodySettings;
  description: string;
  type: string;
}

interface VoicesConfig {
  voices: Record<string, VoiceConfig>;
}

// Default voice settings (ElevenLabs API defaults)
const DEFAULT_PROSODY: ProsodySettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  speed: 1.0,
  use_speaker_boost: true,
};

// Load voices configuration from CORE skill (canonical source for agent voices)
let voicesConfig: VoicesConfig | null = null;
try {
  const corePersonalitiesPath = join(homedir(), '.claude', 'skills', 'CORE', 'SYSTEM', 'AGENTPERSONALITIES.md');
  if (existsSync(corePersonalitiesPath)) {
    const markdownContent = readFileSync(corePersonalitiesPath, 'utf-8');
    // Extract JSON block from markdown
    const jsonMatch = markdownContent.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      voicesConfig = JSON.parse(jsonMatch[1]);
      console.log('✅ Loaded agent voice personalities from AGENTPERSONALITIES.md');
    }
  }
} catch (error) {
  console.warn('⚠️  Failed to load agent voice personalities');
}

// Load user pronunciation customizations
let pronunciations: Record<string, string> = {};
try {
  const pronunciationsPath = join(homedir(), '.claude', 'skills', 'CORE', 'USER', 'pronunciations.json');
  if (existsSync(pronunciationsPath)) {
    const content = readFileSync(pronunciationsPath, 'utf-8');
    pronunciations = JSON.parse(content);
    console.log(`✅ Loaded ${Object.keys(pronunciations).length} pronunciation(s) from USER config`);
  }
} catch (error) {
  console.warn('⚠️  Failed to load pronunciation customizations');
}

// Apply pronunciation substitutions to text before TTS
function applyPronunciations(text: string): string {
  let result = text;
  for (const [term, pronunciation] of Object.entries(pronunciations)) {
    // Case-insensitive replacement with word boundaries
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    result = result.replace(regex, pronunciation);
  }
  return result;
}

// Escape special characters for AppleScript
function escapeForAppleScript(input: string): string {
  // Escape backslashes first, then double quotes
  return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Strip any bracket markers from message (legacy cleanup)
function stripMarkers(message: string): string {
  return message.replace(/\[[^\]]*\]/g, '').trim();
}

// Get voice configuration by voice ID or agent name
function getVoiceConfig(identifier: string): VoiceConfig | null {
  if (!voicesConfig) return null;

  // Try direct agent name lookup
  if (voicesConfig.voices[identifier]) {
    return voicesConfig.voices[identifier];
  }

  // Try voice_id lookup
  for (const config of Object.values(voicesConfig.voices)) {
    if (config.voice_id === identifier) {
      return config;
    }
  }

  return null;
}

// Sanitize input for TTS and notifications - allow natural speech punctuation
function sanitizeForSpeech(input: string): string {
  // Allow: letters, numbers, spaces, common punctuation for natural speech
  // Explicitly block: shell metacharacters, path traversal, script tags, markdown
  const cleaned = input
    .replace(/<script/gi, '')  // Remove script tags
    .replace(/\.\.\//g, '')     // Remove path traversal
    .replace(/[;&|><`$\\]/g, '') // Remove shell metacharacters
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // Strip bold markdown: **text** → text
    .replace(/\*([^*]+)\*/g, '$1')       // Strip italic markdown: *text* → text
    .replace(/`([^`]+)`/g, '$1')         // Strip inline code: `text` → text
    .replace(/#{1,6}\s+/g, '')           // Strip markdown headers: ### → (empty)
    .trim()
    .substring(0, 500);

  return cleaned;
}

// Validate user input - check for obviously malicious content
function validateInput(input: any): { valid: boolean; error?: string; sanitized?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Invalid input type' };
  }

  if (input.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }

  // Sanitize and check if anything remains
  const sanitized = sanitizeForSpeech(input);

  if (!sanitized || sanitized.length === 0) {
    return { valid: false, error: 'Message contains no valid content after sanitization' };
  }

  return { valid: true, sanitized };
}

// Generate speech using Edge TTS CLI
async function generateSpeechEdgeTTS(text: string, voice?: string): Promise<string> {
  const selectedVoice = voice || edgeTtsVoice;
  const tempFile = `/tmp/voice-${Date.now()}.mp3`;

  return new Promise((resolve, reject) => {
    const proc = spawn('edge-tts', [
      '--voice', selectedVoice,
      '--text', text,
      '--write-media', tempFile,
    ]);

    let stderr = '';
    proc.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('error', (error) => {
      reject(new Error(`Edge TTS spawn error: ${error.message}`));
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve(tempFile);
      } else {
        reject(new Error(`Edge TTS exited with code ${code}: ${stderr}`));
      }
    });
  });
}

// Generate speech using ElevenLabs API with full prosody support
async function generateSpeech(
  text: string,
  voiceId: string,
  prosody?: Partial<ProsodySettings>
): Promise<ArrayBuffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  // Merge provided prosody with defaults
  const settings = { ...DEFAULT_PROSODY, ...prosody };

  // ElevenLabs API voice_settings format (speed goes INSIDE voice_settings)
  const voiceSettings = {
    stability: settings.stability,
    similarity_boost: settings.similarity_boost,
    style: settings.style,
    speed: settings.speed, // Speed belongs in voice_settings, not top-level
    use_speaker_boost: settings.use_speaker_boost,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  return await response.arrayBuffer();
}

// Get volume setting from DA config or request (defaults to 1.0 = 100%)
function getVolumeSetting(requestVolume?: number): number {
  // Request volume takes priority
  if (typeof requestVolume === 'number' && requestVolume >= 0 && requestVolume <= 1) {
    return requestVolume;
  }
  // Then DA voice config from settings.json
  if (daVoiceProsody?.volume !== undefined && daVoiceProsody.volume >= 0 && daVoiceProsody.volume <= 1) {
    return daVoiceProsody.volume;
  }
  return 1.0; // Default to full volume
}

// Play an audio file using platform-appropriate player
async function playAudioFile(filePath: string, requestVolume?: number): Promise<void> {
  const volume = getVolumeSetting(requestVolume);

  return new Promise((resolve, reject) => {
    let proc;
    if (IS_LINUX) {
      // mpg123 -f takes volume as 0-32768 (linear scale)
      const mpg123Volume = Math.round(volume * 32768);
      proc = spawn('mpg123', ['-q', '-f', mpg123Volume.toString(), filePath]);
    } else {
      // afplay -v takes a value from 0.0 to 1.0
      proc = spawn('/usr/bin/afplay', ['-v', volume.toString(), filePath]);
    }

    proc.on('error', (error) => {
      console.error('Error playing audio:', error);
      reject(error);
    });

    proc.on('exit', (code) => {
      // Clean up temp file
      try { unlinkSync(filePath); } catch {}

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Audio player exited with code ${code}`));
      }
    });
  });
}

// Play audio from buffer (writes to temp file then plays)
async function playAudio(audioBuffer: ArrayBuffer, requestVolume?: number): Promise<void> {
  const tempFile = `/tmp/voice-${Date.now()}.mp3`;
  await Bun.write(tempFile, audioBuffer);
  return playAudioFile(tempFile, requestVolume);
}

// Spawn a process safely
function spawnSafe(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);

    proc.on('error', (error) => {
      console.error(`Error spawning ${command}:`, error);
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

// Send macOS notification with voice
async function sendNotification(
  title: string,
  message: string,
  voiceEnabled = true,
  voiceId: string | null = null,
  requestProsody?: Partial<ProsodySettings>
) {
  // Validate and sanitize inputs
  const titleValidation = validateInput(title);
  const messageValidation = validateInput(message);

  if (!titleValidation.valid) {
    throw new Error(`Invalid title: ${titleValidation.error}`);
  }

  if (!messageValidation.valid) {
    throw new Error(`Invalid message: ${messageValidation.error}`);
  }

  // Use pre-sanitized values from validation
  const safeTitle = titleValidation.sanitized!;
  let safeMessage = stripMarkers(messageValidation.sanitized!);

  // Generate and play voice
  if (voiceEnabled) {
    const spokenMessage = applyPronunciations(safeMessage);
    let played = false;

    // Try primary provider
    if (voiceProvider === 'edge-tts') {
      try {
        console.log(`🎙️  Generating speech via Edge TTS (voice: ${edgeTtsVoice})`);
        const audioFile = await generateSpeechEdgeTTS(spokenMessage);
        const volume = requestProsody?.volume ?? daVoiceProsody?.volume;
        await playAudioFile(audioFile, volume);
        played = true;
      } catch (error) {
        console.error("Edge TTS failed:", error);
        console.log("🔄 Falling back to ElevenLabs...");
      }
    }

    // Try ElevenLabs (primary or fallback)
    if (!played && ELEVENLABS_API_KEY) {
      try {
        const voice = voiceId || DEFAULT_VOICE_ID;
        const voiceConfig = getVoiceConfig(voice);

        let prosody: Partial<ProsodySettings> = {};
        if (voiceConfig) {
          if (voiceConfig.prosody) {
            prosody = voiceConfig.prosody;
          } else {
            prosody = {
              stability: voiceConfig.stability,
              similarity_boost: voiceConfig.similarity_boost,
              style: voiceConfig.style ?? DEFAULT_PROSODY.style,
              speed: voiceConfig.speed ?? DEFAULT_PROSODY.speed,
              use_speaker_boost: voiceConfig.use_speaker_boost ?? DEFAULT_PROSODY.use_speaker_boost,
            };
          }
          console.log(`👤 Voice: ${voiceConfig.description}`);
        } else if (voice === DEFAULT_VOICE_ID && daVoiceProsody) {
          prosody = daVoiceProsody;
          console.log(`👤 Voice: DA default`);
        }

        if (requestProsody) {
          prosody = { ...prosody, ...requestProsody };
        }

        const settings = { ...DEFAULT_PROSODY, ...prosody };
        const volume = (prosody as any)?.volume ?? daVoiceProsody?.volume;
        console.log(`🎙️  Generating speech via ElevenLabs (voice: ${voice}, stability: ${settings.stability}, style: ${settings.style}, speed: ${settings.speed}, volume: ${volume ?? 1.0})`);

        const audioBuffer = await generateSpeech(spokenMessage, voice, prosody);
        await playAudio(audioBuffer, volume);
        played = true;
      } catch (error) {
        console.error("ElevenLabs failed:", error);
      }
    }

    if (!played) {
      console.error("⚠️  No TTS provider succeeded");
    }
  }

  // Display notification (macOS only - osascript not available on Linux)
  if (!IS_LINUX) {
    try {
      const escapedTitle = escapeForAppleScript(safeTitle);
      const escapedMessage = escapeForAppleScript(safeMessage);
      const script = `display notification "${escapedMessage}" with title "${escapedTitle}" sound name ""`;
      await spawnSafe('/usr/bin/osascript', ['-e', script]);
    } catch (error) {
      console.error("Notification display error:", error);
    }
  } else {
    console.log(`📢 ${safeTitle}: ${safeMessage}`);
  }
}

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Start HTTP server
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    const clientIp = req.headers.get('x-forwarded-for') || 'localhost';

    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ status: "error", message: "Rate limit exceeded" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429
        }
      );
    }

    if (url.pathname === "/notify" && req.method === "POST") {
      try {
        const data = await req.json();
        const title = data.title || "PAI Notification";
        const message = data.message || "Task completed";
        const voiceEnabled = data.voice_enabled !== false;
        const voiceId = data.voice_id || data.voice_name || null; // Support both voice_id and voice_name

        // Accept prosody settings directly in request (for custom agents)
        // Also accept volume at top level for convenience
        const voiceSettings: Partial<ProsodySettings> | undefined = data.voice_settings
          ? { ...data.voice_settings, volume: data.volume ?? data.voice_settings.volume }
          : data.volume !== undefined
            ? { volume: data.volume }
            : undefined;

        if (voiceId && typeof voiceId !== 'string') {
          throw new Error('Invalid voice_id');
        }

        console.log(`📨 Notification: "${title}" - "${message}" (voice: ${voiceEnabled}, voiceId: ${voiceId || DEFAULT_VOICE_ID})`);

        await sendNotification(title, message, voiceEnabled, voiceId, voiceSettings);

        return new Response(
          JSON.stringify({ status: "success", message: "Notification sent" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      } catch (error: any) {
        console.error("Notification error:", error);
        return new Response(
          JSON.stringify({ status: "error", message: error.message || "Internal server error" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: error.message?.includes('Invalid') ? 400 : 500
          }
        );
      }
    }

    if (url.pathname === "/pai" && req.method === "POST") {
      try {
        const data = await req.json();
        const title = data.title || "PAI Assistant";
        const message = data.message || "Task completed";

        console.log(`🤖 PAI notification: "${title}" - "${message}"`);

        await sendNotification(title, message, true, null);

        return new Response(
          JSON.stringify({ status: "success", message: "PAI notification sent" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      } catch (error: any) {
        console.error("PAI notification error:", error);
        return new Response(
          JSON.stringify({ status: "error", message: error.message || "Internal server error" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: error.message?.includes('Invalid') ? 400 : 500
          }
        );
      }
    }

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          port: PORT,
          platform: IS_LINUX ? "linux" : "macos",
          voice_system: voiceProvider,
          voice_name: voiceProvider === 'edge-tts' ? edgeTtsVoice : DEFAULT_VOICE_ID,
          default_voice_id: DEFAULT_VOICE_ID,
          api_key_configured: !!ELEVENLABS_API_KEY
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    return new Response("Voice Server - POST to /notify or /pai", {
      headers: corsHeaders,
      status: 200
    });
  },
});

console.log(`🚀 Voice Server running on port ${PORT}`);
console.log(`🖥️  Platform: ${IS_LINUX ? 'Linux/WSL2' : 'macOS'}`);
if (voiceProvider === 'edge-tts') {
  console.log(`🎙️  Using Edge TTS (voice: ${edgeTtsVoice})`);
  if (ELEVENLABS_API_KEY) console.log(`🔄 ElevenLabs available as fallback`);
} else {
  console.log(`🎙️  Using ElevenLabs TTS (default voice: ${DEFAULT_VOICE_ID})`);
}
console.log(`📡 POST to http://localhost:${PORT}/notify`);
console.log(`🔒 Security: CORS restricted to localhost, rate limiting enabled`);
console.log(`🔑 API Key: ${ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Missing'}`);
