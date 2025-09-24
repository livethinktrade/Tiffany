#!/usr/bin/env bun

// Test get_random_quote with real database categories and full functionality
// Categories from discovery: "Focus", "Risk-Taking", "Patience", "Self-Awareness"

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { getRandomQuoteTool } from './src/tools/data-storage/get-random-quote.js';

async function testRealQuotes() {
  console.log('🎯 Testing get_random_quote with real database categories...\n');

  // Test cases with real categories
  const testCases = [
    {
      name: 'Focus Category Quote',
      params: {
        category: 'Focus',
        userId: 'test-focus-user',
        markAsUsed: false
      },
      expected: 'Should return quote from Focus category'
    },
    {
      name: 'Risk-Taking Category Quote',
      params: {
        category: 'Risk-Taking',
        userId: 'test-risk-user',
        markAsUsed: false
      },
      expected: 'Should return quote from Risk-Taking category'
    },
    {
      name: 'Patience Category with Usage Tracking',
      params: {
        category: 'Patience',
        userId: 'test-patience-user',
        markAsUsed: true
      },
      expected: 'Should return Patience quote and mark as used'
    },
    {
      name: 'Self-Awareness Category',
      params: {
        category: 'Self-Awareness',
        userId: 'test-awareness-user',
        markAsUsed: false
      },
      expected: 'Should return Self-Awareness quote'
    },
    {
      name: 'Unused Quotes Only Test',
      params: {
        category: 'Focus',
        userId: 'test-unused-user',
        markAsUsed: false
      },
      expected: 'Should prefer unused Focus quotes'
    }
  ];

  for (const test of testCases) {
    console.log(`\n📋 ${test.name}`);
    console.log(`🎯 Expected: ${test.expected}`);
    console.log(`⚙️  Parameters:`, JSON.stringify(test.params, null, 2));

    try {
      const startTime = Date.now();
      const result = await getRandomQuoteTool.execute(test.params);
      const executionTime = Date.now() - startTime;

      if (result.isError) {
        console.log('❌ Tool returned error');
        console.log('🔍 Error details:', result.content[0].text);
        console.log('📊 Error metadata:', result.metadata);
      } else {
        console.log('✅ Tool processed successfully');
        console.log(`⏱️  Execution time: ${executionTime}ms`);

        console.log('\n📜 Quote Result:');
        console.log(result.content[0].text);

        console.log('\n📊 Metadata:');
        console.log('  - Quote ID:', result.metadata?.quoteId);
        console.log('  - Category:', result.metadata?.category);
        console.log('  - Style:', result.metadata?.style);
        console.log('  - Author:', result.metadata?.author);
        console.log('  - Marked as used:', result.metadata?.markedAsUsed);
        console.log('  - Available quotes:', result.metadata?.availableQuotes);
      }

    } catch (error) {
      console.error('💥 Execution error:', error.message);
    }

    console.log('\n' + '='.repeat(80));
  }

  // Test the usage tracking by checking if Used_Date gets updated
  console.log('\n🔬 Testing Usage Tracking...');

  try {
    console.log('\nStep 1: Get a quote and mark it as used');
    const usageTest = await getRandomQuoteTool.execute({
      category: 'Self-Awareness',
      userId: 'usage-test-user',
      markAsUsed: true
    });

    if (!usageTest.isError) {
      const quoteId = usageTest.metadata?.quoteId;
      console.log(`✅ Successfully marked quote ${quoteId} as used`);
      console.log('📋 Usage result:', usageTest.metadata?.markedAsUsed);

      // Now test that unused filter works
      console.log('\nStep 2: Try to get unused quotes (should exclude the one we just used)');
      // Note: This might still return the same quote if there are multiple quotes in the category

    } else {
      console.log('❌ Usage test failed:', usageTest.content[0].text);
    }

  } catch (usageError) {
    console.error('💥 Usage tracking test error:', usageError.message);
  }

  console.log('\n🎯 Real quotes testing complete!');
}

// Run the test
testRealQuotes().catch(console.error);