#!/usr/bin/env bun
// Test extract_information with your expected output format

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

const { extractInformationTool } = await import('./src/tools/ai-processing/extract-information.js');

console.log('🎯 Testing extract_information with expected output format - Agent-1...\n');

try {
  const testArgs = {
    userInput: "My daily gains is:\n1. I work out\n2. I met some friends\n3. I finished building an MCP tool server",
    extractionType: "gains",
    userId: "michael"
  };

  console.log('📝 Test input:', JSON.stringify(testArgs, null, 2));
  const result = await extractInformationTool.execute(testArgs);

  console.log('\n✅ Tool execution result:');
  console.log(JSON.stringify(result, null, 2));

  // Check if it matches your expected format
  if (result.metadata?.extractedData?.Gains && result.metadata?.extractedData?.Mood) {
    console.log('\n🎉 SUCCESS: Perfect output format!');
    console.log('Expected format achieved:');
    console.log(JSON.stringify(result.metadata.extractedData, null, 2));

    console.log('\nGains extracted:');
    result.metadata.extractedData.Gains.forEach((gain, i) => {
      console.log(`  ${i+1}. "${gain}"`);
    });
    console.log(`Mood: ${result.metadata.extractedData.Mood[0]}`);
  } else {
    console.log('\n❌ Output format doesn\'t match expected structure');
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
}