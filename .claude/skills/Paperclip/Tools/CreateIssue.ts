#!/usr/bin/env bun
// Creates a Paperclip issue with auto-routing and label assignment
// Usage: bun CreateIssue.ts --title "..." --description "..." --tier 2 [--project PAI] [--status backlog] [--priority medium] [--parent EPIC_ID]

import { COMPANY_ID, paperclipFetch, PROJECTS, TIER_LABELS, routeToProject } from "./config.ts";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    title: { type: "string", short: "t" },
    description: { type: "string", short: "d" },
    tier: { type: "string", default: "2" },
    project: { type: "string", short: "p" },
    status: { type: "string", short: "s", default: "backlog" },
    priority: { type: "string", default: "medium" },
    parent: { type: "string" },
  },
});

async function main() {
  if (!values.title) {
    console.error("Usage: bun CreateIssue.ts --title \"...\" --description \"...\" --tier 2");
    console.error("Options: --project, --status, --priority, --parent");
    process.exit(1);
  }

  // Route to project
  let projectId: string;
  let projectName: string;
  let bucket: number;

  if (values.project) {
    const match = Object.entries(PROJECTS).find(([name]) =>
      name.toLowerCase().includes(values.project!.toLowerCase())
    );
    if (!match) {
      console.error(`Unknown project: ${values.project}. Available: ${Object.keys(PROJECTS).join(", ")}`);
      process.exit(1);
    }
    projectId = match[1].id;
    projectName = match[0];
    bucket = match[1].bucket;
  } else {
    const routed = routeToProject(values.title + " " + (values.description || ""));
    projectId = routed.id;
    projectName = routed.name;
    bucket = routed.bucket;
    console.log(`Auto-routed to: ${projectName} (Bucket ${bucket})`);
  }

  // Warn about Bucket 3
  if (bucket === 3) {
    console.log("⚠️  This is Bucket 3 (Curiosity Shelf) — gated until rotation trigger met.");
  }

  // Get labels
  const tierNum = parseInt(values.tier!);
  const labels = TIER_LABELS[tierNum];
  if (!labels) {
    console.error(`Invalid tier: ${tierNum}. Use 1-4.`);
    process.exit(1);
  }

  const body: any = {
    title: values.title,
    description: values.description || "",
    status: values.status,
    priority: values.priority,
    projectId,
    labelIds: [labels.tier, labels.rc],
  };

  if (values.parent) {
    body.parentId = values.parent;
  }

  const issue = await paperclipFetch(`/companies/${COMPANY_ID}/issues`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  console.log(`\n✅ Created: ${issue.identifier} — ${issue.title}`);
  console.log(`   Project: ${projectName} (Bucket ${bucket})`);
  console.log(`   Status: ${issue.status} | Priority: ${issue.priority}`);
  console.log(`   Tier: ${tierNum} | Labels: ${issue.labelIds?.length || 0}`);
  console.log(`   ID: ${issue.id}`);
}

main().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
