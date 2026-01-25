# Central Metrics Table Design

## Problem
Current setup requires complex aggregation logic everywhere (N8N, AI prompts) to compute weekly metrics. No single source of truth for "how am I doing this week vs last week?"

## Solution
Create a **Weekly_Metrics_Snapshot** table in NocoDB that pre-computes all numerical metrics weekly via N8N scheduled job.

---

## Table Design: `Weekly_Metrics_Snapshot`

### Core Fields
| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `Id` | ID | 1 | Auto-increment |
| `Week_Ending` | Date | 2026-01-19 | Sunday of the week |
| `Week_Label` | Text | W03-2026 | Human-readable week ID |

### KPI Metrics (from KPI_Tracking)
| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `Study_Units_Total` | Number | 29 | Cumulative YTD |
| `Study_Units_Week` | Number | 9 | This week only |
| `Study_Units_Goal` | Number | 112 | From one_sheet |
| `Study_Units_Pct` | Number | 25.9 | Progress % |
| `Cold_Calls_Total` | Number | 45 | Cumulative YTD |
| `Cold_Calls_Week` | Number | 12 | This week only |
| `Cold_Calls_Goal` | Number | 500 | From one_sheet |
| `Cold_Calls_Pct` | Number | 9.0 | Progress % |
*(Add more KPI columns as needed)*

### Daily Gains Metrics (from Daily_Gains)
| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `Gains_Logged` | Number | 5 | Days with gains this week |
| `Gains_Total_Week` | Number | 15 | Total gain entries (3/day max) |

### Time Tracking (Future)
| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `Deep_Work_Hours` | Number | 18.5 | From Toggl/RescueTime |
| `Sales_Hours` | Number | 6.2 | Time on sales activities |
| `Admin_Hours` | Number | 4.0 | Time on admin/overhead |

### Financial (Future)
| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `Spending_Total` | Number | 1250.00 | Total spending this week |
| `Spending_Discretionary` | Number | 320.00 | Non-essential spending |

### Metadata
| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `Created_At` | DateTime | 2026-01-20 08:00 | When snapshot was generated |
| `Notes` | LongText | "Short week due to holiday" | Manual annotations |

---

## Data Flow

```
EVERY SUNDAY/MONDAY (N8N Scheduled Job)
────────────────────────────────────────

1. Query KPI_Tracking
   └─► Filter: Date within last 7 days
   └─► Group by KPI_Type, SUM(Value)
   └─► Also get YTD totals

2. Query one_sheet
   └─► Get current goals for each KPI

3. Query Daily_Gains
   └─► Count entries for the week

4. (Future) Query Toggl API
   └─► Get time entries by category

5. (Future) Query Bank CSV/API
   └─► Categorize spending

6. COMPUTE
   └─► Percentages, deltas from previous week

7. INSERT into Weekly_Metrics_Snapshot
   └─► One row for this week
```

---

## How This Enables Your Use Cases

### 1. Progress Bars (N8N → Telegram)
```javascript
// Simple query - no aggregation needed
const snapshot = $input.first().json;
const bar = progressBar(snapshot.Study_Units_Total, snapshot.Study_Units_Goal);
```

### 2. Banana Visualization
```
Query: Get last 4 weeks of snapshots
→ Render progress bars for each week
→ Show trend (improving/declining)
```

### 3. Weekly Analysis AI Input
```
Prompt: "Here are my metrics for W03-2026:
- Study Units: 29/112 (26%) - +9 this week
- Cold Calls: 45/500 (9%) - +12 this week
- Gains Logged: 5/7 days

Combined with my daily journals, analyze..."
```

### 4. TELOS Updates
```
Query: Get last 12 weeks of snapshots
→ Identify KPIs consistently below target
→ Surface as "challenges" in TELOS
```

### 5. Quarterly Digest
```
Query: Get all snapshots for Q1
→ Calculate quarterly averages
→ Identify best/worst weeks
→ Extract for QUARTERLY_INSIGHTS_DIGEST.md
```

---

## Implementation Steps

### Phase 1: Create Table ✅ COMPLETE (2026-01-22)
**REDESIGNED: Wide table → Fact table for flexibility**

1. ✅ Created `Weekly_Metrics_Snapshot` fact table (ID: mvgewp77tgx3p8v)
2. ✅ Fields: `Week_Ending`, `Week_Label`, `KPI_Type`, `Value_Week`, `Value_YTD`, `Created_At`, `Notes`
3. ✅ one_sheet serves as dimension table (joins on KPI_Type = Field_Alias)

### Phase 1b: Document ✅ COMPLETE (2026-01-22)
1. ✅ Saved spec to Obsidian: `P2_25-12-31_kpi-airtable-to-nocodb-migration_PLANNED/Weekly_Metrics_Snapshot_Table_Spec.md`

### Phase 1c: Data Population ✅ COMPLETE (2026-01-22)
1. ✅ Created migration script: `populate-weekly-snapshots.ts`
2. ✅ Populated 52 weekly snapshots from existing data
3. ✅ KPI Types: Gains_Logged, study_unit, Letters_Sent, Content_Published, etc.

### Phase 2: N8N Workflow
1. Create "Weekly Snapshot Generator" workflow
2. Query KPI_Tracking with date filters
3. Query one_sheet for goals
4. Compute totals, percentages, deltas
5. Insert new snapshot row
6. Schedule for Sunday 11:59 PM or Monday 6:00 AM

### Phase 3: Update Consumers
1. Update progress bar workflow to read from snapshot
2. Update weekly analysis prompt to include snapshot data
3. Test with 2-3 weeks of manual backfill

### Phase 4: Extend (Future)
1. Add time tracking integration (Toggl API)
2. Add financial tracking (bank CSV import or API)
3. Add more KPI types as goals evolve

---

## Verification

1. **Table Creation:** Verify all fields exist with correct types
2. **N8N Workflow:** Run manually, confirm snapshot row created
3. **Data Accuracy:** Compare snapshot totals vs manual KPI_Tracking sum
4. **Consumer Update:** Progress bar workflow reads from snapshot correctly
5. **Historical:** Backfill 2-3 weeks, verify trends display properly

---

## NocoDB Table IDs (Reference)

| Table | ID |
|-------|-----|
| `one_sheet` | mft5qfinmn14g59 |
| `KPI_Tracking` | mqixf7cnw3gv5r4 |
| `Daily_Gains` | m0i6l3ehhyzh8dp |
| `Weekly_Metrics_Snapshot` | mvgewp77tgx3p8v | ✅ CREATED & POPULATED 2026-01-22 (52 records)
