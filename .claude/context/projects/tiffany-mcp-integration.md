# Tiffany MCP Integration Project

## Project Overview

**Goal**: Transform Tiffany from n8n GUI-based development to code-based approach while preserving 24/7 functionality and existing accountability agent capabilities.

**Current State**: Complex n8n workflow (qNqFdwPIbfnsTQt5) with 102 nodes, 81 connections, handling smart routing, gains tracking, quote generation, and scheduling.

**Target State**: Hybrid architecture leveraging MCP ecosystem with code-based development and version control.

## Architecture Discovery

### Current Two-Tier System
- **Local Development**: Claude Code with sophisticated MCP server ecosystem
- **24/7 Production**: n8n on VPS with basic workflow automation
- **Challenge**: Development is slow in n8n GUI, lacks version control

### MCP Ecosystem Role
- **Kai**: Orchestrator (not an MCP server itself) using MCP servers as specialized tools
- **8+ MCP Servers**: httpx, content, daemon, pai/Foundry, naabu, brightdata, stripe, Ref, apify, playwright
- **Agent System**: 7 specialized agents (researcher, engineer, designer, pentester, architect, writer, general-purpose)
- **UFC System**: Universal File System Context for dynamic context loading

## Agent Pattern Decision Framework

Following the 5-level agent pattern hierarchy:
1. **Ad-hoc prompts** (current n8n state)
2. **Reusable prompts**
3. **Sub-agents** ← Target for Tiffany
4. **MCP wrapper**
5. **Full application**

**Principle**: Start simple, scale when needed. Tiffany fits at Level 3 (Sub-agents).

## Proposed Hybrid Architecture

### Phase 1: Code-Based Agent Development
```
Claude Code (Local Development)
├── Tiffany Agent (TypeScript)
│   ├── Smart routing logic
│   ├── Gains tracking
│   ├── Quote generation
│   └── Scheduling coordination
├── MCP Integration Layer
│   ├── pai/Foundry for data storage
│   ├── content for quote retrieval
│   └── daemon for external integrations
└── Version Control (Git)
```

### Phase 2: 24/7 Bridge Service
```
VPS Infrastructure
├── n8n Workflows (Simplified)
│   ├── Webhook receivers
│   ├── Basic routing
│   └── Fallback logic
├── VPS Bridge Service
│   ├── Queue management
│   ├── Claude Code proxy
│   └── State persistence
└── MCP Server Endpoints
    ├── Remote MCP access
    └── Context synchronization
```

## VPS Bridge Service Purpose

**Problem Solved**: Claude Code runs locally, creating a 24/7 availability gap for sophisticated reasoning.

**Solution**: Lightweight proxy service that:
- Runs 24/7 on VPS alongside n8n
- Forwards complex decisions to Claude Code when available
- Falls back to n8n logic when offline
- Maintains state and queues requests
- Preserves hybrid architecture benefits

## Current Tiffany Workflow Analysis

**Workflow ID**: qNqFdwPIbfnsTQt5
**Complexity**: 102 nodes, 81 connections
**Key Components**:
- AI Router Agent for smart routing
- Gains tracking and analysis
- Quote generation system
- Scheduling coordination
- Multi-step accountability flows

**Preservation Strategy**: Extract core logic into TypeScript agents while maintaining existing functionality.

## Implementation Plan

### Phase 1: Agent Development (Code-Based)
1. **Extract Tiffany Logic**: Convert n8n workflow logic to TypeScript agent
2. **MCP Integration**: Connect to existing pai/Foundry, content, daemon servers
3. **Local Testing**: Develop and test in Claude Code environment
4. **Version Control**: Track changes in Git with proper documentation

### Phase 2: Bridge Service (24/7 Operation)
1. **VPS Bridge Service**: Create lightweight proxy for Claude Code
2. **n8n Simplification**: Reduce n8n to basic routing and fallbacks
3. **State Management**: Implement request queuing and state persistence
4. **Deployment Pipeline**: Automate deployment from Git to VPS

### Phase 3: Full Integration
1. **Hybrid Coordination**: Seamless handoff between local and VPS
2. **Performance Optimization**: Monitor and optimize response times
3. **Monitoring & Alerts**: Track system health and availability
4. **User Experience**: Maintain existing interaction patterns

## Benefits of New Architecture

### Development Benefits
- **Version Control**: Track all changes in Git
- **Code-Based**: Faster development than n8n GUI
- **MCP Leverage**: Use specialized servers for complex tasks
- **Agent Specialization**: Tap into existing agent ecosystem

### Operational Benefits
- **24/7 Availability**: Maintained through VPS Bridge Service
- **Hybrid Intelligence**: Best of both local sophistication and cloud reliability
- **Scalability**: Add new MCP servers and agents as needed
- **Maintainability**: Clear separation of concerns

## Technical Requirements

### Local Development Environment
- **Claude Code**: Primary development interface
- **MCP Servers**: Access to full ecosystem (8+ servers)
- **Agent System**: Integration with 7 specialized agents
- **UFC Context**: Dynamic context loading capabilities

### VPS Infrastructure
- **n8n**: Simplified workflow management
- **Bridge Service**: Node.js/TypeScript service
- **MCP Endpoints**: Remote server access
- **Database**: State and queue persistence

## Risk Mitigation

### Availability Risks
- **VPS Bridge Service**: Ensures 24/7 operation when Claude Code offline
- **n8n Fallbacks**: Simplified logic for basic operations
- **State Persistence**: Queue requests for processing when online

### Development Risks
- **Incremental Migration**: Phase-by-phase approach reduces disruption
- **Existing Workflow Preservation**: Keep current n8n as backup during transition
- **Testing Strategy**: Comprehensive testing in Claude Code before VPS deployment

## Next Steps

1. **Phase 1 Implementation**: Begin Tiffany agent development in TypeScript
2. **MCP Server Testing**: Validate pai/Foundry, content, daemon integration
3. **Logic Extraction**: Convert core n8n workflow components to code
4. **Local Testing**: Ensure functionality parity with existing workflow

## Success Metrics

- **Development Speed**: Faster iterations than n8n GUI
- **Code Quality**: Version-controlled, testable, maintainable
- **Availability**: Maintain 24/7 operation
- **Functionality**: Preserve all existing Tiffany capabilities
- **Scalability**: Easy addition of new features and integrations

---

*Project Status: Planning Phase*
*Next Phase: Begin TypeScript agent development*
*Architecture: Hybrid Local/VPS with MCP integration*