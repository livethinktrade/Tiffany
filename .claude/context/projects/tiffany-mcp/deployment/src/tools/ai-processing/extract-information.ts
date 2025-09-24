// Extract Information Tool - Parse and categorize user input intelligently
// Part of Phase 2 AI processing tools implementation

import { z } from 'zod';
import { ToolResponse } from '../../types/tiffany-types.js';

// Zod schema for input validation
const ExtractInformationSchema = z.object({
  userInput: z.string().min(1, 'User input is required'),
  extractionType: z.enum(['full', 'gains', 'goals', 'mood', 'keywords', 'entities']).optional().default('full'),
  userId: z.string().optional().default('default'),
  includeConfidence: z.boolean().optional().default(true),
  context: z.string().optional(),
  language: z.string().optional().default('en')
});

export const extractInformationTool = {
  name: 'extract_information',
  description: 'Parse and categorize user input to extract structured information for intelligent processing',
  schema: ExtractInformationSchema,

  async execute(args: z.infer<typeof ExtractInformationSchema>): Promise<ToolResponse> {
    try {
      const {
        userInput,
        extractionType,
        userId,
        includeConfidence,
        context,
        language
      } = args;

      // Perform extraction based on type
      let extractedData: any = {};

      switch (extractionType) {
        case 'full':
          extractedData = await this.extractFullInformation(userInput, context);
          break;
        case 'gains':
          extractedData = this.extractGainsInformation(userInput);
          break;
        case 'goals':
          extractedData = this.extractGoalsInformation(userInput);
          break;
        case 'mood':
          extractedData = this.extractMoodInformation(userInput);
          break;
        case 'keywords':
          extractedData = this.extractKeywords(userInput);
          break;
        case 'entities':
          extractedData = this.extractEntities(userInput);
          break;
      }

      // Format comprehensive response
      const formattedMessage = this.formatExtractionResult(
        userInput,
        extractedData,
        extractionType,
        includeConfidence
      );

      // For gains extraction, return simplified format for workflow integration
      if (extractionType === 'gains' && extractedData.gains) {
        const gainsArray = extractedData.gains.map((gain: any) => gain.description);
        const mood = extractedData.mood || 'Good'; // Default mood

        return {
          content: [{
            type: 'text',
            text: `✅ **Extracted ${gainsArray.length} gains successfully**\n\n${gainsArray.map((gain, i) => `${i+1}. ${gain}`).join('\n')}\n\n**Mood**: ${mood}`
          }],
          metadata: {
            userId,
            extractionType,
            gains: gainsArray,
            mood: [mood],
            // Simplified format for workflow integration
            extractedData: {
              Gains: gainsArray,
              Mood: [mood]
            }
          }
        };
      }

      // Default format for other extraction types
      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          userId,
          extractionType,
          language,
          inputLength: userInput.length,
          extractedData,
          processingTime: Date.now(),
          confidence: extractedData.confidence || null
        }
      };

    } catch (error) {
      console.error('Extract information error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Information extraction failed**: ${error.message}\n\nPlease check your input and try again.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          userId: args.userId,
          extractionType: args.extractionType,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Extract comprehensive information from user input
  async extractFullInformation(userInput: string, context?: string): Promise<{
    intent: string;
    confidence: number;
    entities: any[];
    sentiment: string;
    topics: string[];
    urgency: string;
    actionItems: string[];
    timeReferences: string[];
    emotions: string[];
    gains?: any;
    goals?: any;
    questions: string[];
  }> {
    const input = userInput.toLowerCase();

    // Intent classification
    const intentResult = this.classifyIntent(userInput);

    // Entity extraction
    const entities = this.extractEntities(userInput);

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(userInput);

    // Topic classification
    const topics = this.classifyTopics(userInput);

    // Urgency detection
    const urgency = this.detectUrgency(userInput);

    // Extract action items
    const actionItems = this.extractActionItems(userInput);

    // Extract time references
    const timeReferences = this.extractTimeReferences(userInput);

    // Extract emotions
    const emotions = this.extractEmotions(userInput);

    // Extract questions
    const questions = this.extractQuestions(userInput);

    // Specialized extractions
    let gains = null;
    let goals = null;

    if (intentResult.intent === 'gains_tracking') {
      gains = this.extractGainsInformation(userInput);
    }

    if (intentResult.intent === 'goal_setting' || input.includes('goal') || input.includes('want to')) {
      goals = this.extractGoalsInformation(userInput);
    }

    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      entities: entities.entities,
      sentiment: sentiment.sentiment,
      topics,
      urgency,
      actionItems,
      timeReferences,
      emotions,
      gains,
      goals,
      questions
    };
  },

  // Classify user intent
  classifyIntent(userInput: string): { intent: string; confidence: number } {
    const input = userInput.toLowerCase();

    const intentPatterns = {
      gains_tracking: {
        patterns: ['accomplished', 'achieved', 'completed', 'finished', 'done', 'won', 'success', 'progress', 'crushed'],
        weight: 2
      },
      mentor_advice: {
        patterns: ['advice', 'help', 'stuck', 'guidance', 'mentor', 'what should', 'how do i', 'struggling'],
        weight: 2
      },
      quote_request: {
        patterns: ['quote', 'inspiration', 'motivate', 'encourage', 'wisdom', 'uplift'],
        weight: 1.5
      },
      goal_setting: {
        patterns: ['goal', 'target', 'aim', 'plan', 'want to', 'going to', 'will', 'commit'],
        weight: 1.5
      },
      check_in: {
        patterns: ['how am i', 'progress check', 'review', 'reflection', 'looking back'],
        weight: 1
      },
      conversation: {
        patterns: ['hello', 'hi', 'hey', 'how are you', 'chat', 'talk'],
        weight: 0.5
      }
    };

    let bestIntent = 'conversation';
    let highestScore = 0;

    for (const [intent, config] of Object.entries(intentPatterns)) {
      const score = config.patterns.reduce((acc, pattern) => {
        return acc + (input.includes(pattern) ? config.weight : 0);
      }, 0);

      if (score > highestScore) {
        highestScore = score;
        bestIntent = intent;
      }
    }

    const confidence = Math.min(highestScore / 3, 1); // Normalize confidence

    return { intent: bestIntent, confidence };
  },

  // Extract gains-specific information - MULTI-GAIN SUPPORT
  extractGainsInformation(userInput: string): {
    gains: Array<{
      description: string;
      category: string;
      impact: 'small' | 'medium' | 'large';
      confidence: number;
    }>;
    totalCount: number;
    timeframe: string;
    metrics?: string[];
  } {
    const input = userInput.toLowerCase();

    // MULTI-GAIN PARSING: Split input into individual gains
    const gainsArray = this.parseMultipleGains(userInput);

    // Extract common timeframe for all gains
    let timeframe = 'recent';
    if (input.includes('today') || input.includes('this morning') || input.includes('this afternoon')) {
      timeframe = 'today';
    } else if (input.includes('yesterday')) {
      timeframe = 'yesterday';
    } else if (input.includes('this week')) {
      timeframe = 'this_week';
    } else if (input.includes('last week')) {
      timeframe = 'last_week';
    }

    // Extract global metrics (numbers, percentages, etc.)
    const metricPatterns = /(\d+(?:\.\d+)?)\s*(%|percent|points|hours|minutes|pounds|kg|dollars|\$)/gi;
    const metrics = [];
    let match;
    while ((match = metricPatterns.exec(userInput)) !== null) {
      metrics.push(`${match[1]}${match[2]}`);
    }

    // Process each gain individually
    const processedGains = gainsArray.map(gainText => {
      return this.processSingleGain(gainText.trim());
    });

    return {
      gains: processedGains,
      totalCount: processedGains.length,
      timeframe,
      metrics: metrics.length > 0 ? metrics : undefined
    };
  },

  // NEW: Parse multiple gains from text
  parseMultipleGains(userInput: string): string[] {
    const input = userInput.trim();

    // Pattern 1: Simple numbered lists - split by line and extract after numbers
    const lines = input.split('\n');
    let numberedGains = [];

    for (const line of lines) {
      // Match patterns like "1. text", "2) text", "1 text", etc.
      const numberMatch = line.match(/^\s*\d+[.)]\s*(.+)$/);
      if (numberMatch && numberMatch[1].trim().length > 2) {
        numberedGains.push(numberMatch[1].trim());
      }
    }

    if (numberedGains.length > 1) {
      return numberedGains;
    }

    // Pattern 2: Explicit multi-gain phrases
    const multiGainPhrases = [
      'accomplished three things:',
      'did three things:',
      'completed multiple',
      'several accomplishments',
      'multiple wins',
      'three things:',
      'two things:',
      'four things:'
    ];

    for (const phrase of multiGainPhrases) {
      if (input.toLowerCase().includes(phrase)) {
        // Split after the phrase by common separators
        const afterPhrase = input.substring(input.toLowerCase().indexOf(phrase) + phrase.length);
        return this.splitByCommonSeparators(afterPhrase);
      }
    }

    // Pattern 3: Comma/and/plus separated list detection
    const separatorPattern = /,|\band\b|\bplus\b|\balso\b|\bthen\b/gi;
    const parts = input.split(separatorPattern);

    // Only treat as multi-gain if we have 2+ substantial parts
    const substantialParts = parts.filter(part => part.trim().length > 15);
    if (substantialParts.length > 1) {
      return substantialParts.map(part => part.trim());
    }

    // Pattern 4: Colon-based lists
    if (input.includes(':') && !input.match(/\d{1,2}:\d{2}/)) { // Exclude time patterns
      const colonParts = input.split(':');
      if (colonParts.length === 2) {
        const listPart = colonParts[1];
        const listItems = this.splitByCommonSeparators(listPart);
        if (listItems.length > 1) {
          return listItems;
        }
      }
    }

    // Default: Return as single gain
    return [userInput];
  },

  // Helper: Split text by common separators
  splitByCommonSeparators(text: string): string[] {
    const separators = /,\s*|\s+and\s+|\s+\+\s+|\s+plus\s+|\s+also\s+|\s+then\s+/gi;
    return text.split(separators)
      .map(item => item.trim())
      .filter(item => item.length > 5); // Filter out very short fragments
  },

  // NEW: Process individual gain
  processSingleGain(gainText: string): {
    description: string;
    category: string;
    impact: 'small' | 'medium' | 'large';
    confidence: number;
  } {
    const input = gainText.toLowerCase();

    // Determine impact level
    let impact: 'small' | 'medium' | 'large' = 'medium';
    if (input.includes('huge') || input.includes('major') || input.includes('breakthrough') ||
        input.includes('massive') || input.includes('incredible') || input.includes('amazing') ||
        input.includes('crushed') || input.includes('won') || input.includes('promoted')) {
      impact = 'large';
    } else if (input.includes('small') || input.includes('tiny') || input.includes('minor') ||
               input.includes('little') || input.includes('quick')) {
      impact = 'small';
    }

    // Determine category with enhanced keywords
    let category = 'general';
    const categoryKeywords = {
      work: ['work', 'job', 'career', 'business', 'project', 'meeting', 'presentation', 'client', 'deal', 'sales', 'promoted', 'launch'],
      health: ['health', 'fitness', 'exercise', 'workout', 'diet', 'nutrition', 'wellness', 'gym', 'ran', 'miles', 'cardio'],
      learning: ['learn', 'study', 'skill', 'course', 'book', 'training', 'education', 'read', 'chapter'],
      personal: ['personal', 'family', 'friend', 'relationship', 'social', 'habit', 'mom', 'dad', 'dinner', 'celebrated'],
      finance: ['money', 'financial', 'budget', 'investment', 'savings', 'income', '$', 'dollars'],
      creative: ['creative', 'art', 'design', 'writing', 'music', 'video', 'content', 'website']
    };

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        category = cat;
        break;
      }
    }

    // Calculate confidence based on specificity
    let confidence = 0.7; // Base confidence
    if (impact !== 'medium') confidence += 0.1;
    if (category !== 'general') confidence += 0.1;
    if (gainText.length > 20) confidence += 0.1; // More detailed gains get higher confidence

    return {
      description: gainText,
      category,
      impact,
      confidence: Math.min(confidence, 1)
    };
  },

  // Extract goals-specific information
  extractGoalsInformation(userInput: string): {
    goal: string;
    category: string;
    timeframe: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    measurable: boolean;
    deadline?: string;
    subgoals: string[];
  } {
    const input = userInput.toLowerCase();

    // Extract the actual goal statement
    const goalMarkers = ['want to', 'going to', 'will', 'plan to', 'aim to', 'goal is', 'target is'];
    let goal = userInput.trim();

    for (const marker of goalMarkers) {
      if (input.includes(marker)) {
        const index = input.indexOf(marker);
        goal = userInput.substring(index + marker.length).trim();
        break;
      }
    }

    // Determine category (similar to gains)
    let category = 'personal';
    const categoryKeywords = {
      career: ['work', 'job', 'career', 'business', 'professional'],
      health: ['health', 'fitness', 'exercise', 'weight', 'diet'],
      learning: ['learn', 'study', 'skill', 'education', 'course'],
      financial: ['money', 'save', 'budget', 'invest', 'financial'],
      relationships: ['relationship', 'family', 'friends', 'social'],
      creative: ['create', 'art', 'write', 'design', 'music']
    };

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        category = cat;
        break;
      }
    }

    // Determine timeframe
    let timeframe = 'indefinite';
    const timeframePhrases = {
      'this week': 'week',
      'next week': 'week',
      'this month': 'month',
      'next month': 'month',
      'this year': 'year',
      'by the end of': 'specific_date',
      'in 30 days': '30_days',
      'in 90 days': '90_days'
    };

    for (const [phrase, frame] of Object.entries(timeframePhrases)) {
      if (input.includes(phrase)) {
        timeframe = frame;
        break;
      }
    }

    // Determine priority
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (input.includes('urgent') || input.includes('critical') || input.includes('must')) {
      priority = 'critical';
    } else if (input.includes('important') || input.includes('really want') || input.includes('need to')) {
      priority = 'high';
    } else if (input.includes('maybe') || input.includes('might') || input.includes('someday')) {
      priority = 'low';
    }

    // Check if measurable
    const hasNumbers = /\d+/.test(userInput);
    const measurableWords = ['percent', '%', 'times', 'pounds', 'kg', 'hours', 'minutes', 'dollars'];
    const measurable = hasNumbers || measurableWords.some(word => input.includes(word));

    // Extract sub-goals (simple heuristic)
    const subgoals = userInput.split(/,|and then|after that|also|plus/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s !== goal);

    return {
      goal,
      category,
      timeframe,
      priority,
      measurable,
      subgoals
    };
  },

  // Extract mood and emotional state
  extractMoodInformation(userInput: string): {
    mood: string;
    energy: 'low' | 'medium' | 'high';
    emotions: string[];
    confidence: number;
  } {
    const input = userInput.toLowerCase();

    const moodKeywords = {
      happy: ['happy', 'joyful', 'elated', 'cheerful', 'upbeat', 'great', 'amazing'],
      sad: ['sad', 'down', 'depressed', 'blue', 'disappointed', 'upset'],
      stressed: ['stressed', 'overwhelmed', 'anxious', 'worried', 'pressure'],
      excited: ['excited', 'pumped', 'thrilled', 'enthusiastic', 'energized'],
      frustrated: ['frustrated', 'annoyed', 'irritated', 'mad', 'angry'],
      calm: ['calm', 'peaceful', 'relaxed', 'serene', 'content'],
      motivated: ['motivated', 'driven', 'determined', 'focused', 'ready']
    };

    let detectedMood = 'neutral';
    let highestScore = 0;

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      const score = keywords.filter(keyword => input.includes(keyword)).length;
      if (score > highestScore) {
        highestScore = score;
        detectedMood = mood;
      }
    }

    // Determine energy level
    const energyWords = {
      high: ['energized', 'pumped', 'hyped', 'buzzing', 'wired'],
      low: ['tired', 'exhausted', 'drained', 'sleepy', 'low energy'],
      medium: ['okay', 'alright', 'normal', 'fine']
    };

    let energy: 'low' | 'medium' | 'high' = 'medium';
    for (const [level, words] of Object.entries(energyWords)) {
      if (words.some(word => input.includes(word))) {
        energy = level as 'low' | 'medium' | 'high';
        break;
      }
    }

    // Extract all emotions
    const allEmotions = Object.values(moodKeywords).flat();
    const emotions = allEmotions.filter(emotion => input.includes(emotion));

    return {
      mood: detectedMood,
      energy,
      emotions,
      confidence: highestScore > 0 ? Math.min(highestScore / 2, 1) : 0.3
    };
  },

  // Extract keywords using simple frequency analysis
  extractKeywords(userInput: string): {
    keywords: string[];
    phrases: string[];
    topics: string[];
  } {
    const words = userInput.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Common stop words to filter out
    const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their'];

    const keywords = words.filter(word => !stopWords.includes(word));

    // Extract noun phrases (simple bigrams)
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length > 6) {
        phrases.push(phrase);
      }
    }

    // Topic classification based on keywords
    const topics = this.classifyTopics(userInput);

    return {
      keywords: [...new Set(keywords)], // Remove duplicates
      phrases: [...new Set(phrases)],
      topics
    };
  },

  // Extract entities (people, places, organizations, etc.)
  extractEntities(userInput: string): {
    entities: Array<{
      text: string;
      type: string;
      confidence: number;
    }>;
    people: string[];
    places: string[];
    organizations: string[];
  } {
    const entities = [];
    const people = [];
    const places = [];
    const organizations = [];

    // Simple pattern-based entity extraction
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s*\d{3}-\d{4}\b/g,
      url: /https?:\/\/[^\s]+/g,
      time: /\b\d{1,2}:\d{2}(?:\s*[AP]M)?\b/gi,
      date: /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
      money: /\$\d+(?:,\d{3})*(?:\.\d{2})?/g
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = userInput.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            text: match,
            type,
            confidence: 0.9
          });
        });
      }
    }

    // Common name patterns (simple heuristic)
    const capitalizedWords = userInput.match(/\b[A-Z][a-z]+\b/g) || [];
    capitalizedWords.forEach(word => {
      if (word.length > 2) {
        people.push(word);
      }
    });

    return {
      entities,
      people: [...new Set(people)],
      places: [...new Set(places)],
      organizations: [...new Set(organizations)]
    };
  },

  // Helper methods
  analyzeSentiment(userInput: string): { sentiment: string; confidence: number } {
    const input = userInput.toLowerCase();

    const positiveWords = ['good', 'great', 'awesome', 'amazing', 'love', 'happy', 'excited', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'frustrated', 'angry', 'disappointed'];

    const positiveCount = positiveWords.filter(word => input.includes(word)).length;
    const negativeCount = negativeWords.filter(word => input.includes(word)).length;

    let sentiment = 'neutral';
    let confidence = 0.5;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.5 + (positiveCount * 0.2), 1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.5 + (negativeCount * 0.2), 1);
    }

    return { sentiment, confidence };
  },

  classifyTopics(userInput: string): string[] {
    const input = userInput.toLowerCase();
    const topics = [];

    const topicKeywords = {
      work: ['work', 'job', 'career', 'business', 'project', 'meeting'],
      health: ['health', 'fitness', 'exercise', 'diet', 'wellness'],
      relationships: ['family', 'friend', 'relationship', 'social'],
      learning: ['learn', 'study', 'education', 'skill', 'course'],
      finance: ['money', 'budget', 'financial', 'investment'],
      technology: ['tech', 'computer', 'software', 'app', 'digital'],
      travel: ['travel', 'trip', 'vacation', 'visit', 'journey']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics.length > 0 ? topics : ['general'];
  },

  detectUrgency(userInput: string): string {
    const input = userInput.toLowerCase();
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'now', 'quickly'];

    return urgentWords.some(word => input.includes(word)) ? 'high' : 'low';
  },

  extractActionItems(userInput: string): string[] {
    const actionPhrases = ['need to', 'should', 'must', 'have to', 'want to', 'going to', 'will'];
    const actionItems = [];

    for (const phrase of actionPhrases) {
      if (userInput.toLowerCase().includes(phrase)) {
        actionItems.push(phrase);
      }
    }

    return actionItems;
  },

  extractTimeReferences(userInput: string): string[] {
    const timePatterns = [
      'today', 'tomorrow', 'yesterday', 'next week', 'last week',
      'this morning', 'this afternoon', 'tonight', 'this weekend'
    ];

    return timePatterns.filter(pattern =>
      userInput.toLowerCase().includes(pattern)
    );
  },

  extractEmotions(userInput: string): string[] {
    const emotionWords = [
      'excited', 'nervous', 'confident', 'worried', 'proud', 'overwhelmed',
      'grateful', 'frustrated', 'motivated', 'inspired', 'curious', 'anxious'
    ];

    return emotionWords.filter(emotion =>
      userInput.toLowerCase().includes(emotion)
    );
  },

  extractQuestions(userInput: string): string[] {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
    const questions = [];

    if (userInput.includes('?')) {
      questions.push('direct_question');
    }

    for (const word of questionWords) {
      if (userInput.toLowerCase().includes(word)) {
        questions.push(`${word}_question`);
      }
    }

    return questions;
  },

  // Format the extraction result
  formatExtractionResult(
    userInput: string,
    extractedData: any,
    extractionType: string,
    includeConfidence: boolean
  ): string {
    const inputPreview = userInput.length > 100 ?
      userInput.substring(0, 100) + '...' : userInput;

    let response = `🔍 **Information Extraction Results**

**Input**: "${inputPreview}"
**Type**: ${extractionType.charAt(0).toUpperCase() + extractionType.slice(1)} extraction
**Processed**: ${new Date().toLocaleString()}

`;

    switch (extractionType) {
      case 'full':
        response += this.formatFullExtraction(extractedData, includeConfidence);
        break;
      case 'gains':
        response += this.formatGainsExtraction(extractedData, includeConfidence);
        break;
      case 'goals':
        response += this.formatGoalsExtraction(extractedData);
        break;
      case 'mood':
        response += this.formatMoodExtraction(extractedData, includeConfidence);
        break;
      case 'keywords':
        response += this.formatKeywordsExtraction(extractedData);
        break;
      case 'entities':
        response += this.formatEntitiesExtraction(extractedData);
        break;
    }

    response += `

💡 **Next Steps**: Use this extracted information with other Tiffany tools like \`store_gains\`, \`set_goal\`, or \`get_mentor_advice\` for comprehensive processing.`;

    return response;
  },

  formatFullExtraction(data: any, includeConfidence: boolean): string {
    const confidenceText = includeConfidence ? ` (${Math.round(data.confidence * 100)}% confidence)` : '';

    return `**🎯 Intent**: ${data.intent}${confidenceText}
**😊 Sentiment**: ${data.sentiment}
**📂 Topics**: ${data.topics.join(', ')}
**⚡ Urgency**: ${data.urgency}

${data.entities.length > 0 ? `**🏷️ Entities**: ${data.entities.map(e => `${e.text} (${e.type})`).join(', ')}\n` : ''}${data.actionItems.length > 0 ? `**✅ Action Items**: ${data.actionItems.join(', ')}\n` : ''}${data.emotions.length > 0 ? `**😊 Emotions**: ${data.emotions.join(', ')}\n` : ''}${data.timeReferences.length > 0 ? `**⏰ Time References**: ${data.timeReferences.join(', ')}\n` : ''}${data.questions.length > 0 ? `**❓ Questions**: ${data.questions.join(', ')}\n` : ''}${data.gains ? `\n**🎆 Gains Info**: ${data.gains.totalCount || 1} gains found (${data.gains.gains ? data.gains.gains[0].category : data.gains.category} primary)\n` : ''}${data.goals ? `\n**🎯 Goals Info**: ${data.goals.category} goal (${data.goals.priority} priority)\n` : ''}`;
  },

  formatGainsExtraction(data: any, includeConfidence: boolean): string {
    if (data.gains && data.totalCount > 1) {
      // Multi-gain format
      let result = `**🎯 Total Gains Found**: ${data.totalCount}
**⏰ Timeframe**: ${data.timeframe}
${data.metrics ? `**📊 Overall Metrics**: ${data.metrics.join(', ')}\n` : ''}

**📋 Individual Gains:**
`;

      data.gains.forEach((gain, index) => {
        const confidenceText = includeConfidence ? ` (${Math.round(gain.confidence * 100)}% confidence)` : '';
        result += `
**${index + 1}. ${gain.category.toUpperCase()} - ${gain.impact} impact${confidenceText}**
   📝 ${gain.description}
`;
      });

      return result;
    } else {
      // Single gain format (backward compatibility)
      const gain = data.gains ? data.gains[0] : data;
      const confidenceText = includeConfidence ? ` (${Math.round(gain.confidence * 100)}% confidence)` : '';

      return `**📂 Category**: ${gain.category}
**⭐ Impact**: ${gain.impact}${confidenceText}
**⏰ Timeframe**: ${data.timeframe}
${data.metrics ? `**📊 Metrics**: ${data.metrics.join(', ')}\n` : ''}
**📝 Description**: ${gain.description}`;
    }
  },

  formatGoalsExtraction(data: any): string {
    return `**🎯 Goal**: ${data.goal}
**📂 Category**: ${data.category}
**⏰ Timeframe**: ${data.timeframe}
**🚨 Priority**: ${data.priority}
**📏 Measurable**: ${data.measurable ? 'Yes' : 'No'}
${data.subgoals.length > 0 ? `**📋 Sub-goals**: ${data.subgoals.join(', ')}\n` : ''}`;
  },

  formatMoodExtraction(data: any, includeConfidence: boolean): string {
    const confidenceText = includeConfidence ? ` (${Math.round(data.confidence * 100)}% confidence)` : '';

    return `**😊 Mood**: ${data.mood}${confidenceText}
**⚡ Energy**: ${data.energy}
${data.emotions.length > 0 ? `**💭 Emotions**: ${data.emotions.join(', ')}\n` : ''}`;
  },

  formatKeywordsExtraction(data: any): string {
    return `**🔑 Keywords**: ${data.keywords.join(', ')}
**📝 Phrases**: ${data.phrases.join(', ')}
**📂 Topics**: ${data.topics.join(', ')}`;
  },

  formatEntitiesExtraction(data: any): string {
    return `**🏷️ All Entities**: ${data.entities.map(e => `${e.text} (${e.type})`).join(', ')}
${data.people.length > 0 ? `**👥 People**: ${data.people.join(', ')}\n` : ''}${data.places.length > 0 ? `**📍 Places**: ${data.places.join(', ')}\n` : ''}${data.organizations.length > 0 ? `**🏢 Organizations**: ${data.organizations.join(', ')}\n` : ''}`;
  }
};

// Export for use in main MCP server
export default extractInformationTool;