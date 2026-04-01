#!/usr/bin/env bun
// Deletes a Paperclip issue by identifier (MIC-XXX) or UUID
// Usage: bun DeleteIssue.ts --id MIC-999

import { COMPANY_ID, paperclipFetch } from "./config.ts";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    id: { type: "string" },
  },
});

async function main() {
  if (!values.id) {
    console.error("Usage: bun DeleteIssue.ts --id MIC-999");
    process.exit(1);
  }

  const issueId = await resolveIssueId(values.id);
  if (!issueId) {
    console.error(`Issue not found: ${values.id}`);
    process.exit(1);
  }

  // Get issue details first for confirmation
  const issue = await paperclipFetch(`/issues/${issueId}`);

  const result = await fetch(`http://localhost:3100/api/issues/${issueId}`, { method: "DELETE" });
  if (!result.ok) {
    const body = await result.text();
    console.error(`Failed to delete: ${result.status} — ${body}`);
    process.exit(1);
  }

  console.log(`✅ Deleted: ${issue.identifier} — ${issue.title}`);
}

async function resolveIssueId(idOrIdentifier: string): Promise<string | null> {
  if (idOrIdentifier.includes("-") && idOrIdentifier.length > 20) return idOrIdentifier;
  const issues = await paperclipFetch(`/companies/${COMPANY_ID}/issues`);
  const match = issues.find((i: any) => i.identifier === idOrIdentifier);
  return match?.id || null;
}

main().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
