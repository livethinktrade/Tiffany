// Get User Memory Tool - Retrieve user context and history
// Part of Phase 1 core tools implementation

import { z } from 'zod';
import { ToolResponse, MemoryEntry, GainSummary } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Zod schema for input validation
const GetUserMemorySchema = z.object({
  userId: z.string().optional().default('default'),
  type: z.enum(['all', 'conversation', 'gain', 'goal', 'advice', 'quote', 'checkin']).optional().default('all'),
  limit: z.number().min(1).max(100).optional().default(20),
  includeStats: z.boolean().optional().default(true),
  timeframe: z.enum(['day', 'week', 'month', 'year', 'all']).optional().default('all')
});

export const getUserMemoryTool = {
  name: 'get_user_memory',
  description: 'Retrieve user context and history with filtering options and statistical summaries',
  schema: GetUserMemorySchema,

  async execute(args: z.infer<typeof GetUserMemorySchema>): Promise<ToolResponse> {
    try {
      const { userId, type, limit, includeStats, timeframe } = args;

      const airtableService = new AirtableService();

      // Get user state and memory entries
      const [userState, memoryEntries, gains] = await Promise.all([
        airtableService.getUserState(userId),
        airtableService.getMemoryEntries(userId, limit, type === 'all' ? undefined : type),
        includeStats ? airtableService.getGainsByUser(userId, 50) : Promise.resolve([])
      ]);

      // Filter by timeframe if specified
      const filteredEntries = this.filterByTimeframe(memoryEntries, timeframe);

      // Generate statistics if requested
      let stats = null;
      if (includeStats && gains.length > 0) {
        stats = this.generateGainStats(gains, timeframe);
      }

      // Format response based on what was found
      const formattedMessage = this.formatMemoryResponse(
        filteredEntries,
        userState,
        stats,
        type,
        timeframe
      );

      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          userId,
          entriesFound: filteredEntries.length,
          type,
          timeframe,
          hasUserState: !!userState,
          stats: stats || undefined
        }
      };

    } catch (error) {
      console.error('Get user memory error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Error retrieving memory**: ${error.message}\n\nThis could be due to database connectivity issues. Please try again.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Filter entries by timeframe
  filterByTimeframe(entries: MemoryEntry[], timeframe: string): MemoryEntry[] {
    if (timeframe === 'all') return entries;

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeframe) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return entries.filter(entry => new Date(entry.timestamp) >= cutoffDate);
  },

  // Generate gain statistics
  generateGainStats(gains: any[], timeframe: string): GainSummary {
    const filteredGains = this.filterByTimeframe(
      gains.map(g => ({ timestamp: g.timestamp })),
      timeframe
    );

    const totalPoints = gains.reduce((sum, gain) => sum + (gain.points || 0), 0);
    const categoryCounts: Record<string, number> = {};

    gains.forEach(gain => {
      categoryCounts[gain.category] = (categoryCounts[gain.category] || 0) + 1;
    });

    // Calculate current streak
    let currentStreak = 0;
    const sortedGains = gains.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    for (const gain of sortedGains) {
      const gainDate = new Date(gain.timestamp).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (gainDate === today || gainDate === yesterday) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalGains: gains.length,
      totalPoints,
      currentStreak,
      longestStreak: currentStreak, // Simplified for now
      categoryCounts,
      lastGainDate: gains.length > 0 ? gains[0].timestamp : ''
    };
  },

  // Format the complete memory response
  formatMemoryResponse(
    entries: MemoryEntry[],
    userState: any,
    stats: GainSummary | null,
    type: string,
    timeframe: string
  ): string {
    const timeframeText = timeframe === 'all' ? 'all time' : `the last ${timeframe}`;
    const typeText = type === 'all' ? 'memory' : `${type} entries`;

    let response = `🧠 **Your ${typeText.charAt(0).toUpperCase() + typeText.slice(1)} - ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}**\n\n`;

    // Add user state summary if available
    if (userState) {
      response += `📊 **Your Progress Summary**:\n`;
      response += `• Total gains: ${userState.gainsCount || 0}\n`;
      response += `• Current streak: ${userState.currentStreak || 0}\n`;
      response += `• Total points: ${userState.totalPoints || 0}\n`;
      response += `• Last interaction: ${new Date(userState.lastInteraction).toLocaleString()}\n\n`;
    }

    // Add statistics if available
    if (stats) {
      response += `📈 **Gains Statistics**:\n`;
      response += `• Total gains: ${stats.totalGains}\n`;
      response += `• Total points earned: ${stats.totalPoints}\n`;
      response += `• Current streak: ${stats.currentStreak} days\n`;

      if (Object.keys(stats.categoryCounts).length > 0) {
        response += `• Top categories: ${Object.entries(stats.categoryCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([cat, count]) => `${cat} (${count})`)
          .join(', ')}\n`;
      }
      response += '\n';
    }

    // Add memory entries
    if (entries.length === 0) {
      response += `📭 **No ${typeText} found for ${timeframeText}**\n\n`;
      response += `This could mean:\n`;
      response += `• You haven't had any ${type === 'all' ? 'interactions' : type + ' activities'} recently\n`;
      response += `• Your memory data is still being synchronized\n`;
      response += `• Try a different timeframe or type filter\n\n`;
      response += `💡 **Get started by**: \n`;
      response += `• Using \`track_gain\` to log an accomplishment\n`;
      response += `• Using \`set_goal\` to create a new goal\n`;
      response += `• Using \`get_mentor_advice\` to seek guidance\n`;
    } else {
      response += `💭 **Recent ${typeText.charAt(0).toUpperCase() + typeText.slice(1)} (${entries.length} entries)**:\n\n`;

      // Group entries by type for better organization
      const groupedEntries = this.groupEntriesByType(entries);

      for (const [entryType, typeEntries] of Object.entries(groupedEntries)) {
        if (typeEntries.length === 0) continue;

        const typeEmoji = this.getTypeEmoji(entryType);
        response += `${typeEmoji} **${entryType.charAt(0).toUpperCase() + entryType.slice(1)} (${typeEntries.length})**:\n`;

        typeEntries.slice(0, 5).forEach((entry, index) => {
          const date = new Date(entry.timestamp).toLocaleDateString();
          const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const preview = entry.content.length > 100 ?
            entry.content.substring(0, 100) + '...' :
            entry.content;

          response += `  ${index + 1}. **${date} ${time}**: ${preview}\n`;
        });

        if (typeEntries.length > 5) {
          response += `  ... and ${typeEntries.length - 5} more entries\n`;
        }
        response += '\n';
      }
    }

    // Add action suggestions
    response += `🎯 **Quick Actions**:\n`;
    response += `• \`track_gain\` - Log a new accomplishment\n`;
    response += `• \`get_conversation_context\` - Get detailed conversation analysis\n`;
    response += `• \`accountability_checkin\` - Reflect on your progress\n`;

    if (stats && stats.currentStreak > 0) {
      response += `• Keep your ${stats.currentStreak}-day streak going! 🔥\n`;
    }

    return response;
  },

  // Group entries by type for organized display
  groupEntriesByType(entries: MemoryEntry[]): Record<string, MemoryEntry[]> {
    return entries.reduce((groups, entry) => {
      const type = entry.type || 'conversation';
      if (!groups[type]) groups[type] = [];
      groups[type].push(entry);
      return groups;
    }, {} as Record<string, MemoryEntry[]>);
  },

  // Get emoji for entry type
  getTypeEmoji(type: string): string {
    const emojiMap: Record<string, string> = {
      gain: '🎆',
      goal: '🎯',
      advice: '💡',
      quote: '✨',
      checkin: '📋',
      conversation: '💬'
    };
    return emojiMap[type] || '📝';
  }
};

// Export for use in main MCP server
export default getUserMemoryTool;