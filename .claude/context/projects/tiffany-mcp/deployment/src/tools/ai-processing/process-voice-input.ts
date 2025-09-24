// Process Voice Input Tool - Transcribe and process voice messages
// Part of Phase 2 AI processing tools implementation

import { z } from 'zod';
import { ToolResponse } from '../../types/tiffany-types.js';

// Access environment variables properly
const getOpenAIKey = () => {
  // In Cloudflare Workers, use global environment
  if (typeof globalThis !== 'undefined' && globalThis.OPENAI_API_KEY) {
    return globalThis.OPENAI_API_KEY;
  }
  // In Node.js/Bun, use process.env
  return process.env.OPENAI_API_KEY;
};

// Zod schema for input validation
const ProcessVoiceInputSchema = z.object({
  audioData: z.string().min(1, 'Audio data is required'),
  audioFormat: z.enum(['mp3', 'wav', 'ogg', 'm4a', 'webm']).optional().default('mp3'),
  userId: z.string().optional().default('default'),
  includeTimestamp: z.boolean().optional().default(true),
  language: z.string().optional().default('en'),
  processForRouting: z.boolean().optional().default(true)
});

export const processVoiceInputTool = {
  name: 'process_voice_input',
  description: 'Transcribe voice messages and process them for intelligent routing and context extraction',
  schema: ProcessVoiceInputSchema,

  async execute(args: z.infer<typeof ProcessVoiceInputSchema>): Promise<ToolResponse> {
    try {
      const {
        audioData,
        audioFormat,
        userId,
        includeTimestamp,
        language,
        processForRouting
      } = args;

      // Check if OpenAI API key is available
      const openaiKey = getOpenAIKey();
      if (!openaiKey || openaiKey === 'your_openai_api_key_here') {
        return {
          content: [{
            type: 'text',
            text: `⚠️ **Voice processing unavailable**: OpenAI API key not configured.\n\nPlease add your OpenAI API key to the environment variables to enable voice transcription.`
          }],
          isError: true,
          metadata: {
            error: 'Missing OpenAI API key',
            feature: 'voice_transcription',
            userId
          }
        };
      }

      // Convert base64 audio data to blob for API
      let audioBlob: Blob;
      try {
        const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
        audioBlob = new Blob([audioBuffer], { type: `audio/${audioFormat}` });
      } catch (conversionError) {
        throw new Error('Invalid audio data format. Expected base64-encoded audio.');
      }

      // Transcribe using OpenAI Whisper API
      const transcriptionResult = await this.transcribeAudio(audioBlob, language);

      if (!transcriptionResult.success) {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`);
      }

      // Process transcribed text for routing if requested
      let routingAnalysis = null;
      if (processForRouting) {
        routingAnalysis = await this.analyzeForRouting(transcriptionResult.text, userId);
      }

      // Extract key information from transcription
      const extractedInfo = this.extractInformation(transcriptionResult.text);

      // Format comprehensive response
      const formattedMessage = this.formatVoiceProcessingResult(
        transcriptionResult,
        extractedInfo,
        routingAnalysis,
        includeTimestamp
      );

      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          userId,
          transcriptionText: transcriptionResult.text,
          confidence: transcriptionResult.confidence,
          language: transcriptionResult.detectedLanguage || language,
          audioFormat,
          audioLength: transcriptionResult.duration,
          extractedInfo,
          routingAnalysis,
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('Process voice input error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Voice processing failed**: ${error.message}\n\nPlease check your audio format and try again. Supported formats: mp3, wav, ogg, m4a, webm.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          userId: args.userId,
          audioFormat: args.audioFormat,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Transcribe audio using OpenAI Whisper API
  async transcribeAudio(audioBlob: Blob, language: string): Promise<{
    success: boolean;
    text?: string;
    confidence?: number;
    duration?: number;
    detectedLanguage?: string;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('response_format', 'verbose_json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getOpenAIKey()}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }

      const transcriptionData = await response.json();

      return {
        success: true,
        text: transcriptionData.text,
        confidence: transcriptionData.segments?.[0]?.no_speech_prob
          ? 1 - transcriptionData.segments[0].no_speech_prob
          : 0.9,
        duration: transcriptionData.duration,
        detectedLanguage: transcriptionData.language
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Analyze transcribed text for intelligent routing
  async analyzeForRouting(text: string, userId: string): Promise<{
    suggestedRoute: string;
    confidence: number;
    reasoning: string;
    extractedEntities: string[];
  }> {
    const input = text.toLowerCase();

    // Intent detection patterns
    const patterns = {
      gains_tracking: [
        'accomplished', 'achieved', 'completed', 'finished', 'done', 'won', 'success',
        'progress', 'milestone', 'breakthrough', 'victory', 'crushed it'
      ],
      mentor_advice: [
        'advice', 'help', 'stuck', 'guidance', 'mentor', 'what should i',
        'how do i', 'struggling', 'challenge', 'problem', 'decision'
      ],
      quote_request: [
        'quote', 'inspiration', 'motivate', 'encourage', 'wisdom',
        'uplift', 'positive', 'boost', 'energy'
      ],
      goal_setting: [
        'goal', 'target', 'aim', 'plan', 'want to', 'going to',
        'commit', 'objective', 'resolution'
      ]
    };

    // Score each route
    let bestRoute = 'conversation';
    let highestScore = 0;
    let reasoning = 'General conversation detected';

    for (const [route, keywords] of Object.entries(patterns)) {
      const score = keywords.reduce((count, keyword) => {
        return count + (input.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > highestScore) {
        highestScore = score;
        bestRoute = route;
        reasoning = `Detected ${score} relevant keywords for ${route}`;
      }
    }

    // Extract entities (simple keyword extraction)
    const allKeywords = Object.values(patterns).flat();
    const extractedEntities = allKeywords.filter(keyword => input.includes(keyword));

    return {
      suggestedRoute: bestRoute,
      confidence: Math.min(highestScore / 3, 1), // Normalize to 0-1
      reasoning,
      extractedEntities
    };
  },

  // Extract structured information from transcribed text
  extractInformation(text: string): {
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'low' | 'medium' | 'high';
    topics: string[];
    actionItems: string[];
    emotions: string[];
  } {
    const input = text.toLowerCase();

    // Sentiment analysis (simple keyword-based)
    const positiveWords = ['great', 'awesome', 'amazing', 'love', 'happy', 'excited', 'good'];
    const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'frustrated', 'angry', 'disappointed'];

    const positiveCount = positiveWords.filter(word => input.includes(word)).length;
    const negativeCount = negativeWords.filter(word => input.includes(word)).length;

    let sentiment: 'positive' | 'neutral' | 'negative';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    else sentiment = 'neutral';

    // Urgency detection
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'now'];
    const urgency = urgentWords.some(word => input.includes(word)) ? 'high' : 'low';

    // Topic extraction (simple keyword matching)
    const topicKeywords = {
      work: ['work', 'job', 'career', 'business', 'project', 'meeting'],
      health: ['health', 'fitness', 'exercise', 'diet', 'wellness'],
      relationships: ['family', 'friend', 'relationship', 'social', 'people'],
      learning: ['learn', 'study', 'education', 'skill', 'course', 'book'],
      personal: ['personal', 'self', 'growth', 'development', 'habit']
    };

    const topics: string[] = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        topics.push(topic);
      }
    }

    // Extract action items (simple heuristic)
    const actionWords = ['need to', 'should', 'want to', 'going to', 'will', 'plan to'];
    const actionItems = actionWords.filter(phrase => input.includes(phrase));

    // Emotion detection
    const emotionWords = ['excited', 'nervous', 'confident', 'worried', 'proud', 'overwhelmed'];
    const emotions = emotionWords.filter(emotion => input.includes(emotion));

    return {
      sentiment,
      urgency,
      topics: topics.length > 0 ? topics : ['general'],
      actionItems,
      emotions
    };
  },

  // Format the voice processing result
  formatVoiceProcessingResult(
    transcription: any,
    extractedInfo: any,
    routingAnalysis: any,
    includeTimestamp: boolean
  ): string {
    const timestamp = includeTimestamp ? `\n**Processed**: ${new Date().toLocaleString()}` : '';

    const confidenceText = transcription.confidence > 0.8 ? '🟢 High' :
                          transcription.confidence > 0.6 ? '🟡 Medium' : '🔴 Low';

    let response = `🎙️ **Voice Message Processed**

**📝 Transcription**:
"${transcription.text}"

**🎯 Analysis**:
• Confidence: ${confidenceText} (${Math.round(transcription.confidence * 100)}%)
• Sentiment: ${this.getSentimentEmoji(extractedInfo.sentiment)} ${extractedInfo.sentiment}
• Topics: ${extractedInfo.topics.join(', ')}${timestamp}`;

    if (routingAnalysis) {
      response += `

**🧭 Smart Routing**:
• Suggested action: ${routingAnalysis.suggestedRoute}
• Confidence: ${Math.round(routingAnalysis.confidence * 100)}%
• Reasoning: ${routingAnalysis.reasoning}`;

      if (routingAnalysis.extractedEntities.length > 0) {
        response += `
• Key terms: ${routingAnalysis.extractedEntities.join(', ')}`;
      }
    }

    if (extractedInfo.actionItems.length > 0) {
      response += `

**✅ Action Items Detected**:
${extractedInfo.actionItems.map(item => `• "${item}"`).join('\n')}`;
    }

    if (extractedInfo.emotions.length > 0) {
      response += `

**😊 Emotions**: ${extractedInfo.emotions.join(', ')}`;
    }

    response += `

💡 **Next Steps**: Use the suggested routing to continue with \`${routingAnalysis?.suggestedRoute || 'appropriate'}\` tools, or process this transcription with other Tiffany tools as needed.`;

    return response;
  },

  // Get emoji for sentiment
  getSentimentEmoji(sentiment: string): string {
    const emojiMap = {
      positive: '😊',
      neutral: '😐',
      negative: '😔'
    };
    return emojiMap[sentiment as keyof typeof emojiMap] || '😐';
  }
};

// Export for use in main MCP server
export default processVoiceInputTool;