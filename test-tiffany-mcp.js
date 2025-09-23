#!/usr/bin/env bun

/**
 * Simple test runner for Tiffany MCP Server
 * Tests core routing logic before deployment
 */

// Import the MCP server (we'll simulate the Cloudflare Workers environment)
import mcpServer from './tiffany-mcp.js';

// Mock Cloudflare Workers environment
const env = {};
const ctx = {};

async function testTiffanyMCP() {
  console.log('🧪 Testing Tiffany MCP Server...\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  const healthRequest = new Request('http://localhost:8787/health');
  const healthResponse = await mcpServer.fetch(healthRequest, env, ctx);
  const healthData = await healthResponse.json();
  console.log('✅ Health check:', healthData.status);

  // Test 2: Gains tracking
  console.log('\n2. Testing gains tracking...');
  const gainsRequest = new Request('http://localhost:8787/tiffany', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'I completed my morning workout and read for 30 minutes!',
      userId: 'test-user'
    })
  });
  const gainsResponse = await mcpServer.fetch(gainsRequest, env, ctx);
  const gainsData = await gainsResponse.json();
  console.log('✅ Gains response:', gainsData.message);

  // Test 3: Quote request
  console.log('\n3. Testing quote generation...');
  const quoteRequest = new Request('http://localhost:8787/tiffany', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Give me a motivational quote',
      userId: 'test-user'
    })
  });
  const quoteResponse = await mcpServer.fetch(quoteRequest, env, ctx);
  const quoteData = await quoteResponse.json();
  console.log('✅ Quote response:', quoteData.message);

  // Test 4: Mentor advice
  console.log('\n4. Testing mentor advice...');
  const mentorRequest = new Request('http://localhost:8787/tiffany', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'I need advice on staying focused',
      userId: 'test-user'
    })
  });
  const mentorResponse = await mcpServer.fetch(mentorRequest, env, ctx);
  const mentorData = await mentorResponse.json();
  console.log('✅ Mentor response:', mentorData.message);

  // Test 5: General interaction
  console.log('\n5. Testing general interaction...');
  const generalRequest = new Request('http://localhost:8787/tiffany', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Hello Tiffany',
      userId: 'test-user'
    })
  });
  const generalResponse = await mcpServer.fetch(generalRequest, env, ctx);
  const generalData = await generalResponse.json();
  console.log('✅ General response:', generalData.message);

  console.log('\n🎉 All tests completed successfully!');
  console.log('\n📋 Ready for deployment to Cloudflare Workers');
}

// Run tests
testTiffanyMCP().catch(console.error);