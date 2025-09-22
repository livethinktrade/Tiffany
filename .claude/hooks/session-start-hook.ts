#!/usr/bin/env bun
import { spawn } from "child_process";
import { homedir } from "os";
import { join } from "path";

const PAI_HOME = process.env.PAI_HOME || join(homedir(), 'tiffany-pai');

async function isVoiceServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8888/health', {
      signal: AbortSignal.timeout(1000)
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
    stdio: 'ignore',
    cwd: PAI_HOME,
    env: { ...process.env, PAI_HOME }
  });

  proc.unref(); // Allow parent to exit without waiting

  // Wait for server to start
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (await isVoiceServerRunning()) {
      console.log('✅ Voice server started successfully');
      return;
    }
  }

  throw new Error('Voice server failed to start after 5 seconds');
}

async function sendNotification(title: string, message: string, priority: string = 'normal') {
  try {
    const response = await fetch('http://localhost:8888/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        message,
        voice_enabled: true,
        priority,
        voice_id: 'jqcCZkN6Knx8BJ5TBdYR'  // Kai's voice ID
      }),
    });

    if (!response.ok) {
      console.error(`Notification failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

async function main() {
  try {
    // Check if voice server is already running
    if (!(await isVoiceServerRunning())) {
      await startVoiceServer();
    } else {
      console.log('✅ Voice server already running');
    }

    // Send startup notification
    const message = `Kai here, ready to go.`;
    await sendNotification('Kai Systems Initialized', message, 'low');
    process.exit(0);
  } catch (error) {
    console.error('SessionStart hook error:', error);
    process.exit(1);
  }
}

main();