#!/usr/bin/env bun
// Gets full details of a single Paperclip issue
// Usage: bun GetIssue.ts --id MIC-219

import { COMPANY_ID, paperclipFetch, PROJECTS } from "./config.ts";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    id: { type: "string" },
  },
});

async function main() {
  if (!values.id) {
    console.error("Usage: bun GetIssue.ts --id MIC-219");
    process.exit(1);
  }

  const issueId = await resolveIssueId(values.id);
  if (!issueId) {
    console.error(`Issue not found: ${values.id}`);
    process.exit(1);
  }

  const issue = await paperclipFetch(`/issues/${issueId}`);

  // Find project name
  const projectEntry = Object.entries(PROJECTS).find(([, c]) => c.id === issue.projectId);
  const projectName = projectEntry?.[0] || "Unknown";
  const bucket = projectEntry?.[1]?.bucket || "?";

  console.log(`\n📋 ${issue.identifier} — ${issue.title}`);
  console.log(`${"─".repeat(60)}`);
  console.log(`Project:  ${projectName} (Bucket ${bucket})`);
  console.log(`Status:   ${issue.status}`);
  console.log(`Priority: ${issue.priority || "none"}`);
  console.log(`Parent:   ${issue.parentId || "(top-level)"}`);
  console.log(`Assignee: ${issue.assigneeAgentId || "(unassigned)"}`);
  console.log(`Created:  ${issue.createdAt}`);
  console.log(`Updated:  ${issue.updatedAt}`);

  if (issue.labels?.length) {
    console.log(`Labels:   ${issue.labels.map((l: any) => l.name).join(", ")}`);
  }

  if (issue.description) {
    console.log(`\nDescription:\n${issue.description}`);
  }

  console.log(`\nID: ${issue.id}`);
}

async function resolveIssueId(idOrIdentifier: string): Promise<string | null> {
  if (idOrIdentifier.includes("-") && idOrIdentifier.length > 20) return idOrIdentifier;
  const issues = await paperclipFetch(`/companies/${COMPANY_ID}/issues`);
  const match = issues.find((i: any) => i.identifier === idOrIdentifier);
  return match?.id || null;
}

main().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
