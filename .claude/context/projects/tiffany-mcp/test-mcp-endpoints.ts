#!/usr/bin/env bun

/**
 * Test Script for Tiffany MCP Server Endpoints
 *
 * This script validates that the MCP server is working correctly
 * before setting up the n8n integration.
 */

const MCP_SERVER_BASE = "https://tiffany-mcp-official.michael-b5e.workers.dev";

interface TestResult {
  test: string;
  status: "PASS" | "FAIL";
  data?: any;
  error?: string;
  duration: number;
}

class MCPTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log("🚀 Starting Tiffany MCP Server Tests\n");
    console.log(`Server: ${MCP_SERVER_BASE}\n`);

    await this.testHealthEndpoint();
    await this.testDirectMCPEndpoint();
    await this.testSSEEndpoint();
    await this.testListTools();
    await this.testTrackGainTool();
    await this.testGetDailyQuote();

    this.printSummary();
  }

  private async testHealthEndpoint(): Promise<void> {
    console.log("🔍 Testing Health Endpoint...");
    const startTime = Date.now();

    try {
      const response = await fetch(`${MCP_SERVER_BASE}/health`);
      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok && data.status === "healthy") {
        this.results.push({
          test: "Health Endpoint",
          status: "PASS",
          data: data,
          duration
        });
        console.log("✅ Health check passed");
        console.log(`   Version: ${data.version}`);
        console.log(`   Phase 1: ${data.implementation?.phase1}`);
        console.log(`   Phase 2: ${data.implementation?.phase2}`);
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: "Health Endpoint",
        status: "FAIL",
        error: error.message,
        duration
      });
      console.log("❌ Health check failed:", error.message);
    }
    console.log("");
  }

  private async testDirectMCPEndpoint(): Promise<void> {
    console.log("🔍 Testing Direct MCP Endpoint...");
    const startTime = Date.now();

    try {
      const response = await fetch(`${MCP_SERVER_BASE}/mcp`);
      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok && data.service) {
        this.results.push({
          test: "Direct MCP Endpoint",
          status: "PASS",
          data: data,
          duration
        });
        console.log("✅ Direct MCP endpoint accessible");
        console.log(`   Service: ${data.service}`);
        console.log(`   Tool Count: ${data.toolCount}`);
      } else {
        throw new Error(`MCP endpoint failed: ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: "Direct MCP Endpoint",
        status: "FAIL",
        error: error.message,
        duration
      });
      console.log("❌ Direct MCP endpoint failed:", error.message);
    }
    console.log("");
  }

  private async testSSEEndpoint(): Promise<void> {
    console.log("🔍 Testing SSE Endpoint...");
    const startTime = Date.now();

    try {
      const response = await fetch(`${MCP_SERVER_BASE}/sse`, {
        method: "GET",
        headers: {
          "Accept": "text/event-stream",
          "Cache-Control": "no-cache"
        }
      });
      const duration = Date.now() - startTime;

      if (response.ok) {
        this.results.push({
          test: "SSE Endpoint",
          status: "PASS",
          data: {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          },
          duration
        });
        console.log("✅ SSE endpoint accessible");
        console.log(`   Content-Type: ${response.headers.get("content-type")}`);
      } else {
        throw new Error(`SSE endpoint failed: ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: "SSE Endpoint",
        status: "FAIL",
        error: error.message,
        duration
      });
      console.log("❌ SSE endpoint failed:", error.message);
    }
    console.log("");
  }

  private async testListTools(): Promise<void> {
    console.log("🔍 Testing MCP Tools List...");
    const startTime = Date.now();

    try {
      const mcpRequest = {
        jsonrpc: "2.0",
        id: "test-list-tools",
        method: "tools/list"
      };

      const response = await fetch(`${MCP_SERVER_BASE}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mcpRequest)
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok && data.result?.tools) {
        this.results.push({
          test: "List Tools",
          status: "PASS",
          data: data.result,
          duration
        });
        console.log("✅ Tools list retrieved successfully");
        console.log(`   Total tools: ${data.result.tools.length}`);
        console.log("   Available tools:");
        data.result.tools.forEach((tool: any, index: number) => {
          console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
        });
      } else {
        throw new Error(`Tools list failed: ${data.error?.message || response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: "List Tools",
        status: "FAIL",
        error: error.message,
        duration
      });
      console.log("❌ Tools list failed:", error.message);
    }
    console.log("");
  }

  private async testTrackGainTool(): Promise<void> {
    console.log("🔍 Testing track_gain Tool...");
    const startTime = Date.now();

    try {
      const mcpRequest = {
        jsonrpc: "2.0",
        id: "test-track-gain",
        method: "tools/call",
        params: {
          name: "track_gain",
          arguments: {
            description: "Successfully tested MCP server from test script",
            category: "testing",
            impact: "medium",
            userId: "test-script-user"
          }
        }
      };

      const response = await fetch(`${MCP_SERVER_BASE}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mcpRequest)
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok && data.result) {
        this.results.push({
          test: "Track Gain Tool",
          status: "PASS",
          data: data.result,
          duration
        });
        console.log("✅ track_gain tool executed successfully");
        if (data.result.content?.[0]?.text) {
          console.log("   Response:", data.result.content[0].text.substring(0, 100) + "...");
        }
      } else {
        throw new Error(`track_gain failed: ${data.error?.message || response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: "Track Gain Tool",
        status: "FAIL",
        error: error.message,
        duration
      });
      console.log("❌ track_gain tool failed:", error.message);
    }
    console.log("");
  }

  private async testGetDailyQuote(): Promise<void> {
    console.log("🔍 Testing get_daily_quote Tool...");
    const startTime = Date.now();

    try {
      const mcpRequest = {
        jsonrpc: "2.0",
        id: "test-daily-quote",
        method: "tools/call",
        params: {
          name: "get_daily_quote",
          arguments: {
            topic: "motivation",
            style: "inspirational",
            userId: "test-script-user"
          }
        }
      };

      const response = await fetch(`${MCP_SERVER_BASE}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mcpRequest)
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok && data.result) {
        this.results.push({
          test: "Get Daily Quote Tool",
          status: "PASS",
          data: data.result,
          duration
        });
        console.log("✅ get_daily_quote tool executed successfully");
        if (data.result.content?.[0]?.text) {
          console.log("   Quote:", data.result.content[0].text.substring(0, 150) + "...");
        }
      } else {
        throw new Error(`get_daily_quote failed: ${data.error?.message || response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: "Get Daily Quote Tool",
        status: "FAIL",
        error: error.message,
        duration
      });
      console.log("❌ get_daily_quote tool failed:", error.message);
    }
    console.log("");
  }

  private printSummary(): void {
    console.log("=" .repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=" .repeat(60));

    const passed = this.results.filter(r => r.status === "PASS").length;
    const failed = this.results.filter(r => r.status === "FAIL").length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ${failed > 0 ? "❌" : ""}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log("");

    this.results.forEach(result => {
      const statusIcon = result.status === "PASS" ? "✅" : "❌";
      console.log(`${statusIcon} ${result.test} (${result.duration}ms)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log("");
    if (failed === 0) {
      console.log("🎉 All tests passed! MCP server is ready for n8n integration.");
    } else {
      console.log("⚠️  Some tests failed. Check the errors above before proceeding.");
    }

    console.log("");
    console.log("Next Steps:");
    console.log("1. Import the n8n workflow files into your n8n instance");
    console.log("2. Install n8n-nodes-mcp: npm install n8n-nodes-mcp");
    console.log("3. Set N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true");
    console.log("4. Test the workflows with the webhook endpoints");
  }
}

// Run the tests
const tester = new MCPTester();
tester.runAllTests().catch(console.error);