#!/usr/bin/env bun

// Test script to verify quote usage updates the Used_Date field immediately
// Tests both functionality and data persistence in Airtable

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { getRandomQuoteTool } from './src/tools/data-storage/get-random-quote.js';
import { AirtableService } from './src/services/airtable-service.js';

async function testQuoteUsageUpdate() {
  console.log('🧪 Testing Quote Usage Date Updates...\n');

  const airtableService = new AirtableService();

  console.log('📊 Step 1: Get a quote WITHOUT marking as used');
  try {
    const result1 = await getRandomQuoteTool.execute({
      userId: 'test-usage-user',
      markAsUsed: false // Don't mark as used yet
    });

    if (result1.isError) {
      console.log('❌ Error getting quote:', result1.content[0].text);
      return;
    }

    const quoteId = result1.metadata?.quoteId;
    const fullText = result1.content[0].text;
    const quoteMatch = fullText.match(/> "(.*?)"/);
    const quoteText = quoteMatch ? quoteMatch[1].substring(0, 50) + '...' : 'Unknown quote';

    console.log(`✅ Got quote: "${quoteText}"`);
    console.log(`📋 Quote ID: ${quoteId}`);
    console.log(`👤 Author: ${result1.metadata?.author}`);
    console.log(`📂 Category: ${result1.metadata?.category}`);

    // Check current Used_Date in Airtable BEFORE marking as used
    console.log('\n🔍 Step 2: Check current Used_Date in Airtable database');
    const beforeUsedDate = await getQuoteUsedDate(airtableService, quoteId);
    console.log(`📅 Used_Date BEFORE: ${beforeUsedDate || 'Empty/Never used'}`);

    // Record timestamp before marking as used
    const timestampBefore = new Date();
    console.log(`⏰ Current time: ${timestampBefore.toISOString()}`);
    console.log(`🌍 Current Central Time: ${timestampBefore.toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);

    console.log('\n💾 Step 3: Mark the same quote as USED');
    const result2 = await getRandomQuoteTool.execute({
      userId: 'test-usage-user',
      markAsUsed: true // NOW mark as used
    });

    if (result2.isError) {
      console.log('❌ Error marking quote as used:', result2.content[0].text);
      return;
    }

    const timestampAfter = new Date();
    console.log(`✅ Successfully marked quote as used`);
    console.log(`⏰ Processing completed at: ${timestampAfter.toISOString()}`);

    // Check Used_Date in Airtable AFTER marking as used
    console.log('\n🔍 Step 4: Verify Used_Date was updated in Airtable database');

    // Wait a moment for database update
    await new Promise(resolve => setTimeout(resolve, 1000));

    const afterUsedDate = await getQuoteUsedDate(airtableService, quoteId);
    console.log(`📅 Used_Date AFTER: ${afterUsedDate || 'Still Empty - ERROR!'}`);

    if (afterUsedDate && afterUsedDate !== beforeUsedDate) {
      console.log('✅ SUCCESS: Used_Date was updated!');

      // Parse the timestamp to verify timezone
      const usedDateParsed = new Date(afterUsedDate);
      console.log(`📊 Parsed timestamp: ${usedDateParsed.toISOString()}`);
      console.log(`🌍 In Central Time: ${usedDateParsed.toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);

      // Calculate time difference
      const timeDiff = Math.abs(usedDateParsed.getTime() - timestampBefore.getTime());
      const secondsDiff = Math.round(timeDiff / 1000);
      console.log(`⏱️  Update latency: ${secondsDiff} seconds`);

      if (secondsDiff < 10) {
        console.log('✅ EXCELLENT: Update was immediate (< 10 seconds)');
      } else if (secondsDiff < 30) {
        console.log('✅ GOOD: Update was fast (< 30 seconds)');
      } else {
        console.log('⚠️ SLOW: Update took longer than expected');
      }

    } else {
      console.log('❌ FAILED: Used_Date was not updated or is the same as before');
      console.log(`   Before: ${beforeUsedDate}`);
      console.log(`   After:  ${afterUsedDate}`);
    }

    // Test prioritization impact
    console.log('\n🎯 Step 5: Test prioritization impact');
    console.log('Getting 3 more quotes to see if the recently used quote is avoided...');

    const usedQuoteAppeared = [];
    for (let i = 1; i <= 3; i++) {
      const testResult = await getRandomQuoteTool.execute({
        userId: 'test-priority-check',
        markAsUsed: false
      });

      if (!testResult.isError) {
        const testId = testResult.metadata?.quoteId;
        const appeared = testId === quoteId;
        usedQuoteAppeared.push(appeared);

        const testText = testResult.content[0].text;
        const testMatch = testText.match(/> "(.*?)"/);
        const testShort = testMatch ? testMatch[1].substring(0, 35) + '...' : 'Unknown';

        console.log(`  ${i}. "${testShort}" ${appeared ? '🔄 SAME (unexpected!)' : '✅ Different (good!)'}`);
      }
    }

    const repeatCount = usedQuoteAppeared.filter(x => x).length;
    console.log(`\n📈 Priority Test Results:`);
    console.log(`   Recently used quote appeared ${repeatCount} out of 3 times`);
    if (repeatCount === 0) {
      console.log('✅ EXCELLENT: Recently used quote was completely avoided');
    } else if (repeatCount === 1) {
      console.log('✅ GOOD: Recently used quote appeared once (weighted randomness)');
    } else {
      console.log('⚠️ CONCERNING: Recently used quote appeared multiple times');
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }

  console.log('\n🎯 Test Summary:');
  console.log('✅ Expected: Used_Date updates immediately in Central Time');
  console.log('✅ Expected: Recently used quotes get lower priority');
  console.log('✅ Expected: Database updates are persistent and verifiable');
}

// Helper function to get Used_Date directly from Airtable
async function getQuoteUsedDate(airtableService: any, quoteId: string): Promise<string | null> {
  try {
    const response = await airtableService.makeRequest(
      'GET',
      `Inspirational_Quotes/${quoteId}`
    );

    return response.fields['Used_Date'] as string || null;
  } catch (error) {
    console.error(`Error getting Used_Date for quote ${quoteId}:`, error.message);
    return null;
  }
}

// Run the test
testQuoteUsageUpdate().catch(console.error);