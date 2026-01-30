# Weekly_Metrics_Snapshot Table Specification

## Status: ✅ CREATED & POPULATED

| Property | Value |
|----------|-------|
| **Table ID** | `mvgewp77tgx3p8v` |
| **Base ID** | `p199bc4ytgj21sr` |
| **Design** | Fact Table (normalized) |
| **Created** | 2026-01-22 |
| **Records** | 52 weekly snapshots |

## Purpose
Pre-compute all numerical metrics weekly via N8N scheduled job. Single source of truth for "how am I doing this week vs last week?"

---

## Table Schema (Fact Table Design)

| Field | Type | Description |
|-------|------|-------------|
| `Week_Ending` | Date | Sunday of the week (YYYY-MM-DD) |
| `Week_Label` | SingleLineText | Human-readable week ID (W##-YYYY) |
| `KPI_Type` | SingleLineText | References one_sheet.Field_Alias |
| `Value_Week` | Number | This week's value |
| `Value_YTD` | Number | Year-to-date cumulative |
| `Created_At` | DateTime | When snapshot was generated |
| `Notes` | LongText | Optional annotations |

---

## KPI Types Currently Tracked

| KPI_Type | Source | Description |
|----------|--------|-------------|
| `Gains_Logged` | Daily_Gains | Days with gains logged per week |
| `study_unit` | KPI_Tracking | Study units completed |
| `Letters_Sent` | KPI_Tracking | Sales letters sent |
| `Content_Published` | KPI_Tracking | Content pieces published |
| `Primary_Interactions` | KPI_Tracking | Primary outreach interactions |
| `Followup_Calls` | KPI_Tracking | Follow-up calls made |
| `System_Building_Hours` | KPI_Tracking | Hours spent on system building |

---

## Dimension Table Reference (one_sheet)

The `one_sheet` table serves as the dimension table:

| Field | Purpose |
|-------|---------|
| `Goal_Name` | Display name |
| `Field_Alias` | Joins to KPI_Type |
| `Yearly Goal` | Annual target |
| `Weekly Goal` | Weekly target |
| `Pillar` | Business / Health / Adventure |
| `Goal_Type` | lead_goal / lag_goal |

---

## Data Population Script

Location: `/.claude/context/projects/kpi-migration/populate-weekly-snapshots.ts`

```bash
# Run to repopulate snapshots
cd /home/michael/tiffany-pai/.claude/context/projects/kpi-migration
bun run populate-weekly-snapshots.ts
```

The script:
1. Fetches all Daily_Gains records
2. Fetches all KPI_Tracking records
3. Aggregates by week (calculates Week_Ending as Sunday)
4. Calculates YTD running totals
5. Inserts into Weekly_Metrics_Snapshot

---

## Sample Data (Most Recent)

| Week_Ending | Week_Label | KPI_Type | Value_Week | Value_YTD |
|-------------|------------|----------|------------|-----------|
| 2026-01-26 | W05-2026 | study_unit | 6 | 51 |
| 2026-01-26 | W04-2026 | Gains_Logged | 1 | 2 |
| 2026-01-19 | W04-2026 | study_unit | 4 | 45 |
| 2026-01-12 | W03-2026 | study_unit | 9 | 41 |

---

## Query Examples

### Get current week's metrics
```sql
SELECT * FROM Weekly_Metrics_Snapshot
WHERE Week_Ending = '2026-01-26'
```

### Get progress with goals (join one_sheet)
```sql
SELECT
  w.Week_Label,
  w.KPI_Type,
  w.Value_Week,
  w.Value_YTD,
  o."Yearly Goal",
  ROUND(w.Value_YTD * 100.0 / o."Yearly Goal", 1) as Pct_Complete
FROM Weekly_Metrics_Snapshot w
JOIN one_sheet o ON w.KPI_Type = o.Field_Alias
WHERE w.Week_Ending = '2026-01-26'
```

### Get 4-week trend
```sql
SELECT * FROM Weekly_Metrics_Snapshot
WHERE KPI_Type = 'study_unit'
ORDER BY Week_Ending DESC
LIMIT 4
```

---

## N8N Workflow Integration

The N8N workflow should:
1. Run every Sunday at 11:59 PM (or Monday 6:00 AM)
2. Query current week's data from KPI_Tracking
3. Query one_sheet for goals
4. Calculate this week's values
5. Insert new snapshot row(s)

---

## NocoDB Table IDs (Reference)

| Table | ID |
|-------|-----|
| `one_sheet` | mft5qfinmn14g59 |
| `KPI_Tracking` | mqixf7cnw3gv5r4 |
| `Daily_Gains` | m0i6l3ehhyzh8dp |
| `Weekly_Metrics_Snapshot` | mvgewp77tgx3p8v |

---

## Created
- Date: 2026-01-22
- Redesigned: 2026-01-22 (wide → fact table)
- Plan: async-weaving-teacup.md
