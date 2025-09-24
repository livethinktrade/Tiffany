#!/usr/bin/env bun

// Discover actual Airtable schema for Inspirational_Quotes table
// This will help us get the correct field names

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

async function discoverQuoteSchema() {
  console.log('🔍 Discovering Inspirational_Quotes table schema...\n');

  const baseUrl = 'https://api.airtable.com/v0';
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = 'Inspirational_Quotes';

  if (!apiKey || !baseId) {
    console.log('❌ Missing Airtable credentials');
    return;
  }

  try {
    // Get a few records to see the field structure
    const url = `${baseUrl}/${baseId}/${table}?maxRecords=3`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`❌ Airtable API error: ${response.status} - ${errorData}`);
      return;
    }

    const data = await response.json();

    console.log('📊 Table Response:');
    console.log(`Total records found: ${data.records?.length || 0}`);

    if (data.records && data.records.length > 0) {
      console.log('\n🔍 Field Names Discovered:');
      const firstRecord = data.records[0];
      const fieldNames = Object.keys(firstRecord.fields);

      fieldNames.forEach((field, index) => {
        console.log(`${index + 1}. "${field}"`);
      });

      console.log('\n📋 Sample Record Structure:');
      console.log('Record ID:', firstRecord.id);
      console.log('Fields:');

      Object.entries(firstRecord.fields).forEach(([key, value]) => {
        console.log(`  "${key}": ${typeof value === 'string' ? `"${value}"` : value}`);
      });

      // Show all records for complete analysis
      console.log('\n📚 All Records Summary:');
      data.records.forEach((record, index) => {
        console.log(`\nRecord ${index + 1} (${record.id}):`);
        Object.entries(record.fields).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 50) {
            console.log(`  "${key}": "${value.substring(0, 50)}..."`);
          } else {
            console.log(`  "${key}": ${typeof value === 'string' ? `"${value}"` : value}`);
          }
        });
      });

    } else {
      console.log('\n⚠️ No records found in table. Table might be empty.');
    }

    // Also try to get table metadata if available
    console.log('\n🔍 Attempting to get table metadata...');
    try {
      const metaUrl = `${baseUrl}/${baseId}/${table}?maxRecords=1&fields[]=*`;
      const metaResponse = await fetch(metaUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        console.log('📋 Metadata response successful');
      }
    } catch (metaError) {
      console.log('⚠️ Could not fetch metadata:', metaError.message);
    }

  } catch (error) {
    console.error('❌ Discovery error:', error.message);
  }
}

// Run the discovery
discoverQuoteSchema().catch(console.error);