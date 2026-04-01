#!/usr/bin/env bun
// Updates a Paperclip issue by identifier (MIC-XXX) or UUID
// Usage: bun UpdateIssue.ts --id MIC-219 [--status in_progress] [--priority high] [--assign tiffany]

import { COMPANY_ID, paperclipFetch, AGENTS } from "./config.ts";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    id: { type: "string" },
    status: { type: "string", short: "s" },
    priority: { type: "string", short: "p" },
    assign: { type: "string", short: "a" },
    unassign: { type: "boolean" },
    title: { type: "string", short: "t" },
  },
});

async function main() {
  if (!values.id) {
    console.error("Usage: bun UpdateIssue.ts --id MIC-219 [--status in_progress] [--priority high] [--assign tiffany]");
    process.exit(1);
  }

  // Resolve identifier to UUID
  const issueId = await resolveIssueId(values.id);
  if (!issueId) {
    console.error(`Issue not found: ${values.id}`);
    process.exit(1);
  }

  const updates: any = {};
  if (values.status) updates.status = values.status;
  if (values.priority) updates.priority = values.priority;
  if (values.title) updates.title = values.title;
  if (values.assign) {
    const agentId = AGENTS[values.assign.toLowerCase()];
    if (!agentId) {
      console.error(`Unknown agent: ${values.assign}. Available: ${Object.keys(AGENTS).join(", ")}`);
      process.exit(1);
    }
    updates.assigneeAgentId = agentId;
  }
  if (values.unassign) {
    updates.assigneeAgentId = null;
  }

  if (Object.keys(updates).length === 0) {
    console.error("No updates specified. Use --status, --priority, --assign, --title");
    process.exit(1);
  }

  const issue = await paperclipFetch(`/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  console.log(`✅ Updated: ${issue.identifier} — ${issue.title}`);
  for (const [key, val] of Object.entries(updates)) {
    console.log(`   ${key}: ${val}`);
  }
}

async function resolveIssueId(idOrIdentifier: string): Promise<string | null> {
  // If it looks like a UUID, use directly
  if (idOrIdentifier.includes("-") && idOrIdentifier.length > 20) return idOrIdentifier;

  // Otherwise search by identifier (MIC-XXX)
  const issues = await paperclipFetch(`/companies/${COMPANY_ID}/issues`);
  const match = issues.find((i: any) => i.identifier === idOrIdentifier);
  return match?.id || null;
}

main().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
