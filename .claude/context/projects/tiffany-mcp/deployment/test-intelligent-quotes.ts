#!/usr/bin/env bun

// Test script for intelligent quote prioritization logic
// Tests time-based prioritization and weighted selection

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { getRandomQuoteTool } from './src/tools/data-storage/get-random-quote.js';

async function testIntelligentQuotePrioritization() {
  console.log('🧠 Testing Intelligent Quote Prioritization Logic...\n');

  // First, let's analyze the current quote database priority distribution
  console.log('📊 Analyzing Current Quote Database:');
  try {
    const priorityInfo = await getRandomQuoteTool.getQuotePrioritizationInfo();

    console.log(`\n📈 Priority Analysis:`);
    console.log(`  Total Quotes: ${priorityInfo.totalQuotes}`);
    console.log(`  Never Used: ${priorityInfo.neverUsed}`);
    console.log(`  Oldest Used: ${priorityInfo.oldestUsed !== 'None' ? new Date(priorityInfo.oldestUsed).toLocaleDateString() : 'None'}`);
    console.log(`  Newest Used: ${priorityInfo.newestUsed !== 'None' ? new Date(priorityInfo.newestUsed).toLocaleDateString() : 'None'}`);

    console.log('\n🎯 Priority Distribution:');
    priorityInfo.priorityDistribution.forEach(dist => {
      console.log(`  ${dist.range}: ${dist.count} quotes`);
    });

  } catch (error) {
    console.log('⚠️ Could not analyze priority info:', error.message);
  }

  // Test multiple quote retrievals to see the prioritization in action
  console.log('\n🎲 Testing Intelligent Selection (10 quotes):');
  console.log('This should heavily favor never-used and old quotes...\n');

  const selectedQuotes = [];
  const quoteFrequency = new Map();

  for (let i = 1; i <= 10; i++) {
    try {
      console.log(`${i.toString().padStart(2)}. `, { newline: false });

      const result = await getRandomQuoteTool.execute({
        userId: 'intelligent-test-user',
        markAsUsed: false // Don't mark as used so we can test multiple times
      });

      if (result.isError) {
        console.log('❌ Error:', result.content[0].text.substring(0, 50) + '...');
      } else {
        const quoteId = result.metadata?.quoteId;
        const category = result.metadata?.category;
        const author = result.metadata?.author;

        // Extract quote text (first 50 chars)
        const fullText = result.content[0].text;
        const quoteMatch = fullText.match(/> "(.*?)"/);
        const quoteText = quoteMatch ? quoteMatch[1].substring(0, 50) + '...' : 'Unknown quote';

        console.log(`${author} (${category}) - "${quoteText}"`);

        selectedQuotes.push({ id: quoteId, author, category, text: quoteText });

        // Track frequency
        quoteFrequency.set(quoteId, (quoteFrequency.get(quoteId) || 0) + 1);
      }

    } catch (error) {
      console.log('💥 Error:', error.message);
    }
  }

  // Analyze selection results
  console.log('\n📋 Selection Analysis:');
  console.log(`Unique quotes selected: ${quoteFrequency.size} out of ${selectedQuotes.length} attempts`);

  const duplicates = Array.from(quoteFrequency.entries()).filter(([id, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log('🔄 Quotes that appeared multiple times:');
    duplicates.forEach(([id, count]) => {
      const quote = selectedQuotes.find(q => q.id === id);
      console.log(`  ${count}x: ${quote?.author} - "${quote?.text}"`);
    });
  } else {
    console.log('✅ No duplicate quotes selected - excellent diversity!');
  }

  // Test category-specific prioritization
  console.log('\n🎯 Testing Category-Specific Prioritization:');
  const categories = ['Focus', 'Self-Awareness', 'Patience'];

  for (const category of categories) {
    console.log(`\n📂 ${category} Category:`);
    try {
      const categoryInfo = await getRandomQuoteTool.getQuotePrioritizationInfo(category);
      console.log(`  Total ${category} quotes: ${categoryInfo.totalQuotes}`);
      console.log(`  Never used: ${categoryInfo.neverUsed}`);

      if (categoryInfo.totalQuotes > 0) {
        const result = await getRandomQuoteTool.execute({
          category,
          userId: 'category-test-user',
          markAsUsed: false
        });

        if (!result.isError) {
          const fullText = result.content[0].text;
          const quoteMatch = fullText.match(/> "(.*?)"/);
          const quoteText = quoteMatch ? quoteMatch[1].substring(0, 60) : 'Unknown quote';
          console.log(`  Selected: "${quoteText}..."`);
        } else {
          console.log(`  ❌ No quotes available for ${category}`);
        }
      }
    } catch (error) {
      console.log(`  💥 Error testing ${category}:`, error.message);
    }
  }

  // Test marking quotes as used and priority changes
  console.log('\n🔄 Testing Usage Tracking Impact:');
  console.log('Getting a quote, marking it as used, then checking if priorities shift...\n');

  try {
    // Get a quote and mark it as used
    console.log('Step 1: Get a quote and mark it as used');
    const usageTest = await getRandomQuoteTool.execute({
      userId: 'usage-impact-test',
      markAsUsed: true
    });

    if (!usageTest.isError) {
      const quoteId = usageTest.metadata?.quoteId;
      const fullText = usageTest.content[0].text;
      const quoteMatch = fullText.match(/> "(.*?)"/);
      const shortQuote = quoteMatch ? quoteMatch[1].substring(0, 40) + '...' : 'Unknown';

      console.log(`✅ Marked quote as used: "${shortQuote}"`);
      console.log(`   Quote ID: ${quoteId}`);
      console.log('   This quote should now have very low priority for future selections');

      // Test that we don't get the same quote immediately
      console.log('\nStep 2: Get 3 more quotes - should avoid the recently used one');
      for (let i = 1; i <= 3; i++) {
        const nextResult = await getRandomQuoteTool.execute({
          userId: 'usage-impact-test-2',
          markAsUsed: false
        });

        if (!nextResult.isError) {
          const nextId = nextResult.metadata?.quoteId;
          const nextText = nextResult.content[0].text;
          const nextMatch = nextText.match(/> "(.*?)"/);
          const nextShort = nextMatch ? nextMatch[1].substring(0, 35) + '...' : 'Unknown';

          const wasRepeated = nextId === quoteId;
          console.log(`  ${i}. "${nextShort}" ${wasRepeated ? '🔄 REPEATED!' : '✅ Different'}`);
        }
      }

    } else {
      console.log('❌ Usage test failed:', usageTest.content[0].text);
    }

  } catch (error) {
    console.log('💥 Usage tracking test error:', error.message);
  }

  console.log('\n🎯 Intelligent Quote Prioritization Testing Complete!');
  console.log('\n💡 Expected Behavior:');
  console.log('   ✅ Never-used quotes should appear most frequently');
  console.log('   ✅ Recently used quotes should rarely appear');
  console.log('   ✅ Good diversity in selections');
  console.log('   ✅ Used_Date updates in Central Time when markAsUsed=true');
}

// Run the test
testIntelligentQuotePrioritization().catch(console.error);