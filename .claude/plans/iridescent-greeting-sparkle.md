# Plan: Rewrite Version 2.0 Roadmap as Unified Gamified Level System

## Summary

Replace the two outdated version_roadmap files (both from Oct 2025, focused on eliminated med spa sales strategy) with a single gamified level system aligned to current telos, analysis, and strategies. Levels are phase-based (not date-bound), KPI-driven (measured in NocoDB), and designed as a game Michael will eventually build on top of.

---

## Step 1: Archive `version_roadmap_detailed.md`

```bash
git mv "telos/identity/version_roadmap_detailed.md" "telos/_archive/version_roadmap_detailed_medspa_2025.md"
```

We keep `version_roadmap.md` in place (preserving git history) and rewrite it completely.

---

## Step 2: Rewrite `telos/identity/version_roadmap.md`

Complete rewrite of this file with the gamified level system. Structure:

### Document Structure

1. **Header** — Living Document callout, related files, last updated
2. **The Game** — What this document is, how levels work, the rules
3. **XP System** — Daily activities → XP, tracked in NocoDB
4. **Current Level** — `[ ] Level 1.1 — The Survivor` (updated as Michael progresses)
5. **Level 1.0 → 2.0** — Seven levels, each with identity shift, KPIs, boss fight, unlocks
6. **Post-2.0 Hints** — Levels 2.1-3.0 mapped to long-term goals G1-G6
7. **NocoDB KPI Reference** — Complete table of tracked fields
8. **Related Files**

### The 7 Levels

| Level | Title | Identity Shift | Strategy Phase | Key KPI Gates |
|-------|-------|---------------|---------------|---------------|
| **1.0** | The Architect | Starting point — brilliant planner, zero sustained execution | — | — |
| **1.1** | The Survivor | "I execute therefore I exist" — 21 consecutive MINS days | S1 Early | 21 MINS days, 60h study, 30 problems, 50 apps, 80% lockbox |
| **1.2** | The Contender | "I compete despite feeling unready" — actively interviewing | S1 Active | 45 MINS days, 150 apps, 10 screens, 3 technical interviews, 20 rejections |
| **1.3** | The Provider | "I have a job" — C1 constraint removed | S1 Victory / S2 Start | Job offer signed, first paycheck, 60 MINS days, 200h study, 200 apps |
| **1.5** | The Foundation | "I build wealth, not just earn" — financial discipline proven | S2 Complete | $5K emergency fund, cards current, 10 Sunday reviews, 85% purchase delay |
| **1.7** | The Hunter | "I sell and collect rejections" — SD2 transfer proven | S3 Launch | 500 dials, 100 business rejections, 10 appointments, 1 client, 150 MINS days |
| **1.9** | The Engine | "My system reliably produces" — repeatable, not lucky | S3 Proven | 3 consecutive months at 2+ clients, 1500 dials, 6 active clients, $10K fund |
| **2.0** | Michael 2.0 | "I AM someone who executes" — character transformation complete | S3 Sustained | $60K annual side revenue, $10K+ net worth, 365 MINS days, 24h avg recovery, 6+ months no pivot |

### Key Design Principles

- **CT1 (Discipline) is NOT tracked separately** — it's the lag indicator. Completing levels IS the proof of discipline.
- **Each level has a Boss Fight** — a specific challenge testing whether the identity shift is real
- **KPI gates require BOTH volume (XP threshold) AND quality (specific criteria)**
- **Levels are phase-based, not date-bound** — level up when criteria met, regardless of calendar
- **Post-2.0 levels hint at G1-G6** but aren't fully designed (expansion content)

### Boss Fights (per level)

| Level | Boss Fight | Tests |
|-------|-----------|-------|
| 1.1 | First Shutdown Recovery — emotional trigger hits, recover within 24h, complete MINS next day | CT3, CT5 |
| 1.2 | Rejection Gauntlet — collect 20 rejections with neutral debriefs | LB3, SD1 |
| 1.3 | Worth Trap — recognize "now I'm worthy" feeling as LB3, reframe as "I proved CT1" | LB3 |
| 1.5 | Lifestyle Inflation — maintain 48h purchase rule + Sunday reviews for 10 weeks with real paychecks | SD3, CT4 |
| 1.7 | 100 Rejections Trophy — 100 actual "no"s from cold calls, each logged | SD2, LB5 |
| 1.9 | Plateau Month — maintain 10 dials/day through a down month without pivoting | Failure Mode #1 |
| 2.0 | Identity Integration — written reflection: who was I at 1.0, who am I now, what did I learn | Full integration |

### XP System

Daily activities tracked in NocoDB generate XP:

| Activity | XP | NocoDB Field |
|----------|-----|-------------|
| MINS completed (daily) | 25 | mins_completed |
| Phone lockbox compliance | 20 | lockbox_compliant |
| Study hour | 5 | study_hours |
| Problem solved | 5 | problems_solved |
| Application sent | 3 | applications_sent |
| Interview completed | 30 | interviews_completed |
| Emotional regulation attempt | 15 | regulation_attempted |
| Ship timer compliance | 10 | ship_timer_compliant |
| Purchase delay compliance | 10 | purchase_delay_compliant |
| Recovery within 24h | 20 | recovery_speed |
| Networking outreach | 5 | networking_outreach |
| Rejection collected | 5 | rejections_collected |
| Cold call dial | 3 | cold_call_dials |
| Content piece published | 15 | content_published |

Streak multipliers: 1.5x after 7 consecutive MINS days, 2x after 21, 3x after 60.

### Suggested NocoDB KPI Additions

Beyond existing (study time, problems solved, gains, applications):

- `mins_completed` (bool/daily)
- `lockbox_compliant` (bool/daily)
- `regulation_attempted` (bool/trigger days)
- `ship_timer_compliant` (bool/daily)
- `purchase_delay_compliant` (bool/per impulse)
- `recovery_speed` (int/days after trigger)
- `rejections_collected` (int/cumulative)
- `cold_call_dials` (int/daily)
- `emergency_fund_balance` (float/weekly)
- `net_worth_monthly` (float/monthly)
- `active_clients` (int/monthly)
- `content_published` (int/cumulative)

---

## Step 3: Update `telos/TELOS_INDEX.md`

Remove `version_roadmap_detailed.md` references:

1. **Directory structure** (line 75): Remove `version_roadmap_detailed.md` line
2. **Layer 1** (line 196): Remove detailed reference, update remaining reference description to "Gamified transformation level system"
3. **"Who am I becoming?"** (line 256): Already references version_roadmap, no change needed

---

## Step 4: Update `telos/P2_worksheets_index.md`

1. **Module 5.2 migration entry** (line 28-30): Update "New Location" to note file archived, content merged into version_roadmap.md
2. **Section 5 TOC** (line 75): Update 5.2 link to note archived/merged
3. **Related Telos Files** (line 122): Remove version_roadmap_detailed reference

---

## Files Modified (Summary)

| File | Action |
|------|--------|
| `telos/identity/version_roadmap_detailed.md` | `git mv` → `telos/_archive/version_roadmap_detailed_medspa_2025.md` |
| `telos/identity/version_roadmap.md` | Complete rewrite with gamified level system |
| `telos/TELOS_INDEX.md` | Remove detailed file references, update description |
| `telos/P2_worksheets_index.md` | Update 5.2 migration entry to note archived/merged |

---

## Verification

1. Only ONE version_roadmap file exists in `telos/identity/`
2. `version_roadmap.md` contains all 7 levels (1.0 → 2.0) with KPI tables, boss fights, unlocks
3. XP system and NocoDB KPI reference table present
4. Post-2.0 hints table present (levels 2.1-3.0)
5. No references to med spa affiliate sales in new content
6. CT1 is NOT tracked as a standalone metric — discipline is proven by level completion
7. `git log --follow telos/identity/version_roadmap.md` preserves history
8. `telos/_archive/version_roadmap_detailed_medspa_2025.md` exists with old content
9. TELOS_INDEX only references single version_roadmap file
10. P2_worksheets_index reflects merged/archived state
11. All Obsidian wiki-links resolve correctly
