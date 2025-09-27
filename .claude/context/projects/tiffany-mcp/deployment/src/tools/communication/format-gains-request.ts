// Format Gains Request Tool - Create gains tracking prompts and request formatting
// Part of Phase 4 communication tools implementation

import { z } from 'zod';
import { ToolResponse } from '../../types/tiffany-types.js';

// Zod schema for input validation
const FormatGainsRequestSchema = z.object({
  userId: z.string().optional().default('friend'),
  userName: z.string().optional(), // User's first name if known
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional().default('afternoon'),
  promptStyle: z.enum(['friendly', 'motivational', 'check-in', 'celebration', 'gentle-nudge']).optional().default('friendly'),
  includeDate: z.boolean().optional().default(true),
  recentGains: z.array(z.string()).optional().default([]), // Recent gains for context
  customFocus: z.string().optional() // Optional focus area (work, health, personal)
});

export const formatGainsRequestTool = {
  name: 'format_gains_request',
  description: 'Create gains tracking prompts and request formatting with Tiffany\'s supportive personality',
  schema: FormatGainsRequestSchema,

  async execute(args: z.infer<typeof FormatGainsRequestSchema>): Promise<ToolResponse> {
    try {
      const {
        userId = 'friend',
        userName,
        timeOfDay = 'afternoon',
        promptStyle = 'friendly',
        includeDate = true,
        recentGains = [],
        customFocus
      } = args;

      // Generate current date in Central Time Zone
      const currentDate = formatGainsRequestTool.getCurrentDateCentral();

      // Create personalized gains request based on parameters
      const gainsRequest = formatGainsRequestTool.generateGainsRequest({
        userName,
        timeOfDay,
        promptStyle,
        includeDate,
        currentDate,
        recentGains,
        customFocus
      });

      // Format for messaging platform
      const formattedRequest = formatGainsRequestTool.formatForMessaging(gainsRequest, promptStyle);

      return {
        content: [{
          type: 'text',
          text: `🎯 **Gains Request Generated**\n\n${formattedRequest}\n\n---\n\n**Request Details:**\n- Style: ${promptStyle}\n- Time: ${timeOfDay}\n- Date included: ${includeDate ? 'Yes' : 'No'}\n- Focus: ${customFocus || 'General gains'}`
        }],
        metadata: {
          toolName: 'format_gains_request',
          gainsRequest: {
            message: formattedRequest,
            style: promptStyle,
            timeOfDay,
            date: currentDate,
            userId,
            focus: customFocus
          },
          formattingApplied: {
            personality: 'Tiffany supportive',
            dateFormatting: includeDate,
            customization: !!userName,
            contextAware: recentGains.length > 0
          }
        }
      };

    } catch (error) {
      console.error('Error formatting gains request:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Gains request formatting failed**: ${error.message}\n\nFallback prompt: "Hey there! 🌟 How did your day go? I'd love to hear about 3 wins or positive moments you had today - big or small!"`
        }],
        isError: true,
        metadata: {
          toolName: 'format_gains_request',
          error: error.message,
          fallbackUsed: true
        }
      };
    }
  },

  // Helper method to get current date in Central Time Zone
  getCurrentDateCentral(): string {
    const now = new Date();
    const centralTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(now);

    return centralTime;
  },

  // Core gains request generation logic
  generateGainsRequest(params: {
    userName?: string,
    timeOfDay: string,
    promptStyle: string,
    includeDate: boolean,
    currentDate: string,
    recentGains: string[],
    customFocus?: string
  }): string {
    const { userName, timeOfDay, promptStyle, includeDate, currentDate, recentGains, customFocus } = params;

    // Personalization elements
    const greeting = userName ? `Hey ${userName}!` : formatGainsRequestTool.getTimeBasedGreeting(timeOfDay);
    const dateContext = includeDate ? ` It's ${currentDate} and` : '';
    const focusContext = customFocus ? ` especially around ${customFocus}` : '';

    // Build context from recent gains
    let contextualElement = '';
    if (recentGains.length > 0) {
      const recentGain = recentGains[0];
      contextualElement = ` I loved hearing about ${recentGain.toLowerCase()} recently!`;
    }

    // Generate style-specific request
    const baseRequest = formatGainsRequestTool.getStyleBasedRequest(promptStyle, {
      greeting,
      dateContext,
      focusContext,
      contextualElement,
      timeOfDay
    });

    return baseRequest;
  },

  // Time-based greeting generation
  getTimeBasedGreeting(timeOfDay: string): string {
    const greetings = {
      morning: ['Good morning, sunshine!', 'Morning, superstar!', 'Rise and shine!', 'Good morning!'],
      afternoon: ['Hey there!', 'Good afternoon!', 'Hope your day is going great!', 'Hey friend!'],
      evening: ['Good evening!', 'Hey there!', 'Hope you had a great day!', 'Evening check-in!']
    };

    const options = greetings[timeOfDay as keyof typeof greetings] || greetings.afternoon;
    return options[Math.floor(Math.random() * options.length)];
  },

  // Style-based request generation
  getStyleBasedRequest(style: string, context: {
    greeting: string,
    dateContext: string,
    focusContext: string,
    contextualElement: string,
    timeOfDay: string
  }): string {
    const { greeting, dateContext, focusContext, contextualElement, timeOfDay } = context;

    const styleTemplates = {
      friendly: `${greeting} 🌟${dateContext} I'd love to catch up with you!${contextualElement}

Tell me about 3 wins or positive moments from your day${focusContext} - they can be big victories or small moments that made you smile!

I'm here to celebrate with you! ✨`,

      motivational: `${greeting} 🚀${dateContext} it's time to recognize your amazing progress!${contextualElement}

You've been crushing it, and I want to hear about it! Share 3 accomplishments or wins from today${focusContext} - whether they're huge achievements or small steps forward!

Every win matters and I'm here to cheer you on! 💪`,

      'check-in': `${greeting} 💙${dateContext} just checking in to see how you're doing!${contextualElement}

I'd love to hear about 3 things that went well today${focusContext} - anything that made you feel good, proud, or just happy!

Remember, I'm always here to listen and celebrate your journey! 🤗`,

      celebration: `${greeting} 🎉${dateContext} it's celebration time!${contextualElement}

I KNOW you've had some wins today, even if they feel small! Tell me about 3 moments worth celebrating${focusContext} - I want to party with you!

Every victory deserves recognition - big or tiny! Let's celebrate! 🎈`,

      'gentle-nudge': `${greeting} 🌸${dateContext} I'm thinking of you!${contextualElement}

No pressure, but when you're ready, I'd love to hear about 3 positive moments from your day${focusContext}. Even the smallest things count!

Take your time - I'm here whenever you want to share! 💕`
    };

    return styleTemplates[style as keyof typeof styleTemplates] || styleTemplates.friendly;
  },

  // Format for messaging platform compatibility
  formatForMessaging(request: string, style: string): string {
    // Ensure proper line breaks and emoji spacing
    const formatted = request
      .replace(/\n\n/g, '\n\n')  // Normalize double line breaks
      .replace(/([!?.])\s*\n/g, '$1\n\n')  // Add space after sentences
      .trim();

    // Add style-specific closing if needed
    const closings = {
      motivational: '\n\n*You\'ve got this!* 💫',
      celebration: '\n\n*Ready to celebrate with you!* 🎊',
      'gentle-nudge': '\n\n*No rush - I\'ll be here!* 🌻',
      'check-in': '\n\n*Always here for you!* 💙',
      friendly: '\n\n*Can\'t wait to hear from you!* 😊'
    };

    const closing = closings[style as keyof typeof closings];
    return closing ? formatted + closing : formatted;
  }
};

export default formatGainsRequestTool;