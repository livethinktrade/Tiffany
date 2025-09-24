// Format Telegram Message Tool - Structure responses for Telegram messaging format
// Part of Phase 4 communication tools implementation

import { z } from 'zod';
import { ToolResponse } from '../../types/tiffany-types.js';

// Zod schema for input validation
const FormatTelegramMessageSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  messageType: z.enum(['text', 'gains_tracking', 'quote', 'mentor_advice', 'error', 'success']).optional().default('text'),
  includeEmojis: z.boolean().optional().default(true),
  maxLength: z.number().optional().default(4096), // Telegram message limit
  userId: z.string().optional().default('default'),
  parseMode: z.enum(['Markdown', 'HTML', 'None']).optional().default('Markdown'),
  disablePreview: z.boolean().optional().default(false)
});

export const formatTelegramMessageTool = {
  name: 'format_telegram_message',
  description: 'Structure responses for Telegram messaging format with proper formatting, emoji support, and character limits',
  schema: FormatTelegramMessageSchema,

  async execute(args: z.infer<typeof FormatTelegramMessageSchema>): Promise<ToolResponse> {
    try {
      const {
        content,
        messageType = 'text',
        includeEmojis = true,
        maxLength = 4096,
        userId = 'default',
        parseMode = 'Markdown',
        disablePreview = false
      } = args;

      // Format content based on message type
      const formattedContent = formatTelegramMessageTool.formatByType(content, messageType, includeEmojis);

      // Apply character limit and truncation if necessary
      const finalContent = formatTelegramMessageTool.applyTelegramLimits(formattedContent, maxLength);

      // Generate Telegram-specific formatting
      const telegramMessage = {
        text: finalContent,
        parse_mode: parseMode !== 'None' ? parseMode : undefined,
        disable_web_page_preview: disablePreview,
        metadata: {
          messageType,
          userId,
          originalLength: content.length,
          formattedLength: finalContent.length,
          truncated: finalContent.length < formattedContent.length
        }
      };

      return {
        content: [{
          type: 'text',
          text: `📱 **Telegram Message Formatted**\n\n${finalContent}\n\n---\n\n**Message Details:**\n- Type: ${messageType}\n- Parse Mode: ${parseMode}\n- Length: ${finalContent.length}/${maxLength} chars\n- Emojis: ${includeEmojis ? 'Enabled' : 'Disabled'}`
        }],
        metadata: {
          toolName: 'format_telegram_message',
          telegramMessage,
          formattingApplied: {
            messageType,
            emojiSupport: includeEmojis,
            parseMode,
            characterLimit: maxLength,
            disablePreview
          }
        }
      };

    } catch (error) {
      console.error('Error formatting Telegram message:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Telegram formatting failed**: ${error.message}\n\nOriginal content: ${args.content.substring(0, 200)}...`
        }],
        isError: true,
        metadata: {
          toolName: 'format_telegram_message',
          error: error.message,
          originalContent: args.content
        }
      };
    }
  },

  // Helper method to format content by message type
  formatByType(content: string, messageType: string, includeEmojis: boolean): string {
    const emojiMap = {
      text: '💬',
      gains_tracking: '🎯',
      quote: '💡',
      mentor_advice: '🧠',
      error: '❌',
      success: '✅'
    };

    const emoji = includeEmojis ? (emojiMap[messageType as keyof typeof emojiMap] || '📱') : '';

    switch (messageType) {
      case 'gains_tracking':
        return `${emoji} **Gains Update**\n\n${content}\n\n*Keep up the momentum!* 🚀`;

      case 'quote':
        return `${emoji} **Daily Inspiration**\n\n"${content}"\n\n*Let this guide your day* ✨`;

      case 'mentor_advice':
        return `${emoji} **Mentor Council**\n\n${content}\n\n*Wisdom for your journey* 🎯`;

      case 'error':
        return `${emoji} **System Notice**\n\n${content}\n\n*Please try again or contact support*`;

      case 'success':
        return `${emoji} **Success!**\n\n${content}\n\n*Great work!* 🎉`;

      case 'text':
      default:
        return `${emoji} ${content}`;
    }
  },

  // Helper method to apply Telegram message limits
  applyTelegramLimits(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }

    // Smart truncation - try to preserve formatting
    const truncated = content.substring(0, maxLength - 50);
    const lastNewline = truncated.lastIndexOf('\n');

    if (lastNewline > maxLength * 0.7) {
      // If we have a good break point, use it
      return truncated.substring(0, lastNewline) + '\n\n...[message truncated]';
    } else {
      // Otherwise, cut at word boundary
      const lastSpace = truncated.lastIndexOf(' ');
      return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength - 20) + '...[truncated]';
    }
  }
};

export default formatTelegramMessageTool;