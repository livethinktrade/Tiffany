---
name: Paperclip
description: |
  Full CRUD interface for Paperclip project management API.
  Create, read, update, and delete issues. Query projects, goals, and buckets.
  Enforces 3-Bucket system routing and label assignment.

  USE WHEN user says "create issue", "create ticket", "new backlog", "new bug",
  "list issues", "show backlog", "check progress", "update issue", "close issue",
  "delete issue", "show projects", "show buckets", "bucket status", "show goals",
  "what's in backlog", "assign to", "move to", or any Paperclip/project management request.

triggers:
  - create issue
  - create ticket
  - new backlog
  - new bug
  - list issues
  - show backlog
  - check progress
  - update issue
  - close issue
  - delete issue
  - show projects
  - show buckets
  - bucket status
  - show goals
  - assign to
  - paperclip
---

# Paperclip Skill

CRUD interface for the Paperclip project management API (VPS `localhost:3100`).

## Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `ListGoals.ts` | Show bucket hierarchy with sub-goals | `bun Tools/ListGoals.ts` |
| `ListProjects.ts` | Show projects grouped by bucket | `bun Tools/ListProjects.ts` |
| `ListIssues.ts` | Query issues with filters | `bun Tools/ListIssues.ts --project PAI --status todo` |
| `CreateIssue.ts` | Create issue with routing + labels | `bun Tools/CreateIssue.ts --title "..." --description "..." --tier 2` |
| `UpdateIssue.ts` | Update status, priority, assignment | `bun Tools/UpdateIssue.ts --id MIC-219 --status in_progress` |
| `DeleteIssue.ts` | Delete an issue | `bun Tools/DeleteIssue.ts --id MIC-999` |
| `GetIssue.ts` | Get full details of one issue | `bun Tools/GetIssue.ts --id MIC-219` |

## 3-Bucket System

All work routes through buckets. See `PAPERCLIP_PROTOCOL.md` in the Obsidian vault for full details.

| Bucket | Priority | Projects |
|--------|----------|----------|
| 1: Money Maker | 80% energy | Austin Job, Project Management |
| 2: Soul Stuff | Bounded | Dance Practice, Health Coach |
| 3: Curiosity Shelf | GATED | Destiny Quotes, Destiny Focus, PAI Infra, Gamification |

## Issue Creation Flow

1. Determine project from keywords (auto-routed by CreateIssue)
2. Assign tier (1-4) → tool adds both Tier + RC labels automatically
3. Ask user if they want to assign to an agent (never auto-assign)
4. Issue created with status `backlog` by default

## Configuration

All tools read from a shared config. Base URL and company ID are hardcoded for the VPS environment.
