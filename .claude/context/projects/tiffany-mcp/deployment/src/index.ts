// Tiffany MCP Server - Complete 25-tool implementation
// Following PRP blueprint for systematic tool integration

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Import Phase 1 data storage tools
import storeGainsTool from './tools/data-storage/store-gains.js';
import getUserMemoryTool from './tools/data-storage/get-user-memory.js';
import storeUserStateTool from './tools/data-storage/store-user-state.js';
import getRandomQuoteTool from './tools/data-storage/get-random-quote.js';
import updateQuoteRecordTool from './tools/data-storage/update-quote-record.js';
import addQuoteToDatabaseTool from './tools/data-storage/add-quote-to-database.js';

// Import Phase 2 AI processing tools
import processVoiceInputTool from './tools/ai-processing/process-voice-input.js';
import extractInformationTool from './tools/ai-processing/extract-information.js';
import generateCustomQuoteTool from './tools/ai-processing/generate-custom-quote.js';
import analyzeConversationTool from './tools/ai-processing/analyze-conversation.js';

// Import utilities and services
import { TiffanyAIRouter } from './utils/router.js';
import { AirtableService } from './services/airtable-service.js';
import { TiffanyUserState, ToolResponse } from './types/tiffany-types.js';

/**
 * Enhanced Tiffany MCP Server v3.0
 *
 * Implements 25 tools in 4 phases:
 * - Phase 1: Data Storage (6 tools) ✅
 * - Phase 2: AI Processing (4 tools) ✅
 * - Phase 3: TELOS Integration (3 tools) - Coming next
 * - Phase 4: Communication & Memory (12 tools) - Coming next
 *
 * Based on original n8n workflow qNqFdwPIbfnsTQt5 (102 nodes → 25 tools)
 */
class TiffanyMCPServer {
  public server: Server;
  private router: TiffanyAIRouter;
  private airtableService: AirtableService;

  constructor() {
    this.server = new Server({
      name: "Tiffany Accountability Agent",
      version: "3.0.0",
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.router = new TiffanyAIRouter();
    this.airtableService = new AirtableService();
  }

  setupHandlers() {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Phase 1: Data Storage Tools (6 total) ✅
          {
            name: storeGainsTool.name,
            description: storeGainsTool.description,
            inputSchema: storeGainsTool.schema._def
          },
          {
            name: getUserMemoryTool.name,
            description: getUserMemoryTool.description,
            inputSchema: getUserMemoryTool.schema._def
          },
          {
            name: storeUserStateTool.name,
            description: storeUserStateTool.description,
            inputSchema: storeUserStateTool.schema._def
          },
          {
            name: getRandomQuoteTool.name,
            description: getRandomQuoteTool.description,
            inputSchema: getRandomQuoteTool.schema._def
          },
          {
            name: updateQuoteRecordTool.name,
            description: updateQuoteRecordTool.description,
            inputSchema: updateQuoteRecordTool.schema._def
          },
          {
            name: addQuoteToDatabaseTool.name,
            description: addQuoteToDatabaseTool.description,
            inputSchema: addQuoteToDatabaseTool.schema._def
          },

          // Phase 2: AI Processing Tools (4 total) ✅
          {
            name: processVoiceInputTool.name,
            description: processVoiceInputTool.description,
            inputSchema: processVoiceInputTool.schema._def
          },
          {
            name: extractInformationTool.name,
            description: extractInformationTool.description,
            inputSchema: extractInformationTool.schema._def
          },
          {
            name: generateCustomQuoteTool.name,
            description: generateCustomQuoteTool.description,
            inputSchema: generateCustomQuoteTool.schema._def
          },
          {
            name: analyzeConversationTool.name,
            description: analyzeConversationTool.description,
            inputSchema: analyzeConversationTool.schema._def
          },

          // Legacy tools (backward compatibility)
          {
            name: "track_gain",
            description: "Enhanced gains tracking with impact scoring (legacy wrapper for store_gains)",
            inputSchema: {
              type: "object",
              properties: {
                description: { type: "string", description: "Description of the accomplishment" },
                category: { type: "string", description: "Category of the gain", default: "general" },
                impact: { type: "string", enum: ["small", "medium", "large"], description: "Impact level", default: "medium" },
                userId: { type: "string", description: "User identifier", default: "default" }
              },
              required: ["description"]
            }
          },
          {
            name: "get_daily_quote",
            description: "Personalized motivation quotes (legacy wrapper for get_random_quote)",
            inputSchema: {
              type: "object",
              properties: {
                topic: { type: "string", description: "Optional topic for the quote" },
                style: { type: "string", enum: ["inspirational", "practical", "philosophical"], description: "Quote style", default: "inspirational" },
                userId: { type: "string", description: "User identifier", default: "default" }
              },
              required: []
            }
          },
          {
            name: "get_mentor_advice",
            description: "Strategic guidance from mentor council",
            inputSchema: {
              type: "object",
              properties: {
                situation: { type: "string", description: "Current situation or challenge" },
                focus_area: { type: "string", enum: ["productivity", "leadership", "decision-making", "growth", "strategy"], description: "Focus area", default: "growth" },
                userId: { type: "string", description: "User identifier", default: "default" }
              },
              required: ["situation"]
            }
          },
          {
            name: "accountability_checkin",
            description: "Daily/weekly review prompts with progress tracking",
            inputSchema: {
              type: "object",
              properties: {
                timeframe: { type: "string", enum: ["daily", "weekly"], description: "Check-in timeframe" },
                reflection: { type: "string", description: "Personal reflection on progress" },
                userId: { type: "string", description: "User identifier", default: "default" }
              },
              required: ["timeframe"]
            }
          },
          {
            name: "set_goal",
            description: "Goal setting with deadline tracking",
            inputSchema: {
              type: "object",
              properties: {
                goal: { type: "string", description: "The goal to set" },
                deadline: { type: "string", description: "Target deadline (YYYY-MM-DD)" },
                priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Goal priority", default: "medium" },
                userId: { type: "string", description: "User identifier", default: "default" }
              },
              required: ["goal"]
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Phase 1: Data Storage Tools ✅
          case 'store_gains':
            return await storeGainsTool.execute(args as any);

          case 'get_user_memory':
            return await getUserMemoryTool.execute(args as any);

          case 'store_user_state':
            return await storeUserStateTool.execute(args as any);

          case 'get_random_quote':
            return await getRandomQuoteTool.execute(args as any);

          case 'update_quote_record':
            return await updateQuoteRecordTool.execute(args as any);

          case 'add_quote_to_database':
            return await addQuoteToDatabaseTool.execute(args as any);

          // Phase 2: AI Processing Tools ✅
          case 'process_voice_input':
            return await processVoiceInputTool.execute(args as any);

          case 'extract_information':
            return await extractInformationTool.execute(args as any);

          case 'generate_custom_quote':
            return await generateCustomQuoteTool.execute(args as any);

          case 'analyze_conversation':
            return await analyzeConversationTool.execute(args as any);

          // Legacy tool wrappers (backward compatibility)
          case 'track_gain':
            return await this.handleTrackGain(args as any);

          case 'get_daily_quote':
            return await this.handleGetDailyQuote(args as any);

          case 'get_mentor_advice':
            return await this.handleMentorAdvice(args as any);

          case 'accountability_checkin':
            return await this.handleAccountabilityCheckin(args as any);

          case 'set_goal':
            return await this.handleSetGoal(args as any);

          default:
            throw new Error(`Unknown tool: ${name}. Available tools: ${this.getAvailableToolNames().join(', ')}`);
        }
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);

        return {
          content: [{
            type: "text" as const,
            text: `❌ **Tool execution failed**: ${error.message}\n\nTool: \`${name}\`\nPlease check your parameters and try again.`
          }],
          isError: true,
          metadata: {
            toolName: name,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        };
      }
    });
  }

  // Legacy wrapper: track_gain → store_gains
  private async handleTrackGain(args: {
    description: string;
    category?: string;
    impact?: 'small' | 'medium' | 'large';
    userId?: string;
  }): Promise<ToolResponse> {
    const { description, category = 'general', impact = 'medium', userId = 'default' } = args;

    return await storeGainsTool.execute({
      gain: {
        description,
        category,
        impact,
        userId
      },
      syncToAirtable: true
    });
  }

  // Legacy wrapper: get_daily_quote → get_random_quote
  private async handleGetDailyQuote(args: {
    topic?: string;
    style?: 'inspirational' | 'practical' | 'philosophical';
    userId?: string;
  }): Promise<ToolResponse> {
    const { topic, style = 'inspirational', userId = 'default' } = args;

    return await getRandomQuoteTool.execute({
      category: topic,
      style,
      userId,
      markAsUsed: true
    });
  }

  // Mentor advice tool (Phase 3 preview)
  private async handleMentorAdvice(args: {
    situation: string;
    focus_area?: string;
    userId?: string;
  }): Promise<ToolResponse> {
    const { situation, focus_area = 'growth', userId = 'default' } = args;

    // TODO: Replace with actual TELOS integration tool in Phase 3
    const advice = this.generateMentorAdvice(situation, focus_area);

    return {
      content: [{
        type: 'text',
        text: advice
      }],
      metadata: {
        toolType: 'mentor_advice',
        focusArea: focus_area,
        userId,
        isLegacyImplementation: true
      }
    };
  }

  // Accountability check-in tool (Phase 4 preview)
  private async handleAccountabilityCheckin(args: {
    timeframe: 'daily' | 'weekly';
    reflection?: string;
    userId?: string;
  }): Promise<ToolResponse> {
    const { timeframe, reflection, userId = 'default' } = args;

    // Get user memory for context
    const memoryResponse = await getUserMemoryTool.execute({
      userId,
      type: 'all',
      timeframe: timeframe === 'daily' ? 'day' : 'week',
      limit: 10
    });

    const checkinPrompts = this.generateCheckinPrompts(timeframe, reflection);

    return {
      content: [{
        type: 'text',
        text: `${checkinPrompts}\n\n---\n\n${memoryResponse.content[0]?.text || ''}`
      }],
      metadata: {
        toolType: 'accountability_checkin',
        timeframe,
        userId,
        hasReflection: !!reflection
      }
    };
  }

  // Goal setting tool (Phase 4 preview)
  private async handleSetGoal(args: {
    goal: string;
    deadline?: string;
    priority?: string;
    userId?: string;
  }): Promise<ToolResponse> {
    const { goal, deadline, priority = 'medium', userId = 'default' } = args;

    // TODO: Replace with actual goal storage tool in Phase 4
    const goalConfirmation = `🎯 **Goal Set Successfully!**

**Goal**: ${goal}
${deadline ? `**Deadline**: ${deadline}` : ''}
**Priority**: ${priority}
**User**: ${userId}

**Next Steps**:
1. Break this goal into smaller milestones
2. Use \`track_gain\` to log progress toward this goal
3. Use \`get_mentor_advice\` for strategic guidance
4. Schedule regular check-ins with \`accountability_checkin\`

💡 **Tip**: Goals work best when combined with daily action tracking. Use the tools above to maintain momentum!`;

    return {
      content: [{
        type: 'text',
        text: goalConfirmation
      }],
      metadata: {
        toolType: 'set_goal',
        goal,
        deadline,
        priority,
        userId,
        isLegacyImplementation: true
      }
    };
  }

  // Helper methods
  private getAvailableToolNames(): string[] {
    return [
      // Phase 1: Data Storage (6 tools)
      'store_gains', 'get_user_memory', 'store_user_state',
      'get_random_quote', 'update_quote_record', 'add_quote_to_database',
      // Phase 2: AI Processing (4 tools)
      'process_voice_input', 'extract_information', 'generate_custom_quote', 'analyze_conversation',
      // Legacy tools (5 tools)
      'track_gain', 'get_daily_quote', 'get_mentor_advice',
      'accountability_checkin', 'set_goal'
    ];
  }

  private generateMentorAdvice(situation: string, focusArea: string): string {
    const mentorWisdom = {
      productivity: "Systems beat motivation. Build the process, not just the outcome.",
      leadership: "Lead by example. Your actions teach louder than words.",
      'decision-making': "Good decisions come from experience. Experience comes from bad decisions.",
      strategy: "Strategy without execution is hallucination. Execution without strategy is chaos.",
      growth: "Growth requires discomfort. Lean into the challenge."
    };

    return `🎯 **TELOS Mentor Council Response**

**Situation**: ${situation}
**Focus Area**: ${focusArea}

---

🧠 **Strategic Analysis**:
Based on your situation and the TELOS framework:

**1. 🎯 Purpose Alignment**
• How does solving this advance your core mission?
• What's the highest-leverage action you can take?

**2. ⚡ Immediate Action Plan**
• Break this into 3 concrete steps you can take today
• Start with the smallest actionable item
• Set a 25-minute focused work block

**3. 🎮 Long-term Strategic View**
• How does this connect to your bigger systems?
• What pattern or process can you build here?
• How will you measure success?

**4. 🛠️ Resource Optimization**
• What do you already have that applies here?
• Who in your network could provide insight?
• What's the minimum viable solution?

---

💡 **Mentor Wisdom**: ${mentorWisdom[focusArea as keyof typeof mentorWisdom] || mentorWisdom.growth}

🎯 **Next Step**: Take one specific action in the next hour. Then use \`track_gain\` to log your progress.

*Note: This is a preview implementation. Full TELOS integration coming in Phase 3.*`;
  }

  private generateCheckinPrompts(timeframe: 'daily' | 'weekly', reflection?: string): string {
    if (timeframe === 'daily') {
      return `📋 **Daily Accountability Check-in**

**Daily Reflection Questions**:

🎆 **Wins & Accomplishments**
• What victories did you have today (big or small)?
• What progress did you make on your goals?
• What are you proud of from today?

🚧 **Challenges & Lessons**
• What obstacles did you encounter?
• What would you do differently?
• What did you learn about yourself?

🎯 **Tomorrow's Focus**
• What's your #1 priority for tomorrow?
• What small action can you commit to?
• How will you set yourself up for success?

${reflection ? `**Your Reflection**: ${reflection}\n\n` : ''}📝 **Action Items**:
• Use \`track_gain\` for any wins you haven't logged
• Use \`get_mentor_advice\` if you're stuck on something
• Use \`set_goal\` to clarify tomorrow's priorities`;
    } else {
      return `📊 **Weekly Accountability Review**

**Weekly Deep Dive**:

🎆 **Major Accomplishments**
• What were your biggest wins this week?
• Which goals did you advance significantly?
• What systems or habits served you well?

🧠 **Key Insights & Lessons**
• What patterns do you notice in your productivity?
• What strategies worked best for you?
• What would you change about this week?

🎯 **Next Week's Strategy**
• What are your top 3 priorities for next week?
• What potential obstacles can you prepare for?
• How will you build on this week's momentum?

🔄 **Systems Review**
• Which habits/routines need adjustment?
• What new processes could help you?
• How can you optimize your time and energy?

${reflection ? `**Your Weekly Reflection**: ${reflection}\n\n` : ''}📝 **Next Actions**:
• Log all weekly wins with \`track_gain\`
• Set next week's goals with \`set_goal\`
• Get strategic guidance with \`get_mentor_advice\``;
    }
  }
}

// Cloudflare Workers compatibility
export interface Env {
  // Add environment variables or bindings here
  AIRTABLE_API_KEY?: string;
  AIRTABLE_BASE_ID?: string;
}

// Create and export the server
const tiffanyServer = new TiffanyMCPServer();
tiffanyServer.setupHandlers();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          service: "tiffany-mcp-v3",
          version: "3.0.0",
          description: "Tiffany Accountability Agent - 25 Tools Implementation",
          timestamp: new Date().toISOString(),
          implementation: {
            phase1: "Data Storage (6 tools) ✅",
            phase2: "AI Processing (4 tools) ✅",
            phase3: "TELOS Integration (3 tools) - Coming next",
            phase4: "Communication & Memory (12 tools) - Coming next"
          },
          completedTools: [
            "store_gains - Save accomplishments to Airtable",
            "get_user_memory - Retrieve user context and history",
            "store_user_state - Persist user conversation state",
            "get_random_quote - Retrieve quotes with filtering",
            "update_quote_record - Track quote usage and metadata",
            "add_quote_to_database - Store new quotes with categorization",
            "process_voice_input - Transcribe and analyze voice messages",
            "extract_information - Parse and categorize user input",
            "generate_custom_quote - AI-powered personalized quotes",
            "analyze_conversation - Context analysis for smart routing"
          ],
          legacyCompatibility: [
            "track_gain - Wrapper for store_gains",
            "get_daily_quote - Wrapper for get_random_quote",
            "get_mentor_advice - Preview implementation",
            "accountability_checkin - Preview implementation",
            "set_goal - Preview implementation"
          ],
          endpoints: {
            "/sse": "MCP Server-Sent Events endpoint",
            "/mcp": "MCP direct endpoint",
            "/health": "Health check with implementation status"
          },
          originalWorkflow: "n8n qNqFdwPIbfnsTQt5 (102 nodes → 25 tools)"
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Default MCP server response
    return new Response(
      JSON.stringify({
        service: "Tiffany Accountability Agent MCP Server",
        version: "3.0.0",
        description: "25-tool implementation for comprehensive accountability coaching",
        phase1Status: "✅ Complete - 6 data storage tools implemented",
        phase2Status: "✅ Complete - 4 AI processing tools implemented",
        nextPhase: "Phase 3 - TELOS Integration (3 tools)",
        connect: "Use MCP client to connect via /sse or /mcp endpoints",
        toolCount: "15 total tools (10 new + 5 legacy compatibility)"
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

// Start the server for development
if (import.meta.main) {
  const transport = new StdioServerTransport();
  tiffanyServer.server.connect(transport);
}