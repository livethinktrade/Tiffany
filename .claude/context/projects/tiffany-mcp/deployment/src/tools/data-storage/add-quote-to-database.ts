// Add Quote to Database Tool - Store new quotes with categorization
// Part of Phase 1 core tools implementation

import { z } from 'zod';
import { Quote, ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Zod schema for input validation
const AddQuoteToDatabaseSchema = z.object({
  text: z.string().min(10, 'Quote text must be at least 10 characters'),
  author: z.string().optional(),
  category: z.string().optional().default('general'),
  style: z.enum(['inspirational', 'practical', 'philosophical']).optional().default('inspirational'),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional().default('en'),
  addedBy: z.string().optional().default('default'),
  verified: z.boolean().optional().default(false),
  publicDomain: z.boolean().optional().default(false)
});

export const addQuoteToDatabaseTool = {
  name: 'add_quote_to_database',
  description: 'Store new quotes in the database with proper categorization and metadata',
  schema: AddQuoteToDatabaseSchema,

  async execute(args: z.infer<typeof AddQuoteToDatabaseSchema>): Promise<ToolResponse> {
    try {
      const {
        text,
        author,
        category,
        style,
        source,
        tags,
        language,
        addedBy,
        verified,
        publicDomain
      } = args;

      const airtableService = new AirtableService();

      // Check for duplicate quotes
      const existingQuotes = await airtableService.searchQuotes(text.substring(0, 50));
      const isDuplicate = existingQuotes.some(q =>
        q.text.toLowerCase().trim() === text.toLowerCase().trim()
      );

      if (isDuplicate) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ **Duplicate Quote Detected**\n\nThis quote (or very similar) already exists in the database.\n\n**Quote**: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"\n\nUse \`get_random_quote\` to retrieve existing quotes or modify the text if this is genuinely different.`
          }],
          isError: true,
          metadata: {
            error: 'Duplicate quote',
            text: text.substring(0, 100),
            existingCount: existingQuotes.length
          }
        };
      }

      // Create new quote object
      const newQuote: Omit<Quote, 'id' | 'airtableId'> = {
        text: text.trim(),
        author: author?.trim() || null,
        category,
        style,
        source: source?.trim() || null,
        tags: tags || [],
        language,
        addedBy,
        verified,
        publicDomain,
        usageCount: 0,
        rating: null,
        ratingCount: 0,
        usedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store in Airtable
      const airtableRecord = await airtableService.addQuote(newQuote as Quote);

      const storedQuote: Quote = {
        ...newQuote,
        id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        airtableId: airtableRecord.id
      };

      // Auto-categorize if not specified
      if (category === 'general') {
        const suggestedCategory = this.suggestCategory(text);
        if (suggestedCategory !== 'general') {
          // Update with suggested category
          await airtableService.updateQuote(airtableRecord.id, {
            category: suggestedCategory
          });
          storedQuote.category = suggestedCategory;
        }
      }

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
          style: storedQuote.style,
          author: storedQuote.author,
          verified: storedQuote.verified,
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

  // Suggest category based on quote content
  suggestCategory(text: string): string {
    const lowercaseText = text.toLowerCase();

    // Category keywords mapping
    const categoryKeywords = {
      motivation: ['achieve', 'success', 'goal', 'dream', 'ambition', 'drive', 'motivate'],
      wisdom: ['wisdom', 'learn', 'knowledge', 'understand', 'experience', 'insight'],
      perseverance: ['persevere', 'persist', 'endure', 'overcome', 'challenge', 'difficult'],
      leadership: ['lead', 'leader', 'inspire', 'influence', 'team', 'guide'],
      creativity: ['create', 'creative', 'imagination', 'innovative', 'art', 'design'],
      mindfulness: ['present', 'moment', 'peace', 'calm', 'meditate', 'aware'],
      relationships: ['love', 'friend', 'family', 'relationship', 'trust', 'connect'],
      growth: ['grow', 'develop', 'improve', 'change', 'evolve', 'progress']
    };

    // Score each category
    let bestCategory = 'general';
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

  // Format quote addition confirmation message
  formatQuoteAddedMessage(quote: Quote): string {
    const categoryEmoji = this.getCategoryEmoji(quote.category);
    const styleIcon = this.getStyleIcon(quote.style);

    const authorText = quote.author ? `**Author**: ${quote.author}` : '**Author**: Anonymous';

    const sourceText = quote.source ? `\n**Source**: ${quote.source}` : '';

    const tagsText = quote.tags && quote.tags.length > 0 ?
      `\n**Tags**: ${quote.tags.map(tag => `#${tag}`).join(' ')}` : '';

    const verificationText = quote.verified ?
      '\n✅ **Verified quote**' :
      '\n⏳ **Pending verification**';

    const publicDomainText = quote.publicDomain ?
      '\n📖 **Public domain**' :
      '\n📝 **Copyrighted content**';

    return `${categoryEmoji} **Quote Added Successfully!**

> "${quote.text}"

${authorText}${sourceText}

**Details**:
${styleIcon} **Style**: ${quote.style.charAt(0).toUpperCase() + quote.style.slice(1)}
📚 **Category**: ${quote.category}
🌍 **Language**: ${quote.language}${tagsText}${verificationText}${publicDomainText}

**Quote ID**: \`${quote.id}\`
**Added by**: ${quote.addedBy}
**Added**: ${new Date(quote.createdAt).toLocaleString()}

${quote.category === 'general' ? '💡 **Note**: Quote was auto-categorized. Use `update_quote_record` to adjust category if needed.' : ''}

Use \`get_random_quote category="${quote.category}"\` to retrieve similar quotes or \`update_quote_record\` to modify this quote!`;
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

  // Helper method for bulk quote addition
  async addMultipleQuotes(quotes: Array<{
    text: string;
    author?: string;
    category?: string;
    style?: 'inspirational' | 'practical' | 'philosophical';
    source?: string;
    tags?: string[];
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

  // Helper method to validate quote format
  validateQuoteFormat(text: string): { isValid: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    let isValid = true;

    // Check length
    if (text.length < 10) {
      isValid = false;
      suggestions.push('Quote should be at least 10 characters long');
    }

    if (text.length > 1000) {
      isValid = false;
      suggestions.push('Quote should be under 1000 characters');
    }

    // Check for proper formatting
    if (text.includes('"') && (!text.startsWith('"') || !text.endsWith('"'))) {
      suggestions.push('Consider using proper quote marks for formatting');
    }

    // Check for meaningful content
    if (text.split(' ').length < 3) {
      isValid = false;
      suggestions.push('Quote should contain at least 3 words');
    }

    return { isValid, suggestions };
  }
};

// Export for use in main MCP server
export default addQuoteToDatabaseTool;