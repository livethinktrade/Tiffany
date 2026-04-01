#!/usr/bin/env bun
// Lists all Paperclip projects grouped by bucket with issue counts

import { PAPERCLIP_BASE, COMPANY_ID, paperclipFetch, PROJECTS } from "./config.ts";

async function main() {
  const goals = await paperclipFetch(`/companies/${COMPANY_ID}/goals`);
  const projects = await paperclipFetch(`/companies/${COMPANY_ID}/projects`);

  const buckets = goals.filter((g: any) => !g.parentId).sort((a: any, b: any) => a.title.localeCompare(b.title));

  for (const bucket of buckets) {
    console.log(`\n🪣 ${bucket.title}`);

    const subGoals = goals.filter((g: any) => g.parentId === bucket.id);
    const allGoalIds = [bucket.id, ...subGoals.map((sg: any) => sg.id)];

    const bucketProjects = projects.filter((p: any) =>
      p.goalIds?.some((gid: string) => allGoalIds.includes(gid))
    );

    for (const proj of bucketProjects) {
      const issues = await paperclipFetch(`/companies/${COMPANY_ID}/issues?projectId=${proj.id}`);
      const epics = issues.filter((i: any) => !i.parentId);
      const stories = issues.filter((i: any) => i.parentId);
      const byStatus: Record<string, number> = {};
      for (const i of issues) {
        byStatus[i.status] = (byStatus[i.status] || 0) + 1;
      }
      const statusStr = Object.entries(byStatus).map(([s, c]) => `${s}: ${c}`).join(", ");

      console.log(`   📁 ${proj.name}`);
      console.log(`      ${issues.length} issues (${epics.length} epics, ${stories.length} stories)`);
      if (statusStr) console.log(`      Status: ${statusStr}`);
    }
  }
}

main().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
