#!/usr/bin/env bun
// Test workflow with user's actual gains data

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

const { extractInformationTool } = await import('./src/tools/ai-processing/extract-information.js');
const { storeGainsTool } = await import('./src/tools/data-storage/store-gains.js');

console.log('🎯 Testing workflow with USER GAINS DATA...\n');

const userInput = `My gains are:
1. I completed the random quote tool
2. I completed the orchestration tool
3. I completed the workout`;

console.log('📝 User input:', userInput);
console.log('\n' + '='.repeat(60));
console.log('STEP 1: EXTRACT INFORMATION');
console.log('='.repeat(60));

try {
  // Step 1: Extract the gains
  const extractionResult = await extractInformationTool.execute({
    userInput: userInput,
    extractionType: "gains",
    userId: "michael"
  });

  console.log('✅ Extraction completed!');
  console.log('📊 Extracted structure:', JSON.stringify(extractionResult.metadata.extractedData, null, 2));

  const extractedGains = extractionResult.metadata.extractedData.Gains;
  const extractedMood = extractionResult.metadata.extractedData.Mood[0];

  console.log('\n📋 Individual gains extracted:');
  extractedGains.forEach((gain, i) => {
    console.log(`  ${i + 1}. "${gain}"`);
  });
  console.log(`😊 Mood detected: ${extractedMood}`);

  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: STORE EACH GAIN TO AIRTABLE');
  console.log('='.repeat(60));

  const storeResults = [];

  for (let i = 0; i < extractedGains.length; i++) {
    const gain = extractedGains[i];
    console.log(`\n💾 Storing gain ${i + 1}: "${gain}"`);

    // Determine impact based on gain type
    let impact = 'medium'; // default
    if (gain.toLowerCase().includes('workout')) {
      impact = 'large'; // physical activity = high impact
    } else if (gain.toLowerCase().includes('tool')) {
      impact = 'large'; // completing tools = high impact
    }

    // Determine category
    let category = 'professional'; // default
    if (gain.toLowerCase().includes('workout')) {
      category = 'health';
    }

    const storeResult = await storeGainsTool.execute({
      gain: gain,
      impact: impact,
      category: category,
      userId: 'michael',
      moodContext: extractedMood
    });

    if (!storeResult.isError) {
      console.log(`✅ SUCCESS: Gain stored to Airtable`);
      if (storeResult.metadata?.airtableId) {
        console.log(`   📋 Record ID: ${storeResult.metadata.airtableId}`);
      }
      storeResults.push({
        success: true,
        gain: gain,
        impact: impact,
        category: category,
        airtableId: storeResult.metadata?.airtableId
      });
    } else {
      console.log(`❌ FAILED: ${storeResult.metadata?.error}`);
      storeResults.push({
        success: false,
        gain: gain,
        error: storeResult.metadata?.error
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('FINAL RESULTS');
  console.log('='.repeat(60));

  console.log(`📊 Total gains processed: ${extractedGains.length}`);
  console.log(`✅ Successfully stored: ${storeResults.filter(r => r.success).length}`);
  console.log(`❌ Failed to store: ${storeResults.filter(r => !r.success).length}`);
  console.log(`😊 Mood context: ${extractedMood}`);

  console.log('\n📋 Storage Details:');
  storeResults.forEach((result, index) => {
    if (result.success) {
      console.log(`  ✅ ${index + 1}. "${result.gain}"`);
      console.log(`     Impact: ${result.impact}, Category: ${result.category}`);
      console.log(`     Airtable: ${result.airtableId || 'stored successfully'}`);
    } else {
      console.log(`  ❌ ${index + 1}. "${result.gain}" - ${result.error}`);
    }
  });

  if (storeResults.every(r => r.success)) {
    console.log('\n🎉 COMPLETE SUCCESS!');
    console.log('✅ All your gains have been extracted and stored in Airtable');
    console.log('🎯 Workflow: Extract → Parse → Store → Database WORKING!');
  } else {
    console.log('\n⚠️ PARTIAL SUCCESS');
  }

} catch (error) {
  console.error('❌ Workflow failed:', error.message);
}