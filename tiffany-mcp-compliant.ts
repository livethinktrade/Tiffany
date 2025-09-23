/**
 * Tiffany MCP Server - Official MCP Protocol Compliant
 *
 * Accountability Agent converted from 102-node n8n workflow
 * Following official Cloudflare MCP patterns with SSE support
 */

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our Tiffany MCP agent with accountability tools
export class TiffanyMCP extends McpAgent {
  server = new McpServer({
    name: "Tiffany Accountability Agent",
    version: "1.0.0",
  });

  async init() {
    // Gains tracking tool - core functionality from n8n workflow
    this.server.tool(
      "track_gain",
      {
        description: z.string().describe("Description of the accomplishment or gain"),
        category: z.string().optional().describe("Category of the gain (work, personal, health, etc.)"),
        impact: z.enum(["small", "medium", "large"]).optional().describe("Impact level of the gain"),
      },
      async ({ description, category = "general", impact = "medium" }) => {
        // Store gain logic (placeholder for Airtable integration)
        const gain = {
          id: `gain_${Date.now()}`,
          description,
          category,
          impact,
          timestamp: new Date().toISOString(),
          points: impact === "large" ? 5 : impact === "medium" ? 3 : 1,
        };

        // TODO: Store in Airtable via API
        console.log("Storing gain:", gain);

        return {
          content: [
            {
              type: "text",
              text: `🎉 Gain tracked successfully!\n\n**${description}**\n\nCategory: ${category}\nImpact: ${impact}\nPoints earned: ${gain.points}\n\nKeep building momentum! Every win matters.`,
            },
          ],
        };
      }
    );

    // Daily quote tool - inspiration system from n8n workflow
    this.server.tool(
      "get_daily_quote",
      {
        topic: z.string().optional().describe("Optional topic for the quote (motivation, success, growth, etc.)"),
        style: z.enum(["inspirational", "practical", "philosophical"]).optional().describe("Style of quote"),
      },
      async ({ topic, style = "inspirational" }) => {
        // Quote generation logic (placeholder for Airtable + AI customization)
        const quotes = [
          "The way to get started is to quit talking and begin doing. - Walt Disney",
          "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
          "Innovation distinguishes between a leader and a follower. - Steve Jobs",
          "Your limitation—it's only your imagination.",
          "Push yourself, because no one else is going to do it for you.",
        ];

        const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // TODO: Use OpenRouter for personalized quote generation
        const customMessage = `🌟 **Your Daily Inspiration**\n\n"${selectedQuote}"\n\n${topic ? `Focus: ${topic}\n\n` : ""}Remember, every small step forward is progress. What will you accomplish today?`;

        return {
          content: [
            {
              type: "text",
              text: customMessage,
            },
          ],
        };
      }
    );

    // Mentor advice tool - TELOS integration from n8n workflow
    this.server.tool(
      "get_mentor_advice",
      {
        situation: z.string().describe("Current situation or challenge you're facing"),
        focus_area: z.enum(["productivity", "leadership", "decision-making", "growth", "strategy"]).optional(),
      },
      async ({ situation, focus_area = "growth" }) => {
        // Mentor advice logic (placeholder for TELOS file + AI mentors)

        // TODO: Retrieve TELOS file content
        // TODO: Apply mentor AI personas (Dan Martell, Hormozi, Ray Dalio, etc.)

        const advice = `**Mentor Council Advice**\n\nSituation: ${situation}\nFocus: ${focus_area}\n\n🧠 **Strategic Perspective:**\nBased on your TELOS framework and situation, here's what your mentor council suggests:\n\n1. **Immediate Action**: Break this down into smaller, actionable steps\n2. **Long-term View**: How does this align with your bigger goals?\n3. **Resource Check**: What do you need to succeed here?\n\nRemember: Progress over perfection. Take action today.`;

        return {
          content: [
            {
              type: "text",
              text: advice,
            },
          ],
        };
      }
    );

    // Accountability check-in tool - daily/weekly review system
    this.server.tool(
      "accountability_checkin",
      {
        timeframe: z.enum(["daily", "weekly"]).describe("Type of check-in"),
        reflection: z.string().optional().describe("Personal reflection on progress"),
      },
      async ({ timeframe, reflection }) => {
        // Check-in logic (placeholder for comprehensive review)

        const checkinMessage = timeframe === "daily"
          ? `📋 **Daily Accountability Check-in**\n\nTime to review your day:\n\n• What wins did you have today?\n• What challenges did you face?\n• What's your priority for tomorrow?\n\n${reflection ? `Your reflection: ${reflection}\n\n` : ""}Ready to track your gains and plan ahead!`
          : `📊 **Weekly Accountability Review**\n\nTime for your weekly review:\n\n• Major accomplishments this week?\n• Key lessons learned?\n• Priorities for next week?\n\n${reflection ? `Your reflection: ${reflection}\n\n` : ""}Use the track_gain tool to log your weekly wins!`;

        return {
          content: [
            {
              type: "text",
              text: checkinMessage,
            },
          ],
        };
      }
    );

    // Goal setting and tracking tool
    this.server.tool(
      "set_goal",
      {
        goal: z.string().describe("The goal you want to set"),
        deadline: z.string().optional().describe("Target deadline (YYYY-MM-DD format)"),
        priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Goal priority level"),
      },
      async ({ goal, deadline, priority = "medium" }) => {
        // Goal setting logic (placeholder for TELOS integration)

        const goalData = {
          id: `goal_${Date.now()}`,
          goal,
          deadline,
          priority,
          created: new Date().toISOString(),
          status: "active"
        };

        // TODO: Store in Airtable/TELOS system
        console.log("Setting goal:", goalData);

        return {
          content: [
            {
              type: "text",
              text: `🎯 **Goal Set Successfully!**\n\n**Goal:** ${goal}\n${deadline ? `**Deadline:** ${deadline}\n` : ""}**Priority:** ${priority}\n\nI'll help you stay accountable to this goal. Use track_gain to log progress and get_mentor_advice if you need strategic guidance!`,
            },
          ],
        };
      }
    );
  }
}

// Main Cloudflare Workers handler following official pattern
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // MCP SSE endpoint (official pattern)
    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return TiffanyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    // MCP direct endpoint (official pattern)
    if (url.pathname === "/mcp") {
      return TiffanyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    // Health check
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          service: "tiffany-mcp",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          endpoints: {
            "/sse": "MCP Server-Sent Events endpoint",
            "/mcp": "MCP direct endpoint",
            "/health": "Health check"
          }
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Default response with usage information
    return new Response(
      JSON.stringify({
        service: "Tiffany Accountability Agent MCP Server",
        version: "1.0.0",
        description: "AI accountability coaching with gains tracking, mentorship, and goal setting",
        endpoints: {
          "/sse": "Connect via MCP SSE for real-time interaction",
          "/mcp": "Connect via MCP direct protocol",
          "/health": "Health check endpoint"
        },
        tools: [
          "track_gain - Log accomplishments and wins",
          "get_daily_quote - Get personalized motivation",
          "get_mentor_advice - Strategic guidance from mentor council",
          "accountability_checkin - Daily/weekly reviews",
          "set_goal - Set and track goals"
        ],
        usage: "Connect with MCP Inspector at http://localhost:5173 or Claude Desktop via mcp-remote proxy"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  },
};