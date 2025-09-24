name: "Tiffany MCP Complete Tool Implementation PRP v1.0"
description: "Comprehensive implementation of all 25 Tiffany MCP tools for full accountability agent functionality"

---

## Goal

**Feature Goal**: Implement all 25 MCP tools for the Tiffany Accountability Agent to match the functionality of the original 102-node n8n workflow while maintaining code-based development and version control.

**Deliverable**: Complete TypeScript MCP server with 25 working tools across 5 functional categories: Data Storage & Retrieval (6), AI Processing (4), TELOS Integration (3), Communication & Formatting (3), Scheduling & Automation (2), Memory & Context (2), plus 5 existing tools enhanced.

**Success Definition**:
- All 25 tools implemented and tested
- Original n8n workflow functionality preserved
- Cloudflare Workers deployment working
- MCP protocol compliance maintained
- Performance and reliability equivalent to n8n workflow

## User Persona

**Target User**: Personal accountability coaching user seeking AI-powered guidance for goal achievement and progress tracking

**Use Case**: Daily accountability interactions via Telegram including gains tracking, mentor advice, motivation quotes, check-ins, and goal setting

**User Journey**:
1. User sends message to Telegram bot
2. AI router analyzes intent and routes to appropriate tool
3. Tool processes request with context and memory
4. Formatted response sent back to user
5. Progress and context stored for future interactions

**Pain Points Addressed**:
- Complex n8n workflow management and version control
- Manual routing and context management
- Limited offline capability and deployment flexibility
- Difficulty adding new tools and features

## Why

- **Business Value**: Reduces infrastructure complexity from 102-node n8n workflow to maintainable code
- **User Impact**: Maintains all existing functionality while enabling faster feature development
- **Integration Benefits**: Enables version control, automated testing, and modular development
- **Development Speed**: Code-based development vs GUI-based n8n workflow management

## What

Implement 25 MCP tools in TypeScript that replicate and enhance the original n8n Tiffany workflow functionality:

### Success Criteria

- [ ] All 25 tools implemented with proper MCP schema definitions
- [ ] Smart routing system preserves n8n AI Router Agent logic
- [ ] User state and memory management working across tools
- [ ] TELOS integration functional for mentor advice
- [ ] Airtable integration for data persistence
- [ ] Voice processing capability maintained
- [ ] Scheduling and automation features working
- [ ] All tools tested and validated individually
- [ ] Integration testing passes for complete workflows
- [ ] Performance metrics meet or exceed n8n workflow
- [ ] Cloudflare Workers deployment successful

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this MCP codebase or the original n8n workflow, would they have everything needed to implement all 25 tools successfully?"_

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://modelcontextprotocol.io/docs/concepts/tools
  why: MCP tool implementation patterns and schema definitions
  critical: Proper tool registration and parameter validation

- url: https://modelcontextprotocol.io/docs/server/typescript
  why: TypeScript MCP server implementation guide
  critical: Server setup, tool handlers, and request processing

- file: /home/michael/tiffany-pai/.claude/context/projects/tiffany-mcp/deployment/src/index.ts
  why: Current implementation with 8 working tools and smart routing
  pattern: Tool registration, handler implementation, user state management
  gotcha: Cloudflare Workers compatibility and STDIO transport limitations

- file: /home/michael/tiffany-pai/.claude/context/projects/tiffany-mcp/tools/track-gain.ts
  why: Individual tool implementation pattern with Zod schema
  pattern: Tool definition structure, execute function, return format
  gotcha: Async execution and proper error handling

- file: /home/michael/tiffany-pai/.claude/context/projects/tiffany-mcp/CLAUDE.md
  why: Complete tool requirements specification with priority phases
  section: Tool breakdown, implementation priorities, and logic details
  critical: All 25 tool specifications and categorization

- docfile: /home/michael/tiffany-pai/.claude/context/projects/tiffany-mcp/workflow-modules/
  why: Original n8n workflow logic extracted into modular components
  section: routing-core.json, tool-integrations.json, communication-flow.json
  critical: Business logic preservation and integration patterns

- url: https://docs.cloudflare.com/workers/runtime-apis/
  why: Cloudflare Workers runtime limitations and capabilities
  critical: No filesystem access, fetch-based integrations, Durable Objects for state
```

### Current Codebase Tree

```bash
/home/michael/tiffany-pai/
├── .claude/context/projects/tiffany-mcp/
│   ├── deployment/src/index.ts (main MCP server - 647 lines)
│   ├── tools/
│   │   ├── track-gain.ts (individual tool pattern)
│   │   ├── mentor-advice.ts
│   │   ├── daily-quote.ts
│   │   ├── accountability-checkin.ts
│   │   └── set-goal.ts
│   ├── workflow-modules/ (n8n logic extraction)
│   │   ├── routing-core.json
│   │   ├── tool-integrations.json
│   │   ├── communication-flow.json
│   │   └── assembly-plan.json
│   └── CLAUDE.md (complete requirements)
```

### Desired Codebase Tree with Files to be Added

```bash
/home/michael/tiffany-pai/.claude/context/projects/tiffany-mcp/
├── deployment/src/
│   ├── index.ts (enhanced with all 25 tools)
│   ├── types/
│   │   ├── tiffany-types.ts (all data interfaces)
│   │   ├── user-state.ts (user management types)
│   │   ├── tool-responses.ts (response type definitions)
│   │   └── external-apis.ts (Airtable, AI service types)
│   ├── tools/
│   │   ├── data-storage/
│   │   │   ├── store-gains.ts
│   │   │   ├── get-random-quote.ts
│   │   │   ├── update-quote-record.ts
│   │   │   ├── add-quote-to-database.ts
│   │   │   ├── store-user-state.ts
│   │   │   └── get-user-memory.ts
│   │   ├── ai-processing/
│   │   │   ├── process-voice-input.ts
│   │   │   ├── extract-information.ts
│   │   │   ├── generate-custom-quote.ts
│   │   │   └── analyze-conversation.ts
│   │   ├── telos-integration/
│   │   │   ├── get-telos-file.ts
│   │   │   ├── search-telos-content.ts
│   │   │   └── get-mentor-council.ts
│   │   ├── communication/
│   │   │   ├── format-telegram-message.ts
│   │   │   ├── format-gains-request.ts
│   │   │   └── format-error-message.ts
│   │   ├── automation/
│   │   │   ├── schedule-daily-reminder.ts
│   │   │   └── check-gains-submission.ts
│   │   └── memory/
│   │       ├── update-conversation-log.ts
│   │       └── get-conversation-context.ts
│   ├── services/
│   │   ├── airtable-service.ts (data persistence)
│   │   ├── ai-service.ts (AI processing integrations)
│   │   ├── telos-service.ts (TELOS file system)
│   │   ├── voice-service.ts (transcription service)
│   │   └── telegram-service.ts (message formatting)
│   ├── utils/
│   │   ├── router.ts (enhanced AI routing logic)
│   │   ├── memory-manager.ts (conversation context)
│   │   ├── user-state-manager.ts (user progress tracking)
│   │   └── validation.ts (input validation and sanitization)
│   └── config/
│       ├── environment.ts (env var management)
│       ├── tool-registry.ts (centralized tool registration)
│       └── constants.ts (system constants and settings)
├── tests/
│   ├── tools/ (individual tool tests)
│   ├── services/ (service integration tests)
│   ├── integration/ (end-to-end workflow tests)
│   └── fixtures/ (test data and mocks)
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Cloudflare Workers limitations
// - No filesystem access (TELOS files need external storage or embedding)
// - Fetch-based external API calls only
// - Durable Objects for persistent state
// - 128MB memory limit, 10ms CPU time limit per request

// CRITICAL: MCP Protocol requirements
// - All tools must be registered in ListToolsRequestSchema handler
// - Tool names must match exactly in CallToolRequestSchema handler
// - Input schemas must use proper JSON Schema format
// - Responses must use content array with type/text structure

// CRITICAL: TypeScript strict mode requirements
// - All interfaces must be properly typed
// - Async functions require proper Promise handling
// - Zod schemas for runtime validation
// - No 'any' types allowed

// CRITICAL: Current implementation patterns
// - TiffanyAIRouter class handles smart routing logic
// - UserState interface tracks user progress and context
// - Memory buffer with 10-item limit for conversation context
// - Points system: small=1, medium=3, large=5

// GOTCHA: Airtable integration
// - Current n8n workflow uses specific Airtable node IDs
// - Need to preserve data schema and field mappings
// - Rate limiting considerations for API calls
// - Error handling for network failures

// GOTCHA: Voice processing
// - Original workflow uses n8n voice transcription
// - Need external transcription service (OpenAI Whisper API)
// - File upload handling in Cloudflare Workers
// - Audio format support limitations
```

## Implementation Blueprint

### Data Models and Structure

Create comprehensive type definitions for all tool interactions and data flow:

```typescript
// Core data interfaces
interface TiffanyUserState {
  id: string;
  lastInteraction: string;
  gainsCount: number;
  currentStreak: number;
  memoryContext: string[];
  totalPoints: number;
  goals: Goal[];
  preferences: UserPreferences;
}

interface Gain {
  id: string;
  description: string;
  category: string;
  impact: 'small' | 'medium' | 'large';
  timestamp: string;
  points: number;
  userId: string;
  airtableId?: string;
}

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  style: 'inspirational' | 'practical' | 'philosophical';
  used: boolean;
  usageCount: number;
}

interface TELOSFile {
  id: string;
  filename: string;
  content: string;
  category: string;
  lastAccessed: string;
}

interface MemoryEntry {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'conversation' | 'gain' | 'goal' | 'advice';
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE types/tiffany-types.ts
  - IMPLEMENT: All TypeScript interfaces for tools, user state, external APIs
  - FOLLOW pattern: deployment/src/index.ts (existing interfaces)
  - NAMING: PascalCase for interfaces, camelCase for properties
  - PLACEMENT: Core type definitions for entire system

Task 2: CREATE utils/router.ts
  - IMPLEMENT: Enhanced TiffanyAIRouter with all 25 tool routing
  - FOLLOW pattern: deployment/src/index.ts (TiffanyAIRouter class)
  - DEPENDENCIES: Import types from Task 1
  - ENHANCEMENT: Add routing for all new tool categories

Task 3: CREATE services/airtable-service.ts
  - IMPLEMENT: Airtable API integration service
  - FOLLOW pattern: External API service with fetch-based calls
  - DEPENDENCIES: Environment variables, error handling
  - CRITICAL: Preserve n8n workflow data schema compatibility

Task 4: CREATE tools/data-storage/ (6 tools)
  - IMPLEMENT: store-gains, get-random-quote, update-quote-record, add-quote-to-database, store-user-state, get-user-memory
  - FOLLOW pattern: tools/track-gain.ts (tool structure, Zod schema, execute function)
  - DEPENDENCIES: airtable-service, user state management
  - PLACEMENT: Data persistence layer tools

Task 5: CREATE tools/ai-processing/ (4 tools)
  - IMPLEMENT: process-voice-input, extract-information, generate-custom-quote, analyze-conversation
  - FOLLOW pattern: tools/track-gain.ts with external AI service calls
  - DEPENDENCIES: AI service integrations, voice processing
  - CRITICAL: OpenAI API integration for voice and text processing

Task 6: CREATE tools/telos-integration/ (3 tools)
  - IMPLEMENT: get-telos-file, search-telos-content, get-mentor-council
  - FOLLOW pattern: File content retrieval and search functionality
  - DEPENDENCIES: TELOS content storage strategy
  - GOTCHA: Cloudflare Workers filesystem limitations

Task 7: CREATE tools/communication/ (3 tools)
  - IMPLEMENT: format-telegram-message, format-gains-request, format-error-message
  - FOLLOW pattern: Response formatting with markdown support
  - DEPENDENCIES: Message templates and user preferences
  - CRITICAL: Preserve n8n Telegram formatting patterns

Task 8: CREATE tools/automation/ (2 tools)
  - IMPLEMENT: schedule-daily-reminder, check-gains-submission
  - FOLLOW pattern: Scheduled task management with Durable Objects
  - DEPENDENCIES: User state, scheduling service
  - GOTCHA: Cloudflare Workers cron trigger integration

Task 9: CREATE tools/memory/ (2 tools)
  - IMPLEMENT: update-conversation-log, get-conversation-context
  - FOLLOW pattern: Memory management with persistence
  - DEPENDENCIES: User state management, conversation storage
  - ENHANCEMENT: Extend current memory buffer to full conversation log

Task 10: UPDATE deployment/src/index.ts
  - IMPLEMENT: Register all 25 tools in MCP server
  - FOLLOW pattern: Existing tool registration and handler setup
  - DEPENDENCIES: All tool implementations from previous tasks
  - CRITICAL: Maintain existing 8 tools while adding 17 new ones
```

### Implementation Patterns & Key Details

```typescript
// Tool registration pattern
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Existing tools (5) + new tools (20) = 25 total
      {
        name: "store_gains",
        description: "Save gains to Airtable with categorization and user tracking",
        inputSchema: {
          type: "object",
          properties: {
            gain: { $ref: "#/definitions/Gain" },
            userId: { type: "string" }
          },
          required: ["gain"]
        }
      },
      // ... all 25 tools
    ]
  };
});

// Tool handler pattern
switch (name) {
  case "store_gains":
    return this.handleStoreGains(args as StoreGainsArgs);
  // ... all 25 handlers
}

// Service integration pattern
class AirtableService {
  private baseUrl = "https://api.airtable.com/v0";
  private apiKey = process.env.AIRTABLE_API_KEY;

  async storeGain(gain: Gain): Promise<AirtableRecord> {
    // PATTERN: Fetch-based API calls with error handling
    // GOTCHA: Rate limiting and network error recovery
    // CRITICAL: Data schema compatibility with n8n workflow
  }
}

// Memory management pattern
class MemoryManager {
  // PATTERN: Conversation context with sliding window
  // GOTCHA: Memory limits in Cloudflare Workers
  // ENHANCEMENT: Persistent storage vs in-memory buffer
}

// Voice processing pattern
async processVoiceInput(audioData: ArrayBuffer): Promise<string> {
  // PATTERN: OpenAI Whisper API integration
  // GOTCHA: File size limits and audio format support
  // CRITICAL: Error handling for transcription failures
}
```

### Integration Points

```yaml
AIRTABLE:
  - api_key: process.env.AIRTABLE_API_KEY
  - base_id: process.env.AIRTABLE_BASE_ID
  - tables: ["Gains", "Quotes", "UserState", "ConversationLog"]
  - pattern: "Preserve n8n workflow field mappings"

OPENAI:
  - api_key: process.env.OPENAI_API_KEY
  - services: ["Whisper (voice)", "GPT-4 (text processing)", "Embeddings (search)"]
  - pattern: "Error handling and rate limiting"

TELEGRAM:
  - bot_token: process.env.TELEGRAM_BOT_TOKEN
  - webhook: "Integration via n8n workflow (preserved)"
  - pattern: "Markdown formatting and response structure"

CLOUDFLARE:
  - durable_objects: "User state persistence"
  - cron_triggers: "Scheduled reminders and automation"
  - kv_storage: "TELOS content and configuration"

TELOS:
  - storage: "Cloudflare KV or embedded content"
  - search: "Vector embeddings or text search"
  - pattern: "File content retrieval and context matching"
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each tool implementation
bun run lint                    # ESLint with TypeScript rules
bun run type-check             # TypeScript compilation check
bun run format                 # Prettier formatting

# Tool-specific validation
bun test tools/data-storage/   # Individual tool tests
bun test tools/ai-processing/  # Category-specific tests

# Expected: Zero errors, all types properly defined
```

### Level 2: Unit Tests (Tool Validation)

```bash
# Individual tool testing
bun test tools/data-storage/store-gains.test.ts
bun test tools/ai-processing/process-voice-input.test.ts
bun test tools/telos-integration/get-telos-file.test.ts

# Service integration testing
bun test services/airtable-service.test.ts
bun test services/ai-service.test.ts

# Router and memory testing
bun test utils/router.test.ts
bun test utils/memory-manager.test.ts

# Expected: All unit tests pass, proper mocking of external services
```

### Level 3: Integration Testing (System Validation)

```bash
# MCP server startup
bun run dev &
sleep 5

# Tool registration validation
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' \
  | jq '.result.tools | length'
# Expected: 25 tools registered

# Individual tool execution testing
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "store_gains",
      "arguments": {
        "gain": {
          "description": "Test gain",
          "category": "test",
          "impact": "medium"
        }
      }
    }
  }' | jq .

# Smart routing validation
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "smart_route",
      "arguments": {
        "userInput": "I accomplished something great today!"
      }
    }
  }' | jq .
# Expected: Routes to gains_tracking action

# Cloudflare Workers deployment
wrangler deploy
# Expected: Successful deployment with all tools accessible
```

### Level 4: End-to-End Workflow Validation

```bash
# Complete user journey testing
# 1. Gains tracking workflow
curl -X POST https://tiffany-mcp-official.michael-b5e.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/call", "params": {"name": "track_gain", "arguments": {"description": "Completed project milestone", "category": "work", "impact": "large"}}}'

# 2. Mentor advice workflow
curl -X POST https://tiffany-mcp-official.michael-b5e.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/call", "params": {"name": "get_mentor_advice", "arguments": {"situation": "Struggling with time management", "focus_area": "productivity"}}}'

# 3. User state persistence validation
curl -X POST https://tiffany-mcp-official.michael-b5e.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/call", "params": {"name": "get_user_memory", "arguments": {"userId": "test-user"}}}'

# Performance testing
# - Response time < 2 seconds per tool call
# - Memory usage within Cloudflare Workers limits
# - Concurrent user handling (100+ simultaneous users)

# Original n8n workflow comparison
# - Feature parity validation
# - Response quality comparison
# - Performance benchmarking
```

## Final Validation Checklist

### Technical Validation

- [ ] All 25 tools implemented with proper MCP schemas
- [ ] TypeScript compilation passes with no errors
- [ ] All unit tests pass: `bun test`
- [ ] No linting errors: `bun run lint`
- [ ] Integration tests successful
- [ ] Cloudflare Workers deployment working

### Feature Validation

- [ ] Smart routing preserves n8n AI Router Agent logic
- [ ] User state management working across all tools
- [ ] Memory context preserved between interactions
- [ ] Airtable integration maintains data schema compatibility
- [ ] TELOS integration functional for mentor advice
- [ ] Voice processing working with external transcription
- [ ] Automation features working with Cloudflare cron triggers
- [ ] Error handling graceful for all external service failures

### Code Quality Validation

- [ ] All tools follow established MCP patterns
- [ ] Service layer properly abstracts external APIs
- [ ] Type safety maintained throughout system
- [ ] Configuration managed through environment variables
- [ ] Performance optimized for Cloudflare Workers environment

### User Experience Validation

- [ ] All original n8n workflow functionality preserved
- [ ] Response times meet or exceed n8n performance
- [ ] Error messages clear and actionable
- [ ] Tool discovery and usage intuitive
- [ ] Context awareness maintained across sessions

### Deployment & Operations

- [ ] Cloudflare Workers deployment automated
- [ ] Environment variables properly configured
- [ ] Health check endpoint functional
- [ ] Monitoring and logging implemented
- [ ] Rollback plan validated

---

## Anti-Patterns to Avoid

- ❌ Don't break existing tool functionality while adding new ones
- ❌ Don't ignore Cloudflare Workers runtime limitations
- ❌ Don't skip external API error handling and retries
- ❌ Don't hardcode external service configurations
- ❌ Don't lose user context between tool calls
- ❌ Don't sacrifice type safety for implementation speed
- ❌ Don't create new patterns when MCP patterns exist
- ❌ Don't deploy without comprehensive testing
- ❌ Don't ignore data persistence requirements
- ❌ Don't break compatibility with existing n8n integrations

---

## Implementation Success Metrics

**Confidence Score**: 9/10 for one-pass TypeScript implementation success likelihood

**Quality Standard**: All 25 tools working, tested, and deployed successfully

**Validation**: The completed implementation enables full accountability agent functionality equivalent to the original 102-node n8n workflow, with improved maintainability, version control, and development velocity.