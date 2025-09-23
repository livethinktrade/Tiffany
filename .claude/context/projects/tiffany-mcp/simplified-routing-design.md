# Simplified Tiffany Routing Design

## Current State: 102 Nodes → Target: ~10 Nodes

### Original Complex Flow
```
Telegram → 102 node workflow → Multiple AI agents → Airtable → Response
```

### Simplified Flow
```
Telegram → n8n Router (10 nodes) → MCP Server → Response
```

## Simplified n8n Workflow Design

### Core Nodes (Target: 8-10 nodes)

1. **Telegram Trigger** (existing: `10cfcf9c-4237-407e-847c-2b8cfe7035a9`)
   - Receives user messages
   - Handles voice/text input

2. **Input Preprocessor** (new)
   - Clean and format user input
   - Extract basic metadata (voice vs text, user ID)

3. **MCP Route Caller** (replaces Smart Routing switch)
   - Single node that calls MCP server's `smart_route` tool
   - Passes user input and context
   - Gets back routing decision

4. **Tool Dispatcher** (new)
   - Based on MCP routing decision, calls appropriate MCP tool:
     - `track_gain` for accomplishments
     - `get_mentor_advice` for guidance
     - `get_daily_quote` for inspiration
     - `accountability_checkin` for reviews
     - `set_goal` for goal setting

5. **Response Formatter** (new)
   - Formats MCP tool response for Telegram
   - Handles different response types (text, photos, etc.)

6. **Telegram Sender** (existing: multiple nodes → simplified to 1)
   - Sends formatted response back to user

7. **Error Handler** (new)
   - Catches and handles any failures
   - Provides fallback responses

8. **Logger** (simplified from multiple logging nodes)
   - Logs conversation for memory
   - Stores user state updates

### Scheduling Nodes (Keep existing)
- **Daily Quote Schedule** (existing: `b919e738-aee5-40d9-b665-cc9363d8fe2d`)
- **Daily Gains Schedule** (existing: `3523f654-2a6c-4959-bbf8-a79a14a27cd6`)
- **Definite Purpose Schedule** (existing: `ed6b8184-24e2-4673-a3d7-d075e4b8d28f`)

## Removed Complexity

### Eliminated (moved to MCP):
- AI Agent nodes (6+ nodes)
- Information Extractor
- Multiple OpenRouter Chat Models
- Complex memory management nodes
- Multiple response sender nodes
- Complex error handling chains
- Airtable operations (simplified to MCP calls)

### Kept in n8n:
- Scheduling triggers (3 nodes)
- Core routing logic (1 node calling MCP)
- Basic input/output handling (3 nodes)
- Error handling (1 node)

## Benefits of Simplified Design

1. **Maintainable**: 10 nodes vs 102 nodes
2. **Version Controlled**: Logic in TypeScript/MCP
3. **Testable**: Tools can be tested independently
4. **Scalable**: Add new tools without n8n changes
5. **Debuggable**: Clear separation of concerns

## Implementation Steps

1. ✅ Create MCP server with routing logic
2. ✅ Add n8n workflow management tools
3. 🔄 Design simplified workflow
4. ⏳ Create new simplified n8n workflow
5. ⏳ Test with existing Telegram integration
6. ⏳ Deploy and validate

## MCP Integration Points

The simplified n8n workflow will use these MCP tools:
- `smart_route`: Core routing decisions
- `track_gain`: Accomplishment logging
- `get_mentor_advice`: TELOS guidance
- `get_daily_quote`: Inspirational content
- `accountability_checkin`: Review prompts
- `set_goal`: Goal management
- `fetch_n8n_workflow`: For version control
- `deploy_n8n_workflow`: For automated updates

This hybrid approach keeps n8n's strengths (scheduling, triggers) while gaining code-based development benefits through MCP tools.