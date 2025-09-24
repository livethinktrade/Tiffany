#!/usr/bin/env bun

// Test script for process_voice_input tool
// Tests voice transcription functionality

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { processVoiceInputTool } from './src/tools/ai-processing/process-voice-input.js';

async function testProcessVoiceInput() {
  console.log('🎤 Testing process_voice_input tool...\n');

  // Check if OpenAI API key is available
  console.log('🔑 Environment check:');
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);

  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  OpenAI API key not found in environment');
  } else {
    console.log('✅ OpenAI API key detected (length:', process.env.OPENAI_API_KEY.length, ')');
  }

  // Test cases
  const testCases = [
    {
      name: 'Missing OpenAI Key Test',
      // Test with fake audio data but focus on API key validation
      audioData: btoa('fake audio data'),
      expected: 'Should return error about missing OpenAI API key if not configured'
    },
    {
      name: 'Invalid Audio Data Test',
      audioData: 'invalid_base64_data',
      expected: 'Should return error about invalid audio data format'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n📋 ${test.name}`);
    console.log(`🎯 Expected: ${test.expected}`);

    try {
      // Test with different parameters
      const result = await processVoiceInputTool.execute({
        audioData: test.audioData,
        audioFormat: 'mp3',
        userId: 'test-user',
        includeTimestamp: true,
        language: 'en',
        processForRouting: true
      });

      console.log('📊 Result:');
      console.log(result.content[0].text);

      if (result.isError) {
        console.log('❌ Tool correctly identified error');
        console.log('🔍 Error metadata:', result.metadata);
      } else {
        console.log('✅ Tool processed successfully');
        console.log('📊 Metadata:', JSON.stringify(result.metadata, null, 2));
      }

    } catch (error) {
      console.error('💥 Execution error:', error.message);
    }

    console.log('\n' + '='.repeat(80));
  }

  // Test tool structure and schema
  console.log('\n🔬 Tool Structure Analysis:');
  console.log('Tool name:', processVoiceInputTool.name);
  console.log('Tool description:', processVoiceInputTool.description);
  console.log('Schema defined:', !!processVoiceInputTool.schema);

  // Show the schema requirements
  console.log('\n📋 Schema Requirements:');
  try {
    processVoiceInputTool.schema.parse({
      audioData: 'test',
      audioFormat: 'mp3',
      userId: 'test-user'
    });
    console.log('✅ Schema validation works correctly');
  } catch (schemaError) {
    console.log('❌ Schema validation issue:', schemaError.message);
  }
}

// Run the test
testProcessVoiceInput().catch(console.error);