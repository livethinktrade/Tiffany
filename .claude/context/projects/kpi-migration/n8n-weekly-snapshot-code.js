/**
 * N8N Weekly Snapshot Generator - Code Node
 *
 * WORKFLOW STRUCTURE:
 * 1. Schedule Trigger (Sunday 11:59 PM or Monday 6:00 AM)
 * 2. HTTP Request: GET KPI_Tracking records for this week
 * 3. HTTP Request: GET Daily_Gains records for this week
 * 4. HTTP Request: GET last week's snapshot (for YTD calculation)
 * 5. Code Node: THIS CODE - processes and aggregates data
 * 6. HTTP Request: POST to Weekly_Metrics_Snapshot
 *
 * INPUT: Expects items from previous nodes:
 *   - $('KPI_Tracking').all() - KPI records
 *   - $('Daily_Gains').all() - Daily gains records
 *   - $('Last_Snapshot').all() - Previous week's snapshots (optional)
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Adjust these node names to match your workflow
  KPI_NODE: 'KPI_Tracking',
  GAINS_NODE: 'Daily_Gains',
  LAST_SNAPSHOT_NODE: 'Last_Snapshot',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get Sunday (end of week) for a given date
 */
function getWeekEnding(date = new Date()) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().split('T')[0];
}

/**
 * Get week label (W##-YYYY format)
 */
function getWeekLabel(weekEnding) {
  const date = new Date(weekEnding);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `W${weekNum.toString().padStart(2, '0')}-${date.getFullYear()}`;
}

/**
 * Parse date string to Date object (handles MM/DD/YYYY and YYYY-MM-DD)
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1;
      const day = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      if (year < 100) year = year > 50 ? 1900 + year : 2000 + year;
      return new Date(year, month, day);
    }
  } else if (dateStr.includes('-')) {
    return new Date(dateStr);
  }
  return null;
}

/**
 * Check if a date falls within the current week
 */
function isInCurrentWeek(dateStr, weekEnding) {
  const date = parseDate(dateStr);
  if (!date) return false;

  const weekEnd = new Date(weekEnding);
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekStart.getDate() - 6);

  return date >= weekStart && date <= weekEnd;
}

// ============================================
// MAIN PROCESSING
// ============================================

// Calculate current week
const weekEnding = getWeekEnding();
const weekLabel = getWeekLabel(weekEnding);

// Get input data from previous nodes
let kpiRecords = [];
let gainsRecords = [];
let lastSnapshots = [];

try {
  kpiRecords = $input.all().filter(item => item.json.KPI_Type); // KPI records have KPI_Type
  gainsRecords = $input.all().filter(item => item.json.Gain_1 !== undefined); // Gains have Gain_1
} catch (e) {
  // If using named node references (preferred):
  try { kpiRecords = $(CONFIG.KPI_NODE).all(); } catch (e) { kpiRecords = []; }
  try { gainsRecords = $(CONFIG.GAINS_NODE).all(); } catch (e) { gainsRecords = []; }
  try { lastSnapshots = $(CONFIG.LAST_SNAPSHOT_NODE).all(); } catch (e) { lastSnapshots = []; }
}

// Build YTD lookup from last week's snapshots
const lastYTD = {};
for (const item of lastSnapshots) {
  const data = item.json;
  if (data.KPI_Type && data.Value_YTD !== undefined) {
    lastYTD[data.KPI_Type] = data.Value_YTD;
  }
}

// ============================================
// PROCESS KPI TRACKING
// ============================================
const kpiAggregates = {};

for (const item of kpiRecords) {
  const data = item.json;
  const dateStr = data.Date;
  const kpiType = data.KPI_Type;
  const value = data.Value;

  if (!dateStr || !kpiType || value === null || value === undefined) continue;
  if (!isInCurrentWeek(dateStr, weekEnding)) continue;

  if (!kpiAggregates[kpiType]) {
    kpiAggregates[kpiType] = { sum: 0, notes: [] };
  }

  kpiAggregates[kpiType].sum += Number(value);
  if (data.Notes) {
    kpiAggregates[kpiType].notes.push(data.Notes);
  }
}

// ============================================
// PROCESS DAILY GAINS
// ============================================
const gainsDays = new Set();
let totalGains = 0;

for (const item of gainsRecords) {
  const data = item.json;
  const dateStr = data.Date;

  if (!dateStr) continue;
  if (!isInCurrentWeek(dateStr, weekEnding)) continue;

  gainsDays.add(dateStr);

  // Count actual gains (non-null, non-template)
  if (data.Gain_1 && !data.Gain_1.includes('{{')) totalGains++;
  if (data.Gain_2 && !data.Gain_2.includes('{{')) totalGains++;
  if (data.Gain_3 && !data.Gain_3.includes('{{')) totalGains++;
}

// ============================================
// BUILD OUTPUT RECORDS
// ============================================
const snapshots = [];

// Add KPI snapshots
for (const [kpiType, data] of Object.entries(kpiAggregates)) {
  const previousYTD = lastYTD[kpiType] || 0;

  snapshots.push({
    json: {
      Week_Ending: weekEnding,
      Week_Label: weekLabel,
      KPI_Type: kpiType,
      Value_Week: data.sum,
      Value_YTD: previousYTD + data.sum,
      Notes: data.notes.length > 0 ? data.notes.slice(0, 3).join('; ') : null,
    }
  });
}

// Add Gains_Logged snapshot
const previousGainsYTD = lastYTD['Gains_Logged'] || 0;
snapshots.push({
  json: {
    Week_Ending: weekEnding,
    Week_Label: weekLabel,
    KPI_Type: 'Gains_Logged',
    Value_Week: gainsDays.size,
    Value_YTD: previousGainsYTD + gainsDays.size,
    Notes: `Days with gains logged. ${totalGains} total gain entries.`,
  }
});

// Return snapshots for insertion
return snapshots;
