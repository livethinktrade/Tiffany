# FeatureBranch Workflow

Create a dev branch and do all work there. Master stays untouched.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Creating feature branch for safe development"}' \
  > /dev/null 2>&1 &
```

Running the **FeatureBranch** workflow in the **GitWorkflows** skill to create a safe dev branch...

---

## Step 1: Problem Definition Gate (MANDATORY — DO NOT SKIP)

> "If your problem definition is vague, the AI will efficiently execute the wrong solution."

Before writing ANY code, the agent MUST have clear answers to these questions. If the user's request is vague, use AskUserQuestion to get clarity.

### 1a. Define the Problem

Ask yourself (or the user if unclear):

| Question | Must Be Answered |
|----------|-----------------|
| **What is broken or missing?** | Specific symptom, not vague "it doesn't work" |
| **Where does it happen?** | Which page, component, flow, environment |
| **Who is affected?** | User on Telegram? Browser? All platforms? |
| **What triggered this?** | Recent change? Always been broken? Regression? |

If you cannot answer these precisely, STOP and ask the user.

### 1b. Define the Acceptance Criteria (Definition of Done)

The user defines WHAT "done" looks like. The agent does NOT decide this.

Use AskUserQuestion to present and confirm:

```
PROBLEM DEFINITION:
[1-2 sentence summary of the problem]

ACCEPTANCE CRITERIA (Definition of Done):
- [ ] [Specific, testable condition 1]
- [ ] [Specific, testable condition 2]
- [ ] [Specific, testable condition 3]

ANTI-CRITERIA (What must NOT happen):
- [ ] [Existing functionality must not break]
- [ ] [Specific thing to avoid]

SCOPE BOUNDARY:
- IN SCOPE: [exactly what this branch will fix/build]
- OUT OF SCOPE: [what this branch will NOT touch]

Does this match your vision? Adjust before I start.
```

**The user must approve this before any code is written.**

If the user says "just fix it" without specifics, push back once:
> "I want to make sure I solve the right problem. Can you confirm: [your best understanding of acceptance criteria]? I'll start as soon as you confirm."

### 1c. Check for Existing Documentation

Before starting work, check:
- Issue files (`projects/*/issues/`) — is this already documented?
- Session logs — has this been attempted before? What failed?
- Bug docs (`agents/*/memory/`) — is there prior RCA?

Existing documentation saves cycles. Don't re-diagnose what's already diagnosed.

---

## Step 2: Verify Clean State

```bash
git status
git branch --show-current
```

- Confirm you are on `master`
- If there are uncommitted changes to app source files, STOP and ask the user what to do with them (stash, commit, or discard)
- Non-app files (docs, notes, session logs) can be left as-is

## Step 3: Create Dev Branch

```bash
git checkout master
git pull origin master
git checkout -b dev/<app-name>-<short-description>
```

**Branch naming:** `dev/<app>-<description>` (e.g., `dev/aaron-edit-button-fix`)

Announce to user:
```
Created branch `dev/aaron-edit-button-fix`. All work will happen here.
Master (production) is untouched.

Accepted criteria:
- [list from Step 1b]
```

## Step 4: Do The Work

Implement the fix or feature on the dev branch. Normal development:
- Edit source files
- Build to test: `bun run build` (in the correct app directory)
- Use Browser skill to screenshot and verify
- Iterate as needed
- Commit progress on the dev branch as you go
- **Check each acceptance criterion as you complete it**

**IMPORTANT:** If the Docker container is currently serving production, be aware that `bun run build` on the dev branch will overwrite `dist/`. If the user is actively using the app, warn them before building.

## Step 5: When Work Is Complete

When you believe the work is done and tested:

1. Commit all changes on the dev branch
2. Run `bun run build` to confirm build succeeds
3. Use Browser skill to take a screenshot confirming it works
4. **Verify EVERY acceptance criterion from Step 1b is met**
5. Proceed to **RequestUAT** workflow — include the acceptance criteria checklist in the UAT request so the user can verify against their own definition of done

---

## Checklist

- [ ] Problem definition approved by user (Step 1)
- [ ] Acceptance criteria locked before coding started (Step 1b)
- [ ] Started from clean master
- [ ] Dev branch created with proper naming
- [ ] All work done on dev branch (no master edits)
- [ ] Build succeeds on dev branch
- [ ] ALL acceptance criteria verified by agent
- [ ] Browser screenshot confirms functionality
- [ ] Ready for UAT → invoke RequestUAT workflow
