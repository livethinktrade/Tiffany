// Update Quote Record Tool - Track quote usage and modify quote data
// Part of Phase 1 core tools implementation
// SIMPLIFIED to work with actual Airtable schema: Quote, Author, Lesson Category, Used_Date

import { z } from 'zod';
import { ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Zod schema for input validation
const UpdateQuoteRecordSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
  action: z.enum(['mark_used', 'mark_unused', 'get_info']),
  userId: z.string().optional().default('default')
});

export const updateQuoteRecordTool = {
  name: 'update_quote_record',
  description: 'Mark quotes as used/unused and retrieve quote information',
  schema: UpdateQuoteRecordSchema,

  async execute(args: z.infer<typeof UpdateQuoteRecordSchema>): Promise<ToolResponse> {
    try {
      const { quoteId, action, userId } = args;

      const airtableService = new AirtableService();

      // Get current quote record using existing makeRequest method
      const quote = await airtableService.makeRequest(
        'GET',
        `Inspirational_Quotes/${quoteId}`
      );

      if (!quote || !quote.fields) {
        return {
          content: [{
            type: 'text',
            text: `❌ **Quote not found**: ID \`${quoteId}\`\n\nThe quote may have been deleted or the ID is incorrect.`
          }],
          isError: true,
          metadata: {
            error: 'Quote not found',
            quoteId,
            userId
          }
        };
      }

      let actionDescription = '';
      let updatedQuote = quote;

      // Process different actions based on actual Airtable schema
      switch (action) {
        case 'mark_used':
          // Use existing updateQuoteUsage method
          await airtableService.updateQuoteUsage(quoteId, userId);
          actionDescription = 'marked as used';
          // Get updated quote to show new Used_Date
          updatedQuote = await airtableService.makeRequest(
            'GET',
            `Inspirational_Quotes/${quoteId}`
          );
          break;

        case 'mark_unused':
          // Clear the Used_Date field
          await airtableService.makeRequest(
            'PATCH',
            `Inspirational_Quotes/${quoteId}`,
            {
              fields: {
                'Used_Date': null
              }
            }
          );
          actionDescription = 'marked as unused (Used_Date cleared)';
          updatedQuote = await airtableService.makeRequest(
            'GET',
            `Inspirational_Quotes/${quoteId}`
          );
          break;

        case 'get_info':
          actionDescription = 'information retrieved';
          // updatedQuote is already set to current quote
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Format success response based on actual Airtable fields
      const formattedMessage = this.formatUpdateMessage(
        updatedQuote.fields,
        updatedQuote.id,
        actionDescription
      );

      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          quoteId,
          action,
          actionDescription,
          userId,
          previousUsedDate: quote.fields['Used_Date'] || null,
          newUsedDate: updatedQuote.fields['Used_Date'] || null,
          quote: updatedQuote.fields['Quote'],
          author: updatedQuote.fields['Author'],
          category: updatedQuote.fields['Lesson Category']
        }
      };

    } catch (error) {
      console.error('Update quote record error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Error updating quote**: ${error.message}\n\nPlease verify the quote ID and try again.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          quoteId: args.quoteId,
          action: args.action,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Format update confirmation message based on actual Airtable schema
  formatUpdateMessage(quoteFields: any, quoteId: string, actionDescription: string): string {
    const previewText = quoteFields.Quote && quoteFields.Quote.length > 100 ?
      quoteFields.Quote.substring(0, 100) + '...' :
      quoteFields.Quote;

    const usedDateText = quoteFields['Used_Date'] ?
      `\n**Used Date**: ${new Date(quoteFields['Used_Date']).toLocaleString('en-US', { timeZone: 'America/Chicago' })} (Central Time)` :
      '\n**Used Date**: Never used';

    const categoryEmoji = this.getCategoryEmoji(quoteFields['Lesson Category']);

    return `✅ **Quote Record Updated**

${categoryEmoji} **Quote**: "${previewText}"
**Author**: ${quoteFields.Author || 'Anonymous'}
**Category**: ${quoteFields['Lesson Category'] || 'Uncategorized'}

**Action**: ${actionDescription.charAt(0).toUpperCase() + actionDescription.slice(1)}
**Timestamp**: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (Central Time)${usedDateText}

**Quote ID**: \`${quoteId}\`

💡 Use \`get_random_quote\` to retrieve quotes or \`add_quote_to_database\` to add new ones!`;
  },

  // Get emoji for quote category (same as get_random_quote tool)
  getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'Focus': '🎯',
      'Risk-Taking': '🎲',
      'Patience': '⏳',
      'Self-Awareness': '🪞',
      'Persistence': '💪',
      'Courage': '🦁',
      'Integrity': '⚖️',
      'Self-Direction': '🧭'
    };
    return emojiMap[category] || '💭';
  },

  // Helper method for bulk updates (simplified for actual schema)
  async bulkUpdateQuotes(
    quoteIds: string[],
    action: 'mark_used' | 'mark_unused' | 'get_info',
    userId: string = 'default'
  ): Promise<ToolResponse[]> {
    const results: ToolResponse[] = [];

    for (const quoteId of quoteIds) {
      try {
        const result = await this.execute({
          quoteId,
          action,
          userId
        });
        results.push(result);
      } catch (error) {
        results.push({
          content: [{
            type: 'text',
            text: `❌ Failed to update quote ${quoteId}: ${error.message}`
          }],
          isError: true,
          metadata: { quoteId, error: error.message }
        });
      }
    }

    return results;
  }
};

// Export for use in main MCP server
export default updateQuoteRecordTool;