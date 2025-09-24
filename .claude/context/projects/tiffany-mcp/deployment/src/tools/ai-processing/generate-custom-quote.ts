// Generate Custom Quote Tool - AI-powered personalized quote creation
// Part of Phase 2 AI processing tools implementation

import { z } from 'zod';
import { Quote, ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Access environment variables properly
const getAPIKeys = () => {
  const getKey = (keyName: string) => {
    // In Cloudflare Workers, use global environment
    if (typeof globalThis !== 'undefined' && globalThis[keyName]) {
      return globalThis[keyName];
    }
    // In Node.js/Bun, use process.env
    return process.env[keyName];
  };

  return {
    openai: getKey('OPENAI_API_KEY'),
    openrouter: getKey('OPENROUTER_API_KEY')
  };
};

// Zod schema for input validation
const GenerateCustomQuoteSchema = z.object({
  topic: z.string().optional(),
  style: z.enum(['inspirational', 'practical', 'philosophical']).optional().default('inspirational'),
  userContext: z.string().optional(),
  userId: z.string().optional().default('default'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  includeAuthor: z.boolean().optional().default(false),
  personalizedFor: z.string().optional(),
  mood: z.enum(['motivational', 'calming', 'energizing', 'reflective']).optional().default('motivational'),
  saveToDatabase: z.boolean().optional().default(true)
});

export const generateCustomQuoteTool = {
  name: 'generate_custom_quote',
  description: 'Generate personalized quotes using AI based on user context, mood, and preferences',
  schema: GenerateCustomQuoteSchema,

  async execute(args: z.infer<typeof GenerateCustomQuoteSchema>): Promise<ToolResponse> {
    try {
      const {
        topic,
        style,
        userContext,
        userId,
        length,
        includeAuthor,
        personalizedFor,
        mood,
        saveToDatabase
      } = args;

      // Check if API keys are available for AI generation
      const keys = getAPIKeys();
      const hasOpenAI = keys.openai && keys.openai !== 'your_openai_api_key_here';
      const hasOpenRouter = keys.openrouter && keys.openrouter !== 'your_openrouter_api_key_here';

      if (!hasOpenAI && !hasOpenRouter) {
        // Fallback to template-based generation
        const fallbackQuote = this.generateTemplateQuote(topic, style, mood, length);
        return await this.processGeneratedQuote(fallbackQuote, args, true);
      }

      // Generate AI-powered quote
      const generatedQuote = await this.generateAIQuote({
        topic,
        style,
        userContext,
        length,
        includeAuthor,
        personalizedFor,
        mood
      });

      if (!generatedQuote.success) {
        // Fallback to template if AI generation fails
        const fallbackQuote = this.generateTemplateQuote(topic, style, mood, length);
        return await this.processGeneratedQuote(fallbackQuote, args, true);
      }

      return await this.processGeneratedQuote(generatedQuote, args, false);

    } catch (error) {
      console.error('Generate custom quote error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Quote generation failed**: ${error.message}\n\nPlease try again with different parameters or check your API configuration.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          userId: args.userId,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Generate AI-powered quote using available API
  async generateAIQuote(params: {
    topic?: string;
    style: string;
    userContext?: string;
    length: string;
    includeAuthor: boolean;
    personalizedFor?: string;
    mood: string;
  }): Promise<{
    success: boolean;
    text?: string;
    author?: string;
    reasoning?: string;
    error?: string;
  }> {
    try {
      const prompt = this.buildQuotePrompt(params);

      // Try OpenAI first, then OpenRouter as fallback
      const keys = getAPIKeys();
      const hasOpenAI = keys.openai && keys.openai !== 'your_openai_api_key_here';

      if (hasOpenAI) {
        return await this.generateWithOpenAI(prompt, params.includeAuthor);
      } else {
        return await this.generateWithOpenRouter(prompt, params.includeAuthor);
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Build prompt for AI quote generation
  buildQuotePrompt(params: {
    topic?: string;
    style: string;
    userContext?: string;
    length: string;
    personalizedFor?: string;
    mood: string;
  }): string {
    const lengthGuidance = {
      short: '10-20 words',
      medium: '20-40 words',
      long: '40-80 words'
    };

    let prompt = `Generate a ${params.style} quote that is ${params.mood} in tone, approximately ${lengthGuidance[params.length as keyof typeof lengthGuidance]} long.`;

    if (params.topic) {
      prompt += ` The quote should focus on the topic of "${params.topic}".`;
    }

    if (params.personalizedFor) {
      prompt += ` Personalize it for someone who is ${params.personalizedFor}.`;
    }

    if (params.userContext) {
      prompt += ` Consider this context: ${params.userContext}.`;
    }

    prompt += `

Style guidelines:
- ${params.style === 'inspirational' ? 'Uplifting, encouraging, and empowering' : ''}
- ${params.style === 'practical' ? 'Actionable, concrete, and focused on implementation' : ''}
- ${params.style === 'philosophical' ? 'Thoughtful, deep, and contemplative' : ''}

Mood guidelines:
- ${params.mood === 'motivational' ? 'Energizing and action-oriented' : ''}
- ${params.mood === 'calming' ? 'Peaceful and reassuring' : ''}
- ${params.mood === 'energizing' ? 'Dynamic and exciting' : ''}
- ${params.mood === 'reflective' ? 'Introspective and thoughtful' : ''}

Requirements:
- Be original and unique
- Avoid clichés and overused phrases
- Make it memorable and impactful
- Ensure it's appropriate for personal accountability context

Return only the quote text, nothing else.`;

    return prompt;
  },

  // Generate quote using OpenAI API
  async generateWithOpenAI(prompt: string, includeAuthor: boolean): Promise<{
    success: boolean;
    text?: string;
    author?: string;
    reasoning?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAPIKeys().openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a wise quote generator that creates original, meaningful quotes for personal development and accountability. Always respond with just the quote text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const quoteText = data.choices[0]?.message?.content?.trim();

      if (!quoteText) {
        throw new Error('No quote generated by OpenAI');
      }

      return {
        success: true,
        text: quoteText.replace(/^["']|["']$/g, ''), // Remove surrounding quotes
        author: includeAuthor ? 'AI Assistant' : undefined,
        reasoning: 'Generated using OpenAI GPT-4'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Generate quote using OpenRouter API
  async generateWithOpenRouter(prompt: string, includeAuthor: boolean): Promise<{
    success: boolean;
    text?: string;
    author?: string;
    reasoning?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAPIKeys().openrouter}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tiffany-mcp.danielmiessler.workers.dev',
          'X-Title': 'Tiffany MCP Server'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku:beta',
          messages: [
            {
              role: 'system',
              content: 'You are a wise quote generator that creates original, meaningful quotes for personal development and accountability. Always respond with just the quote text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const quoteText = data.choices[0]?.message?.content?.trim();

      if (!quoteText) {
        throw new Error('No quote generated by OpenRouter');
      }

      return {
        success: true,
        text: quoteText.replace(/^["']|["']$/g, ''), // Remove surrounding quotes
        author: includeAuthor ? 'AI Assistant' : undefined,
        reasoning: 'Generated using OpenRouter Claude'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Generate template-based quote as fallback
  generateTemplateQuote(
    topic?: string,
    style: string = 'inspirational',
    mood: string = 'motivational',
    length: string = 'medium'
  ): {
    success: boolean;
    text: string;
    author?: string;
    reasoning: string;
  } {
    const templates = {
      inspirational: {
        motivational: [
          "Your potential is unlimited when you commit to consistent daily action.",
          "Every small step forward is a victory worth celebrating and building upon.",
          "The gap between dreams and reality is bridged by persistent daily effort.",
          "Success is not a destination but a journey of continuous improvement and growth."
        ],
        calming: [
          "Progress happens quietly in the space between effort and patience.",
          "Trust the process, embrace the journey, and celebrate small victories along the way.",
          "Growth requires both action and rest, effort and acceptance of the present moment."
        ],
        energizing: [
          "Today is your opportunity to transform intention into action and dreams into reality!",
          "Your energy and focus today create the momentum for tomorrow's breakthrough!"
        ],
        reflective: [
          "The most important conversation you have is the one with yourself about your progress.",
          "Reflection transforms experience into wisdom, and wisdom guides future action."
        ]
      },
      practical: {
        motivational: [
          "Start with one small action, then build momentum through consistent daily habits.",
          "Focus on systems, not goals. Good systems create lasting results automatically.",
          "Measure progress daily, celebrate weekly, and adjust monthly for continuous improvement."
        ],
        calming: [
          "Take one step at a time. Sustainable progress beats overwhelming sprint every time.",
          "Consistency over intensity. Small daily actions compound into significant long-term results."
        ],
        energizing: [
          "Take action now! The perfect moment is created by starting, not by waiting!",
          "Transform your ideas into reality through immediate, focused action!"
        ],
        reflective: [
          "Ask yourself: What did I learn today that I can apply tomorrow?",
          "Regular reflection turns experience into insight and insight into better action."
        ]
      },
      philosophical: {
        motivational: [
          "The person you become through pursuing your goals matters more than the goals themselves.",
          "Accountability is the bridge between intention and transformation."
        ],
        calming: [
          "Change happens gradually, then suddenly. Trust the unseen progress you're making daily.",
          "You are exactly where you need to be to become who you're meant to be."
        ],
        energizing: [
          "You have within you right now everything needed to create extraordinary change!",
          "The universe responds to action with opportunity and growth!"
        ],
        reflective: [
          "Who you're becoming is more important than what you're achieving.",
          "Every choice is a vote for the person you want to become."
        ]
      }
    };

    const styleTemplates = templates[style as keyof typeof templates] || templates.inspirational;
    const moodTemplates = styleTemplates[mood as keyof typeof styleTemplates] || styleTemplates.motivational;

    const selectedQuote = moodTemplates[Math.floor(Math.random() * moodTemplates.length)];

    // Adjust length if needed
    let finalQuote = selectedQuote;
    if (length === 'short' && selectedQuote.length > 80) {
      finalQuote = selectedQuote.split('.')[0] + '.';
    } else if (length === 'long' && selectedQuote.length < 100) {
      finalQuote += ' Remember, every journey begins with a single step forward.';
    }

    return {
      success: true,
      text: finalQuote,
      reasoning: 'Generated using curated template system'
    };
  },

  // Process the generated quote and optionally save to database
  async processGeneratedQuote(
    quoteResult: any,
    originalArgs: any,
    isFallback: boolean
  ): Promise<ToolResponse> {
    const {
      topic,
      style,
      userId,
      saveToDatabase,
      personalizedFor
    } = originalArgs;

    if (!quoteResult.success) {
      throw new Error(quoteResult.error || 'Quote generation failed');
    }

    // Create quote object
    const generatedQuote: Partial<Quote> = {
      text: quoteResult.text,
      author: quoteResult.author || 'Tiffany AI',
      category: topic || 'motivation',
      style,
      usageCount: 0,
      rating: null,
      ratingCount: 0,
      usedBy: [],
      tags: [],
      language: 'en',
      addedBy: userId,
      verified: false,
      publicDomain: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database if requested
    let databaseRecord = null;
    let saveStatus = 'skipped';

    if (saveToDatabase) {
      try {
        const airtableService = new AirtableService();

        // Add generation metadata as tags
        const generationTags = [
          'ai_generated',
          isFallback ? 'template_based' : 'llm_generated',
          `style_${style}`,
          `user_${userId}`
        ];

        if (personalizedFor) {
          generationTags.push(`personalized_${personalizedFor.replace(/\s+/g, '_')}`);
        }

        const quoteToSave: Quote = {
          ...generatedQuote,
          id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tags: generationTags
        } as Quote;

        databaseRecord = await airtableService.addQuote(quoteToSave);
        saveStatus = 'success';
      } catch (saveError) {
        console.error('Failed to save generated quote:', saveError);
        saveStatus = 'failed';
      }
    }

    // Format response message
    const formattedMessage = this.formatGeneratedQuoteMessage(
      generatedQuote,
      quoteResult.reasoning,
      saveStatus,
      isFallback
    );

    return {
      content: [{
        type: 'text',
        text: formattedMessage
      }],
      metadata: {
        userId,
        quoteText: generatedQuote.text,
        author: generatedQuote.author,
        style,
        category: generatedQuote.category,
        generationMethod: isFallback ? 'template' : 'ai',
        saveStatus,
        databaseId: databaseRecord?.id,
        reasoning: quoteResult.reasoning,
        personalizedFor: personalizedFor || null
      }
    };
  },

  // Format the generated quote response message
  formatGeneratedQuoteMessage(
    quote: Partial<Quote>,
    reasoning: string,
    saveStatus: string,
    isFallback: boolean
  ): string {
    const methodEmoji = isFallback ? '📋' : '🤖';
    const methodText = isFallback ? 'Template-based' : 'AI-generated';

    const saveStatusText = saveStatus === 'success' ? '✅ Saved to database' :
                          saveStatus === 'failed' ? '⚠️ Database save failed (quote still generated)' :
                          '💾 Generated only (not saved)';

    return `${methodEmoji} **Custom Quote Generated**

> "${quote.text}"

${quote.author && quote.author !== 'Tiffany AI' ? `**— ${quote.author}**\n` : ''}
**Style**: ${quote.style?.charAt(0).toUpperCase() + quote.style?.slice(1)}
**Category**: ${quote.category}
**Method**: ${methodText}
**Status**: ${saveStatusText}

${reasoning ? `**Generation Details**: ${reasoning}\n` : ''}
${isFallback ? '💡 **Note**: Generated using curated templates. Add API keys for AI-powered generation.\n' : ''}
**Perfect for**: Daily motivation, sharing with others, or adding to your personal quote collection

**Quick Actions**:
• Use \`get_random_quote\` to retrieve more quotes
• Use \`track_gain\` if this quote inspired action
• Use \`store_user_state\` to remember your preferences`;
  }
};

// Export for use in main MCP server
export default generateCustomQuoteTool;