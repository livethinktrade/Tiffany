#!/usr/bin/env bun
// Test complete workflow: extract_information → store_gains - Agent-1

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

const { extractInformationTool } = await import('./src/tools/ai-processing/extract-information.js');
const { storeGainsTool } = await import('./src/tools/data-storage/store-gains.js');

console.log('🔄 Testing COMPLETE WORKFLOW: Extract → Store Gains - Agent-1...\n');

// Test data with multiple gains
const testInput = `My daily gains today:
1. Completed the MCP tool testing workflow
2. Fixed the multi-gain parsing algorithm
3. Successfully integrated Airtable with proper field mapping
4. Generated AI-powered personalized quotes`;

console.log('📝 Input gains:', testInput);
console.log('\n' + '='.repeat(60));
console.log('STEP 1: EXTRACT INFORMATION');
console.log('='.repeat(60));

try {
  // Step 1: Extract the gains
  const extractionResult = await extractInformationTool.execute({
    userInput: testInput,
    extractionType: "gains",
    userId: "michael"
  });

  console.log('✅ Extraction successful!');
  console.log('📊 Extracted data:', JSON.stringify(extractionResult.metadata.extractedData, null, 2));

  if (!extractionResult.metadata?.extractedData?.Gains) {
    throw new Error('No gains extracted from input');
  }

  const extractedGains = extractionResult.metadata.extractedData.Gains;
  const extractedMood = extractionResult.metadata.extractedData.Mood[0];

  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: STORE GAINS TO AIRTABLE');
  console.log('='.repeat(60));

  // Step 2: Store each gain individually (current tool limitation)
  const storeResults = [];

  for (let i = 0; i < extractedGains.length; i++) {
    const gain = extractedGains[i];
    console.log(`\n🔄 Storing gain ${i + 1}: "${gain}"`);

    try {
      const storeResult = await storeGainsTool.execute({
        gain: gain,
        impact: i === 0 ? 'large' : i === 1 ? 'medium' : 'small', // Vary impact for testing
        category: 'professional',
        userId: 'michael',
        moodContext: extractedMood
      });

      if (!storeResult.isError) {
        console.log(`✅ Gain ${i + 1} stored successfully!`);
        if (storeResult.metadata?.airtableId) {
          console.log(`   📋 Airtable ID: ${storeResult.metadata.airtableId}`);
        }
        storeResults.push({
          success: true,
          gain: gain,
          airtableId: storeResult.metadata?.airtableId
        });
      } else {
        console.log(`❌ Gain ${i + 1} failed to store:`, storeResult.metadata?.error);
        storeResults.push({
          success: false,
          gain: gain,
          error: storeResult.metadata?.error
        });
      }
    } catch (error) {
      console.log(`❌ Gain ${i + 1} error:`, error.message);
      storeResults.push({
        success: false,
        gain: gain,
        error: error.message
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('WORKFLOW SUMMARY');
  console.log('='.repeat(60));

  console.log(`📊 Extracted: ${extractedGains.length} gains`);
  console.log(`💾 Stored: ${storeResults.filter(r => r.success).length} gains`);
  console.log(`❌ Failed: ${storeResults.filter(r => !r.success).length} gains`);
  console.log(`😊 Mood: ${extractedMood}`);

  console.log('\n📋 Detailed Results:');
  storeResults.forEach((result, index) => {
    if (result.success) {
      console.log(`  ✅ ${index + 1}. "${result.gain}" → ${result.airtableId}`);
    } else {
      console.log(`  ❌ ${index + 1}. "${result.gain}" → ${result.error}`);
    }
  });

  if (storeResults.every(r => r.success)) {
    console.log('\n🎉 COMPLETE WORKFLOW SUCCESS!');
    console.log('🔄 Full pipeline working: User Input → Extract → Store → Airtable');
  } else {
    console.log('\n⚠️ PARTIAL SUCCESS - Some gains failed to store');
  }

} catch (error) {
  console.error('❌ Workflow test failed:', error.message);
  console.error('Stack:', error.stack);
}