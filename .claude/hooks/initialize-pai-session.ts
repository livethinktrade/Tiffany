#!/usr/bin/env bun

/**
 * initialize-pai-session.ts
 *
 * Main PAI session initialization hook that runs at the start of every Claude Code session.
 *
 * What it does:
 * - Checks if this is a subagent session (skips for subagents)
 * - **Auto-starts voice server if not running** (eliminates manual debugging)
 * - Tests that stop-hook is properly configured
 * - Sets initial terminal tab title
 * - Sends voice notification that system is ready
 * - Calls load-core-context.ts to inject PAI context into the session
 *
 * Voice Server Auto-Start:
 * - Checks if voice server is responding on http://localhost:8888/health
 * - If not, automatically runs ${PAI_DIR}/voice-server/start-voice-server.sh
 * - Verifies successful startup before proceeding
 * - Eliminates need for manual debugging and token waste
 *
 * Setup:
 * 1. Set environment variables in settings.json:
 *    - DA: Your AI's name (e.g., "Kai", "Nova", "Assistant")
 *    - DA_VOICE_ID: Your ElevenLabs voice ID (if using voice system)
 *    - PAI_DIR: Path to your PAI directory (defaults to $HOME/.claude)
 * 2. Ensure load-core-context.ts exists in hooks/ directory
 * 3. Add both hooks to SessionStart in settings.json
 */

import { existsSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import { PAI_DIR } from './lib/pai-paths';

// Debounce duration in milliseconds (prevents duplicate SessionStart events)
const DEBOUNCE_MS = 2000;
const LOCKFILE = join(tmpdir(), 'pai-session-start.lock');
const VOICE_SERVER_PID_FILE = '/tmp/pai-voice-server.pid';

async function sendNotification(title: string, message: string, priority: string = 'normal') {
  try {
    // Get voice ID from environment variable (customize in settings.json)
    const voiceId = process.env.DA_VOICE_ID || 'default-voice-id';

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
        voice_id: voiceId
      }),
    });

    if (!response.ok) {
      console.error(`Notification failed: ${response.status}`);
    }
  } catch (error) {
    // Silently fail if voice server isn't running
    // console.error('Failed to send notification:', error);
  }
}

/**
 * Check if we're within the debounce window to prevent duplicate notifications
 * from the IDE firing multiple SessionStart events
 */
function shouldDebounce(): boolean {
  try {
    if (existsSync(LOCKFILE)) {
      const lockContent = readFileSync(LOCKFILE, 'utf-8');
      const lockTime = parseInt(lockContent, 10);
      const now = Date.now();

      if (now - lockTime < DEBOUNCE_MS) {
        // Within debounce window, skip this notification
        return true;
      }
    }

    // Update lockfile with current timestamp
    writeFileSync(LOCKFILE, Date.now().toString());
    return false;
  } catch (error) {
    // If any error, just proceed (don't break session start)
    try {
      writeFileSync(LOCKFILE, Date.now().toString());
    } catch {}
    return false;
  }
}

async function testStopHook() {
  const stopHookPath = join(PAI_DIR, 'hooks/stop-hook.ts');

  console.error('\n🔍 Testing stop-hook configuration...');

  // Check if stop-hook exists
  if (!existsSync(stopHookPath)) {
    console.error('❌ Stop-hook NOT FOUND at:', stopHookPath);
    return false;
  }

  // Check if stop-hook is executable
  try {
    const stats = statSync(stopHookPath);
    const isExecutable = (stats.mode & 0o111) !== 0;

    if (!isExecutable) {
      console.error('❌ Stop-hook exists but is NOT EXECUTABLE');
      return false;
    }

    console.error('✅ Stop-hook found and is executable');

    // Set initial tab title (customize with your AI's name via DA env var)
    const daName = process.env.DA || 'AI Assistant';
    const tabTitle = `${daName} Ready`;

    process.stderr.write(`\x1b]0;${tabTitle}\x07`);
    process.stderr.write(`\x1b]2;${tabTitle}\x07`);
    process.stderr.write(`\x1b]30;${tabTitle}\x07`);
    console.error(`📍 Set initial tab title: "${tabTitle}"`);

    return true;
  } catch (e) {
    console.error('❌ Error checking stop-hook:', e);
    return false;
  }
}

/**
 * Check if voice server is running and start it if not
 */
async function ensureVoiceServerRunning(): Promise<boolean> {
  try {
    // First check if server is responding
    const healthCheck = await fetch('http://localhost:8888/health', {
      signal: AbortSignal.timeout(1000)
    }).catch(() => null);

    if (healthCheck?.ok) {
      console.error('✅ Voice server already running');
      return true;
    }

    console.error('🔄 Voice server not responding, starting...');

    // Voice server not running, start it
    const voiceServerScript = join(PAI_DIR, 'voice-server/start-voice-server.sh');

    if (!existsSync(voiceServerScript)) {
      console.error('❌ Voice server start script not found:', voiceServerScript);
      return false;
    }

    // Start the voice server in background
    const child = spawn(voiceServerScript, [], {
      detached: true,
      stdio: 'ignore',
      shell: true
    });

    child.unref();

    // Wait briefly for server to start, then verify
    await new Promise(resolve => setTimeout(resolve, 2000));

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

async function main() {
  try {
    // Check if this is a subagent session - if so, exit silently
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      // This is a subagent session - exit silently without notification
      console.error('🤖 Subagent session detected - skipping session initialization');
      process.exit(0);
    }

    // Check debounce to prevent duplicate voice notifications
    // (IDE extension can fire multiple SessionStart events)
    if (shouldDebounce()) {
      console.error('🔇 Debouncing duplicate SessionStart event');
      process.exit(0);
    }

    // Ensure voice server is running BEFORE attempting notifications
    await ensureVoiceServerRunning();

    // Test stop-hook first (only for main sessions)
    const stopHookOk = await testStopHook();

    const daName = process.env.DA || 'AI Assistant';
    const message = `${daName} here, ready to go.`;

    if (!stopHookOk) {
      console.error('\n⚠️ STOP-HOOK ISSUE DETECTED - Tab titles may not update automatically');
    }

    // Note: PAI core context loading is handled by load-core-context.ts hook
    // which should run BEFORE this hook in settings.json SessionStart hooks

    await sendNotification(`${daName} Systems Initialized`, message, 'low');
    process.exit(0);
  } catch (error) {
    console.error('SessionStart hook error:', error);
    process.exit(1);
  }
}

main();
