#!/usr/bin/env bun
// Validation Tools for Systematic Testing Protocol
// Used by all agents to verify business logic outcomes

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

/**
 * AIRTABLE DATA INSPECTOR
 * Validates actual data stored vs expected outcomes
 */
export class AirtableValidator {
  constructor() {
    this.baseUrl = 'https://api.airtable.com/v0';
    this.apiKey = process.env.AIRTABLE_API_KEY;
    this.baseId = process.env.AIRTABLE_BASE_ID;
  }

  /**
   * Fetch and validate a specific Airtable record
   */
  async validateRecord(tableName, recordId, expectedFields) {
    console.log(`🔍 Inspecting Airtable record: ${recordId}`);

    const response = await fetch(`${this.baseUrl}/${this.baseId}/${tableName}/${recordId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch record ${recordId}: ${response.status}`);
    }

    const record = await response.json();

    console.log('📊 Field-by-field validation:');
    const validation = {};

    for (const [field, expectedValue] of Object.entries(expectedFields)) {
      const actualValue = record.fields[field];
      const matches = this.deepEqual(actualValue, expectedValue);

      validation[field] = {
        expected: expectedValue,
        actual: actualValue,
        matches
      };

      console.log(`${matches ? '✅' : '❌'} ${field}:`);
      console.log(`   Expected: ${JSON.stringify(expectedValue)}`);
      console.log(`   Actual:   ${JSON.stringify(actualValue)}`);
    }

    return { record, validation };
  }

  /**
   * Count records created today for a specific table
   */
  async countTodaysRecords(tableName, dateField = 'Date', targetDate = null) {
    // Use target date if provided, otherwise use today in Central Time
    let dateToCheck;
    if (targetDate) {
      dateToCheck = targetDate;
    } else {
      const today = new Date().toLocaleDateString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/');
      dateToCheck = `${today[2]}-${today[0]}-${today[1]}`;
    }

    const filterFormula = `{${dateField}} = "${dateToCheck}"`;
    const encodedFormula = encodeURIComponent(filterFormula);

    const response = await fetch(
      `${this.baseUrl}/${this.baseId}/${tableName}?filterByFormula=${encodedFormula}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    const data = await response.json();

    console.log(`📅 Records for date (${dateToCheck}): ${data.records.length}`);
    return {
      count: data.records.length,
      records: data.records,
      date: dateToCheck
    };
  }

  /**
   * Validate gains storage follows business rules
   */
  async validateGainsStorage(recordId, expectedGains) {
    const { record, validation } = await this.validateRecord('Daily_Gains', recordId, {
      'Gain_1': expectedGains[0] || '',
      'Gain_2': expectedGains[1] || '',
      'Gain_3': expectedGains[2] || '',
      'Mood_Context': ['Good', 'Neutral', 'Struggling'].includes(validation?.mood) ? validation.mood : 'Good'
    });

    // Business rule: Multiple gains should be in ONE record
    const todayCount = await this.countTodaysRecords('Daily_Gains');

    if (expectedGains.length > 1 && todayCount.count > 1) {
      throw new Error(`BUSINESS RULE VIOLATION: ${expectedGains.length} gains created ${todayCount.count} records. Expected: 1 record with multiple Gain_X fields.`);
    }

    // Validate gains are in correct fields
    const gainsInRecord = [
      record.fields['Gain_1'],
      record.fields['Gain_2'],
      record.fields['Gain_3']
    ].filter(Boolean);

    console.log('📋 Gains Business Logic Validation:');
    console.log(`   Expected gains count: ${expectedGains.length}`);
    console.log(`   Gains in record: ${gainsInRecord.length}`);
    console.log(`   Records created today: ${todayCount.count}`);

    if (expectedGains.length > 1 && gainsInRecord.length !== expectedGains.length) {
      throw new Error(`Expected ${expectedGains.length} gains in record, found ${gainsInRecord.length}`);
    }

    return {
      businessRuleCompliant: true,
      recordsToday: todayCount.count,
      gainsInRecord: gainsInRecord.length,
      record
    };
  }

  /**
   * Deep equality check for complex values
   */
  deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return a === b;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => this.deepEqual(a[key], b[key]));
  }
}

/**
 * BUSINESS LOGIC VALIDATOR
 * Validates tool-specific business rules
 */
export class BusinessLogicValidator {
  constructor() {
    this.airtableValidator = new AirtableValidator();
  }

  /**
   * Validate extract_information tool output
   */
  async validateInformationExtraction(result, expectedOutcome) {
    console.log('🧠 Validating Information Extraction Business Logic:');

    const extractedData = result.metadata?.extractedData;
    if (!extractedData) {
      throw new Error('No extractedData found in result metadata');
    }

    // Validate structure matches expected format
    const requiredKeys = ['Gains', 'Mood'];
    for (const key of requiredKeys) {
      if (!(key in extractedData)) {
        throw new Error(`Missing required key in extractedData: ${key}`);
      }
    }

    // Validate gains array
    if (!Array.isArray(extractedData.Gains)) {
      throw new Error('Gains should be an array');
    }

    if (extractedData.Gains.length === 0) {
      throw new Error('No gains extracted from input');
    }

    // Validate mood
    if (!Array.isArray(extractedData.Mood)) {
      throw new Error('Mood should be an array');
    }

    const validMoods = ['Good', 'Neutral', 'Struggling'];
    if (!validMoods.includes(extractedData.Mood[0])) {
      throw new Error(`Invalid mood: ${extractedData.Mood[0]}. Must be one of: ${validMoods.join(', ')}`);
    }

    console.log(`✅ Extracted ${extractedData.Gains.length} gains with mood: ${extractedData.Mood[0]}`);

    return {
      gainsCount: extractedData.Gains.length,
      mood: extractedData.Mood[0],
      businessRuleCompliant: true
    };
  }

  /**
   * Validate store_gains tool output and Airtable storage
   */
  async validateGainsStorage(result, expectedGains) {
    console.log('💾 Validating Gains Storage Business Logic:');

    // Validate tool response
    if (result.isError) {
      throw new Error(`Store gains failed: ${result.metadata?.error}`);
    }

    const airtableId = result.metadata?.airtableId;
    if (!airtableId) {
      throw new Error('No Airtable ID returned - data may not be persisted');
    }

    // Validate actual Airtable storage
    return await this.airtableValidator.validateGainsStorage(airtableId, expectedGains);
  }

  /**
   * Validate complete extract → store workflow
   */
  async validateExtractStoreWorkflow(extractResult, storeResults, originalInput) {
    console.log('🔄 Validating Extract → Store Workflow:');

    // Validate extraction
    const extractValidation = await this.validateInformationExtraction(extractResult, {});
    const extractedGains = extractResult.metadata.extractedData.Gains;

    // Validate storage approach
    if (storeResults.length !== extractedGains.length) {
      throw new Error(`Extracted ${extractedGains.length} gains but attempted to store ${storeResults.length}`);
    }

    // Check if all storage operations succeeded
    const successfulStores = storeResults.filter(r => !r.isError).length;
    console.log(`📊 Storage success rate: ${successfulStores}/${storeResults.length}`);

    if (successfulStores === 0) {
      throw new Error('No gains were successfully stored');
    }

    // CRITICAL BUSINESS LOGIC CHECK
    // If multiple gains were extracted, they should create ONE record, not multiple
    if (extractedGains.length > 1) {
      console.log('🚨 CHECKING MULTIPLE GAINS BUSINESS RULE...');

      const todaysRecords = await this.airtableValidator.countTodaysRecords('Daily_Gains');

      if (todaysRecords.count > 1) {
        throw new Error(
          `BUSINESS RULE VIOLATION: ${extractedGains.length} gains created ${todaysRecords.count} separate records. ` +
          `Expected: 1 record with gains in Gain_1, Gain_2, Gain_3 fields.`
        );
      }

      console.log('✅ Business rule compliant: Multiple gains in single record');
    }

    return {
      extractionValid: true,
      storageSuccessful: successfulStores === storeResults.length,
      businessRuleCompliant: true,
      workflow: 'extract_store',
      gainsProcessed: extractedGains.length
    };
  }

  /**
   * Validate quote retrieval business logic
   */
  async validateQuoteRetrieval(result, criteria) {
    console.log('💬 Validating Quote Retrieval Business Logic:');

    if (result.isError) {
      throw new Error(`Quote retrieval failed: ${result.metadata?.error}`);
    }

    const quote = result.metadata?.quote;
    if (!quote) {
      throw new Error('No quote returned in metadata');
    }

    // Validate quote structure
    const requiredFields = ['text', 'author', 'category'];
    for (const field of requiredFields) {
      if (!quote[field]) {
        console.log(`⚠️ Missing quote field: ${field}`);
      }
    }

    // Validate filtering criteria if provided
    if (criteria?.category && quote.category !== criteria.category) {
      throw new Error(`Quote category "${quote.category}" doesn't match requested "${criteria.category}"`);
    }

    console.log(`✅ Quote retrieved: "${quote.text.substring(0, 50)}..." by ${quote.author}`);

    return {
      quoteValid: true,
      matchesCriteria: true,
      businessRuleCompliant: true
    };
  }
}

/**
 * INTEGRATION TESTER
 * Tests tool integration and workflow compatibility
 */
export class IntegrationTester {
  constructor() {
    this.businessValidator = new BusinessLogicValidator();
  }

  /**
   * Test extract_information → store_gains integration
   */
  async testExtractStoreIntegration(userInput) {
    console.log('🔗 Testing Extract → Store Integration:');

    // Import tools
    const { extractInformationTool } = await import('../tools/ai-processing/extract-information.js');
    const { storeGainsTool } = await import('../tools/data-storage/store-gains.js');

    // Step 1: Extract
    const extractResult = await extractInformationTool.execute({
      userInput,
      extractionType: "gains",
      userId: "test"
    });

    // Step 2: Store each gain
    const extractedGains = extractResult.metadata.extractedData.Gains;
    const storeResults = [];

    for (let i = 0; i < extractedGains.length; i++) {
      const storeResult = await storeGainsTool.execute({
        gain: extractedGains[i],
        impact: 'medium',
        category: 'professional',
        userId: 'test',
        moodContext: extractResult.metadata.extractedData.Mood[0]
      });
      storeResults.push(storeResult);
    }

    // Step 3: Validate workflow
    return await this.businessValidator.validateExtractStoreWorkflow(
      extractResult,
      storeResults,
      userInput
    );
  }

  /**
   * Test tool dependencies
   */
  async testToolDependencies(toolName, testResult) {
    const dependencies = {
      'extract_information': ['store_gains'],
      'get_random_quote': ['update_quote_record'],
      'store_gains': [], // No dependencies
      'generate_custom_quote': ['store_user_state']
    };

    const toolDeps = dependencies[toolName] || [];

    if (toolDeps.length === 0) {
      console.log('✅ No dependencies to test');
      return { dependenciesValid: true };
    }

    console.log(`🔗 Testing dependencies: ${toolDeps.join(', ')}`);

    for (const depTool of toolDeps) {
      try {
        // Test if the dependent tool can consume this tool's output
        await this.testDependencyCompatibility(toolName, depTool, testResult);
        console.log(`✅ ${depTool} integration: PASS`);
      } catch (error) {
        console.log(`❌ ${depTool} integration: FAIL - ${error.message}`);
        throw new Error(`Dependency ${depTool} cannot consume ${toolName} output`);
      }
    }

    return { dependenciesValid: true };
  }

  async testDependencyCompatibility(sourceTool, targetTool, sourceOutput) {
    // Tool-specific compatibility tests
    const compatibilityTests = {
      'extract_information->store_gains': () => {
        const extractedData = sourceOutput.metadata?.extractedData;
        return extractedData?.Gains && Array.isArray(extractedData.Gains);
      }
    };

    const testKey = `${sourceTool}->${targetTool}`;
    const test = compatibilityTests[testKey];

    if (test && !test()) {
      throw new Error(`${sourceTool} output incompatible with ${targetTool} input`);
    }

    return true;
  }
}

/**
 * TESTING COORDINATOR
 * Manages multi-agent testing coordination
 */
export class TestingCoordinator {
  constructor(agentId) {
    this.agentId = agentId;
    this.lockDirectory = './testing-locks';
  }

  /**
   * Claim a tool for testing
   */
  async claimTool(toolName) {
    const lockFile = `${this.lockDirectory}/${toolName}.lock`;

    try {
      // Check if already locked
      if (await Bun.file(lockFile).exists()) {
        const lockData = await Bun.file(lockFile).json();
        if (lockData.agentId !== this.agentId) {
          throw new Error(`Tool ${toolName} is being tested by ${lockData.agentId}`);
        }
      }

      // Create lock
      await Bun.write(lockFile, JSON.stringify({
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
        toolName
      }));

      console.log(`🔒 Tool ${toolName} claimed by ${this.agentId}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Could not claim tool ${toolName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Release tool lock
   */
  async releaseTool(toolName) {
    const lockFile = `${this.lockDirectory}/${toolName}.lock`;

    try {
      if (await Bun.file(lockFile).exists()) {
        await Bun.file(lockFile).remove();
        console.log(`🔓 Tool ${toolName} released by ${this.agentId}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not release lock for ${toolName}: ${error.message}`);
    }
  }
}

// Usage example for agents:
/*
const validator = new BusinessLogicValidator();
const integrationTester = new IntegrationTester();
const coordinator = new TestingCoordinator('Agent-1');

// Test a complete workflow
const result = await integrationTester.testExtractStoreIntegration(
  "My gains:\n1. Fixed the testing\n2. Improved validation\n3. Added documentation"
);

console.log('Workflow validation:', result);
*/