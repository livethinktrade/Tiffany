# ClawdBot-First Architecture with N8N Backend Support

**Date**: 2026-01-25
**Goal**: Deploy ClawdBot as PRIMARY bot interface with N8N as scheduled task runner and programmatic backend
**Today's Win**: Text Tiffany bot (now powered by ClawdBot) and receive intelligent responses with Obsidian context

---

## Executive Summary - REVISED ARCHITECTURE

**🔄 MAJOR ARCHITECTURAL SHIFT**

**Previous Plan**: ClawdBot as HTTP middleware enhancing N8N (conservative approach)
**New Vision**: ClawdBot as PRIMARY bot interface with N8N as SUPPORTING backend (radical redesign)

**Deployment Strategy**: ClawdBot owns Telegram bot interaction, N8N provides scheduled tasks and API services

**Why This Approach:**
- ✅ **ClawdBot-Native**: Fully leverages ClawdBot's conversation intelligence and skills system
- ✅ **N8N Refactored**: Becomes "backend microservices" for data operations
- ✅ **Cleaner Architecture**: Clear separation between conversational AI (ClawdBot) and automation (N8N)
- ✅ **Bot Separation**: Each bot (Aaron, Tiffany, Megan) gets own ClawdBot instance with shared N8N backend
- ✅ **Scalable**: Easier to add new bots without N8N workflow sprawl

**Breaking Changes Accepted**: Existing Tiffany_AccountabilityAgent workflow (85 nodes) gets REPLACED by ClawdBot skills and N8N backend services.

---

## NEW Architecture: ClawdBot-First with N8N Backend

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TELEGRAM BOT (Tiffany)                         │
│                     ClawdBot owns bot token                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   ClawdBot (PRIMARY INTERFACE)                      │
│  • Receives ALL Telegram messages                                  │
│  • Security checks (authorized user)                               │
│  • Conversation management (Claude with memory)                    │
│  • Intent understanding                                            │
│  • Obsidian knowledge base access (MCP/direct)                     │
│  • Skills system (goal tracking, KPI analysis, motivation)         │
│  • Calls N8N for programmatic operations                           │
└─────────────────────────────────────────────────────────────────────┘
        ↓                           ↓                        ↓
┌──────────────────┐   ┌───────────────────────┐   ┌─────────────────┐
│ N8N: Data Ops    │   │ N8N: Scheduled Tasks  │   │ Obsidian Vault  │
│ (Webhook Svcs)   │   │ (Time-Based)          │   │ (Read/Write)    │
├──────────────────┤   ├───────────────────────┤   ├─────────────────┤
│ • Save to        │   │ • Daily Quote (8 AM)  │   │ • /TELOS/       │
│   NocoDB         │   │ • KPI Check (9 PM)    │   │ • /goals/       │
│ • Query Airtable │   │ • Weekly Reflect      │   │ • /journal/     │
│ • Update goals   │   │ • Definite Purpose    │   │ • /reflections/ │
│ • Create files   │   │ • Obsidian Sync       │   │                 │
└──────────────────┘   └───────────────────────┘   └─────────────────┘
```

**Key Architectural Decisions:**

1. **ClawdBot Owns Bot Token**: Telegram messages go directly to ClawdBot, NOT N8N
2. **N8N Becomes Backend**: HTTP webhooks for data operations, scheduled cron for reminders
3. **Conversation in ClawdBot**: All bot logic, intent routing, response generation
4. **N8N Stays for**: Scheduled tasks (daily quotes, KPI prompts) + programmatic operations (database CRUD, file writes)

---

## ✅ AGREED ARCHITECTURE (After Discussion)

**Core Principle: "N8N = Discipline, ClawdBot = Conversation"**

### N8N Role: Scheduled Consistency & Discipline
- ✅ **KEEP** all 5 scheduled workflows (daily quotes, KPI checks, weekly reflections, definite purpose, Obsidian sync)
- ✅ **KEEP** using Telegram token for scheduled sends (via HTTP API)
- ✅ **MINOR UPDATE**: Change Telegram node → HTTP Request node in 5 workflows
- ✅ Provides time-based discipline and consistency habits

### ClawdBot Role: Conversational Flexibility & One-Offs
- ✅ **OWNS** Telegram webhook (receives all user messages)
- ✅ **REPLACES** 85-node `Tiffany_AccountabilityAgent` workflow
- ✅ **HANDLES** all one-off tasks, questions, ad-hoc requests
- ✅ **LOGS** conversations to Obsidian (better integration than N8N)
- ✅ Provides conversational intelligence and flexibility

### Shared Resources
Both systems access same data:
- **NocoDB**: Tiffany-PAI base (goals, KPIs, study time, gains)
- **Airtable**: Goals, quotes, financial records
- **Obsidian**: TELOS, goals, journal, reflections

### Token Architecture
**Same Telegram token, different usage:**
- **ClawdBot**: Owns webhook endpoint (receives user messages)
- **N8N**: Uses token for HTTP API sends (scheduled messages only)

### Meta-Capability: Ad-Hoc → Automated Evolution
When one-off tasks become repetitive:
1. User notices pattern: "I keep asking ClawdBot about X every Monday"
2. User tells ClawdBot: "Make this a weekly Monday reminder"
3. ClawdBot/Claude Code generates N8N workflow
4. Ad-hoc conversation → Automated discipline

---

---

## 🚀 TODAY's Implementation (5 Steps)

**Goal**: Get ClawdBot responding to Tiffany messages while keeping N8N scheduled tasks running

**Estimated Time**: 2-3 hours

### Step 1: Install ClawdBot on Hostinger VPS

**SSH into Hostinger:**
```bash
ssh user@your-hostinger-vps.com
```

**One-Line Install:**
```bash
curl -sSL https://claw.bot/install | bash
```

**Verify Installation:**
```bash
clawdbot --version
```

**Expected Output**: `ClawdBot v1.x.x installed successfully`

---

### Step 2: Configure ClawdBot for Telegram

**Configure Telegram Integration:**

ClawdBot has built-in Telegram support. Configure it to use Tiffany's bot token:

```bash
# In ClawdBot config
clawdbot config set telegram.token "YOUR_TELEGRAM_BOT_TOKEN"
clawdbot config set telegram.webhook true
```

**System Prompt Configuration** (`~/.clawdbot/config.yaml`):

```yaml
telegram:
  enabled: true
  bot_name: "Tiffany"

system_prompt: |
  You are Tiffany, a personal accountability AI assistant.

  Your role:
  - Help track goals, KPIs, and personal growth
  - Provide motivational support with emotional intelligence
  - Reference past reflections and patterns from Obsidian vault
  - Maintain encouraging yet honest tone
  - Log important conversations to Obsidian

  Available context from Obsidian:
  - Weekly reflections in /TELOS/reflections/
  - Daily journal entries in /journal/
  - Goal tracking in /goals/

  You have access to:
  - NocoDB (Tiffany-PAI base) - for goals, KPIs, study time
  - Airtable - for quotes and extended goal tracking
  - Obsidian vault - for journaling and reflections

  When users text you:
  - Understand their intent and emotional state
  - Reference relevant past context from Obsidian
  - Help them with one-off questions and tasks
  - Log important conversations to journal

  Note: Scheduled reminders (daily quotes, KPI checks) are handled by N8N.

obsidian:
  vault_path: "/mnt/d/Program Files/Obsidian"
  telos_path: "/mnt/d/Program Files/Obsidian/TELOS"
  journal_path: "/mnt/d/Program Files/Obsidian/journal"
```

**Enable Obsidian Skill** (for reading/writing vault):

```bash
clawdbot skills enable obsidian
```

---

### Step 3: Setup Data Access for ClawdBot

**NocoDB Configuration:**

Create `~/.clawdbot/nocodb.env`:
```bash
NOCODB_BASE_URL=https://nocodb.legacysearchers.agency/api/v2
NOCODB_BASE_ID=ppluy31r2b5wxrw
NOCODB_TOKEN=j7isc5YCEGCR_Igw2HmNQin6sXW3cskwx-ZZIg5D
```

**Airtable Configuration:**

Create `~/.clawdbot/airtable.env`:
```bash
AIRTABLE_API_KEY=your-airtable-key
AIRTABLE_BASE_ID=your-base-id
```

**Load into ClawdBot:**
```bash
clawdbot config load ~/.clawdbot/nocodb.env
clawdbot config load ~/.clawdbot/airtable.env
```

---

### Step 4: Update N8N Scheduled Workflows (5 workflows)

**Workflows to Update:**
1. `Tiffany_DailyQuote_Schedule` (BVYWx2gzdQeuFevb)
2. `Tiffany_Gains_Schedule` (wk3JEQDGqaMvBkIk)
3. `TIFFANY_DefinatePurpose_Schedule` (q9Yc59fCV6nt0E5l)
4. `Tiffany_Obsidian_Schedule` (W0Q5EZNOiDQZtKYp)
5. `Tiffany_KPI_SubAgent` scheduled triggers (Vi7b1LbDFIrRvwas)

**Change Required**: Replace "Telegram Send Message" node with "HTTP Request" node

**Old Node** (Telegram Send Message):
```
Node Type: Telegram → Send Message
  Message: {{ quote_text }}
  Chat ID: {{ user_id }}
```

**New Node** (HTTP Request):
```
Node Type: HTTP Request
  Method: POST
  URL: https://api.telegram.org/bot{{ TELEGRAM_BOT_TOKEN }}/sendMessage
  Body (JSON):
    {
      "chat_id": "{{ user_id }}",
      "text": "{{ quote_text }}"
    }
```

**Steps for Each Workflow:**
1. Open workflow in N8N
2. Find "Telegram Send Message" node(s)
3. Delete and replace with HTTP Request node
4. Copy message content to HTTP Request body
5. Test workflow execution
6. Save workflow

---

### Step 5: Migrate Telegram Webhook & Delete Old Workflow

**A. Remove N8N Telegram Webhook:**

1. Open `Tiffany_AccountabilityAgent` workflow (qNqFdwPIbfnsTQt5)
2. Note the Telegram webhook trigger URL
3. **DELETE** the entire workflow (85 nodes no longer needed!)
4. This frees up the webhook endpoint

**B. Start ClawdBot with Telegram:**

```bash
clawdbot start --telegram
```

This will:
- Register webhook with Telegram API
- Start receiving user messages
- Handle all conversational interactions

---

## 🧪 Verification Plan

### Test 1: ClawdBot Installation & Status
```bash
clawdbot --version
clawdbot status
```
**Expected**:
- ClawdBot version displayed
- Status shows "Running" with Telegram integration enabled

### Test 2: N8N Scheduled Workflow (Daily Quote)

**Wait for scheduled trigger OR manually execute:**
1. Open `Tiffany_DailyQuote_Schedule` workflow
2. Click "Execute Workflow"
3. Check Telegram for message

**Expected**:
- ✅ Quote message appears in Telegram
- ✅ N8N execution log shows HTTP Request success
- ✅ No errors in workflow execution

### Test 3: ClawdBot Conversation (User Message)

**Action**: Send Telegram message to Tiffany:
```
"I'm feeling great today! Just finished my workout."
```

**Expected Flow**:
1. ClawdBot receives message via Telegram webhook
2. ClawdBot reads Obsidian for context
3. ClawdBot generates response
4. Response appears in Telegram

**Success Criteria**:
- ✅ ClawdBot responds within 3 seconds
- ✅ Response shows understanding of intent
- ✅ No errors in ClawdBot logs

### Test 4: Obsidian Context Integration

**Setup**: Create test file:
```markdown
/mnt/d/Program Files/Obsidian/TELOS/reflections/2026-01-25_reflection.md

---
date: 2026-01-25
---

# Weekly Reflection

This week I struggled with consistency on my exercise goal.
Only worked out 1 time instead of 3x target.
```

**Action**: Send message to Tiffany:
```
"How's my exercise goal going?"
```

**Expected**:
- ✅ ClawdBot reads reflection file
- ✅ Response references the 1/3 workout struggle
- ✅ Response is empathetic and actionable

### Test 5: Data Write (NocoDB/Obsidian)

**Action**: Send message:
```
"Log this: I completed my daily goal to read for 30 minutes"
```

**Expected**:
- ✅ ClawdBot updates NocoDB (if configured)
- ✅ ClawdBot creates journal entry in Obsidian
- ✅ Confirmation response sent to Telegram

### Test 6: Both Systems Working Together

**Scenario**: Test scheduled message + user conversation in sequence

1. **Wait for scheduled reminder** (e.g., 9 PM KPI check from N8N)
2. **Respond to reminder** via ClawdBot conversation
3. **Verify**: N8N sent reminder, ClawdBot handled response

**Success Criteria**:
- ✅ N8N sends scheduled message
- ✅ ClawdBot receives user's reply
- ✅ Both systems share data correctly

---

## 🔄 Rollback Plan (if issues arise)

**If ClawdBot has problems** (< 10 minutes to rollback):

1. **Stop ClawdBot:**
   ```bash
   clawdbot stop
   ```

2. **Restore N8N conversational workflow:**
   - Import backup of `Tiffany_AccountabilityAgent` workflow (saved before deletion)
   - Activate workflow
   - Telegram webhook automatically re-registers

3. **Revert scheduled workflows:**
   - If HTTP Request nodes have issues, restore from N8N version history
   - Each workflow keeps version history for easy rollback

4. **Move Telegram token back to N8N:**
   - Update webhook in Telegram API to point to N8N
   - Remove token from ClawdBot config

**Data Safety:**
- ✅ All NocoDB, Airtable, Obsidian data unchanged
- ✅ N8N workflows can be restored from backup
- ✅ ClawdBot config is in version control

**Rollback Preparation:**
Before implementing, backup:
1. Export `Tiffany_AccountabilityAgent` workflow as JSON
2. Screenshot current N8N scheduled workflow configurations
3. Save Telegram bot token securely

---

## 📋 Critical Files & Credentials

### Hostinger VPS
- **SSH Access**: User's existing Hostinger VPS
- **ClawdBot Install Path**: `~/.clawdbot/`
- **Config File**: `~/.clawdbot/config.yaml`
- **Environment Files**:
  - `~/.clawdbot/nocodb.env`
  - `~/.clawdbot/airtable.env`

### N8N Configuration
- **Instance URL**: https://n8n.srv816737.hstgr.cloud
- **Workflows to Update** (5 scheduled workflows):
  - `Tiffany_DailyQuote_Schedule` (BVYWx2gzdQeuFevb)
  - `Tiffany_Gains_Schedule` (wk3JEQDGqaMvBkIk)
  - `TIFFANY_DefinatePurpose_Schedule` (q9Yc59fCV6nt0E5l)
  - `Tiffany_Obsidian_Schedule` (W0Q5EZNOiDQZtKYp)
  - `Tiffany_KPI_SubAgent` (Vi7b1LbDFIrRvwas)
- **Workflow to DELETE**:
  - `Tiffany_AccountabilityAgent` (qNqFdwPIbfnsTQt5) - 85 nodes, replaced by ClawdBot

### Obsidian Vault
- **Base Path**: `/mnt/d/Program Files/Obsidian/`
- **Tiffany Context Paths**:
  - `/mnt/d/Program Files/Obsidian/TELOS/reflections/`
  - `/mnt/d/Program Files/Obsidian/goals/`
  - `/mnt/d/Program Files/Obsidian/journal/`

### NocoDB Access
- **Base URL**: `https://nocodb.legacysearchers.agency/api/v2`
- **Base ID**: `ppluy31r2b5wxrw` (Tiffany-PAI)
- **Auth Token**: `j7isc5YCEGCR_Igw2HmNQin6sXW3cskwx-ZZIg5D`

### API Keys & Tokens
- **Anthropic API Key**: Required for ClawdBot
- **Telegram Bot Token**: Move from N8N to ClawdBot config
- **Airtable API Key**: For quotes and goal tracking
- **NocoDB Token**: Listed above

---

## 🚀 Future Enhancements (Post-TODAY)

### Week 2: Advanced Obsidian Integration
- Deploy Obsidian MCP server for semantic search
- Implement link graph traversal (related notes)
- Add automatic daily journal creation
- Smart context retrieval (recent notes + relevant past notes)

### Week 3: Meta-Capability (Ad-Hoc → Automated)
- Teach ClawdBot to detect repetitive patterns in user requests
- ClawdBot generates N8N workflow JSON when pattern becomes repetitive
- Use Claude Code to create and deploy N8N workflows
- Example: "You've asked about exercise 3 Mondays in a row - should I make this a weekly reminder?"

### Week 4: Multi-Bot Expansion
- Deploy separate ClawdBot instance for Aaron (dance practice)
- Deploy separate ClawdBot instance for Megan (email management)
- Shared N8N backend for all three bots (scheduled tasks + data ops)
- Unified analytics dashboard

### Week 5+: N8N Webhook Services Layer
Instead of ClawdBot writing directly to NocoDB/Airtable, create N8N webhook services:
- POST `/api/save-goal` → Updates NocoDB + creates Obsidian file
- POST `/api/log-session` → Updates multiple tables + generates reflection
- POST `/api/update-kpi` → KPI tracking + weekly aggregation

**Why**: Cleaner separation, reusable operations, N8N becomes "backend API"

### Months 2-3: Production Hardening
- Rate limiting and error handling
- Monitoring and alerting (ClawdBot uptime, N8N workflow health)
- Backup automation (Obsidian vault, NocoDB exports)
- Performance optimization (caching, response time)

---

## ✅ Success Criteria for TODAY

**Primary Goal**: ClawdBot handles conversational messages, N8N handles scheduled reminders

**Implementation Checklist**:
- [x] **DONE** ClawdBot installed on Hostinger VPS (via `npm install -g clawdbot@latest`, Node.js v22.22.0)
- [x] **DONE** ClawdBot configured for Telegram (via `clawdbot onboard` wizard, bot token configured)
- [ ] **PENDING** ClawdBot has access to Obsidian vault (read/write) - configured path but not tested
- [x] **DONE** AI model authentication configured (OpenRouter with MiniMax m2.1 as default)
- [ ] **PENDING** ClawdBot has access to NocoDB (credentials not yet configured)
- [ ] **NOT STARTED** 5 N8N scheduled workflows updated (Telegram node → HTTP Request node)
- [ ] **NOT STARTED** Old `Tiffany_AccountabilityAgent` workflow backed up
- [x] **DONE** Telegram webhook migrated (deleted from N8N via Telegram API `deleteWebhook`)
- [x] **DONE** ClawdBot started and running (systemd service enabled, using long-polling mode)

**Functional Tests** (Definition of Done):
- [x] **PASSED** **Test 1**: Text Tiffany → ClawdBot responds intelligently ✅
- [ ] **PENDING** **Test 2**: ClawdBot logs conversation to Obsidian journal
- [ ] **NOT TESTED** **Test 3**: N8N scheduled reminder fires (daily quote or KPI check)
- [x] **PASSED** **Test 4**: Response time < 3 seconds for user messages ✅
- [ ] **PENDING** **Test 5**: Both systems share data correctly (same NocoDB, Airtable, Obsidian)

**Success Definition**:
1. **Conversational**: User can text Tiffany one-off questions, ClawdBot responds intelligently
2. **Disciplined**: N8N still sends scheduled reminders at set times
3. **Contextual**: ClawdBot references Obsidian vault for personalized responses
4. **Persistent**: ClawdBot logs important conversations to Obsidian

**Estimated Time**: 2-3 hours for full implementation + testing

---

## 📝 IMPLEMENTATION NOTES (2026-01-25)

### What We Actually Built

**Installation Method**: Used npm instead of curl installer
```bash
npm install -g clawdbot@latest
```

**Node.js Upgrade Required**:
- Started with v18.19.1 → Failed
- Upgraded to v20.20.0 → Failed
- Upgraded to v22.22.0 → Success ✅

**Configuration Method**: Interactive onboard wizard
```bash
clawdbot onboard
clawdbot configure
```

**Authentication**: OpenRouter instead of Anthropic
- Original plan: Use Claude Pro subscription via setup-token
- Actual implementation: OpenRouter API key with MiniMax m2.1 model
- Reason: User preference for model flexibility
- Command: `clawdbot models set openrouter/minimax/minimax-m2.1`

**Telegram Integration**: Long-polling instead of webhook
- ClawdBot uses long-polling mode (not webhook mode)
- Gateway runs on localhost:18789 (loopback only)
- Telegram webhook removed from N8N via API: `curl "https://api.telegram.org/bot.../deleteWebhook"`
- Service: systemd user service at `/root/.config/systemd/user/clawdbot-gateway.service`

**Key Troubleshooting**:
1. **Token mismatch error**: Fixed with `clawdbot config set gateway.remote.token "$(clawdbot config get gateway.auth.token)"`
2. **Config path error**: Used `agents.defaults.model.primary` not `agents.main.model`
3. **Webhook conflict**: Deleted N8N webhook to free up bot for ClawdBot polling

**Current Status**:
- ✅ ClawdBot receiving and responding to messages
- ✅ Pairing system working (user approved)
- ✅ AI responses working via OpenRouter/MiniMax
- ⚠️ Obsidian integration configured but not tested
- ⚠️ NocoDB integration not yet configured
- ❌ N8N scheduled workflows not updated yet
- ❌ Old N8N workflow not deleted yet

**Documentation Created**:
- `/home/michael/tiffany-pai/CLAWDBOT_SETUP_NOTES.md` - Complete setup reference

**Next Priority**:
1. Configure NocoDB credentials for KPI/goal tracking
2. Test Obsidian vault integration
3. Update 5 N8N scheduled workflows
4. Delete old Tiffany_AccountabilityAgent workflow (85 nodes)

---

## Design Principles Applied

**CLI-First Architecture**: TypeScript HTTP server handles deterministic routing, Claude API provides intelligent intent analysis.

**Prompts Wrap Code**: 80% deterministic code (HTTP server, file system access), 20% AI (intent classification, emotion detection).

**Scaffolding > Model**: System design (HTTP middleware pattern) more important than specific model - can swap Claude for other models later.

**Bot Separation via Context**: Single ClawdBot instance, bot-specific configs passed via context parameter - clean separation without code duplication.

**Non-Breaking Integration**: Existing N8N workflows remain functional - ClawdBot is an enhancement, not a replacement.

---

**Next Steps After Plan Approval**:
1. SSH into Hostinger VPS
2. Run ClawdBot one-line installer
3. Create `http-server.ts` file
4. Set up systemd service
5. Modify N8N workflow
6. Run verification tests
7. 🎉 Text Tiffany and celebrate!
