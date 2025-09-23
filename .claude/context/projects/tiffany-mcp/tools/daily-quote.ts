// Daily Quote Tool - Motivation and inspiration system
// Extracted from deployed MCP server for PAI integration

import { z } from "zod";

export const dailyQuoteTool = {
  name: "get_daily_quote",
  description: "Get personalized motivation and inspiration",
  schema: {
    topic: z.string().optional().describe("Optional topic for the quote (motivation, success, growth, etc.)"),
    style: z.enum(["inspirational", "practical", "philosophical"]).optional().describe("Style of quote"),
  },

  async execute({ topic, style = "inspirational" }: {
    topic?: string;
    style?: "inspirational" | "practical" | "philosophical";
  }) {
    // TODO: Replace with content MCP server integration for dynamic quote generation
    // TODO: Connect to existing n8n quote collection and AI generation workflow

    const quotes = [
      "The way to get started is to quit talking and begin doing. - Walt Disney",
      "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
      "Innovation distinguishes between a leader and a follower. - Steve Jobs",
      "Your limitation—it's only your imagination.",
      "Push yourself, because no one else is going to do it for you.",
    ];

    const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const customMessage = `🌟 **Your Daily Inspiration**\n\n"${selectedQuote}"\n\n${topic ? `Focus: ${topic}\n\n` : ""}Remember, every small step forward is progress. What will you accomplish today?`;

    return {
      content: [
        {
          type: "text",
          text: customMessage,
        },
      ],
    };
  }
};