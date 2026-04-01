# RequestUAT Workflow

Pause development and request human acceptance testing before merging to production.

This is the **critical human-in-the-loop gate**. The agent defines what changed and how to test it. The human verifies it meets their vision of WHAT the solution should be.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Development complete. Requesting your UAT approval before deploying to production."}' \
  > /dev/null 2>&1 &
```

Running the **RequestUAT** workflow in the **GitWorkflows** skill to request human acceptance testing...

---

## The Principle

> "When AI can write the code, the highest-value skill becomes Problem Definition — the WHAT and WHY."
> — Eric Schmidt framing

The agent handled the HOW (implementation). Now the human verifies the WHAT:
- Does this solve the actual problem?
- Does it match the vision in their head?
- Are there edge cases or UX issues the agent missed?

**The agent MUST NOT merge to master without explicit human approval.**

---

## Step 1: Prepare the UAT Summary

Before asking the user, prepare:

### A. What Changed (concise)
- List files modified and what each change does
- One-sentence summary of the approach taken

### B. How to Test
- Specific steps the user should follow to verify
- URLs, pages, or flows to check
- What "working" looks like vs what was broken before

### C. Visual Evidence
- Browser skill screenshot(s) of the fix/feature working on the dev branch
- Before/after comparison if applicable

### D. Known Limitations (honest)
- Anything that's NOT fixed by this change
- Edge cases or environments not tested
- Follow-up work needed

---

## Step 2: Ask for Approval

Use AskUserQuestion with structured format:

```
UAT REQUEST — [Branch Name]

WHAT CHANGED:
[Summary]

HOW TO TEST:
1. [Step]
2. [Step]
3. [Step]

SCREENSHOTS:
[Attached via Browser skill]

KNOWN LIMITATIONS:
[List or "None"]

OPTIONS:
- APPROVE: Merge to master and deploy to production
- REQUEST CHANGES: Tell me what needs fixing (stays on dev branch)
- REJECT: Discard this approach entirely
```

---

## Step 3: Handle Response

### If APPROVED:
→ Proceed to **MergeDeploy** workflow

### If REQUEST CHANGES:
→ Stay on dev branch
→ Implement requested changes
→ Re-run RequestUAT when complete
→ DO NOT merge. The loop continues until approved.

### If REJECTED:
→ Ask: "Should I delete the dev branch, or keep it for reference?"
→ Switch back to master
→ Document what was tried and why it was rejected in session log

---

## Anti-Patterns

| Don't Do This | Do This Instead |
|---------------|-----------------|
| "I've merged the fix to master" (without asking) | "Fix is ready on dev branch. Here's how to test it." |
| "It works, trust me" | Screenshot + specific test steps |
| Present only happy path | Include known limitations honestly |
| Ask vague "does this look good?" | Give structured test plan with specific verification steps |
| Merge after timeout/no response | Wait for explicit approval. No response ≠ approval. |
