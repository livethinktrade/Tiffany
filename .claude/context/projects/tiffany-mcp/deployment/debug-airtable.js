#!/usr/bin/env bun
// Debug actual Airtable storage - find the real issue

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

console.log('🔍 DEBUGGING AIRTABLE STORAGE...\n');

console.log('🔑 Environment check:');
console.log('- AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? `Present (${process.env.AIRTABLE_API_KEY.substring(0, 8)}...)` : 'MISSING');
console.log('- AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? `Present (${process.env.AIRTABLE_BASE_ID})` : 'MISSING');

// Test direct Airtable API call
try {
  console.log('\n🌐 Testing DIRECT Airtable API call...');

  const testData = {
    "Date": "2025-01-14",
    "Gain_1": "Test gain from debug script",
    "User_Response": "Testing direct API call",
    "Mood_Context": "Good"
  };

  console.log('📝 Sending data:', JSON.stringify(testData, null, 2));

  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Daily_Gains`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: testData
    })
  });

  console.log('📡 Response status:', response.status);
  console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ AIRTABLE API ERROR:', errorText);
    throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ DIRECT API SUCCESS!');
  console.log('📊 Response:', JSON.stringify(result, null, 2));
  console.log(`🎯 RECORD ID: ${result.id}`);

} catch (apiError) {
  console.error('❌ Direct API test failed:', apiError.message);
}

// Test the store_gains tool with detailed logging
try {
  console.log('\n🔧 Testing store_gains TOOL with debug...');

  const { storeGainsTool } = await import('./src/tools/data-storage/store-gains.js');

  const toolResult = await storeGainsTool.execute({
    gain: "Debug test gain from tool",
    impact: 'medium',
    category: 'professional',
    userId: 'michael',
    moodContext: 'Good'
  });

  console.log('🛠️ Tool result:', JSON.stringify(toolResult, null, 2));

  if (toolResult.isError) {
    console.error('❌ TOOL ERROR:', toolResult.metadata?.error);
  } else {
    console.log('✅ Tool success claim, but checking metadata...');
    console.log('🔍 Airtable ID in metadata:', toolResult.metadata?.airtableId);

    if (!toolResult.metadata?.airtableId) {
      console.error('❌ NO AIRTABLE ID RETURNED - Data likely not stored!');
    }
  }

} catch (toolError) {
  console.error('❌ Tool test failed:', toolError.message);
  console.error('Stack trace:', toolError.stack);
}

console.log('\n' + '='.repeat(60));
console.log('DIAGNOSIS COMPLETE');
console.log('='.repeat(60));