// Enhanced Tiffany AI Router with support for all 25 tools
// Expanded from original n8n workflow routing logic

import {
  TiffanyUserState,
  RouterDecision,
  RoutingContext,
  MemoryEntry,
  InformationExtractionResult,
  Gain
} from '../types/tiffany-types.js';

export class TiffanyAIRouter {
  private memoryBuffer: string[] = [];
  private maxMemorySize = 20; // Increased from 10 for better context

  constructor() {
    // Initialize router with enhanced patterns
  }

  addToMemory(interaction: string): void {
    this.memoryBuffer.push(`${new Date().toISOString()}: ${interaction}`);
    if (this.memoryBuffer.length > this.maxMemorySize) {
      this.memoryBuffer.shift();
    }
  }

  getMemoryContext(): string {
    return this.memoryBuffer.join(' | ');
  }

  // Enhanced smart routing logic with all 25 tool categories
  route(context: RoutingContext): RouterDecision {
    const { userInput, userId, conversationHistory, userState } = context;
    const input = userInput.toLowerCase();
    const memoryContext = this.getMemoryContext();

    // Enhanced routing patterns for all tool categories

    // 1. GAINS TRACKING - Expanded patterns
    if (this.detectGainsTracking(input)) {
      return {
        action: 'gains_tracking',
        confidence: 0.9,
        reasoning: 'User mentioned accomplishments, wins, or progress',
        suggestedTool: 'track_gain',
        parameters: this.extractGainInfo(userInput)
      };
    }

    // 2. TELOS ADVICE - Enhanced mentor council detection
    if (this.detectAdviceNeeded(input)) {
      return {
        action: 'telos_advice',
        confidence: 0.85,
        reasoning: 'User seeking strategic guidance or mentorship',
        suggestedTool: 'get_mentor_advice',
        parameters: {
          situation: userInput,
          focus_area: this.determineFocusArea(input)
        }
      };
    }

    // 3. GOAL SETTING - New goal management detection
    if (this.detectGoalSetting(input)) {
      return {
        action: 'goal_setting',
        confidence: 0.8,
        reasoning: 'User wants to set or manage goals',
        suggestedTool: 'set_goal',
        parameters: {
          goal: userInput,
          priority: this.determinePriority(input)
        }
      };
    }

    // 4. ACCOUNTABILITY CHECK-IN - Enhanced check-in detection
    if (this.detectAccountabilityCheckin(input)) {
      return {
        action: 'accountability_checkin',
        confidence: 0.8,
        reasoning: 'User requesting accountability check-in or review',
        suggestedTool: 'accountability_checkin',
        parameters: {
          timeframe: this.determineTimeframe(input)
        }
      };
    }

    // 5. QUOTE/INSPIRATION - Enhanced motivation detection
    if (this.detectQuoteRequest(input)) {
      return {
        action: 'quote_collection',
        confidence: 0.75,
        reasoning: 'User seeking motivation, inspiration, or quotes',
        suggestedTool: 'get_daily_quote',
        parameters: {
          topic: this.extractTopic(input),
          style: this.determineQuoteStyle(input)
        }
      };
    }

    // 6. DATA RETRIEVAL - New pattern for accessing stored data
    if (this.detectDataRetrieval(input)) {
      return {
        action: 'log_conversation',
        confidence: 0.7,
        reasoning: 'User requesting stored data or memory retrieval',
        suggestedTool: this.determineDataTool(input),
        parameters: {}
      };
    }

    // 7. VOICE PROCESSING - New pattern for voice inputs
    if (this.detectVoiceProcessing(input)) {
      return {
        action: 'log_conversation',
        confidence: 0.8,
        reasoning: 'User submitted voice input for processing',
        suggestedTool: 'process_voice_input',
        parameters: {}
      };
    }

    // Default: Enhanced conversation logging
    return {
      action: 'log_conversation',
      confidence: 0.6,
      reasoning: 'General conversation, enhanced context logging',
      suggestedTool: 'smart_route',
      parameters: {
        userInput,
        analysisNeeded: true
      }
    };
  }

  // Enhanced detection methods for all categories

  private detectGainsTracking(input: string): boolean {
    const gainsKeywords = [
      'accomplished', 'achieved', 'win', 'won', 'progress', 'completed', 'finished',
      'done', 'success', 'successful', 'breakthrough', 'milestone', 'victory',
      'proud', 'crushed it', 'nailed it', 'killed it', 'smashed', 'conquered',
      'delivered', 'shipped', 'launched', 'published', 'submitted', 'closed',
      'solved', 'fixed', 'resolved', 'improved', 'enhanced', 'optimized',
      'learned', 'mastered', 'practiced', 'trained', 'studied', 'gained'
    ];

    return gainsKeywords.some(keyword => input.includes(keyword)) ||
           /\b(did|made|got|earned|received|hit|reached|exceeded)\b.*\b(goal|target|quota|deadline|objective)\b/.test(input);
  }

  private detectAdviceNeeded(input: string): boolean {
    const adviceKeywords = [
      'advice', 'help', 'stuck', 'guidance', 'mentor', 'counsel', 'suggest',
      'recommend', 'opinion', 'perspective', 'insight', 'wisdom', 'direction',
      'strategy', 'approach', 'confused', 'uncertain', 'unsure', 'dilemma',
      'challenge', 'problem', 'issue', 'difficulty', 'obstacle', 'barrier',
      'what should', 'how do', 'how can', 'what would', 'best way', 'struggling'
    ];

    return adviceKeywords.some(keyword => input.includes(keyword)) ||
           /\b(need|want|seeking|looking for)\b.*\b(help|advice|guidance)\b/.test(input);
  }

  private detectGoalSetting(input: string): boolean {
    const goalKeywords = [
      'goal', 'target', 'objective', 'aim', 'plan', 'want to', 'going to',
      'will', 'commit', 'promise', 'resolution', 'intention', 'aspiration',
      'mission', 'vision', 'dream', 'ambition', 'desire', 'hope', 'wish',
      'deadline', 'timeline', 'schedule', 'by when', 'achieve', 'accomplish'
    ];

    return goalKeywords.some(keyword => input.includes(keyword)) ||
           /\b(set|setting|create|creating|establish|establishing)\b.*\b(goal|target|objective)\b/.test(input) ||
           /\b(plan to|going to|want to|need to|should)\b/.test(input);
  }

  private detectAccountabilityCheckin(input: string): boolean {
    const checkinKeywords = [
      'check in', 'check-in', 'checkin', 'review', 'reflect', 'reflection',
      'progress', 'update', 'status', 'how am', 'how have', 'weekly', 'daily',
      'summary', 'report', 'accountability', 'catch up', 'touch base'
    ];

    return checkinKeywords.some(keyword => input.includes(keyword)) ||
           /\b(how.*(going|doing)|what.*(progress|status)|time for|ready for)\b.*\b(review|check|update)\b/.test(input);
  }

  private detectQuoteRequest(input: string): boolean {
    const quoteKeywords = [
      'quote', 'inspiration', 'motivat', 'encourage', 'wisdom', 'saying',
      'phrase', 'words', 'lift me', 'boost', 'energy', 'mindset', 'attitude',
      'positive', 'uplifting', 'strength', 'courage', 'confidence', 'belief'
    ];

    return quoteKeywords.some(keyword => input.includes(keyword)) ||
           /\b(need|want|give me|share)\b.*\b(motivation|inspiration|quote|wisdom)\b/.test(input);
  }

  private detectDataRetrieval(input: string): boolean {
    const dataKeywords = [
      'show me', 'tell me', 'what are', 'list', 'history', 'past', 'previous',
      'stored', 'saved', 'recorded', 'logged', 'memory', 'remember', 'recall',
      'stats', 'statistics', 'count', 'total', 'summary', 'overview'
    ];

    return dataKeywords.some(keyword => input.includes(keyword)) ||
           /\b(how many|what.*(gains|goals|quotes)|show.*(progress|history))\b/.test(input);
  }

  private detectVoiceProcessing(input: string): boolean {
    // This would be triggered by the system when voice input is detected
    return input.includes('[VOICE_INPUT]') || input.includes('transcribe') || input.includes('voice message');
  }

  // Enhanced information extraction with improved categorization
  extractGainInfo(userInput: string): Partial<Gain> {
    const input = userInput.toLowerCase();

    // Enhanced impact detection
    let impact: 'small' | 'medium' | 'large' = 'medium';

    // Large impact indicators
    if (this.hasPatterns(input, [
      'huge', 'major', 'breakthrough', 'massive', 'incredible', 'amazing',
      'fantastic', 'outstanding', 'exceptional', 'milestone', 'game-changer',
      'life-changing', 'transformative', 'revolutionary', 'monumental'
    ])) {
      impact = 'large';
    }
    // Small impact indicators
    else if (this.hasPatterns(input, [
      'small', 'tiny', 'minor', 'little', 'quick', 'simple', 'basic',
      'routine', 'regular', 'normal', 'standard', 'ordinary'
    ])) {
      impact = 'small';
    }

    // Enhanced category detection
    let category = 'general';

    const categoryMap = {
      work: ['work', 'job', 'career', 'business', 'project', 'meeting', 'presentation', 'deadline', 'client', 'team', 'office', 'professional'],
      health: ['health', 'fitness', 'exercise', 'workout', 'gym', 'run', 'walk', 'diet', 'nutrition', 'sleep', 'medical', 'doctor'],
      learning: ['learn', 'study', 'skill', 'education', 'course', 'book', 'read', 'practice', 'training', 'certification', 'knowledge'],
      personal: ['family', 'friend', 'relationship', 'social', 'personal', 'home', 'hobby', 'travel', 'vacation', 'fun'],
      financial: ['money', 'financial', 'budget', 'savings', 'investment', 'income', 'expense', 'cost', 'price', 'paid', 'earned'],
      creative: ['creative', 'art', 'design', 'music', 'writing', 'photo', 'video', 'content', 'blog', 'craft'],
      spiritual: ['spiritual', 'meditation', 'prayer', 'mindfulness', 'gratitude', 'reflection', 'peace', 'calm', 'zen']
    };

    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (this.hasPatterns(input, keywords)) {
        category = cat;
        break;
      }
    }

    // Extract tags from input
    const tags: string[] = [];
    if (input.includes('first time')) tags.push('first-time');
    if (input.includes('personal best')) tags.push('personal-best');
    if (input.includes('team')) tags.push('collaboration');
    if (input.includes('challenge')) tags.push('challenging');
    if (input.includes('goal')) tags.push('goal-related');

    return {
      description: userInput.trim(),
      category,
      impact,
      tags: tags.length > 0 ? tags : undefined
    };
  }

  // Helper methods for enhanced routing logic

  private determineFocusArea(input: string): string {
    const focusMap = {
      productivity: ['productive', 'efficient', 'time', 'organize', 'focus', 'distraction', 'workflow'],
      leadership: ['lead', 'manage', 'team', 'delegate', 'influence', 'motivate', 'inspire'],
      'decision-making': ['decide', 'choice', 'option', 'alternative', 'pros', 'cons', 'evaluate'],
      growth: ['grow', 'develop', 'improve', 'better', 'progress', 'advance', 'evolve'],
      strategy: ['strategy', 'plan', 'approach', 'method', 'tactics', 'execution', 'framework']
    };

    for (const [focus, keywords] of Object.entries(focusMap)) {
      if (this.hasPatterns(input, keywords)) {
        return focus;
      }
    }
    return 'growth'; // default
  }

  private determinePriority(input: string): string {
    if (this.hasPatterns(input, ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'crucial'])) {
      return 'critical';
    }
    if (this.hasPatterns(input, ['important', 'high', 'priority', 'key', 'essential', 'vital'])) {
      return 'high';
    }
    if (this.hasPatterns(input, ['low', 'minor', 'optional', 'nice to have', 'someday', 'maybe'])) {
      return 'low';
    }
    return 'medium';
  }

  private determineTimeframe(input: string): 'daily' | 'weekly' {
    if (this.hasPatterns(input, ['week', 'weekly', 'last week', 'this week', 'past week'])) {
      return 'weekly';
    }
    return 'daily'; // default
  }

  private determineQuoteStyle(input: string): string {
    if (this.hasPatterns(input, ['practical', 'actionable', 'tips', 'advice', 'how to', 'steps'])) {
      return 'practical';
    }
    if (this.hasPatterns(input, ['philosophical', 'deep', 'meaning', 'wisdom', 'profound', 'thoughts'])) {
      return 'philosophical';
    }
    return 'inspirational'; // default
  }

  private extractTopic(input: string): string | undefined {
    const topics = [
      'success', 'leadership', 'productivity', 'growth', 'motivation', 'perseverance',
      'creativity', 'innovation', 'courage', 'confidence', 'change', 'opportunity',
      'learning', 'wisdom', 'strength', 'resilience', 'focus', 'determination'
    ];

    for (const topic of topics) {
      if (input.includes(topic)) {
        return topic;
      }
    }
    return undefined;
  }

  private determineDataTool(input: string): string {
    if (this.hasPatterns(input, ['gains', 'accomplishments', 'wins', 'progress'])) {
      return 'get_user_memory';
    }
    if (this.hasPatterns(input, ['goals', 'objectives', 'targets'])) {
      return 'get_conversation_context';
    }
    if (this.hasPatterns(input, ['quotes', 'inspiration', 'motivation'])) {
      return 'get_random_quote';
    }
    return 'get_conversation_context';
  }

  private hasPatterns(input: string, patterns: string[]): boolean {
    return patterns.some(pattern => input.includes(pattern));
  }

  // Conversation analysis for enhanced context understanding
  analyzeConversationContext(history: MemoryEntry[]): {
    mood: 'positive' | 'neutral' | 'negative';
    topics: string[];
    patterns: string[];
    suggestions: string[];
  } {
    const recentEntries = history.slice(-5); // Last 5 entries

    // Mood analysis
    let positiveCount = 0;
    let negativeCount = 0;

    const positiveWords = ['great', 'awesome', 'fantastic', 'excellent', 'amazing', 'good', 'happy', 'excited', 'proud'];
    const negativeWords = ['bad', 'terrible', 'awful', 'frustrated', 'angry', 'sad', 'difficult', 'struggling', 'stuck'];

    recentEntries.forEach(entry => {
      const content = entry.content.toLowerCase();
      positiveWords.forEach(word => { if (content.includes(word)) positiveCount++; });
      negativeWords.forEach(word => { if (content.includes(word)) negativeCount++; });
    });

    const mood = positiveCount > negativeCount ? 'positive' :
                 negativeCount > positiveCount ? 'negative' : 'neutral';

    // Topic extraction
    const topics = new Set<string>();
    recentEntries.forEach(entry => {
      if (entry.type === 'gain') topics.add('accomplishments');
      if (entry.type === 'goal') topics.add('goals');
      if (entry.type === 'advice') topics.add('guidance');
    });

    // Pattern detection
    const patterns: string[] = [];
    if (recentEntries.filter(e => e.type === 'gain').length >= 2) {
      patterns.push('frequent_gains');
    }
    if (recentEntries.filter(e => e.type === 'advice').length >= 2) {
      patterns.push('seeking_guidance');
    }

    // Suggestions based on analysis
    const suggestions: string[] = [];
    if (mood === 'negative') {
      suggestions.push('Consider requesting a motivational quote');
      suggestions.push('Try an accountability check-in to reflect');
    }
    if (patterns.includes('frequent_gains')) {
      suggestions.push('Great momentum! Consider setting a new goal');
    }

    return {
      mood,
      topics: Array.from(topics),
      patterns,
      suggestions
    };
  }

  // Enhanced memory management
  getMemoryStats(): {
    totalEntries: number;
    oldestEntry: string;
    newestEntry: string;
    memoryUsage: string;
  } {
    return {
      totalEntries: this.memoryBuffer.length,
      oldestEntry: this.memoryBuffer[0] || 'No entries',
      newestEntry: this.memoryBuffer[this.memoryBuffer.length - 1] || 'No entries',
      memoryUsage: `${this.memoryBuffer.length}/${this.maxMemorySize}`
    };
  }

  // Clear memory buffer (for privacy or reset)
  clearMemory(): void {
    this.memoryBuffer = [];
  }

  // Get filtered memory by type
  getFilteredMemory(filter: string): string[] {
    return this.memoryBuffer.filter(entry => entry.toLowerCase().includes(filter.toLowerCase()));
  }
}