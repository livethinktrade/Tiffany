#!/usr/bin/env bun
/**
 * Manual Voice Server Startup Script
 * Usage: bun ./.claude/commands/start-voice-server.ts
 */

import { spawn } from "child_process";
import { homedir } from "os";
import { join } from "path";

const PAI_HOME = process.env.PAI_HOME || join(homedir(), 'tiffany-pai');

async function isVoiceServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8888/health', {
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function startVoiceServer(): Promise<void> {
  console.log('🚀 Starting Kai voice server...');

  const serverPath = join(PAI_HOME, '.claude/voice-server/server.ts');
  const proc = spawn('bun', [serverPath], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: PAI_HOME,
    env: { ...process.env, PAI_HOME }
  });

  // Show startup output briefly
  proc.stdout?.on('data', (data) => {
    console.log(data.toString());
  });

  proc.stderr?.on('data', (data) => {
    console.error(data.toString());
  });

  proc.unref(); // Allow parent to exit without waiting

  // Wait for server to start
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (await isVoiceServerRunning()) {
      console.log('✅ Voice server started successfully on port 8888');
      console.log('🎙️  ElevenLabs TTS enabled with Kai voice');
      return;
    }
  }

  throw new Error('Voice server failed to start after 5 seconds');
}

async function main() {
  try {
    if (await isVoiceServerRunning()) {
      console.log('✅ Voice server already running on port 8888');

      // Test with a notification
      const response = await fetch('http://localhost:8888/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Voice Server',
          message: 'Voice server is already running',
          voice_enabled: true
        })
      });

      if (response.ok) {
        console.log('🔊 Voice test sent');
      }

      return;
    }

    await startVoiceServer();

    // Send test notification
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await fetch('http://localhost:8888/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Voice Server Started',
        message: 'Kai voice server is now running',
        voice_enabled: true,
        voice_id: 'jqcCZkN6Knx8BJ5TBdYR'
      })
    });

    if (response.ok) {
      console.log('🔊 Startup notification sent');
    }

  } catch (error) {
    console.error('❌ Error starting voice server:', error);
    process.exit(1);
  }
}

main();