// Get Random Quote Tool - Retrieve quotes from database with filtering
// Part of Phase 1 core tools implementation

import { z } from 'zod';
import { Quote, ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Zod schema for input validation
const GetRandomQuoteSchema = z.object({
  category: z.string().optional(),
  style: z.enum(['inspirational', 'practical', 'philosophical']).optional(),
  exclude: z.array(z.string()).optional(),
  userId: z.string().optional().default('default'),
  markAsUsed: z.boolean().optional().default(false)
});

export const getRandomQuoteTool = {
  name: 'get_random_quote',
  description: 'Retrieve a random quote from the database with filtering and usage tracking',
  schema: GetRandomQuoteSchema,

  async execute(args: z.infer<typeof GetRandomQuoteSchema>): Promise<ToolResponse> {
    try {
      const { category, style, exclude, userId, markAsUsed } = args;

      const airtableService = new AirtableService();

      // Use intelligent time-based prioritization to avoid recent repeats
      const quotes = await airtableService.getQuotesWithTimePrioritization({
        category,
        style,
        excludeIds: exclude,
        limit: 50 // Get prioritized pool
      });

      if (quotes.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `❌ **No quotes found**\n\nNo quotes match your criteria${category ? ` for category: ${category}` : ''}${style ? ` with style: ${style}` : ''}.\n\nConsider adding quotes with \`add_quote_to_database\` first.`
          }],
          isError: true,
          metadata: {
            error: 'No quotes found',
            filters: { category, style, exclude },
            userId
          }
        };
      }

      // Intelligent weighted selection - heavily favor high priority quotes
      const selectedQuote = this.selectQuoteWithWeighting(quotes);

      // Mark as used if requested
      if (markAsUsed) {
        try {
          await airtableService.updateQuoteUsage(selectedQuote.id, userId);
        } catch (usageError) {
          console.error('Failed to mark quote as used:', usageError);
          // Continue execution even if usage tracking fails
        }
      }

      // Format the quote response
      const formattedMessage = this.formatQuoteMessage(selectedQuote, markAsUsed);

      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          quoteId: selectedQuote.id,
          category: selectedQuote.category,
          style: selectedQuote.style,
          author: selectedQuote.author,
          markedAsUsed: markAsUsed,
          availableQuotes: quotes.length,
          userId
        }
      };

    } catch (error) {
      console.error('Get random quote error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Error retrieving quote**: ${error.message}\n\nThis could be due to database connectivity issues. Please try again.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Format quote display message
  formatQuoteMessage(quote: Quote, markedAsUsed: boolean): string {
    const categoryEmoji = this.getCategoryEmoji(quote.category);
    const styleIcon = this.getStyleIcon(quote.style);

    const usageText = markedAsUsed ?
      '\n\n📝 **Quote marked as used**' :
      '';

    const tagsText = quote.tags && quote.tags.length > 0 ?
      `\n**Tags**: ${quote.tags.map(tag => `#${tag}`).join(' ')}` : '';

    return `${categoryEmoji} **Daily Quote**

> "${quote.text}"

${quote.author ? `**— ${quote.author}**` : '**— Anonymous**'}

${styleIcon} **Style**: ${quote.style.charAt(0).toUpperCase() + quote.style.slice(1)}
📚 **Category**: ${quote.category}${tagsText}${usageText}

💡 **Reflection Prompt**: How can you apply this wisdom to your current challenges today?

Use \`track_gain\` to log how this quote inspired action or \`get_mentor_advice\` for guidance on implementation!`;
  },

  // Get emoji for quote category
  getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      motivation: '🔥',
      wisdom: '🧠',
      success: '🎯',
      growth: '🌱',
      leadership: '👑',
      perseverance: '💪',
      creativity: '💡',
      mindfulness: '🧘',
      relationships: '❤️',
      general: '✨'
    };
    return emojiMap[category] || '💭';
  },

  // Get icon for quote style
  getStyleIcon(style: string): string {
    const iconMap: Record<string, string> = {
      inspirational: '🌟',
      practical: '⚙️',
      philosophical: '🤔'
    };
    return iconMap[style] || '💬';
  },

  // Helper method to get quote by specific criteria
  async getQuoteByType(
    type: 'morning' | 'evening' | 'weekly' | 'motivational',
    userId: string = 'default'
  ): Promise<ToolResponse> {
    const categoryMap = {
      morning: 'motivation',
      evening: 'mindfulness',
      weekly: 'growth',
      motivational: 'success'
    };

    const styleMap = {
      morning: 'inspirational',
      evening: 'philosophical',
      weekly: 'practical',
      motivational: 'inspirational'
    };

    return await this.execute({
      category: categoryMap[type],
      style: styleMap[type] as 'inspirational' | 'practical' | 'philosophical',
      userId,
      markAsUsed: true
    });
  },

  // Intelligent weighted selection algorithm
  // Heavily favors quotes that haven't been used recently
  selectQuoteWithWeighting(quotes: any[]): any {
    if (quotes.length === 0) {
      return null;
    }

    if (quotes.length === 1) {
      return quotes[0];
    }

    // The quotes are already sorted by priority (highest first)
    // Use exponential weighting to heavily favor high-priority quotes

    const weights = quotes.map((quote, index) => {
      // Top quotes get exponentially higher weights
      // First quote (highest priority) gets weight of 100
      // Second quote gets weight of 50
      // Third quote gets weight of 25, etc.
      const position = index + 1;
      return Math.max(1, Math.floor(100 / position));
    });

    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    // Select random number between 0 and totalWeight
    let random = Math.floor(Math.random() * totalWeight);

    // Find which quote this random number corresponds to
    for (let i = 0; i < quotes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return quotes[i];
      }
    }

    // Fallback (should never reach here)
    return quotes[0];
  },

  // Helper method to get unused quotes count
  async getUnusedQuotesCount(
    category?: string,
    style?: 'inspirational' | 'practical' | 'philosophical'
  ): Promise<number> {
    try {
      const airtableService = new AirtableService();
      const quotes = await airtableService.getQuotes({
        category,
        style,
        onlyUnused: true,
        limit: 1000 // Get all to count
      });
      return quotes.length;
    } catch (error) {
      console.error('Error counting unused quotes:', error);
      return 0;
    }
  },

  // Helper method to show quote prioritization info (for debugging)
  async getQuotePrioritizationInfo(
    category?: string
  ): Promise<{
    totalQuotes: number;
    neverUsed: number;
    oldestUsed: string;
    newestUsed: string;
    priorityDistribution: { range: string; count: number }[];
  }> {
    try {
      const airtableService = new AirtableService();
      const quotes = await airtableService.getQuotesWithTimePrioritization({
        category,
        limit: 1000 // Get all for analysis
      });

      const neverUsed = quotes.filter((q: any) => !q.lastUsed).length;
      const usedQuotes = quotes.filter((q: any) => q.lastUsed);

      const oldestUsed = usedQuotes.length > 0
        ? usedQuotes[usedQuotes.length - 1]?.lastUsed || 'None'
        : 'None';

      const newestUsed = usedQuotes.length > 0
        ? usedQuotes.reduce((newest, quote) =>
            !newest.lastUsed || (quote.lastUsed && quote.lastUsed > newest.lastUsed)
              ? quote : newest, usedQuotes[0]).lastUsed || 'None'
        : 'None';

      // Analyze priority distribution
      const priorityRanges = [
        { range: 'Never used (1000)', min: 1000, max: Infinity },
        { range: 'Very old (100+)', min: 100, max: 999 },
        { range: 'Old (50-99)', min: 50, max: 99 },
        { range: 'Medium (10-49)', min: 10, max: 49 },
        { range: 'Recent (1-9)', min: 1, max: 9 }
      ];

      const priorityDistribution = priorityRanges.map(range => ({
        range: range.range,
        count: quotes.filter((q: any) =>
          q.priority >= range.min && q.priority <= range.max
        ).length
      }));

      return {
        totalQuotes: quotes.length,
        neverUsed,
        oldestUsed,
        newestUsed,
        priorityDistribution
      };

    } catch (error) {
      console.error('Error getting prioritization info:', error);
      return {
        totalQuotes: 0,
        neverUsed: 0,
        oldestUsed: 'Error',
        newestUsed: 'Error',
        priorityDistribution: []
      };
    }
  }
};

// Export for use in main MCP server
export default getRandomQuoteTool;