#!/bin/bash
# Voice Notification System Diagnostic and Test Script
# This script tests the entire voice notification pipeline

set -e

echo "═══════════════════════════════════════════════════════════"
echo "🎤 VOICE NOTIFICATION SYSTEM DIAGNOSTIC"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if voice server is running
echo "Test 1: Checking voice server status..."
if curl -s http://localhost:8888/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Voice server is running${NC}"
    HEALTH=$(curl -s http://localhost:8888/health)
    echo "   Server details: $HEALTH"
else
    echo -e "${RED}❌ Voice server is NOT running${NC}"
    echo "   Fix: cd /home/michael/tiffany-pai/.claude/voice-server && ./start-voice-server.sh"
    exit 1
fi
echo ""

# Test 2: Check if stop-hook.ts exists and is executable
echo "Test 2: Checking stop-hook.ts..."
STOP_HOOK="/home/michael/tiffany-pai/.claude/hooks/stop-hook.ts"
if [ -x "$STOP_HOOK" ]; then
    echo -e "${GREEN}✅ stop-hook.ts exists and is executable${NC}"
else
    echo -e "${RED}❌ stop-hook.ts is missing or not executable${NC}"
    echo "   Fix: chmod +x $STOP_HOOK"
    exit 1
fi
echo ""

# Test 3: Check if bun is available
echo "Test 3: Checking bun runtime..."
if which bun > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Bun runtime is available: $(which bun)${NC}"
else
    echo -e "${RED}❌ Bun runtime is NOT available${NC}"
    echo "   Fix: Install bun from https://bun.sh"
    exit 1
fi
echo ""

# Test 4: Check settings.json has Stop hook configured
echo "Test 4: Checking settings.json Stop hook configuration..."
SETTINGS="/home/michael/tiffany-pai/.claude/settings.json"
if grep -q "stop-hook.ts" "$SETTINGS" 2>/dev/null; then
    echo -e "${GREEN}✅ Stop hook is configured in settings.json${NC}"
else
    echo -e "${RED}❌ Stop hook is NOT configured in settings.json${NC}"
    echo "   Fix: Add Stop hook to settings.json"
    exit 1
fi
echo ""

# Test 5: Check ElevenLabs API key
echo "Test 5: Checking ElevenLabs API key..."
if [ -f "$HOME/.env" ] && grep -q "ELEVENLABS_API_KEY" "$HOME/.env"; then
    echo -e "${GREEN}✅ ElevenLabs API key is configured in ~/.env${NC}"
else
    echo -e "${YELLOW}⚠️  ElevenLabs API key not found in ~/.env${NC}"
    echo "   This is optional but recommended for voice output"
fi
echo ""

# Test 6: Check audio player availability
echo "Test 6: Checking audio player..."
if which mpg123 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Audio player (mpg123) is available${NC}"
elif which afplay > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Audio player (afplay) is available${NC}"
else
    echo -e "${YELLOW}⚠️  No audio player found (mpg123 or afplay)${NC}"
    echo "   Install: sudo apt-get install mpg123"
fi
echo ""

# Test 7: Send test notification
echo "Test 7: Sending test notification..."
RESPONSE=$(curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Voice notification system test successful!","voice_id":"jqcCZkN6Knx8BJ5TBdYR"}' \
  2>&1)

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Test notification sent successfully${NC}"
    echo "   You should hear: 'Voice notification system test successful!'"
else
    echo -e "${RED}❌ Test notification failed${NC}"
    echo "   Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 8: Check recent voice server logs
echo "Test 8: Checking recent voice server activity..."
if [ -f "/tmp/pai-voice-server.log" ]; then
    echo -e "${GREEN}✅ Voice server log exists${NC}"
    echo "   Recent activity:"
    tail -5 /tmp/pai-voice-server.log | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  Voice server log not found${NC}"
fi
echo ""

# Final summary
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Your voice notification system is configured correctly."
echo ""
echo "If you're still not hearing notifications, check:"
echo "1. Volume is turned up on your system"
echo "2. Tiffany is including the 🎯 COMPLETED line in responses"
echo "3. Check Stop events: tail -f /home/michael/tiffany-pai/.claude/history/raw-outputs/*/$(date +%Y-%m-%d)_all-events.jsonl | grep Stop"
echo ""
echo "To view voice server logs in real-time:"
echo "  tail -f /tmp/pai-voice-server.log"
echo ""
