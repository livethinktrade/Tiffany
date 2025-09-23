/**
 * Tiffany MCP Server - Accountability Agent as Cloudflare Workers MCP
 *
 * Converted from 102-node n8n workflow to serverless MCP architecture
 * Following danielmiessler.workers.dev pattern for single-file deployment
 */

// Core routing logic extracted from n8n workflow qNqFdwPIbfnsTQt5
const ROUTING_PATHS = {
  TELOS_ADVICE: 0,    // TELOS file retrieval → Mentor advice
  LOG_CONVERSATION: 1, // Conversation logging
  QUOTE_COLLECTION: 2, // Quote collection and generation
  GAINS_TRACKING: 3    // Gains tracking workflow
};

// AI Router Agent logic - core decision making
class TiffanyRouter {
  constructor() {
    this.memory = new Map(); // Simple memory store
  }

  async route(message, userId) {
    // Semantic analysis of incoming message
    const intent = await this.analyzeIntent(message);

    switch (intent.path) {
      case ROUTING_PATHS.TELOS_ADVICE:
        return await this.handleTelosAdvice(message, userId, intent);
      case ROUTING_PATHS.LOG_CONVERSATION:
        return await this.logConversation(message, userId, intent);
      case ROUTING_PATHS.QUOTE_COLLECTION:
        return await this.handleQuoteRequest(message, userId, intent);
      case ROUTING_PATHS.GAINS_TRACKING:
        return await this.handleGainsTracking(message, userId, intent);
      default:
        return await this.handleGeneral(message, userId, intent);
    }
  }

  async analyzeIntent(message) {
    // Simplified intent analysis (to be enhanced with OpenRouter)
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('gain') || lowerMessage.includes('accomplish') || lowerMessage.includes('win')) {
      return { path: ROUTING_PATHS.GAINS_TRACKING, confidence: 0.9 };
    }

    if (lowerMessage.includes('quote') || lowerMessage.includes('inspiration') || lowerMessage.includes('motivation')) {
      return { path: ROUTING_PATHS.QUOTE_COLLECTION, confidence: 0.8 };
    }

    if (lowerMessage.includes('advice') || lowerMessage.includes('mentor') || lowerMessage.includes('telos')) {
      return { path: ROUTING_PATHS.TELOS_ADVICE, confidence: 0.9 };
    }

    // Default to conversation logging
    return { path: ROUTING_PATHS.LOG_CONVERSATION, confidence: 0.6 };
  }

  async handleGainsTracking(message, userId, intent) {
    // Core gains tracking logic from n8n workflow
    const gain = await this.extractGainFromMessage(message);

    if (gain) {
      // Store in Airtable (placeholder - needs API integration)
      await this.storeGain(userId, gain);

      // Get user state and provide personalized response
      const userState = await this.getUserState(userId);

      return {
        success: true,
        message: `💪 Awesome gain recorded! ${gain.description}. Keep building momentum!`,
        action: 'gains_stored',
        data: gain
      };
    }

    return {
      success: true,
      message: "Tell me about a win or accomplishment today! What did you achieve?",
      action: 'gains_prompt'
    };
  }

  async handleQuoteRequest(message, userId, intent) {
    // Quote generation logic from n8n workflow
    const randomQuote = await this.getRandomQuote();
    const customMessage = await this.generateCustomQuoteMessage(randomQuote, userId);

    return {
      success: true,
      message: customMessage,
      action: 'quote_delivered',
      data: { quote: randomQuote }
    };
  }

  async handleTelosAdvice(message, userId, intent) {
    // TELOS file retrieval and mentor advice
    const telosContent = await this.retrieveTelosFile(userId);
    const mentorAdvice = await this.getMentorAdvice(message, telosContent);

    return {
      success: true,
      message: mentorAdvice,
      action: 'mentor_advice',
      data: { telos: telosContent }
    };
  }

  async logConversation(message, userId, intent) {
    // Simple conversation logging
    const timestamp = new Date().toISOString();

    // Log to persistent storage (placeholder)
    await this.logToStorage({
      userId,
      message,
      timestamp,
      intent
    });

    return {
      success: true,
      message: "I'm here to help! What would you like to work on today?",
      action: 'conversation_logged'
    };
  }

  async handleGeneral(message, userId, intent) {
    return {
      success: true,
      message: "I'm Tiffany, your accountability agent! I can help you track gains, get motivation quotes, or provide mentor advice. What would you like to focus on?",
      action: 'general_help'
    };
  }

  // Helper methods (placeholders for full implementation)
  async extractGainFromMessage(message) {
    // TODO: Implement AI extraction using OpenRouter
    return {
      description: message,
      category: 'general',
      timestamp: new Date().toISOString()
    };
  }

  async storeGain(userId, gain) {
    // TODO: Implement Airtable integration
    console.log('Storing gain:', { userId, gain });
    return true;
  }

  async getUserState(userId) {
    // TODO: Implement user state retrieval from Airtable
    return { userId, lastActive: new Date().toISOString() };
  }

  async getRandomQuote() {
    // TODO: Implement Airtable quote retrieval
    const defaultQuotes = [
      "The way to get started is to quit talking and begin doing. - Walt Disney",
      "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
      "Innovation distinguishes between a leader and a follower. - Steve Jobs"
    ];

    return defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
  }

  async generateCustomQuoteMessage(quote, userId) {
    // TODO: Implement AI customization using OpenRouter
    return `🌟 Here's your daily inspiration:\n\n"${quote}"\n\nRemember, every small step forward is progress. What will you accomplish today?`;
  }

  async retrieveTelosFile(userId) {
    // TODO: Implement TELOS file retrieval
    return "Personal TELOS file content would be loaded here";
  }

  async getMentorAdvice(message, telosContent) {
    // TODO: Implement mentor AI advice using OpenRouter
    return "Here's some wisdom from your personal board of advisors based on your TELOS...";
  }

  async logToStorage(logEntry) {
    // TODO: Implement conversation logging
    console.log('Logged:', logEntry);
    return true;
  }
}

// Cloudflare Workers event handler
export default {
  async fetch(request, env, ctx) {
    // CORS headers for cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return Response.json(
        {
          status: 'healthy',
          service: 'tiffany-mcp',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        },
        { headers: corsHeaders }
      );
    }

    // Main Tiffany endpoint
    if (url.pathname === '/tiffany' && request.method === 'POST') {
      try {
        const data = await request.json();
        const { message, userId = 'default' } = data;

        if (!message) {
          return Response.json(
            { success: false, error: 'Message is required' },
            { status: 400, headers: corsHeaders }
          );
        }

        // Initialize Tiffany router
        const tiffany = new TiffanyRouter();
        const response = await tiffany.route(message, userId);

        return Response.json(response, { headers: corsHeaders });

      } catch (error) {
        console.error('Tiffany MCP Error:', error);

        return Response.json(
          {
            success: false,
            error: 'Internal server error',
            message: 'I encountered an issue. Please try again.'
          },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Default response
    return Response.json(
      {
        service: 'Tiffany MCP Server',
        version: '1.0.0',
        endpoints: {
          '/health': 'GET - Health check',
          '/tiffany': 'POST - Main Tiffany interaction'
        },
        example: {
          url: '/tiffany',
          method: 'POST',
          body: {
            message: 'I completed my morning workout!',
            userId: 'user123'
          }
        }
      },
      { headers: corsHeaders }
    );
  },
};