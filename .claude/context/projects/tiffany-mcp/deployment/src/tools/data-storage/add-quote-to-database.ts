// Add Quote to Database Tool - Store new quotes with categorization
// Part of Phase 1 core tools implementation
// SIMPLIFIED to work with actual Airtable schema: Quote, Author, Lesson Category, Used_Date

import { z } from 'zod';
import { Quote, ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Valid categories from actual database
const VALID_CATEGORIES = [
  'Courage', 'Determination', 'Focus', 'Growth', 'Identity', 'Mindset', 'Patience',
  'Persistence', 'Priorities', 'Process', 'Purpose', 'Resilience', 'Risk-Taking',
  'Self-Awareness', 'Self-Direction', 'Self-Reliance', 'Systems'
] as const;

// Zod schema for input validation - simplified for actual schema
const AddQuoteToDatabaseSchema = z.object({
  text: z.string().min(10, 'Quote text must be at least 10 characters').max(500, 'Quote text too long'),
  author: z.string().optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
  addedBy: z.string().optional().default('default')
});

export const addQuoteToDatabaseTool = {
  name: 'add_quote_to_database',
  description: 'Store new quotes in database with proper categorization',
  schema: AddQuoteToDatabaseSchema,

  async execute(args: z.infer<typeof AddQuoteToDatabaseSchema>): Promise<ToolResponse> {
    try {
      const { text, author, category, addedBy } = args;

      const airtableService = new AirtableService();

      // Simple duplicate check by searching for exact text match
      // Get recent quotes to check for duplicates
      const recentQuotes = await airtableService.makeRequest(
        'GET',
        'Inspirational_Quotes?maxRecords=100&sort[0][field]=Quote'
      );

      const isDuplicate = recentQuotes.records.some((record: any) => {
        const existingText = record.fields.Quote;
        return existingText && existingText.toLowerCase().trim() === text.toLowerCase().trim();
      });

      if (isDuplicate) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ **Duplicate Quote Detected**\n\nThis quote already exists in the database.\n\n**Quote**: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"\n\nUse \`get_random_quote\` to retrieve existing quotes or modify the text if this is genuinely different.`
          }],
          isError: true,
          metadata: {
            error: 'Duplicate quote',
            text: text.substring(0, 100),
            duplicateFound: true
          }
        };
      }

      // Create simplified quote object matching actual schema
      const newQuote = {
        text: text.trim(),
        author: author?.trim() || 'Anonymous',
        category: category || this.suggestCategory(text) || 'Growth'
      };

      // Store in Airtable using the fixed storeQuote method
      const airtableRecord = await airtableService.addQuote(newQuote as Quote);

      const storedQuote = {
        ...newQuote,
        id: airtableRecord.id,
        airtableId: airtableRecord.id
      };

      // Format success response
      const formattedMessage = this.formatQuoteAddedMessage(storedQuote);

      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          quoteId: storedQuote.id,
          airtableId: storedQuote.airtableId,
          category: storedQuote.category,
          author: storedQuote.author,
          addedBy
        }
      };

    } catch (error) {
      console.error('Add quote to database error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Error adding quote**: ${error.message}\n\nPlease check your input and try again. Ensure the quote text is meaningful and not empty.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Suggest category based on quote content - updated for actual categories
  suggestCategory(text: string): string {
    const lowercaseText = text.toLowerCase();

    // Category keywords mapping based on actual database categories
    const categoryKeywords = {
      Focus: ['focus', 'concentrate', 'attention', 'clarity', 'priorities'],
      Growth: ['grow', 'develop', 'improve', 'change', 'evolve', 'progress', 'learn'],
      Persistence: ['persist', 'persevere', 'continue', 'endure', 'keep going'],
      Courage: ['courage', 'brave', 'fear', 'bold', 'risk'],
      'Self-Awareness': ['know yourself', 'self', 'aware', 'reflect', 'conscious'],
      Purpose: ['purpose', 'meaning', 'why', 'mission', 'calling'],
      Resilience: ['resilient', 'bounce back', 'recover', 'overcome', 'tough'],
      Mindset: ['mindset', 'attitude', 'thinking', 'believe', 'mental'],
      'Risk-Taking': ['risk', 'chance', 'opportunity', 'venture', 'bold'],
      Process: ['process', 'system', 'method', 'approach', 'way']
    };

    // Score each category
    let bestCategory = 'Growth'; // Default fallback
    let highestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.reduce((count, keyword) => {
        return count + (lowercaseText.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  },

  // Format quote addition confirmation message - simplified for actual schema
  formatQuoteAddedMessage(quote: any): string {
    const categoryEmoji = this.getCategoryEmoji(quote.category);
    const authorText = quote.author && quote.author !== 'Anonymous' ?
      `**Author**: ${quote.author}` : '**Author**: Anonymous';

    return `${categoryEmoji} **Quote Added Successfully!**

> "${quote.text}"

${authorText}

**Details**:
📚 **Category**: ${quote.category}
🕐 **Added**: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (Central Time)

**Quote ID**: \`${quote.id}\`

💡 **Next Steps**:
• Use \`get_random_quote category="${quote.category}"\` to retrieve similar quotes
• Use \`update_quote_record\` to mark quotes as used or get more info
• The quote will appear in intelligent rotation after being added!

✅ Quote ready for use in the accountability system!`;
  },

  // Get emoji for quote category - updated for actual categories
  getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'Focus': '🎯',
      'Risk-Taking': '🎲',
      'Patience': '⏳',
      'Self-Awareness': '🪞',
      'Persistence': '💪',
      'Courage': '🦁',
      'Self-Direction': '🧭',
      'Growth': '🌱',
      'Purpose': '🎯',
      'Resilience': '🛡️',
      'Mindset': '🧠',
      'Process': '⚙️',
      'Systems': '🔗',
      'Determination': '🔥',
      'Identity': '👤',
      'Priorities': '📋',
      'Self-Reliance': '🗿'
    };
    return emojiMap[category] || '💭';
  },

  // Helper method for bulk quote addition - simplified
  async addMultipleQuotes(quotes: Array<{
    text: string;
    author?: string;
    category?: string;
  }>, addedBy: string = 'default'): Promise<ToolResponse[]> {
    const results: ToolResponse[] = [];

    for (const quote of quotes) {
      try {
        const result = await this.execute({
          ...quote,
          addedBy
        });
        results.push(result);
      } catch (error) {
        results.push({
          content: [{
            type: 'text',
            text: `❌ Failed to add quote: "${quote.text.substring(0, 50)}..." - ${error.message}`
          }],
          isError: true,
          metadata: { quote: quote.text.substring(0, 100), error: error.message }
        });
      }
    }

    return results;
  },

  // Helper method to validate quote format - simplified
  validateQuoteFormat(text: string): { isValid: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    let isValid = true;

    // Check length (enforced by schema)
    if (text.length < 10) {
      isValid = false;
      suggestions.push('Quote should be at least 10 characters long');
    }

    if (text.length > 500) {
      isValid = false;
      suggestions.push('Quote should be under 500 characters for optimal display');
    }

    // Check for meaningful content
    if (text.split(' ').length < 3) {
      isValid = false;
      suggestions.push('Quote should contain at least 3 words');
    }

    // Check for excessive formatting
    if (text.includes('\n')) {
      suggestions.push('Consider removing line breaks for consistency');
    }

    return { isValid, suggestions };
  }
};

// Export for use in main MCP server
export default addQuoteToDatabaseTool;