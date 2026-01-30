# ClawdBot Setup Notes

**Date**: 2026-01-25
**VPS**: root@167.88.42.12 (Hostinger - srv816737)

## Model Configuration

### Set Default Model
```bash
clawdbot models set openrouter/minimax/minimax-m2.1
```

### Current Configuration
- **Default model**: `openrouter/minimax/minimax-m2.1`
- **Provider**: OpenRouter
- **Fallbacks**: 9 models configured (Claude Opus/Haiku, DeepSeek, Gemini, Grok)
- **Config file**: `~/.clawdbot/clawdbot.json`
- **Agent directory**: `~/.clawdbot/agents/main/agent`

### Verify Configuration
```bash
clawdbot models status
```

## Key Setup Details

### Installation
- **Node.js version**: v22.22.0 (required >=22.0.0)
- **ClawdBot version**: 2026.1.24-3
- **Installation method**: `npm install -g clawdbot@latest`

### Telegram Configuration
- **Bot name**: Tiffany Accountability (@tiffany_eabot)
- **Bot token**: 8161323254:AAFnWrxVwdQris3IpYg1YMVZ0evzCL6Oo-g
- **Channel status**: Configured and working
- **Webhook**: Removed from N8N, ClawdBot using long-polling

### Authentication
- **Method**: OpenRouter API key
- **Provider**: openrouter
- **Auth profile location**: `~/.clawdbot/agents/main/agent/auth-profiles.json`

### Gateway
- **Mode**: local
- **Bind**: loopback (127.0.0.1)
- **Port**: 18789
- **Service**: systemd (enabled, running)
- **Service file**: `/root/.config/systemd/user/clawdbot-gateway.service`

## Important Commands

### Service Management
```bash
# Start gateway
clawdbot gateway start

# Restart gateway
clawdbot gateway restart

# Check status
clawdbot status

# Check health
clawdbot health

# View logs
clawdbot logs --follow
```

### Pairing Management
```bash
# List pairing requests
clawdbot pairing list telegram

# Approve pairing
clawdbot pairing approve telegram <code>
```

### Model Management
```bash
# Set default model
clawdbot models set <model>

# View model status
clawdbot models status

# List available models
clawdbot models list
```

### Configuration
```bash
# Interactive configuration
clawdbot configure

# Get config value
clawdbot config get <key>

# Set config value
clawdbot config set <key> <value>
```

## Troubleshooting Notes

### Webhook Conflict
- **Issue**: Telegram webhook was pointing to N8N instead of ClawdBot
- **Solution**:
  ```bash
  curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
  ```
- **Result**: ClawdBot now uses long-polling mode

### Token Mismatch Error
- **Issue**: `gateway token mismatch (set gateway.remote.token to match gateway.auth.token)`
- **Solution**:
  ```bash
  AUTH_TOKEN=$(clawdbot config get gateway.auth.token)
  clawdbot config set gateway.remote.token "$AUTH_TOKEN"
  clawdbot gateway restart
  ```

### Node.js Version
- **Issue**: ClawdBot requires Node.js >=22.0.0
- **Solution**:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install nodejs -y
  ```

## Integration with N8N

### Current Architecture
- **ClawdBot**: Primary conversational interface for Tiffany bot
- **N8N**: Backend for scheduled tasks (daily quotes, KPI reminders, etc.)
- **Shared resources**: NocoDB, Obsidian vault

### N8N Scheduled Workflows (Still Active)
- Tiffany_DailyQuote_Schedule
- Tiffany_Gains_Schedule
- TIFFANY_DefinatePurpose_Schedule
- Tiffany_Obsidian_Schedule
- Tiffany_KPI_SubAgent

### Data Connections
- **NocoDB Base URL**: https://nocodb.legacysearchers.agency/api/v2
- **NocoDB Base ID**: ppluy31r2b5wxrw (Tiffany-PAI)
- **Obsidian Vault**: /root/obsidian_vault/

## Next Steps (Pending)

1. Configure NocoDB credentials in ClawdBot (if needed)
2. Setup Obsidian vault access for ClawdBot
3. Test end-to-end workflow with Telegram messages
4. Update N8N scheduled workflows to use HTTP API instead of Telegram nodes (if needed)
5. Monitor model performance and costs via OpenRouter dashboard

## References

- ClawdBot Docs: https://docs.clawd.bot/
- OpenRouter Dashboard: https://openrouter.ai/
- N8N Instance: https://n8n.srv816737.hstgr.cloud
- NocoDB Instance: https://nocodb.legacysearchers.agency/

---

**Last Updated**: 2026-01-25
