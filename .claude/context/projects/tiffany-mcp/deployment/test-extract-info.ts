#!/usr/bin/env bun

// Test script for extract_information tool
// Specifically testing multi-gain parsing functionality

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { extractInformationTool } from './src/tools/ai-processing/extract-information.js';

async function testExtractInformation() {
  console.log('🔍 Testing extract_information tool...\n');

  // Test cases - specifically multi-gain scenarios
  const testCases = [
    {
      name: 'Single Gain Test',
      input: 'I completed my workout today - 45 minutes of cardio!',
      expected: 'Should extract one gain about exercise'
    },
    {
      name: 'Multi-Gain Test (Critical Issue)',
      input: 'Today I accomplished three things: finished the project presentation, had a great workout at the gym, and called my mom to check in.',
      expected: 'Should extract 3 separate gains: work/project, health/exercise, personal/family'
    },
    {
      name: 'Complex Multi-Gain with Numbers',
      input: 'Crushed my goals today! 1) Closed 3 sales deals worth $15k, 2) ran 5 miles in under 40 minutes, 3) read 2 chapters of my leadership book',
      expected: 'Should extract 3 gains with metrics: sales ($15k), fitness (5 miles, 40min), learning (2 chapters)'
    },
    {
      name: 'Comma-Separated Gains',
      input: 'Won big today: launched the new website, got promoted to senior developer, and celebrated with friends at dinner',
      expected: 'Should extract 3 gains: career/launch, work/promotion, personal/social'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`📋 ${test.name}`);
    console.log(`📝 Input: "${test.input}"`);
    console.log(`🎯 Expected: ${test.expected}`);

    try {
      // Test with 'gains' extraction type specifically
      const result = await extractInformationTool.execute({
        userInput: test.input,
        extractionType: 'gains',
        userId: 'test-user',
        includeConfidence: true
      });

      console.log('✅ Result:');
      console.log(result.content[0].text);
      console.log('\n📊 Metadata:', JSON.stringify(result.metadata, null, 2));

    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  // Test full extraction type to see comprehensive parsing
  console.log('🔬 Testing FULL extraction type...\n');

  try {
    const fullResult = await extractInformationTool.execute({
      userInput: 'Today I accomplished three things: finished the project presentation, had a great workout at the gym, and called my mom to check in.',
      extractionType: 'full',
      userId: 'test-user',
      includeConfidence: true
    });

    console.log('📋 FULL Extraction Result:');
    console.log(fullResult.content[0].text);
    console.log('\n📊 Full Metadata:', JSON.stringify(fullResult.metadata?.extractedData, null, 2));

  } catch (error) {
    console.error('❌ Full extraction error:', error.message);
  }
}

// Run the test
testExtractInformation().catch(console.error);