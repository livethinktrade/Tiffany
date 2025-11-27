#!/bin/bash

# PAI Voice Server Startup Script for Linux/WSL
# Starts the voice server in the background if not already running

VOICE_SERVER_DIR="/home/michael/tiffany-pai/.claude/voice-server"
PIDFILE="/tmp/pai-voice-server.pid"

# Check if server is already running
if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
    echo "✅ Voice server is already running (PID: $(cat "$PIDFILE"))"
    exit 0
fi

# Start the server in background
cd "$VOICE_SERVER_DIR"
bun run server.ts > /tmp/pai-voice-server.log 2>&1 &
SERVER_PID=$!

# Save PID
echo $SERVER_PID > "$PIDFILE"

# Wait a moment and verify it's running
sleep 2
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Voice server started successfully (PID: $SERVER_PID)"
    echo "📡 Listening on http://localhost:8888"
    echo "📝 Logs: /tmp/pai-voice-server.log"
else
    echo "❌ Failed to start voice server"
    rm -f "$PIDFILE"
    exit 1
fi
