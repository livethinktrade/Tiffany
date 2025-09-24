// Store Gains Tool - Enhanced data persistence with Airtable integration
// Part of Phase 1 core tools implementation

import { z } from 'zod';
import { Gain, ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Zod schema for input validation - FIXED to match actual usage
const StoreGainsSchema = z.object({
  gain: z.string().min(1, 'Gain description is required'),
  category: z.string().optional().default('general'),
  impact: z.enum(['small', 'medium', 'large']).optional().default('medium'),
  userId: z.string().optional().default('default'),
  moodContext: z.string().optional().default('Good'),
  tags: z.array(z.string()).optional(),
  reflection: z.string().optional()
});

export const storeGainsTool = {
  name: 'store_gains',
  description: 'Save gains to Airtable with categorization and user tracking, preserving n8n workflow data schema',
  schema: StoreGainsSchema,

  async execute(args: z.infer<typeof StoreGainsSchema>): Promise<ToolResponse> {
    try {
      const { gain, category, impact, userId, moodContext, tags, reflection } = args;

      // Generate unique ID and timestamp
      const enhancedGain: Gain = {
        id: `gain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: gain, // Now taking gain as string directly
        category,
        impact,
        userId,
        timestamp: new Date().toISOString(),
        points: impact === 'large' ? 5 : impact === 'medium' ? 3 : 1,
        tags,
        reflection
      };

      let airtableRecord = null;
      let syncStatus = 'skipped';

      // ALWAYS sync to Airtable - that's the whole point!
      try {
        const airtableService = new AirtableService();
        airtableRecord = await airtableService.storeGain(enhancedGain);
        enhancedGain.airtableId = airtableRecord.id;
        syncStatus = 'success';
      } catch (airtableError) {
        console.error('Airtable sync failed:', airtableError);
        syncStatus = 'failed';
        // Return error instead of continuing - we NEED Airtable storage!
        return {
          content: [{
            type: 'text',
            text: `❌ **Failed to store gain to Airtable**: ${airtableError.message}\n\nThis is a critical error - gains must be stored in the database.`
          }],
          isError: true,
          metadata: {
            error: airtableError.message,
            timestamp: new Date().toISOString(),
            gain: enhancedGain.description
          }
        };
      }

      // Format success response
      const formattedMessage = this.formatGainMessage(enhancedGain, syncStatus, moodContext);

      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          gainId: enhancedGain.id,
          airtableId: enhancedGain.airtableId,
          syncStatus,
          points: enhancedGain.points,
          category: enhancedGain.category,
          impact: enhancedGain.impact
        }
      };

    } catch (error) {
      console.error('Store gains error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Error storing gain**: ${error.message}\n\nPlease try again or contact support if the issue persists.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Format gain confirmation message
  formatGainMessage(gain: Gain, syncStatus: string, moodContext?: string): string {
    const impactEmoji = gain.impact === 'large' ? '🚀' :
                       gain.impact === 'medium' ? '💪' : '✨';

    const syncStatusText = syncStatus === 'success' ? '✅ Synced to database' :
                          syncStatus === 'failed' ? '⚠️ Database sync failed (stored locally)' :
                          '💾 Stored locally';

    const tagsText = gain.tags && gain.tags.length > 0 ?
      `\n**Tags**: ${gain.tags.map(tag => `#${tag}`).join(' ')}` : '';

    const reflectionText = gain.reflection ?
      `\n**Reflection**: ${gain.reflection}` : '';

    return `${impactEmoji} **Gain Stored Successfully!**

**Description**: ${gain.description}

**Details**:
• Category: ${gain.category}
• Impact: ${gain.impact}
• Points earned: ${gain.points}
• Timestamp: ${new Date(gain.timestamp).toLocaleString()}${tagsText}${reflectionText}

**Status**: ${syncStatusText}
**ID**: \`${gain.id}\`

${gain.impact === 'large' ? '🎆 **MAJOR WIN!** This is a significant accomplishment!' :
  gain.impact === 'medium' ? '🎯 **Great progress!** Keep building momentum!' :
  '🌟 **Every step counts!** Small wins lead to big victories!'}

Use \`get_user_memory\` to see your recent gains or \`track_gain\` to log another win!`;
  }
};

// Export for use in main MCP server
export default storeGainsTool;