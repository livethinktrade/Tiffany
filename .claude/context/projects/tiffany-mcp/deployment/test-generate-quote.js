#!/usr/bin/env bun
// Test generate_custom_quote tool - Agent-1

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

const { generateCustomQuoteTool } = await import('./src/tools/ai-processing/generate-custom-quote.js');

console.log('🧪 Testing generate_custom_quote - Agent-1...\n');
console.log('🔑 Environment check:');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Present' : 'Missing');
console.log('- AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing');

try {
  const testArgs = {
    topic: "personal accountability",
    style: "inspirational",
    userContext: "Building MCP tools and tracking daily progress",
    userId: "michael",
    length: "medium",
    includeAuthor: true,
    personalizedFor: "someone building accountability systems",
    mood: "motivational",
    saveToDatabase: false // Don't save during testing
  };

  console.log('\n📝 Test input:', JSON.stringify(testArgs, null, 2));
  const result = await generateCustomQuoteTool.execute(testArgs);

  console.log('\n✅ Tool execution result:');
  console.log(JSON.stringify(result, null, 2));

  if (!result.isError) {
    console.log('\n🎉 SUCCESS: Quote generation working!');
    if (result.metadata?.quoteText) {
      console.log(`✅ Generated Quote: "${result.metadata.quoteText}"`);
      console.log(`✅ Author: ${result.metadata.author}`);
      console.log(`✅ Generation Method: ${result.metadata.generationMethod}`);
    }
  } else {
    console.log('\n❌ FAILED: Tool has issues');
    console.log('Error:', result.metadata?.error);
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
}