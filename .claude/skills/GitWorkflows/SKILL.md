---
name: GitWorkflows
description: Git branching and deployment workflow enforcement for dev/prod separation. USE WHEN fixing bugs, building features, editing mini-app code, deploying, merging, creating branches, OR any code modification to deployed applications. Enforces branch-based development, UAT gates, and safe production deploys.
---

# GitWorkflows

Enforces disciplined git branching workflows so that deployed applications are never disrupted by in-progress development work. All code changes to deployed apps MUST go through the dev branch → UAT → merge → deploy pipeline.

**Core Principle (Eric Schmidt):** AI agents handle the HOW (implementation). The human handles the WHAT and WHY (problem definition, UAT verification). This skill encodes that division by requiring a human UAT gate before any code reaches production.

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/CORE/USER/SKILLCUSTOMIZATIONS/GitWorkflows/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

## Voice Notification

**When executing a workflow, do BOTH:**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in GitWorkflows to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **GitWorkflows** skill to ACTION...
   ```

**Full documentation:** `~/.claude/skills/CORE/SYSTEM/THENOTIFICATIONSYSTEM.md`

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **FeatureBranch** | "fix bug", "add feature", "edit code", "modify app", any code change to deployed app | `Workflows/FeatureBranch.md` |
| **RequestUAT** | Work is complete on dev branch, ready for human testing | `Workflows/RequestUAT.md` |
| **MergeDeploy** | Human approved UAT, ready to ship to production | `Workflows/MergeDeploy.md` |
| **Rollback** | "rollback", "revert", "undo deploy", production is broken | `Workflows/Rollback.md` |

---

## The Golden Rules

### Rule 1: NEVER Edit Deployed App Source on Master
All code changes to mini-apps or deployed applications MUST happen on a `dev/` branch. Direct edits to master are forbidden.

### Rule 2: NEVER Merge Without Human UAT Approval
Between completing dev work and merging to master, the human MUST verify the changes work. Use the `RequestUAT` workflow to pause and ask.

### Rule 3: ALWAYS Rebuild + Redeploy After Merge
Merging to master without rebuilding leaves a stale `dist/`. The `MergeDeploy` workflow handles build + Docker restart + verification.

### Rule 4: The Human Defines WHAT, the Agent Executes HOW
The agent's job is implementation. The human's job is problem definition and acceptance testing. The UAT gate enforces this boundary.

---

## The Pipeline

```
┌───────────────────────────────────────────────────────────────────┐
│  0. PROBLEM DEFINITION GATE (Human → Agent)                       │
│     Agent asks structured questions if request is vague           │
│     Human defines: problem, acceptance criteria, scope            │
│     Human approves definition of done BEFORE any code             │
│                                                                   │
│  ──── GATE: Human approves problem definition + acceptance ────   │
│                                                                   │
│  1. FEATURE BRANCH (Agent)                                        │
│     git checkout -b dev/<app>-<description>                       │
│     Do all work on this branch                                    │
│     Build + test with Browser skill                               │
│     Verify against acceptance criteria                            │
│                                                                   │
│  ──── GATE: ALL acceptance criteria verified by agent ────        │
│                                                                   │
│  2. REQUEST UAT (Agent → Human)                                   │
│     Present: what changed, acceptance criteria checklist           │
│     AskUserQuestion: "Here's what to verify against YOUR criteria"│
│     WAIT for human approval                                       │
│                                                                   │
│  ──── GATE: Human approves UAT ────                               │
│                                                                   │
│  3. MERGE + DEPLOY (Agent)                                        │
│     git checkout master && git merge dev/...                      │
│     bun run build (in correct app directory)                      │
│     docker restart <container>                                    │
│     Browser skill screenshot to verify production                 │
│     Cleanup: delete dev branch                                    │
│                                                                   │
│  ──── GATE: Production verified via screenshot ────               │
│                                                                   │
│  4. DONE                                                          │
│     Update session log                                            │
│     Notify human: "Deployed and verified"                         │
└───────────────────────────────────────────────────────────────────┘
```

---

## Examples

**Example 1: Bug fix on Aaron app**
```
User: "Fix the edit button black screen on the Aaron app"
→ Agent invokes FeatureBranch workflow
→ GATE 0: Agent presents problem definition + acceptance criteria:
    "Edit button on Library cards shows black screen on all platforms.
     AC1: Edit button opens form modal with visible content
     AC2: Works in both Telegram WebView and regular browser
     AC3: No regression on card expand/collapse behavior"
→ Human approves criteria
→ Agent creates dev/aaron-edit-button-fix
→ Implements fix, builds, verifies each AC
→ RequestUAT: presents AC checklist + screenshots
→ Human tests against their own criteria, approves
→ MergeDeploy: merges, rebuilds, restarts Docker, verifies
→ Done. Master is updated. App works.
```

**Example 2: New feature on any mini-app**
```
User: "Add a metronome feature to the Aaron dance app"
→ Agent invokes FeatureBranch workflow
→ GATE 0: Agent asks structured questions:
    "What BPM range? Visual beat indicator? Audio click?
     Should it integrate with existing combos or be standalone?"
→ Human defines: "BPM 60-180, visual beat marker, tap-to-set-tempo,
     standalone page at /metronome"
→ Agent creates dev/aaron-metronome with locked criteria
→ Builds feature, iterates
→ RequestUAT: "Metronome at /metronome. Verify against your criteria."
→ Human tests, requests changes
→ Agent iterates on dev branch (master still untouched)
→ Human approves
→ MergeDeploy → production updated
```

**Example 3: Emergency rollback**
```
User: "The app is broken after the last deploy, roll it back"
→ Agent invokes Rollback workflow
→ git revert HEAD on master
→ Rebuild + restart
→ Screenshot verification
→ Production restored
```

---

## Scope

### Apps That Require This Workflow
Any application served via Docker or accessible by users:
- Aaron dance app (`miniapp-2030destiny` container)
- Megan dashboard
- Any future mini-apps in the 2030 Destiny suite

### What Does NOT Require This Workflow
- Obsidian vault content (daily notes, TELOS, session logs, documentation)
- PAI skill files (these aren't "deployed" apps)
- Configuration changes (settings.json, AGENTS.md)
- Research, analysis, or non-code tasks

---

## Branch Naming Convention

```
dev/<app-name>-<short-description>
```

Examples:
- `dev/aaron-edit-button-fix`
- `dev/aaron-metronome-feature`
- `dev/megan-gcal-integration`
- `dev/shared-ui-card-refactor`

---

## Build Commands by App

| App | Build Directory | Build Command | Container |
|-----|----------------|---------------|-----------|
| Aaron | `projects/P2_tiffany-pai-project/mini-app/react/aaron` | `bun run build` | `miniapp-2030destiny` |
| Megan | `projects/P2_tiffany-pai-project/mini-app/react/megan` | `bun run build` | `miniapp-2030destiny` |

---

## Integration

### Feeds Into
- **Browser** skill — Used for screenshot verification at UAT and post-deploy gates
- **ProjectLog** skill — Session logs document what was changed and deployed

### Uses
- **AskUserQuestion** tool — For UAT gate (human-in-the-loop)
- **Browser** skill — For visual verification
- Git CLI — For all branch/merge/revert operations
