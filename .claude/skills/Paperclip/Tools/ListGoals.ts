#!/usr/bin/env bun
// Lists all Paperclip goals (buckets + sub-goals) with their projects

import { PAPERCLIP_BASE, COMPANY_ID, paperclipFetch, PROJECTS } from "./config.ts";

async function main() {
  const goals = await paperclipFetch(`/companies/${COMPANY_ID}/goals`);
  const projects = await paperclipFetch(`/companies/${COMPANY_ID}/projects`);

  const buckets = goals.filter((g: any) => !g.parentId);

  for (const bucket of buckets.sort((a: any, b: any) => a.title.localeCompare(b.title))) {
    console.log(`\n🪣 ${bucket.title}`);
    console.log(`   Status: ${bucket.status} | Level: ${bucket.level}`);

    const subGoals = goals.filter((g: any) => g.parentId === bucket.id);
    for (const sg of subGoals) {
      const sgProjects = projects.filter((p: any) => p.goalIds?.includes(sg.id));
      const projectList = sgProjects.map((p: any) => p.name).join(", ") || "(no projects)";
      console.log(`   └── 🎯 ${sg.title}`);
      console.log(`       Projects: ${projectList}`);
    }

    // Direct projects (linked to bucket, not sub-goal)
    const directProjects = projects.filter((p: any) => p.goalIds?.includes(bucket.id));
    for (const p of directProjects) {
      console.log(`   └── 📁 ${p.name} (direct)`);
    }
  }

  console.log(`\nTotal: ${buckets.length} buckets, ${goals.length - buckets.length} sub-goals, ${projects.length} projects`);
}

main().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
