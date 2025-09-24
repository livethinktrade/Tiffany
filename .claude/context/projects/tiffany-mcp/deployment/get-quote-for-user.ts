#!/usr/bin/env bun

// Quick script to get a quote for the user

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { getRandomQuoteTool } from './src/tools/data-storage/get-random-quote.js';

async function getQuoteForUser() {
  try {
    const result = await getRandomQuoteTool.execute({
      userId: 'user-request',
      markAsUsed: false
    });

    if (result.isError) {
      console.log('❌ Error getting quote:', result.content[0].text);
    } else {
      console.log(result.content[0].text);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

getQuoteForUser();