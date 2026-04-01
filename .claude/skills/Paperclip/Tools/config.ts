// Paperclip API Configuration — VPS only (localhost:3100)
// For WSL2 access, use SSH tunnel: ssh -L 3100:localhost:3100 root@srv816737.hstgr.cloud

export const PAPERCLIP_BASE = "http://localhost:3100/api";
export const COMPANY_ID = "df05cea3-9a04-4a9d-a300-cea99930cc48";

export const PROJECTS: Record<string, { id: string; bucket: number; keywords: string[] }> = {
  "Austin Job":       { id: "d37024ea-c05f-472e-93a8-b5074d63a1eb", bucket: 1, keywords: ["job", "interview", "resume", "application", "career", "salary", "employment"] },
  "Project Management": { id: "05dbd506-9208-4c3c-a43b-00927a5bfba3", bucket: 1, keywords: ["megan", "project", "task", "ticket", "backlog", "productivity", "pm", "schedule"] },
  "Dance Practice":   { id: "f853f039-1629-427f-8c5b-ce51262b7525", bucket: 2, keywords: ["aaron", "dance", "moves", "practice", "choreography", "dip", "swing", "red river"] },
  "Health Coach":     { id: "8ee6e2ec-78d6-4d02-821e-155440c1a92d", bucket: 2, keywords: ["marc", "health", "fitness", "workout", "nutrition", "sleep", "ironman", "weight"] },
  "Destiny: Quotes":  { id: "695d21d7-d5a6-4ab4-bae3-9b4451de7ce2", bucket: 3, keywords: ["quote", "motivation", "inspiration", "daily quote"] },
  "Destiny: Focus":   { id: "c75c6c52-d77e-4e19-8e69-736626ffa729", bucket: 3, keywords: ["screen time", "focus", "blocking", "app limit", "stayfree", "usage"] },
  "PAI Infrastructure": { id: "6ca5df9c-fe60-49de-b5b3-b382c24da947", bucket: 3, keywords: ["tiffany", "pai", "infrastructure", "kpi", "nocodb", "n8n", "openclaw", "claude", "skill", "hook"] },
  "Gamification":     { id: "975988a2-5df9-4ab5-ae50-5b84e45d5fed", bucket: 3, keywords: ["gamification", "rc", "reward", "boss", "minion", "combo", "quest", "sprite"] },
};

export const TIER_LABELS: Record<number, { tier: string; rc: string }> = {
  1: { tier: "8d1b64a5-afde-49de-89e7-cad952e48db8", rc: "3e70018d-a519-42e3-947b-4f99b12a6b3e" },
  2: { tier: "cd5eb584-ec3b-43fb-84f7-5e216060058d", rc: "5616cb68-a2aa-4c3a-8023-44b919e12af5" },
  3: { tier: "7af72d3e-bec8-4501-9ab3-08cec97b405b", rc: "377177fc-e981-41f5-92c9-8e5d814b87c8" },
  4: { tier: "fff690c3-b38d-4040-8806-b1ff31718b4a", rc: "b456e73c-d2d5-40a9-9ec7-25f307eaadd6" },
};

export const AGENTS: Record<string, string> = {
  "tiffany": "b27e615d-4f0d-4853-9825-816565ca3811",
  "megan":   "27009afb-95c3-454d-ac9f-a455f8e12640",
  "aaron":   "26a3ca29-edfa-44e4-b5ba-bdac6bf2a9be",
  "marc":    "a9f8369e-f771-40c5-af25-7305110b7158",
};

export function routeToProject(text: string): { name: string; id: string; bucket: number } {
  const lower = text.toLowerCase();
  for (const [name, config] of Object.entries(PROJECTS)) {
    if (config.keywords.some(kw => lower.includes(kw))) {
      return { name, id: config.id, bucket: config.bucket };
    }
  }
  // Default to PAI Infrastructure
  return { name: "PAI Infrastructure", id: PROJECTS["PAI Infrastructure"].id, bucket: 3 };
}

export async function paperclipFetch(path: string, options?: RequestInit): Promise<any> {
  const url = `${PAPERCLIP_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paperclip API ${res.status}: ${body}`);
  }
  return res.json();
}
