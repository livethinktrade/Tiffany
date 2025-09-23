# Fabric Patterns Integration for KAI

## Overview

Fabric patterns are AI prompts for extracting insights, creating content, and analyzing data. KAI has access to 200+ patterns including specialized Tiffany patterns for behavioral analysis and accountability coaching.

## Pattern Locations

- **Fabric CLI**: `/usr/local/bin/fabric` (v1.4.272+)
- **Pattern Directory**: `~/.config/fabric/patterns/`
- **Source Repo**: `~/fabric/` (on fabric branch)

## Available Pattern Categories

### Analysis Patterns
- `analyze_*` - Content analysis (prose, papers, threats, etc.)
- `extract_*` - Information extraction (insights, wisdom, ideas, etc.)
- `summarize_*` - Content summarization

### Creation Patterns
- `create_*` - Content creation (summaries, visualizations, reports, etc.)
- `write_*` - Writing assistance (essays, reports, etc.)

### Tiffany Accountability Patterns (t_ prefix)
- `t_analyze_challenge_handling` - Analyze how challenges are being handled
- `t_check_dunning_kruger` - Check for overconfidence patterns
- `t_check_metrics` - Review progress metrics
- `t_create_h3_career` - Create Human 3.0 career guidance
- `t_find_blindspots` - Identify cognitive blindspots
- `t_find_negative_thinking` - Detect negative thought patterns
- `t_find_neglected_goals` - Find goals that aren't being pursued
- `t_give_encouragement` - Provide personalized encouragement
- `t_visualize_mission_goals_projects` - Create visual mission alignment
- `t_year_in_review` - Comprehensive year review analysis

## Usage Methods

### Direct CLI Execution
```bash
echo "$content" | fabric --pattern t_find_negative_thinking
echo "$content" | fabric --pattern extract_insights
```

### Pattern with Strategy
```bash
echo "$content" | fabric --pattern analyze_prose --strategy cot
```

### Save Output
```bash
echo "$content" | fabric --pattern t_give_encouragement --output /path/to/output.md
```

## Integration with KAI Commands

### Creating Fabric-wrapped Commands
Create commands in `.claude/commands/` that wrap common patterns:

```markdown
# Example: .claude/commands/analyze-mindset.md
#!/usr/bin/env bun
// Analyze mindset using Tiffany patterns
```

### Pattern Selection Logic
- For behavioral analysis: Use `t_*` patterns
- For content analysis: Use `analyze_*` patterns
- For extraction: Use `extract_*` patterns
- For creation: Use `create_*` patterns

## TIFFANY Integration Points

These patterns bridge the KAI and TIFFANY systems:
- **Behavioral Analysis**: `t_find_negative_thinking`, `t_check_dunning_kruger`
- **Goal Tracking**: `t_find_neglected_goals`, `t_check_metrics`
- **Coaching**: `t_give_encouragement`, `t_analyze_challenge_handling`
- **Planning**: `t_visualize_mission_goals_projects`, `t_create_h3_career`

## Status Line Integration

The statusline counts patterns: `📚 ${fabric_count} Patterns`
- Currently counting: 225+ patterns from `~/.config/fabric/patterns/`
- Includes all official patterns plus Tiffany-specific patterns

## Pattern Development

- **Source**: Patterns stored in `~/fabric/data/patterns/`
- **Local**: Installed to `~/.config/fabric/patterns/`
- **Branch**: Working on `fabric` branch for customizations
- **Contributing**: Tiffany patterns are now part of main Fabric repo

## Best Practices

1. **Use appropriate patterns** for the task type
2. **Combine patterns** for complex analysis
3. **Cache results** for expensive operations
4. **Test pattern outputs** before automation
5. **Use strategies** (cot, concise, etc.) for different needs

## Error Handling

- Check pattern exists: `fabric --listpatterns | grep pattern_name`
- Validate input format before piping to patterns
- Handle empty or invalid outputs gracefully
- Fall back to simpler patterns if complex ones fail