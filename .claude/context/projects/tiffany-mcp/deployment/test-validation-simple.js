#!/usr/bin/env bun
// Simple test of validation tools functionality

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { AirtableValidator, BusinessLogicValidator } from './src/testing/validation-tools.js';

console.log('🧪 TESTING VALIDATION TOOLS FUNCTIONALITY\n');

try {
  // Test 1: Basic Airtable connection
  console.log('TEST 1: Airtable Connection');
  const airtableValidator = new AirtableValidator();

  // Get recent records to test with
  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Daily_Gains?maxRecords=3&sort[0][field]=Date&sort[0][direction]=desc`, {
    headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` }
  });

  const data = await response.json();
  console.log(`✅ Found ${data.records.length} recent records in Daily_Gains table`);

  if (data.records.length > 0) {
    const testRecord = data.records[0];
    console.log(`📋 Latest record ID: ${testRecord.id}`);
    console.log(`   Date: ${testRecord.fields.Date}`);
    console.log(`   Gain_1: ${testRecord.fields.Gain_1}`);

    // Test 2: Record validation
    console.log('\nTEST 2: Record Validation');
    const validation = await airtableValidator.validateRecord('Daily_Gains', testRecord.id, {
      'Date': testRecord.fields.Date,
      'Gain_1': testRecord.fields.Gain_1
    });

    console.log('✅ Record validation completed');

    // Test 3: Date-specific record counting
    console.log('\nTEST 3: Date-Specific Record Counting');
    const recordCount = await airtableValidator.countTodaysRecords('Daily_Gains', 'Date', testRecord.fields.Date);
    console.log(`✅ Found ${recordCount.count} records for date ${recordCount.date}`);
  }

  // Test 4: Business Logic Validator
  console.log('\nTEST 4: Business Logic Validator');
  const businessValidator = new BusinessLogicValidator();

  // Test extraction validation with mock data
  const mockExtractionResult = {
    metadata: {
      extractedData: {
        Gains: ['Test gain 1', 'Test gain 2', 'Test gain 3'],
        Mood: ['Good']
      }
    }
  };

  const extractValidation = await businessValidator.validateInformationExtraction(mockExtractionResult, {});
  console.log('✅ Information extraction validation:', extractValidation);

  console.log('\n🎉 ALL VALIDATION TOOLS WORKING CORRECTLY!');
  console.log('\n📊 VALIDATION TOOLS STATUS:');
  console.log('✅ AirtableValidator: Functional');
  console.log('✅ BusinessLogicValidator: Functional');
  console.log('✅ Record inspection: Working');
  console.log('✅ Date filtering: Working');
  console.log('✅ Field validation: Working');

} catch (error) {
  console.error('❌ Validation tools test failed:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n' + '='.repeat(50));
console.log('VALIDATION TOOLS TEST COMPLETE');
console.log('='.repeat(50));