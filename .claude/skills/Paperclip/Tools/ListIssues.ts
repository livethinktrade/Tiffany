#!/usr/bin/env bun
// Lists issues with optional filters: --project, --status, --bucket, --epic, --limit

import { PAPERCLIP_BASE, COMPANY_ID, paperclipFetch, PROJECTS } from "./config.ts";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    project: { type: "string", short: "p" },
    status: { type: "string", short: "s" },
    bucket: { type: "string", short: "b" },
    epic: { type: "boolean", short: "e", default: false },
    limit: { type: "string", short: "l", default: "30" },
  },
});

async function main() {
  // Resolve project ID
  let projectId: string | undefined;
  if (values.project) {
    const match = Object.entries(PROJECTS).find(([name]) =>
      name.toLowerCase().includes(values.project!.toLowerCase())
    );
    if (match) {
      projectId = match[1].id;
      console.log(`Filtering by project: ${match[0]}`);
    } else {
      console.error(`Unknown project: ${values.project}. Available: ${Object.keys(PROJECTS).join(", ")}`);
      process.exit(1);
    }
  }

  // Filter by bucket
  if (values.bucket) {
    const bucketNum = parseInt(values.bucket);
    const bucketProjects = Object.entries(PROJECTS).filter(([, c]) => c.bucket === bucketNum);
    if (bucketProjects.length === 0) {
      console.error(`No projects in bucket ${bucketNum}`);
      process.exit(1);
    }
    console.log(`Filtering by Bucket ${bucketNum}: ${bucketProjects.map(([n]) => n).join(", ")}`);

    const allIssues: any[] = [];
    for (const [name, config] of bucketProjects) {
      const issues = await paperclipFetch(`/companies/${COMPANY_ID}/issues?projectId=${config.id}`);
      allIssues.push(...issues.map((i: any) => ({ ...i, _project: name })));
    }
    printIssues(allIssues, values);
    return;
  }

  // Single project query
  let url = `/companies/${COMPANY_ID}/issues`;
  if (projectId) url += `?projectId=${projectId}`;

  const issues = await paperclipFetch(url);
  printIssues(issues, values);
}

function printIssues(issues: any[], filters: any) {
  let filtered = issues;

  if (filters.status) {
    const statuses = filters.status.split(",");
    filtered = filtered.filter((i: any) => statuses.includes(i.status));
  }

  if (filters.epic) {
    filtered = filtered.filter((i: any) => !i.parentId);
  }

  const limit = parseInt(filters.limit || "30");
  filtered = filtered.slice(0, limit);

  if (filtered.length === 0) {
    console.log("No issues found matching filters.");
    return;
  }

  console.log(`\nShowing ${filtered.length} issues:\n`);
  for (const issue of filtered) {
    const parent = issue.parentId ? " (story)" : "";
    const project = issue._project ? ` [${issue._project}]` : "";
    const assignee = issue.assigneeAgentId ? " 👤" : "";
    console.log(`  ${issue.identifier || "---"} | ${issue.status.padEnd(12)} | ${issue.priority?.padEnd(6) || "none  "} | ${issue.title.slice(0, 60)}${parent}${project}${assignee}`);
  }
  console.log(`\nTotal: ${filtered.length} issues`);
}

main().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
