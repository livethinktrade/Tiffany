#!/usr/bin/env bun

// Test script for get_random_quote tool
// Tests the complete quote retrieval and filtering functionality

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { getRandomQuoteTool } from './src/tools/data-storage/get-random-quote.js';

async function testGetRandomQuote() {
  console.log('📋 Testing get_random_quote tool...\n');

  // Check environment variables
  console.log('🔑 Environment check:');
  console.log('AIRTABLE_API_KEY present:', !!process.env.AIRTABLE_API_KEY);
  console.log('AIRTABLE_BASE_ID present:', !!process.env.AIRTABLE_BASE_ID);

  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.log('⚠️  Airtable credentials not found - will test offline behavior');
  }

  // Test cases
  const testCases = [
    {
      name: 'Basic Quote Retrieval (No Filters)',
      params: {
        userId: 'test-user-1',
        markAsUsed: false
      },
      expected: 'Should return any available quote'
    },
    {
      name: 'Category Filter - Motivation',
      params: {
        category: 'motivation',
        userId: 'test-user-2',
        markAsUsed: false
      },
      expected: 'Should return quote from motivation category'
    },
    {
      name: 'Style Filter - Inspirational',
      params: {
        style: 'inspirational' as const,
        userId: 'test-user-3',
        markAsUsed: false
      },
      expected: 'Should return inspirational style quote'
    },
    {
      name: 'Combined Filters with Usage Tracking',
      params: {
        category: 'success',
        style: 'practical' as const,
        userId: 'test-user-4',
        markAsUsed: true
      },
      expected: 'Should return practical success quote and mark it as used'
    },
    {
      name: 'Exclude IDs Filter',
      params: {
        exclude: ['quote_1', 'quote_2', 'quote_3'],
        userId: 'test-user-5',
        markAsUsed: false
      },
      expected: 'Should return quote not in exclude list'
    },
    {
      name: 'Unused Quotes Only',
      params: {
        category: 'growth',
        userId: 'test-user-6',
        markAsUsed: false
      },
      expected: 'Should prefer unused quotes from growth category'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n📋 ${test.name}`);
    console.log(`🎯 Expected: ${test.expected}`);
    console.log(`⚙️  Parameters:`, JSON.stringify(test.params, null, 2));

    try {
      const startTime = Date.now();
      const result = await getRandomQuoteTool.execute(test.params);
      const executionTime = Date.now() - startTime;

      console.log('📊 Result:');
      console.log(result.content[0].text);

      if (result.isError) {
        console.log('❌ Tool returned error');
        console.log('🔍 Error metadata:', result.metadata);
      } else {
        console.log('✅ Tool processed successfully');
        console.log(`⏱️  Execution time: ${executionTime}ms`);
        console.log('📊 Metadata summary:');
        console.log('  - Quote ID:', result.metadata?.quoteId);
        console.log('  - Category:', result.metadata?.category);
        console.log('  - Style:', result.metadata?.style);
        console.log('  - Author:', result.metadata?.author);
        console.log('  - Marked as used:', result.metadata?.markedAsUsed);
        console.log('  - Available quotes:', result.metadata?.availableQuotes);
      }

    } catch (error) {
      console.error('💥 Execution error:', error.message);
      console.error('🔍 Stack trace:', error.stack);
    }

    console.log('\n' + '='.repeat(80));
  }

  // Test helper methods
  console.log('\n🔬 Helper Methods Testing:');

  console.log('\n📋 Testing getQuoteByType helper:');
  try {
    const morningQuote = await getRandomQuoteTool.getQuoteByType('morning', 'test-user-morning');
    console.log('✅ Morning quote helper works');
    console.log('📊 Morning quote result:', morningQuote.content[0].text.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ Morning quote helper failed:', error.message);
  }

  console.log('\n📋 Testing getUnusedQuotesCount helper:');
  try {
    const unusedCount = await getRandomQuoteTool.getUnusedQuotesCount('motivation', 'inspirational');
    console.log('✅ Unused quotes count helper works');
    console.log('📊 Unused motivational inspirational quotes:', unusedCount);
  } catch (error) {
    console.log('❌ Unused quotes count helper failed:', error.message);
  }

  // Test tool structure
  console.log('\n🔬 Tool Structure Analysis:');
  console.log('Tool name:', getRandomQuoteTool.name);
  console.log('Tool description:', getRandomQuoteTool.description);
  console.log('Schema defined:', !!getRandomQuoteTool.schema);

  // Test schema validation
  console.log('\n📋 Schema Validation:');
  try {
    getRandomQuoteTool.schema.parse({
      category: 'motivation',
      style: 'inspirational',
      userId: 'test'
    });
    console.log('✅ Schema validation works correctly');
  } catch (schemaError) {
    console.log('❌ Schema validation issue:', schemaError.message);
  }

  // Test edge cases
  console.log('\n🧪 Edge Case Testing:');
  try {
    getRandomQuoteTool.schema.parse({
      style: 'invalid_style'
    });
  } catch (error) {
    console.log('✅ Schema correctly rejects invalid style enum');
  }

  console.log('\n🎯 Testing complete! Check results above for any issues.');
}

// Run the test
testGetRandomQuote().catch(console.error);