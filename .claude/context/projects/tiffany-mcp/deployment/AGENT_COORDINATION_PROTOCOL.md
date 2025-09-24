# MULTI-AGENT COORDINATION PROTOCOL
**For Parallel Tiffany MCP Tool Testing**

## 🚦 MANDATORY STEPS FOR ALL AGENTS

### **1. BEFORE STARTING WORK**
```bash
# Check current status
cat TOOL_TESTING_STATUS.md

# 🚨 MANDATORY: FOLLOW SYSTEMATIC TESTING PROTOCOL
# 1. Read SYSTEMATIC_TESTING_PROTOCOL.md for complete methodology
# 2. Define EXPECTED OUTCOME before testing (don't assume)
# 3. Use validation-tools.js to verify business logic
# 4. NEVER celebrate API success without validating actual data
# 5. Ask user for clarification only if business logic is unclear

# Claim your tool (example for Agent-2)
# Update the tool you're working on:
# - Status: NOT_STARTED → IN_PROGRESS
# - Testing By: Agent-2
# - Started: current timestamp
# - Expected Output: [User's clarification]

# Save immediately
git add TOOL_TESTING_STATUS.md
git commit -m "Agent-2: Claimed tool X for testing - awaiting output clarification"
```

### **2. DURING TESTING**
- **Test thoroughly** with real credentials
- **Document all issues** found
- **Apply stateless design principles** (Input → Process → Output)
- **Handle variable data** (1-3 gains, optional fields)
- **Use Central Time Zone** for date fields
- **Follow existing patterns** from working tools

### **3. AFTER TESTING**
```bash
# Update status with results
# - Status: IN_PROGRESS → WORKING/FAILED/NEEDS_WORK
# - Add fixes applied
# - Add test results (Airtable record IDs)
# - Add completion timestamp

# Save immediately
git add TOOL_TESTING_STATUS.md
git commit -m "Agent-2: Completed tool X - [WORKING/FAILED]"
```

## 🔄 FILE COORDINATION

### **Avoiding Conflicts**
1. **Always pull latest** before editing
2. **Make atomic updates** (one tool status per commit)
3. **Use descriptive commits** with agent ID
4. **Wait and retry** if file locked

### **Update Format**
```markdown
#### **N. tool_name** ✅/❌/🔄
- **Status**: WORKING/FAILED/IN_PROGRESS/NOT_STARTED
- **Testing By**: Agent-X
- **Last Tested**: 2025-09-24T04:15:00Z
- **Fixes Applied**: List of changes made
- **Test Results**: Specific outcomes
- **Known Issues**: Any remaining problems
```

## 🎯 TESTING PRIORITIES

### **CRITICAL PATH (Do First)**
1. **extract_information** - Multi-gain parsing (blocks workflow)
2. **get_random_quote** - Fix existing failure
3. **store_user_state** - User context persistence
4. **generate_custom_quote** - AI integration testing

### **HIGH PRIORITY**
- All AI Processing tools (7-10)
- Data Storage & Retrieval completion (2-6)
- Core Communication tools (14-16)

### **LOWER PRIORITY**
- TELOS Integration (11-13)
- Scheduling/Automation (17-18)
- Legacy Wrappers (21-25)

## 🧪 STANDARDIZED TESTING PATTERN

### **Test File Template**
```javascript
#!/usr/bin/env bun
// Test [TOOL_NAME] - Agent-X

import { config } from 'dotenv';
config({ path: '/home/michael/tiffany-pai/.env' });

const { toolName } = await import('./src/tools/[category]/[tool-file].js');

console.log('🧪 Testing [TOOL_NAME] - Agent-X...\n');
console.log('🔑 Environment check:');
console.log('- AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing');

try {
  const testArgs = {
    // Test data structure matching tool schema
  };

  console.log('📝 Test input:', JSON.stringify(testArgs, null, 2));
  const result = await toolName.execute(testArgs);

  console.log('\n✅ Result:', JSON.stringify(result, null, 2));

  if (!result.isError) {
    console.log('\n🎉 SUCCESS: Tool working!');
    if (result.metadata?.airtableId) {
      console.log(`✅ Airtable Record: ${result.metadata.airtableId}`);
    }
  } else {
    console.log('\n❌ FAILED: Tool has issues');
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
}
```

## 📊 PROGRESS TRACKING

### **Daily Standup Format**
- **Agent ID**: Your identifier
- **Completed**: Tools finished yesterday
- **In Progress**: Current tool being tested
- **Blocked**: Issues preventing progress
- **Next**: Plan for today

### **Communication Channels**
- **Status File**: Primary coordination mechanism
- **Git Commits**: Change tracking
- **User Updates**: Report major milestones

## ⚡ EFFICIENCY TIPS

### **Schema Discovery Speed**
```javascript
// Quick Airtable table structure check
const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/[TABLE_NAME]`, {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});
const data = await response.json();
console.log('Fields:', Object.keys(data.records[0]?.fields || {}));
```

### **Common Fixes Pattern**
1. **Check table names** (use actual Airtable table names)
2. **Check field names** (match exact Airtable field names)
3. **Check field values** (use allowed dropdown options)
4. **Test timezone handling** (Central Time Zone required)
5. **Test error handling** (graceful failures)

### **Parallel Work Distribution**
- **Agent-1**: AI Processing tools (require OpenAI/OpenRouter)
- **Agent-2**: Data Storage tools (require Airtable schema work)
- **Agent-3**: Communication tools (formatting/templates)
- **Agent-4**: Advanced features (TELOS/Automation)

---

**🎯 Goal: Complete all 25 tools with 4 agents working in parallel**
**📈 Expected: 6-7 tools per agent = ~80% efficiency gain**