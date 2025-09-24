// Store User State Tool - Persist user conversation context and progress
// Part of Phase 1 core tools implementation

import { z } from 'zod';
import { TiffanyUserState, ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Zod schema for input validation
const StoreUserStateSchema = z.object({
  userState: z.object({
    id: z.string(),
    lastInteraction: z.string().optional(),
    gainsCount: z.number().optional(),
    currentStreak: z.number().optional(),
    memoryContext: z.array(z.string()).optional(),
    totalPoints: z.number().optional(),
    goals: z.array(z.any()).optional(),
    preferences: z.object({
      quoteStyle: z.enum(['inspirational', 'practical', 'philosophical']).optional(),
      reminderTime: z.string().optional(),
      timezone: z.string().optional(),
      telegramChatId: z.string().optional(),
      voiceEnabled: z.boolean().optional(),
      language: z.string().optional()
    }).optional()
  }),
  syncToDatabase: z.boolean().optional().default(true)
});

export const storeUserStateTool = {
  name: 'store_user_state',
  description: 'Persist user conversation context and progress tracking state',
  schema: StoreUserStateSchema,

  async execute(args: z.infer<typeof StoreUserStateSchema>): Promise<ToolResponse> {
    try {
      const { userState, syncToDatabase } = args;

      // Enhance user state with defaults and timestamp
      const enhancedUserState: TiffanyUserState = {
        id: userState.id,
        lastInteraction: userState.lastInteraction || new Date().toISOString(),
        gainsCount: userState.gainsCount || 0,
        currentStreak: userState.currentStreak || 0,
        memoryContext: userState.memoryContext || [],
        totalPoints: userState.totalPoints || 0,
        goals: userState.goals || [],
        preferences: {
          quoteStyle: 'inspirational',
          reminderTime: '09:00',
          timezone: 'UTC',
          voiceEnabled: false,
          language: 'en',
          ...userState.preferences
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let databaseRecord = null;
      let syncStatus = 'skipped';

      // Sync to database if enabled
      if (syncToDatabase) {
        try {
          const airtableService = new AirtableService();
          databaseRecord = await airtableService.storeUserState(enhancedUserState);
          syncStatus = 'success';
        } catch (databaseError) {
          console.error('Database sync failed:', databaseError);
          syncStatus = 'failed';
          // Continue execution even if database sync fails
        }
      }

      // Format success response
      const formattedMessage = this.formatStateMessage(enhancedUserState, syncStatus);

      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          userId: enhancedUserState.id,
          databaseId: databaseRecord?.id,
          syncStatus,
          gainsCount: enhancedUserState.gainsCount,
          currentStreak: enhancedUserState.currentStreak,
          totalPoints: enhancedUserState.totalPoints,
          lastInteraction: enhancedUserState.lastInteraction
        }
      };

    } catch (error) {
      console.error('Store user state error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Error storing user state**: ${error.message}\n\nUser context may not be preserved. Please try again.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Format user state confirmation message
  formatStateMessage(userState: TiffanyUserState, syncStatus: string): string {
    const syncStatusText = syncStatus === 'success' ? '✅ Synced to database' :
                          syncStatus === 'failed' ? '⚠️ Database sync failed (stored locally)' :
                          '💾 Stored locally';

    const streakText = userState.currentStreak > 0 ?
      `🔥 **Current streak**: ${userState.currentStreak} days` : '';

    const goalsText = userState.goals.length > 0 ?
      `🎯 **Active goals**: ${userState.goals.length}` : '';

    const preferencesText = `🔧 **Preferences**:
• Quote style: ${userState.preferences.quoteStyle}
• Voice enabled: ${userState.preferences.voiceEnabled ? 'Yes' : 'No'}
• Language: ${userState.preferences.language}
• Timezone: ${userState.preferences.timezone}`;

    return `💾 **User State Stored Successfully!**

**User**: ${userState.id}
**Last interaction**: ${new Date(userState.lastInteraction).toLocaleString()}

**Progress Summary**:
🎆 **Total gains**: ${userState.gainsCount}
⭐ **Total points**: ${userState.totalPoints}
${streakText}
${goalsText}

${preferencesText}

**Memory Context**: ${userState.memoryContext.length} entries stored

**Status**: ${syncStatusText}

${userState.currentStreak >= 7 ? '🎉 **Amazing!** You\'re on a fantastic streak!' :
  userState.gainsCount >= 10 ? '💪 **Great progress!** You\'re building excellent momentum!' :
  '🌟 **Getting started!** Every interaction helps build your accountability journey!'}

Use \`get_user_memory\` to review your progress or \`track_gain\` to add another win!`;
  },

  // Helper method to update specific user state fields
  async updateUserStateField(
    userId: string,
    field: keyof TiffanyUserState,
    value: any
  ): Promise<ToolResponse> {
    try {
      const airtableService = new AirtableService();
      const currentState = await airtableService.getUserState(userId);

      if (!currentState) {
        // Create new user state if it doesn't exist
        const newState: TiffanyUserState = {
          id: userId,
          lastInteraction: new Date().toISOString(),
          gainsCount: 0,
          currentStreak: 0,
          memoryContext: [],
          totalPoints: 0,
          goals: [],
          preferences: {
            quoteStyle: 'inspirational',
            reminderTime: '09:00',
            timezone: 'UTC',
            voiceEnabled: false,
            language: 'en'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          [field]: value
        };

        return await this.execute({
          userState: newState,
          syncToDatabase: true
        });
      }

      // Update existing state
      const updatedState = {
        ...currentState,
        [field]: value,
        updatedAt: new Date().toISOString()
      };

      return await this.execute({
        userState: updatedState,
        syncToDatabase: true
      });

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error updating user state field**: ${error.message}`
        }],
        isError: true
      };
    }
  },

  // Helper method to increment numeric fields
  async incrementUserStateField(
    userId: string,
    field: 'gainsCount' | 'currentStreak' | 'totalPoints',
    increment: number = 1
  ): Promise<ToolResponse> {
    try {
      const airtableService = new AirtableService();
      const currentState = await airtableService.getUserState(userId);

      const currentValue = currentState ? currentState[field] || 0 : 0;
      const newValue = currentValue + increment;

      return await this.updateUserStateField(userId, field, newValue);

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error incrementing user state field**: ${error.message}`
        }],
        isError: true
      };
    }
  },

  // Helper method to add to memory context
  async addToMemoryContext(userId: string, entry: string): Promise<ToolResponse> {
    try {
      const airtableService = new AirtableService();
      const currentState = await airtableService.getUserState(userId);

      const currentMemory = currentState ? currentState.memoryContext || [] : [];
      const maxMemorySize = 20; // Configurable limit

      // Add new entry and maintain size limit
      const updatedMemory = [...currentMemory, `${new Date().toISOString()}: ${entry}`];
      if (updatedMemory.length > maxMemorySize) {
        updatedMemory.splice(0, updatedMemory.length - maxMemorySize);
      }

      return await this.updateUserStateField(userId, 'memoryContext', updatedMemory);

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error adding to memory context**: ${error.message}`
        }],
        isError: true
      };
    }
  }
};

// Export for use in main MCP server
export default storeUserStateTool;