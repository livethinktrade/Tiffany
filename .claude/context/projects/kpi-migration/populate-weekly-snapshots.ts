#!/usr/bin/env bun
/**
 * Weekly Metrics Snapshot Population Script
 *
 * Aggregates data from Daily_Gains and KPI_Tracking tables
 * and inserts weekly snapshots into Weekly_Metrics_Snapshot fact table.
 *
 * Usage: bun run populate-weekly-snapshots.ts
 */

const NOCODB_BASE_URL = "https://nocodb.legacysearchers.agency";
const NOCODB_TOKEN = "td0bOQERBas7rhBpl5Tgqw5me3KOd90wfcT8wzSP";
const BASE_ID = "p199bc4ytgj21sr";

// Table IDs
const TABLES = {
  DAILY_GAINS: "m0i6l3ehhyzh8dp",
  KPI_TRACKING: "mqixf7cnw3gv5r4",
  WEEKLY_SNAPSHOT: "mvgewp77tgx3p8v",
  ONE_SHEET: "mft5qfinmn14g59",
};

interface DailyGain {
  id: number;
  fields: {
    Date: string;
    Gain_1?: string;
    Gain_2?: string;
    Gain_3?: string;
    Mood_Context?: string;
  };
}

interface KPIRecord {
  id: number;
  fields: {
    Date: string;
    KPI_Type: string;
    Value: number;
    Notes?: string;
  };
}

interface WeeklySnapshot {
  Week_Ending: string;
  Week_Label: string;
  KPI_Type: string;
  Value_Week: number;
  Value_YTD: number;
  Notes?: string;
}

// Helper: Get Sunday of the week for a given date
function getWeekEnding(dateStr: string): string {
  // Parse various date formats
  let date: Date;

  // Try MM/DD/YYYY format first
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1;
      const day = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      // Handle 2-digit years
      if (year < 100) {
        year = year > 50 ? 1900 + year : 2000 + year;
      }
      date = new Date(year, month, day);
    } else {
      return "";
    }
  } else if (dateStr.includes("-")) {
    // YYYY-MM-DD format
    date = new Date(dateStr);
  } else {
    return "";
  }

  if (isNaN(date.getTime())) {
    return "";
  }

  // Get Sunday of the week (end of week)
  const dayOfWeek = date.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  date.setDate(date.getDate() + daysUntilSunday);

  return date.toISOString().split("T")[0];
}

// Helper: Get week label (W##-YYYY)
function getWeekLabel(weekEnding: string): string {
  const date = new Date(weekEnding);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `W${weekNum.toString().padStart(2, "0")}-${date.getFullYear()}`;
}

// Fetch all records from a table
async function fetchAllRecords<T>(tableId: string): Promise<T[]> {
  const records: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${NOCODB_BASE_URL}/api/v2/tables/${tableId}/records?limit=100&offset=${(page - 1) * 100}`;
    const response = await fetch(url, {
      headers: {
        "xc-token": NOCODB_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.statusText}`);
    }

    const data = await response.json();
    const list = data.list || [];

    // Transform to expected format
    for (const item of list) {
      records.push({
        id: item.Id,
        fields: item,
      } as T);
    }

    hasMore = list.length === 100;
    page++;
  }

  return records;
}

// Insert records into Weekly_Metrics_Snapshot
async function insertSnapshots(snapshots: WeeklySnapshot[]): Promise<void> {
  const url = `${NOCODB_BASE_URL}/api/v2/tables/${TABLES.WEEKLY_SNAPSHOT}/records`;

  // NocoDB expects records in a specific format
  const records = snapshots.map((s) => ({
    Week_Ending: s.Week_Ending,
    Week_Label: s.Week_Label,
    KPI_Type: s.KPI_Type,
    Value_Week: s.Value_Week,
    Value_YTD: s.Value_YTD,
    Notes: s.Notes || null,
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xc-token": NOCODB_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(records),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to insert records: ${response.statusText} - ${error}`);
  }

  const result = await response.json();
  console.log(`✅ Inserted ${result.length || records.length} snapshot records`);
}

// Process Daily Gains into weekly snapshots
function processDailyGains(records: DailyGain[]): Map<string, WeeklySnapshot> {
  const weeklyData = new Map<string, { days: Set<string>; totalGains: number }>();

  for (const record of records) {
    const dateStr = record.fields.Date;
    if (!dateStr) continue;

    const weekEnding = getWeekEnding(dateStr);
    if (!weekEnding) continue;

    // Only process 2025 and 2026 data
    const year = parseInt(weekEnding.split("-")[0]);
    if (year < 2025) continue;

    if (!weeklyData.has(weekEnding)) {
      weeklyData.set(weekEnding, { days: new Set(), totalGains: 0 });
    }

    const week = weeklyData.get(weekEnding)!;
    week.days.add(dateStr);

    // Count actual gains (non-null, non-template entries)
    let gainsCount = 0;
    if (record.fields.Gain_1 && !record.fields.Gain_1.includes("{{")) gainsCount++;
    if (record.fields.Gain_2 && !record.fields.Gain_2.includes("{{")) gainsCount++;
    if (record.fields.Gain_3 && !record.fields.Gain_3.includes("{{")) gainsCount++;
    week.totalGains += gainsCount;
  }

  // Convert to snapshots
  const snapshots = new Map<string, WeeklySnapshot>();

  // Sort weeks chronologically to calculate YTD
  const sortedWeeks = Array.from(weeklyData.keys()).sort();
  let ytdDays = 0;

  for (const weekEnding of sortedWeeks) {
    const week = weeklyData.get(weekEnding)!;
    ytdDays += week.days.size;

    const key = `${weekEnding}:Gains_Logged`;
    snapshots.set(key, {
      Week_Ending: weekEnding,
      Week_Label: getWeekLabel(weekEnding),
      KPI_Type: "Gains_Logged",
      Value_Week: week.days.size,
      Value_YTD: ytdDays,
      Notes: `Days with gains logged. ${week.totalGains} total gain entries.`,
    });
  }

  return snapshots;
}

// Process KPI Tracking into weekly snapshots
function processKPITracking(records: KPIRecord[]): Map<string, WeeklySnapshot> {
  // Group by KPI type and week
  const weeklyData = new Map<string, Map<string, { sum: number; notes: string[] }>>();

  for (const record of records) {
    const dateStr = record.fields.Date;
    const kpiType = record.fields.KPI_Type;
    const value = record.fields.Value;

    if (!dateStr || !kpiType || value === null || value === undefined) continue;

    const weekEnding = getWeekEnding(dateStr);
    if (!weekEnding) continue;

    // Only process 2025 and 2026 data
    const year = parseInt(weekEnding.split("-")[0]);
    if (year < 2025) continue;

    if (!weeklyData.has(kpiType)) {
      weeklyData.set(kpiType, new Map());
    }

    const kpiWeeks = weeklyData.get(kpiType)!;
    if (!kpiWeeks.has(weekEnding)) {
      kpiWeeks.set(weekEnding, { sum: 0, notes: [] });
    }

    const week = kpiWeeks.get(weekEnding)!;
    week.sum += value;
    if (record.fields.Notes) {
      week.notes.push(record.fields.Notes);
    }
  }

  // Convert to snapshots
  const snapshots = new Map<string, WeeklySnapshot>();

  for (const [kpiType, weeks] of weeklyData) {
    const sortedWeeks = Array.from(weeks.keys()).sort();
    let ytd = 0;

    for (const weekEnding of sortedWeeks) {
      const week = weeks.get(weekEnding)!;
      ytd += week.sum;

      const key = `${weekEnding}:${kpiType}`;
      snapshots.set(key, {
        Week_Ending: weekEnding,
        Week_Label: getWeekLabel(weekEnding),
        KPI_Type: kpiType,
        Value_Week: week.sum,
        Value_YTD: ytd,
        Notes: week.notes.length > 0 ? week.notes.slice(0, 3).join("; ") : undefined,
      });
    }
  }

  return snapshots;
}

async function main() {
  console.log("🚀 Weekly Metrics Snapshot Population Script");
  console.log("============================================\n");

  try {
    // Fetch Daily Gains
    console.log("📊 Fetching Daily_Gains records...");
    const dailyGains = await fetchAllRecords<DailyGain>(TABLES.DAILY_GAINS);
    console.log(`   Found ${dailyGains.length} records\n`);

    // Fetch KPI Tracking
    console.log("📊 Fetching KPI_Tracking records...");
    const kpiRecords = await fetchAllRecords<KPIRecord>(TABLES.KPI_TRACKING);
    console.log(`   Found ${kpiRecords.length} records\n`);

    // Process into weekly snapshots
    console.log("⚙️  Processing Daily Gains...");
    const gainsSnapshots = processDailyGains(dailyGains);
    console.log(`   Created ${gainsSnapshots.size} weekly gain snapshots\n`);

    console.log("⚙️  Processing KPI Tracking...");
    const kpiSnapshots = processKPITracking(kpiRecords);
    console.log(`   Created ${kpiSnapshots.size} weekly KPI snapshots\n`);

    // Merge all snapshots
    const allSnapshots = new Map([...gainsSnapshots, ...kpiSnapshots]);
    console.log(`📦 Total snapshots to insert: ${allSnapshots.size}\n`);

    // Preview
    console.log("📋 Preview of snapshots:");
    console.log("------------------------");
    const previewItems = Array.from(allSnapshots.values()).slice(0, 10);
    for (const snapshot of previewItems) {
      console.log(`   ${snapshot.Week_Label} | ${snapshot.KPI_Type.padEnd(20)} | Week: ${snapshot.Value_Week.toString().padStart(4)} | YTD: ${snapshot.Value_YTD.toString().padStart(5)}`);
    }
    if (allSnapshots.size > 10) {
      console.log(`   ... and ${allSnapshots.size - 10} more`);
    }
    console.log("");

    // Insert into database
    console.log("💾 Inserting snapshots into NocoDB...");
    await insertSnapshots(Array.from(allSnapshots.values()));

    console.log("\n✅ Migration complete!");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
