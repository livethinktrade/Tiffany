// Accountability Check-in Tool - Daily/weekly review system
// Extracted from deployed MCP server for PAI integration

import { z } from "zod";

export const accountabilityCheckinTool = {
  name: "accountability_checkin",
  description: "Daily/weekly review prompts and reflection system",
  schema: {
    timeframe: z.enum(["daily", "weekly"]).describe("Type of check-in"),
    reflection: z.string().optional().describe("Personal reflection on progress"),
  },

  async execute({ timeframe, reflection }: {
    timeframe: "daily" | "weekly";
    reflection?: string;
  }) {
    // TODO: Integrate with pai/Foundry MCP server for progress tracking
    // TODO: Connect to n8n workflow for scheduled check-in automation

    const checkinMessage = timeframe === "daily"
      ? `📋 **Daily Accountability Check-in**\n\nTime to review your day:\n\n• What wins did you have today?\n• What challenges did you face?\n• What's your priority for tomorrow?\n\n${reflection ? `Your reflection: ${reflection}\n\n` : ""}Ready to track your gains and plan ahead!`
      : `📊 **Weekly Accountability Review**\n\nTime for your weekly review:\n\n• Major accomplishments this week?\n• Key lessons learned?\n• Priorities for next week?\n\n${reflection ? `Your reflection: ${reflection}\n\n` : ""}Use the track_gain tool to log your weekly wins!`;

    return {
      content: [
        {
          type: "text",
          text: checkinMessage,
        },
      ],
    };
  }
};