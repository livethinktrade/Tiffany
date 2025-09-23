// Set Goal Tool - Goal creation and tracking system
// Extracted from deployed MCP server for PAI integration

import { z } from "zod";

export const setGoalTool = {
  name: "set_goal",
  description: "Set goals with deadlines and priority tracking",
  schema: {
    goal: z.string().describe("The goal you want to set"),
    deadline: z.string().optional().describe("Target deadline (YYYY-MM-DD format)"),
    priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Goal priority level"),
  },

  async execute({ goal, deadline, priority = "medium" }: {
    goal: string;
    deadline?: string;
    priority?: "low" | "medium" | "high" | "critical";
  }) {
    // TODO: Integrate with pai/Foundry MCP server for goal persistence
    // TODO: Connect to n8n workflow for goal tracking and reminders

    return {
      content: [
        {
          type: "text",
          text: `🎯 **Goal Set Successfully!**\n\n**Goal:** ${goal}\n${deadline ? `**Deadline:** ${deadline}\n` : ""}**Priority:** ${priority}\n\nI'll help you stay accountable to this goal. Use track_gain to log progress and get_mentor_advice if you need strategic guidance!`,
        },
      ],
    };
  }
};