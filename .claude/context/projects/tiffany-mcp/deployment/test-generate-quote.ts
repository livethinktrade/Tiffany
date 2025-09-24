#!/usr/bin/env bun

// Test script for generate_custom_quote tool
// Tests AI-powered quote generation functionality

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { generateCustomQuoteTool } from './src/tools/ai-processing/generate-custom-quote.js';

async function testGenerateCustomQuote() {
  console.log('💬 Testing generate_custom_quote tool...\n');

  // Check environment variables
  console.log('🔑 Environment check:');
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
  console.log('OPENROUTER_API_KEY present:', !!process.env.OPENROUTER_API_KEY);

  if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    console.log('⚠️  No AI API keys found - will test template generation');
  }

  // Test cases
  const testCases = [
    {
      name: 'Basic Quote Generation',
      params: {
        topic: 'productivity',
        style: 'inspirational' as const,
        userId: 'test-user',
        saveToDatabase: false
      },
      expected: 'Should generate inspirational quote about productivity'
    },
    {
      name: 'Personalized Quote with Context',
      params: {
        topic: 'overcoming challenges',
        style: 'practical' as const,
        userContext: 'User is struggling with time management and feeling overwhelmed',
        personalizedFor: 'John',
        mood: 'calming' as const,
        length: 'short' as const,
        userId: 'test-user',
        saveToDatabase: false
      },
      expected: 'Should generate calming, practical quote about overcoming challenges'
    },
    {
      name: 'Philosophical Long Quote',
      params: {
        style: 'philosophical' as const,
        mood: 'reflective' as const,
        length: 'long' as const,
        includeAuthor: true,
        userId: 'test-user',
        saveToDatabase: false
      },
      expected: 'Should generate long philosophical quote with author attribution'
    },
    {
      name: 'Motivational Quote without Topic',
      params: {
        style: 'inspirational' as const,
        mood: 'energizing' as const,
        userId: 'test-user',
        saveToDatabase: false
      },
      expected: 'Should generate energizing inspirational quote on general theme'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n📋 ${test.name}`);
    console.log(`🎯 Expected: ${test.expected}`);
    console.log(`⚙️  Parameters:`, JSON.stringify(test.params, null, 2));

    try {
      const startTime = Date.now();
      const result = await generateCustomQuoteTool.execute(test.params);
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
        console.log('  - Style:', result.metadata?.style);
        console.log('  - Length:', result.metadata?.length);
        console.log('  - Generation method:', result.metadata?.generationMethod);
        console.log('  - Saved to database:', result.metadata?.savedToDatabase);
      }

    } catch (error) {
      console.error('💥 Execution error:', error.message);
    }

    console.log('\n' + '='.repeat(80));
  }

  // Test tool structure
  console.log('\n🔬 Tool Structure Analysis:');
  console.log('Tool name:', generateCustomQuoteTool.name);
  console.log('Tool description:', generateCustomQuoteTool.description);
  console.log('Schema defined:', !!generateCustomQuoteTool.schema);

  // Test schema validation
  console.log('\n📋 Schema Validation:');
  try {
    generateCustomQuoteTool.schema.parse({
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
    generateCustomQuoteTool.schema.parse({
      style: 'invalid_style'
    });
  } catch (error) {
    console.log('✅ Schema correctly rejects invalid style enum');
  }
}

// Run the test
testGenerateCustomQuote().catch(console.error);