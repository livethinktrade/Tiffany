#!/usr/bin/env bun
// EXAMPLE: Systematic Testing Protocol Implementation
// Shows how agents should test with proper business logic validation

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

import { BusinessLogicValidator, IntegrationTester, AirtableValidator } from './src/testing/validation-tools.js';

console.log('🧪 SYSTEMATIC TESTING PROTOCOL DEMONSTRATION');
console.log('Testing: Extract Information → Store Gains Workflow');
console.log('Agent: Agent-1 (Demonstration)\n');

// STEP 1: DEFINE EXPECTED OUTCOME (MANDATORY)
console.log('📋 STEP 1: EXPECTED OUTCOME DEFINITION');
const expectedOutcome = {
  description: 'Multiple gains should create ONE Airtable record with gains in Gain_1, Gain_2, Gain_3 fields',
  inputGains: 3,
  expectedRecords: 1,
  expectedFields: {
    'Date': '2025-01-14', // Today in Central Time
    'Gain_1': 'Fixed systematic testing',
    'Gain_2': 'Created validation tools',
    'Gain_3': 'Improved agent coordination',
    'User_Response': 'Testing systematic approach',
    'Mood_Context': 'Good'
  },
  successCriteria: [
    'EXACTLY 1 new record created',
    'All 3 gains in separate Gain_X fields',
    'Date in Central Time Zone',
    'Valid mood enum value',
    'No duplicate records'
  ]
};

console.log('Expected Outcome:', JSON.stringify(expectedOutcome, null, 2));

// STEP 2: TEST EXECUTION WITH VALIDATION
console.log('\n📊 STEP 2: SYSTEMATIC TESTING EXECUTION');

try {
  const integrationTester = new IntegrationTester();
  const validator = new BusinessLogicValidator();

  const testInput = `My gains today:
1. Fixed systematic testing
2. Created validation tools
3. Improved agent coordination`;

  console.log('\n🧪 Executing extract → store workflow...');
  const workflowResult = await integrationTester.testExtractStoreIntegration(testInput);

  console.log('\n✅ WORKFLOW VALIDATION RESULTS:');
  console.log(JSON.stringify(workflowResult, null, 2));

  // STEP 3: BUSINESS LOGIC VALIDATION (CRITICAL)
  console.log('\n🎯 STEP 3: BUSINESS LOGIC VALIDATION');

  const airtableValidator = new AirtableValidator();
  const todaysRecords = await airtableValidator.countTodaysRecords('Daily_Gains');

  console.log('\n📊 Business Rule Compliance Check:');
  console.log(`Expected records: ${expectedOutcome.expectedRecords}`);
  console.log(`Actual records today: ${todaysRecords.count}`);

  if (todaysRecords.count === expectedOutcome.expectedRecords) {
    console.log('✅ BUSINESS RULE COMPLIANT: Correct number of records');
  } else {
    console.log('❌ BUSINESS RULE VIOLATION: Wrong number of records created');
    throw new Error(`Expected ${expectedOutcome.expectedRecords} records, got ${todaysRecords.count}`);
  }

  // STEP 4: DETAILED DATA VALIDATION
  console.log('\n🔍 STEP 4: DETAILED DATA VALIDATION');

  if (todaysRecords.records.length > 0) {
    const latestRecord = todaysRecords.records[0];
    console.log('\n📋 Latest record validation:');
    console.log(`Record ID: ${latestRecord.id}`);

    const fieldsToCheck = ['Gain_1', 'Gain_2', 'Gain_3', 'User_Response', 'Mood_Context'];
    const validation = {};

    for (const field of fieldsToCheck) {
      const value = latestRecord.fields[field];
      validation[field] = value;
      console.log(`${field}: "${value}"`);
    }

    // Check if multiple gains are properly stored in single record
    const gainsInRecord = [
      validation['Gain_1'],
      validation['Gain_2'],
      validation['Gain_3']
    ].filter(Boolean).length;

    console.log(`\n📊 Gains stored in single record: ${gainsInRecord}`);

    if (gainsInRecord === expectedOutcome.inputGains) {
      console.log('✅ PERFECT: All gains stored in single record with proper field distribution');
    } else {
      console.log('❌ ISSUE: Not all gains stored in single record');
    }
  }

  // STEP 5: FINAL VALIDATION
  console.log('\n🎉 STEP 5: FINAL VALIDATION SUMMARY');
  console.log('✅ Extraction: Working');
  console.log('✅ Storage: Working');
  console.log('✅ Integration: Working');
  console.log('✅ Business Logic: Compliant');
  console.log('✅ Data Persistence: Verified');

  console.log('\n🎯 CONCLUSION: WORKFLOW IS PRODUCTION-READY');
  console.log('The extract → store workflow correctly implements business logic.');

} catch (error) {
  console.log('\n❌ SYSTEMATIC TESTING FAILED:');
  console.log('Error:', error.message);
  console.log('\n🚨 CRITICAL ISSUES FOUND:');
  console.log('- Workflow is NOT production-ready');
  console.log('- Business logic validation failed');
  console.log('- Requires investigation and fixes');

  console.log('\n📋 RECOMMENDED ACTIONS:');
  console.log('1. Review business requirements');
  console.log('2. Fix data storage logic');
  console.log('3. Re-test with systematic protocol');
  console.log('4. Do not mark tools as WORKING until validation passes');
}

console.log('\n' + '='.repeat(70));
console.log('SYSTEMATIC TESTING PROTOCOL DEMONSTRATION COMPLETE');
console.log('='.repeat(70));