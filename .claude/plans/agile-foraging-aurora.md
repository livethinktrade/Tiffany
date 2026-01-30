# KPI Accountability System — Design Plan

## What This Is

A 3-part system where ClawdBot reminds Michael to log KPIs, NocoDB form captures the data, and a scorecard is sent back after submission. If nothing is logged by evening, ClawdBot follows up with accountability nudge.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  FLOW 1: Morning Reminder (ClawdBot Cron)               │
│                                                         │
│  ClawdBot cron (same schedule as current workflows)     │
│       → Telegram: "Log your KPIs" + NocoDB form link    │
└─────────────────────────────────────────────────────────┘
                          ↓
                 Michael fills NocoDB form
     https://nocodb.legacysearchers.agency/dashboard/#/nc/form/de6f861f-...
                          ↓
┌─────────────────────────────────────────────────────────┐
│  FLOW 2: Post-Submission Scorecard (NocoDB → N8N)       │
│                                                         │
│  NocoDB webhook (on row create)                         │
│       → N8N webhook trigger                             │
│       → Query all KPI records + goal data from NocoDB   │
│       → Run power-goals-progress-bar.js                 │
│       → Send scorecard to Telegram                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  FLOW 3: Accountability Check (N8N Cron, every 2 hrs)   │
│                                                         │
│  N8N cron (10AM, 12PM, 2PM, 4PM, 6PM, 8PM, 10PM CT)    │
│       → Query NocoDB: any records with today's date?    │
│       → IF none found → Telegram nudge + form link      │
│       → IF found → skip (already logged, stay quiet)    │
└─────────────────────────────────────────────────────────┘
```

---

## Existing Schedule (From Current N8N Workflows)

| Workflow | Time (CT) | What It Does |
|----------|-----------|-------------|
| Definite Purpose | 7:00 AM, 8:00 AM, 11:00 PM | Affirmations + power goals progress bar |
| Daily Quote | Daily (24h interval) | Sends motivational quote from NocoDB |
| Gains | 1:00 AM | "What are your 3 GAINS today?" |
| Obsidian Summary | 11:58 PM | Summarizes daily notes |

**Recommendation for KPI reminder**: Pair with the **8:00 AM Definite Purpose** send. Right after seeing your mission statement and power goals, you get the form link to log KPIs. Natural flow.

---

## Flow 1: Morning KPI Reminder

**Method**: ClawdBot cron job
**Schedule**: `0 8 * * *` (8:00 AM CT daily) — same time as existing "My Mission" trigger
**Action**: Send Telegram message with NocoDB form link

**Message template**:
```
📊 Time to log your KPIs!

Track your progress: https://nocodb.legacysearchers.agency/dashboard/#/nc/form/de6f861f-29ed-408d-97c2-6f2b14a83e88

S1 metrics: study units, job applications, interviews, Pomodoros
```

**ClawdBot cron config** (to run on VPS):
```bash
clawdbot cron create "0 8 * * *" \
  --message "Send Michael his daily KPI form link" \
  --session isolated \
  --wake-mode now
```

**Alternative**: If ClawdBot cron isn't reliable yet, add this as an N8N scheduled workflow (same pattern as existing quote/gains/purpose workflows — Schedule Trigger → HTTP POST to Telegram API).

---

## Flow 2: Post-Submission Scorecard

**Trigger**: NocoDB webhook fires when a new row is created in the KPI table
**Pipeline**: NocoDB webhook → N8N Webhook node → Query data → Run scorecard → Send to Telegram

### Step 1: Configure NocoDB Webhook

NocoDB supports outgoing webhooks on record events. In NocoDB dashboard:
1. Go to the KPI table (`mqixf7cnw3gv5r4`)
2. Open table settings → Webhooks
3. Create webhook:
   - **Event**: After Insert
   - **URL**: `https://n8n.srv816737.hstgr.cloud/webhook/kpi-scorecard` (N8N webhook URL)
   - **Method**: POST

### Step 2: N8N Workflow — KPI Scorecard Generator

**New workflow in N8N** (or extend existing KPI_SubAgent):

```
Webhook Trigger (POST /webhook/kpi-scorecard)
    ↓
Get all KPI records from NocoDB
    (GET /api/v2/tables/mqixf7cnw3gv5r4/records, where KPI_Type=study_unit)
    ↓
Get goal record from NocoDB
    (GET /api/v2/tables/mft5qfinmn14g59/records, where Goal_Name=study_unit)
    ↓
Code Node: power-goals-progress-bar.js (already written)
    ↓
HTTP Request: Send to Telegram
    (POST https://api.telegram.org/bot{TOKEN}/sendMessage)
    chat_id: 7286534686
    text: scorecard output
```

**Note**: The Definite Purpose workflow already does steps 2-4 (queries KPI data, runs progress bar, sends to Telegram). The N8N scorecard workflow can reuse the same nodes — just swap the Schedule Trigger for a Webhook Trigger.

### NocoDB Connection Details (from existing workflows):
- **API Base**: `https://nocodb.legacysearchers.agency/api/v2`
- **Project ID**: `p199bc4ytgj21sr` (Tiffany-PAI)
- **KPI Table**: `mqixf7cnw3gv5r4`
- **Goals Table**: `mft5qfinmn14g59`
- **Auth**: NocoDB API Token (already configured in N8N credentials)

---

## Flow 3: Accountability Follow-up (Every 2 Hours)

**Method**: N8N scheduled workflow
**Schedule**: `0 10,12,14,16,18,20,22 * * *` (every 2 hours from 10 AM - 10 PM CT)
**Logic**: Check if any KPI records were logged today. If not, send nudge. If already logged, stay quiet.

### N8N Workflow:

```
Schedule Trigger (every 2h, 10 AM - 10 PM CT)
    ↓
Query NocoDB: GET records where Date = today
    ↓
IF Node: Check record count
    ├─ Records found → Do nothing (already logged, stop bothering)
    └─ No records → Send nudge to Telegram
```

### Escalating Nudge Messages:

The nudge intensity can increase throughout the day. N8N can use the current hour to pick the message:

**10 AM - 12 PM (gentle)**:
```
📊 Reminder: You haven't logged any KPIs yet today.

Log now: https://nocodb.legacysearchers.agency/dashboard/#/nc/form/de6f861f-29ed-408d-97c2-6f2b14a83e88
```

**2 PM - 4 PM (direct)**:
```
⚠️ Still no KPIs logged today. Half the day is gone.

Log now: https://nocodb.legacysearchers.agency/dashboard/#/nc/form/de6f861f-29ed-408d-97c2-6f2b14a83e88
```

**6 PM - 10 PM (accountability)**:
```
🔴 No KPIs logged today. The day is almost over.

"The feeling associated with knowing is the reason they don't know."

Log now: https://nocodb.legacysearchers.agency/dashboard/#/nc/form/de6f861f-29ed-408d-97c2-6f2b14a83e88
```

**Key behavior**: Once you submit the form, all subsequent checks find today's records and go silent. No more nudges after you log.

---

## What Needs to Happen (On VPS)

### ClawdBot Side
1. Create cron job for morning KPI reminder (or use N8N as fallback)

### NocoDB Side
2. Configure webhook on KPI table → fires POST to N8N webhook URL on row insert

### N8N Side
3. Create Webhook-triggered workflow: receives NocoDB event → queries all data → runs scorecard → sends to Telegram
4. Create Cron-triggered workflow: every 2 hours (10 AM - 10 PM) → if no records today → send escalating nudge
5. Re-activate existing scheduled workflows (quote, gains, purpose) — currently `"active": false`

### Telegram Side
- No changes needed — uses existing bot token and chat ID

---

## What NOT to Build (MVP Scope)

- No natural language KPI parsing through ClawdBot
- No NocoDB MCP integration (webhook is simpler and more reliable)
- No AI-powered follow-up messages (deterministic nudge is sufficient)
- No new dashboards or web UI
- No gamification or streak tracking

---

## Key Files

| File | Purpose |
|------|---------|
| `projects/P2_tiffany-pai-project/data/scripts/power-goals-progress-bar.js` | Scorecard generator (already updated) |
| `projects/P2_tiffany-pai-project/n8n-workflows/TIFFANY_DefinatePurpose_Schedule_*.json` | Existing workflow with progress bar nodes to reuse |
| `projects/P2_tiffany-pai-project/n8n-workflows/Tiffany_KPI_SubAgent_*.json` | Existing KPI master workflow (178KB) |
| `projects/P2_tiffany-pai-project/TIFFANY_MVP_SCOPE.md` | MVP definition of done tracker |

---

## Verification

After implementation, verify each flow:
1. **Morning reminder**: Wait for 8 AM or manually trigger ClawdBot cron → form link appears in Telegram
2. **Post-submission scorecard**: Fill out NocoDB form → scorecard message appears in Telegram within seconds
3. **Accountability nudge**: Don't log anything → at 10 AM, first nudge appears → every 2 hours another nudge
4. **Nudge stops after logging**: Fill form → next 2-hour check finds records → no more nudges
5. **End-to-end**: Morning form link → fill form → scorecard appears → nudges stay silent rest of day
