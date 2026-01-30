# N8N Workflow Update Guide - ClawdBot Integration

**Date**: 2026-01-25
**Purpose**: Update N8N scheduled workflows to work with ClawdBot
**Reason**: ClawdBot now owns the Telegram bot, so N8N needs to send messages via HTTP API

---

## Overview

Since ClawdBot now handles all incoming Telegram messages, N8N scheduled workflows can no longer use the "Telegram Send Message" nodes. Instead, they need to call the Telegram Bot API directly using HTTP Request nodes.

**What Changes:**
- ❌ **Old**: Telegram Send Message node (requires webhook ownership)
- ✅ **New**: HTTP Request node calling Telegram Bot API

**What Stays the Same:**
- Scheduled triggers (cron jobs)
- Message content and logic
- All other workflow nodes

---

## Workflows to Update (5 total)

1. **Tiffany_DailyQuote_Schedule** (BVYWx2gzdQeuFevb)
2. **Tiffany_Gains_Schedule** (wk3JEQDGqaMvBkIk)
3. **TIFFANY_DefinatePurpose_Schedule** (q9Yc59fCV6nt0E5l)
4. **Tiffany_Obsidian_Schedule** (W0Q5EZNOiDQZtKYp)
5. **Tiffany_KPI_SubAgent** (Vi7b1LbDFIrRvwas)

---

## Step-by-Step Update Process

### For Each Workflow:

#### 1. Open Workflow in N8N

Navigate to: https://n8n.srv816737.hstgr.cloud

Open the workflow from the list.

#### 2. Locate Telegram Send Message Node(s)

Find any node named "Telegram" or "Send Message" or similar.

**Example old node:**
```
Node Type: Telegram
Operation: Send Message
Chat ID: {{ $json["chat_id"] }} or hardcoded user ID
Message: {{ $json["message_text"] }}
```

#### 3. Note the Message Content

**IMPORTANT**: Copy the message content/expression before deleting the node!

Common patterns:
- `{{ $json["quote_text"] }}` - Dynamic content from previous node
- `{{ $json["message"] }}` - Message variable
- Hardcoded text with expressions

#### 4. Delete the Telegram Node

Delete the old Telegram Send Message node.

#### 5. Add HTTP Request Node

Add a new "HTTP Request" node in the same position.

#### 6. Configure HTTP Request Node

**Node Settings:**

**Method:** `POST`

**URL:**
```
https://api.telegram.org/bot8161323254:AAFnWrxVwdQris3IpYg1YMVZ0evzCL6Oo-g/sendMessage
```

**Authentication:** None (token in URL)

**Send Body:** Yes

**Body Content Type:** JSON

**Specify Body:** Using Fields Below

**Body Parameters (JSON):**
```json
{
  "chat_id": "YOUR_CHAT_ID",
  "text": "{{ $json['message_text'] }}"
}
```

**Replace:**
- `YOUR_CHAT_ID` - Your Telegram user ID (numeric)
- `{{ $json['message_text'] }}` - The expression from the old Telegram node

#### 7. Common Patterns and Examples

**Pattern 1: Simple Text Message**
```json
{
  "chat_id": "123456789",
  "text": "Good morning! Here's your daily quote."
}
```

**Pattern 2: Dynamic Content from Previous Node**
```json
{
  "chat_id": "{{ $json['user_id'] }}",
  "text": "{{ $json['quote_text'] }}"
}
```

**Pattern 3: Multiple Lines with Markdown**
```json
{
  "chat_id": "123456789",
  "text": "*Daily Reflection*\n\n{{ $json['reflection'] }}",
  "parse_mode": "Markdown"
}
```

**Pattern 4: With Buttons (Optional)**
```json
{
  "chat_id": "123456789",
  "text": "{{ $json['message'] }}",
  "reply_markup": {
    "inline_keyboard": [[
      {"text": "Done", "callback_data": "done"}
    ]]
  }
}
```

#### 8. Test the Workflow

**Option A: Manual Execution**
1. Click "Execute Workflow" button
2. Check your Telegram for the message
3. Verify message content is correct

**Option B: Wait for Schedule**
- Note when the next scheduled run is
- Wait and verify message arrives

#### 9. Save the Workflow

Click "Save" button in N8N.

---

## Quick Reference: HTTP Request Template

**Copy-paste this and modify:**

```
Node Type: HTTP Request
Method: POST
URL: https://api.telegram.org/bot8161323254:AAFnWrxVwdQris3IpYg1YMVZ0evzCL6Oo-g/sendMessage

Body (JSON):
{
  "chat_id": "YOUR_CHAT_ID",
  "text": "YOUR_MESSAGE_HERE"
}
```

**For dynamic content, use N8N expressions:**
```json
{
  "chat_id": "{{ $json['chat_id'] }}",
  "text": "{{ $json['message'] }}"
}
```

---

## Troubleshooting

### Error: "Chat not found"
- Check your chat_id is correct (numeric, not @username)
- Make sure you've messaged the bot at least once

### Error: "Unauthorized"
- Check bot token is correct in URL
- Token format: `8161323254:AAFnWrxVwdQris3IpYg1YMVZ0evzCL6Oo-g`

### Error: "Bad Request: message text is empty"
- Check the `text` field has content
- Verify expression like `{{ $json['message'] }}` resolves to actual text

### Message sends but content is wrong
- Check previous nodes are providing correct data
- Use "Execute Workflow" to see node outputs
- Verify expression syntax

### Scheduled trigger not firing
- Check workflow is **active** (toggle in top-right)
- Verify cron expression is correct
- Check N8N execution logs

---

## Testing Checklist

After updating each workflow:

- [ ] HTTP Request node configured correctly
- [ ] Bot token in URL is correct
- [ ] Chat ID is correct
- [ ] Message text/expression is correct
- [ ] Manual execution sends message successfully
- [ ] Message content matches expected output
- [ ] Workflow saved
- [ ] Workflow is active

---

## Backup Old Workflow (Important!)

Before deleting `Tiffany_AccountabilityAgent`:

1. Open the workflow in N8N
2. Click three dots menu (⋮) → Download
3. Save JSON file to: `/home/michael/tiffany-pai/backups/Tiffany_AccountabilityAgent_backup.json`
4. Verify file downloaded successfully
5. Then delete the workflow

---

## Common Chat IDs (for reference)

**Your User ID:** (You'll need to get this from a previous workflow or Telegram)

To find your chat ID:
1. Open any working N8N workflow that sends to you
2. Look at the chat_id value
3. It's a numeric ID like: `123456789`

---

## Telegram Bot API Reference

**Official Docs:** https://core.telegram.org/bots/api#sendmessage

**sendMessage Parameters:**
- `chat_id` (required) - Unique identifier for the target chat
- `text` (required) - Text of the message to be sent
- `parse_mode` (optional) - "Markdown" or "HTML"
- `disable_notification` (optional) - Send silently

---

## N8N Workflow IDs Quick Reference

```
Tiffany_DailyQuote_Schedule: BVYWx2gzdQeuFevb
Tiffany_Gains_Schedule: wk3JEQDGqaMvBkIk
TIFFANY_DefinatePurpose_Schedule: q9Yc59fCV6nt0E5l
Tiffany_Obsidian_Schedule: W0Q5EZNOiDQZtKYp
Tiffany_KPI_SubAgent: Vi7b1LbDFIrRvwas
Tiffany_AccountabilityAgent (DELETE): qNqFdwPIbfnsTQt5
```

---

## Expected Time

- **Per workflow**: 5-10 minutes
- **All 5 workflows**: 30-50 minutes
- **Testing**: 10-15 minutes
- **Total**: ~1 hour

---

## Success Criteria

✅ All 5 scheduled workflows updated
✅ Manual test execution sends messages correctly
✅ Old Tiffany_AccountabilityAgent workflow backed up
✅ Old workflow deleted from N8N
✅ All workflows marked as active
✅ First scheduled message arrives successfully

---

**Let's get this done! 🚀**
