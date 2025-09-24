// Update Quote Record Tool - Track quote usage and modify quote data
// Part of Phase 1 core tools implementation

import { z } from 'zod';
import { ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Zod schema for input validation
const UpdateQuoteRecordSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
  action: z.enum(['mark_used', 'mark_unused', 'increment_usage', 'update_rating', 'add_tags', 'remove_tags']),
  userId: z.string().optional().default('default'),
  value: z.union([
    z.number(), // For rating updates or usage increments
    z.array(z.string()), // For tag updates
    z.string() // For single values
  ]).optional(),
  notes: z.string().optional()
});

export const updateQuoteRecordTool = {
  name: 'update_quote_record',
  description: 'Track quote usage, update ratings, and modify quote metadata',
  schema: UpdateQuoteRecordSchema,

  async execute(args: z.infer<typeof UpdateQuoteRecordSchema>): Promise<ToolResponse> {
    try {
      const { quoteId, action, userId, value, notes } = args;

      const airtableService = new AirtableService();

      // Get current quote record
      const quote = await airtableService.getQuoteById(quoteId);

      if (!quote) {
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

      let updateData: any = {};
      let actionDescription = '';

      // Process different actions
      switch (action) {
        case 'mark_used':
          updateData = await this.markAsUsed(quote, userId);
          actionDescription = 'marked as used';
          break;

        case 'mark_unused':
          updateData = await this.markAsUnused(quote, userId);
          actionDescription = 'marked as unused';
          break;

        case 'increment_usage':
          updateData = await this.incrementUsage(quote, value as number || 1);
          actionDescription = `usage incremented by ${value || 1}`;
          break;

        case 'update_rating':
          if (typeof value !== 'number' || value < 1 || value > 5) {
            throw new Error('Rating must be a number between 1 and 5');
          }
          updateData = await this.updateRating(quote, value, userId);
          actionDescription = `rating updated to ${value}/5`;
          break;

        case 'add_tags':
          if (!Array.isArray(value)) {
            throw new Error('Tags must be provided as an array');
          }
          updateData = await this.addTags(quote, value);
          actionDescription = `tags added: ${value.join(', ')}`;
          break;

        case 'remove_tags':
          if (!Array.isArray(value)) {
            throw new Error('Tags must be provided as an array');
          }
          updateData = await this.removeTags(quote, value);
          actionDescription = `tags removed: ${value.join(', ')}`;
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Add notes if provided
      if (notes) {
        updateData.lastModificationNote = notes;
      }

      // Update the quote record
      const updatedQuote = await airtableService.updateQuote(quoteId, updateData);

      // Format success response
      const formattedMessage = this.formatUpdateMessage(
        updatedQuote,
        actionDescription,
        notes
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
          previousState: {
            usageCount: quote.usageCount,
            rating: quote.rating,
            tags: quote.tags
          },
          newState: {
            usageCount: updatedQuote.usageCount,
            rating: updatedQuote.rating,
            tags: updatedQuote.tags
          }
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

  // Mark quote as used by specific user
  async markAsUsed(quote: any, userId: string): Promise<any> {
    const usedBy = quote.usedBy || [];
    const usageHistory = quote.usageHistory || [];

    const newUsageEntry = {
      userId,
      timestamp: new Date().toISOString(),
      type: 'manual_mark'
    };

    return {
      usedBy: [...new Set([...usedBy, userId])], // Avoid duplicates
      usageHistory: [...usageHistory, newUsageEntry],
      usageCount: (quote.usageCount || 0) + 1,
      lastUsed: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // Mark quote as unused by removing user usage
  async markAsUnused(quote: any, userId: string): Promise<any> {
    const usedBy = (quote.usedBy || []).filter((id: string) => id !== userId);
    const usageHistory = quote.usageHistory || [];

    const newUsageEntry = {
      userId,
      timestamp: new Date().toISOString(),
      type: 'manual_unmark'
    };

    return {
      usedBy,
      usageHistory: [...usageHistory, newUsageEntry],
      usageCount: Math.max(0, (quote.usageCount || 0) - 1),
      updatedAt: new Date().toISOString()
    };
  },

  // Increment usage count
  async incrementUsage(quote: any, increment: number): Promise<any> {
    return {
      usageCount: (quote.usageCount || 0) + increment,
      updatedAt: new Date().toISOString()
    };
  },

  // Update user rating
  async updateRating(quote: any, rating: number, userId: string): Promise<any> {
    const ratings = quote.ratings || {};
    ratings[userId] = {
      rating,
      timestamp: new Date().toISOString()
    };

    // Calculate average rating
    const allRatings = Object.values(ratings).map((r: any) => r.rating);
    const averageRating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

    return {
      ratings,
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingCount: allRatings.length,
      updatedAt: new Date().toISOString()
    };
  },

  // Add tags to quote
  async addTags(quote: any, newTags: string[]): Promise<any> {
    const currentTags = quote.tags || [];
    const updatedTags = [...new Set([...currentTags, ...newTags])]; // Remove duplicates

    return {
      tags: updatedTags,
      updatedAt: new Date().toISOString()
    };
  },

  // Remove tags from quote
  async removeTags(quote: any, tagsToRemove: string[]): Promise<any> {
    const currentTags = quote.tags || [];
    const updatedTags = currentTags.filter((tag: string) => !tagsToRemove.includes(tag));

    return {
      tags: updatedTags,
      updatedAt: new Date().toISOString()
    };
  },

  // Format update confirmation message
  formatUpdateMessage(quote: any, actionDescription: string, notes?: string): string {
    const previewText = quote.text.length > 100 ?
      quote.text.substring(0, 100) + '...' :
      quote.text;

    const notesText = notes ? `\n**Notes**: ${notes}` : '';

    const statsText = `
**Usage Statistics**:
• Usage count: ${quote.usageCount || 0}
• Average rating: ${quote.rating ? `${quote.rating}/5` : 'Not rated'}
• Total ratings: ${quote.ratingCount || 0}`;

    const tagsText = quote.tags && quote.tags.length > 0 ?
      `\n**Tags**: ${quote.tags.map((tag: string) => `#${tag}`).join(' ')}` : '';

    return `✅ **Quote Record Updated**

**Quote**: "${previewText}"
**Author**: ${quote.author || 'Anonymous'}

**Action**: ${actionDescription.charAt(0).toUpperCase() + actionDescription.slice(1)}
**Timestamp**: ${new Date().toLocaleString()}${notesText}
${statsText}${tagsText}

**Quote ID**: \`${quote.id}\`

Use \`get_random_quote\` to retrieve quotes or \`add_quote_to_database\` to add new ones!`;
  },

  // Helper method for bulk updates
  async bulkUpdateQuotes(
    quoteIds: string[],
    action: string,
    value?: any,
    userId: string = 'default'
  ): Promise<ToolResponse[]> {
    const results: ToolResponse[] = [];

    for (const quoteId of quoteIds) {
      try {
        const result = await this.execute({
          quoteId,
          action: action as any,
          value,
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