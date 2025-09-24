// Analyze Conversation Tool - Context analysis for smart routing and insights
// Part of Phase 2 AI processing tools implementation

import { z } from 'zod';
import { ToolResponse } from '../../types/tiffany-types.js';
import { AirtableService } from '../../services/airtable-service.js';

// Zod schema for input validation
const AnalyzeConversationSchema = z.object({
  conversationText: z.string().min(1, 'Conversation text is required'),
  analysisType: z.enum(['routing', 'sentiment', 'progress', 'insights', 'comprehensive']).optional().default('comprehensive'),
  userId: z.string().optional().default('default'),
  includeHistory: z.boolean().optional().default(true),
  timeframe: z.enum(['session', 'day', 'week', 'month']).optional().default('session'),
  generateRecommendations: z.boolean().optional().default(true)
});

export const analyzeConversationTool = {
  name: 'analyze_conversation',
  description: 'Analyze conversation context for intelligent routing, sentiment tracking, and progress insights',
  schema: AnalyzeConversationSchema,

  async execute(args: z.infer<typeof AnalyzeConversationSchema>): Promise<ToolResponse> {
    try {
      const {
        conversationText,
        analysisType,
        userId,
        includeHistory,
        timeframe,
        generateRecommendations
      } = args;

      // Get conversation history if requested
      let conversationHistory: any[] = [];
      if (includeHistory) {
        conversationHistory = await this.getConversationHistory(userId, timeframe);
      }

      // Perform analysis based on type
      let analysisResult: any = {};

      switch (analysisType) {
        case 'routing':
          analysisResult = await this.analyzeForRouting(conversationText, conversationHistory);
          break;
        case 'sentiment':
          analysisResult = await this.analyzeSentiment(conversationText, conversationHistory);
          break;
        case 'progress':
          analysisResult = await this.analyzeProgress(conversationText, conversationHistory, userId);
          break;
        case 'insights':
          analysisResult = await this.generateInsights(conversationText, conversationHistory);
          break;
        case 'comprehensive':
          analysisResult = await this.performComprehensiveAnalysis(conversationText, conversationHistory, userId);
          break;
      }

      // Generate recommendations if requested
      let recommendations: string[] = [];
      if (generateRecommendations) {
        recommendations = this.generateActionRecommendations(analysisResult, conversationText);
      }

      // Format response message
      const formattedMessage = this.formatAnalysisResult(
        analysisResult,
        analysisType,
        recommendations,
        conversationHistory.length
      );

      return {
        content: [{
          type: 'text',
          text: formattedMessage
        }],
        metadata: {
          userId,
          analysisType,
          timeframe,
          conversationLength: conversationText.length,
          historyCount: conversationHistory.length,
          analysisResult,
          recommendations,
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('Analyze conversation error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Conversation analysis failed**: ${error.message}\n\nPlease check your input and try again.`
        }],
        isError: true,
        metadata: {
          error: error.message,
          userId: args.userId,
          analysisType: args.analysisType,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  // Get conversation history from user memory
  async getConversationHistory(userId: string, timeframe: string): Promise<any[]> {
    try {
      const airtableService = new AirtableService();

      // Convert timeframe to limit
      const limitMap = {
        session: 5,
        day: 10,
        week: 25,
        month: 50
      };

      const limit = limitMap[timeframe as keyof typeof limitMap] || 10;

      // Get memory entries
      const memoryEntries = await airtableService.getMemoryEntries(userId, limit, 'conversation');

      return memoryEntries || [];
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  },

  // Analyze conversation for intelligent routing
  async analyzeForRouting(conversationText: string, history: any[]): Promise<{
    suggestedRoutes: Array<{
      route: string;
      confidence: number;
      reasoning: string;
    }>;
    primaryRoute: string;
    contextualFactors: string[];
    urgencyLevel: 'low' | 'medium' | 'high';
  }> {
    const input = conversationText.toLowerCase();

    // Define routing patterns with weights
    const routingPatterns = {
      gains_tracking: {
        keywords: ['accomplished', 'achieved', 'completed', 'finished', 'done', 'won', 'success', 'progress', 'breakthrough'],
        phrases: ['i did', 'i finished', 'i completed', 'made progress', 'got it done'],
        weight: 3
      },
      mentor_advice: {
        keywords: ['advice', 'help', 'stuck', 'guidance', 'mentor', 'struggling', 'challenge', 'problem'],
        phrases: ['what should i', 'how do i', 'need help', 'dont know', "can't figure"],
        weight: 3
      },
      quote_request: {
        keywords: ['quote', 'inspiration', 'motivate', 'encourage', 'wisdom', 'uplift', 'boost'],
        phrases: ['need motivation', 'feeling down', 'inspire me', 'pick me up'],
        weight: 2
      },
      goal_setting: {
        keywords: ['goal', 'target', 'aim', 'plan', 'want to', 'going to', 'commit', 'objective'],
        phrases: ['want to achieve', 'my goal is', 'planning to', 'going to start'],
        weight: 2
      },
      check_in: {
        keywords: ['progress', 'review', 'reflection', 'update', 'status', 'how am i'],
        phrases: ['checking in', 'progress report', 'how have i been', 'looking back'],
        weight: 1.5
      },
      conversation: {
        keywords: ['hello', 'hi', 'hey', 'chat', 'talk', 'discuss'],
        phrases: ['how are you', 'whats up', 'good morning', 'good evening'],
        weight: 0.5
      }
    };

    // Score each route
    const routeScores: Array<{ route: string; score: number; matches: string[]; reasoning: string }> = [];

    for (const [route, config] of Object.entries(routingPatterns)) {
      let score = 0;
      const matches: string[] = [];

      // Check keywords
      for (const keyword of config.keywords) {
        if (input.includes(keyword)) {
          score += config.weight;
          matches.push(keyword);
        }
      }

      // Check phrases
      for (const phrase of config.phrases) {
        if (input.includes(phrase)) {
          score += config.weight * 1.5; // Phrases get higher weight
          matches.push(phrase);
        }
      }

      // Consider historical patterns
      const historyBonus = this.calculateHistoryBonus(route, history);
      score += historyBonus;

      const reasoning = this.generateRoutingReasoning(matches, historyBonus, config.weight);

      routeScores.push({ route, score, matches, reasoning });
    }

    // Sort by score and calculate confidence
    routeScores.sort((a, b) => b.score - a.score);

    const suggestedRoutes = routeScores
      .filter(r => r.score > 0)
      .slice(0, 3)
      .map(r => ({
        route: r.route,
        confidence: Math.min(r.score / 5, 1), // Normalize to 0-1
        reasoning: r.reasoning
      }));

    const primaryRoute = routeScores[0]?.route || 'conversation';

    // Analyze contextual factors
    const contextualFactors = this.extractContextualFactors(conversationText, history);

    // Determine urgency level
    const urgencyLevel = this.assessUrgency(conversationText);

    return {
      suggestedRoutes,
      primaryRoute,
      contextualFactors,
      urgencyLevel
    };
  },

  // Analyze sentiment trends
  async analyzeSentiment(conversationText: string, history: any[]): Promise<{
    currentSentiment: {
      polarity: 'positive' | 'neutral' | 'negative';
      confidence: number;
      emotions: string[];
    };
    sentimentTrend: {
      direction: 'improving' | 'stable' | 'declining';
      change: number;
    };
    insights: string[];
  }> {
    const input = conversationText.toLowerCase();

    // Analyze current sentiment
    const sentimentWords = {
      positive: ['great', 'awesome', 'amazing', 'good', 'happy', 'excited', 'love', 'fantastic', 'wonderful'],
      negative: ['bad', 'terrible', 'awful', 'sad', 'frustrated', 'angry', 'hate', 'disappointed', 'upset'],
      emotions: {
        joy: ['happy', 'joyful', 'elated', 'cheerful'],
        sadness: ['sad', 'down', 'depressed', 'blue'],
        anger: ['angry', 'mad', 'furious', 'irritated'],
        fear: ['scared', 'afraid', 'nervous', 'worried'],
        surprise: ['surprised', 'amazed', 'shocked'],
        excitement: ['excited', 'thrilled', 'pumped', 'energized']
      }
    };

    let positiveCount = 0;
    let negativeCount = 0;
    const detectedEmotions: string[] = [];

    // Count sentiment words
    for (const word of sentimentWords.positive) {
      if (input.includes(word)) positiveCount++;
    }

    for (const word of sentimentWords.negative) {
      if (input.includes(word)) negativeCount++;
    }

    // Detect specific emotions
    for (const [emotion, words] of Object.entries(sentimentWords.emotions)) {
      if (words.some(word => input.includes(word))) {
        detectedEmotions.push(emotion);
      }
    }

    // Determine polarity and confidence
    let polarity: 'positive' | 'neutral' | 'negative' = 'neutral';
    let confidence = 0.5;

    if (positiveCount > negativeCount) {
      polarity = 'positive';
      confidence = Math.min(0.5 + (positiveCount * 0.15), 1);
    } else if (negativeCount > positiveCount) {
      polarity = 'negative';
      confidence = Math.min(0.5 + (negativeCount * 0.15), 1);
    }

    // Analyze historical sentiment trend
    const sentimentTrend = this.analyzeSentimentTrend(history);

    // Generate insights
    const insights = this.generateSentimentInsights(polarity, detectedEmotions, sentimentTrend);

    return {
      currentSentiment: {
        polarity,
        confidence,
        emotions: detectedEmotions
      },
      sentimentTrend,
      insights
    };
  },

  // Analyze progress patterns
  async analyzeProgress(conversationText: string, history: any[], userId: string): Promise<{
    progressIndicators: {
      gainsRecency: string;
      streakStatus: string;
      engagementLevel: string;
    };
    patterns: {
      activeTimeOfDay: string;
      commonTopics: string[];
      progressFrequency: string;
    };
    recommendations: string[];
  }> {
    try {
      const airtableService = new AirtableService();

      // Get user state
      const userState = await airtableService.getUserState(userId);

      // Analyze progress indicators
      const progressIndicators = {
        gainsRecency: this.assessGainsRecency(userState),
        streakStatus: this.assessStreakStatus(userState),
        engagementLevel: this.assessEngagementLevel(history)
      };

      // Analyze patterns from history
      const patterns = {
        activeTimeOfDay: this.findActiveTimeOfDay(history),
        commonTopics: this.extractCommonTopics(history),
        progressFrequency: this.assessProgressFrequency(history)
      };

      // Generate progress recommendations
      const recommendations = this.generateProgressRecommendations(progressIndicators, patterns);

      return {
        progressIndicators,
        patterns,
        recommendations
      };
    } catch (error) {
      // Fallback analysis without user state
      return {
        progressIndicators: {
          gainsRecency: 'unknown',
          streakStatus: 'unknown',
          engagementLevel: this.assessEngagementLevel(history)
        },
        patterns: {
          activeTimeOfDay: this.findActiveTimeOfDay(history),
          commonTopics: this.extractCommonTopics(history),
          progressFrequency: this.assessProgressFrequency(history)
        },
        recommendations: ['Use track_gain to log recent accomplishments', 'Regular check-ins help maintain momentum']
      };
    }
  },

  // Generate insights from conversation patterns
  async generateInsights(conversationText: string, history: any[]): Promise<{
    conversationInsights: string[];
    behaviorPatterns: string[];
    suggestions: string[];
  }> {
    const input = conversationText.toLowerCase();

    // Analyze conversation characteristics
    const conversationInsights = [];

    if (input.length > 200) {
      conversationInsights.push('Detailed communication style - provides comprehensive context');
    } else if (input.length < 50) {
      conversationInsights.push('Concise communication style - prefers brief interactions');
    }

    if (this.hasQuestions(input)) {
      conversationInsights.push('Seeking-oriented - actively asks questions and seeks guidance');
    }

    if (this.hasActionWords(input)) {
      conversationInsights.push('Action-oriented - focuses on implementation and next steps');
    }

    // Analyze behavior patterns from history
    const behaviorPatterns = this.analyzeBehaviorPatterns(history);

    // Generate suggestions
    const suggestions = this.generateInsightBasedSuggestions(conversationInsights, behaviorPatterns);

    return {
      conversationInsights,
      behaviorPatterns,
      suggestions
    };
  },

  // Perform comprehensive analysis
  async performComprehensiveAnalysis(conversationText: string, history: any[], userId: string): Promise<{
    routing: any;
    sentiment: any;
    progress: any;
    insights: any;
    summary: string;
  }> {
    // Perform all analysis types
    const [routing, sentiment, progress, insights] = await Promise.all([
      this.analyzeForRouting(conversationText, history),
      this.analyzeSentiment(conversationText, history),
      this.analyzeProgress(conversationText, history, userId),
      this.generateInsights(conversationText, history)
    ]);

    // Generate comprehensive summary
    const summary = this.generateComprehensiveSummary(routing, sentiment, progress, insights);

    return {
      routing,
      sentiment,
      progress,
      insights,
      summary
    };
  },

  // Helper methods
  calculateHistoryBonus(route: string, history: any[]): number {
    if (history.length === 0) return 0;

    const recentRoutes = history.slice(0, 3).map(h => h.type || 'conversation');
    const routeFrequency = recentRoutes.filter(r => r === route).length;

    return routeFrequency * 0.5; // Small bonus for route consistency
  },

  generateRoutingReasoning(matches: string[], historyBonus: number, weight: number): string {
    if (matches.length === 0 && historyBonus === 0) {
      return 'No specific indicators found';
    }

    let reasoning = '';
    if (matches.length > 0) {
      reasoning += `Detected keywords: ${matches.join(', ')}`;
    }
    if (historyBonus > 0) {
      reasoning += `${reasoning ? '; ' : ''}Recent pattern match`;
    }

    return reasoning;
  },

  extractContextualFactors(conversationText: string, history: any[]): string[] {
    const factors = [];
    const input = conversationText.toLowerCase();

    // Time-based factors
    if (input.includes('today') || input.includes('this morning')) {
      factors.push('immediate_timeframe');
    }

    if (input.includes('urgent') || input.includes('asap')) {
      factors.push('high_urgency');
    }

    // Emotional factors
    if (input.includes('excited') || input.includes('motivated')) {
      factors.push('positive_energy');
    }

    if (input.includes('tired') || input.includes('overwhelmed')) {
      factors.push('low_energy');
    }

    // Progress factors
    if (input.includes('stuck') || input.includes('challenge')) {
      factors.push('needs_support');
    }

    return factors;
  },

  assessUrgency(conversationText: string): 'low' | 'medium' | 'high' {
    const input = conversationText.toLowerCase();

    const highUrgencyWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'deadline'];
    const mediumUrgencyWords = ['soon', 'quickly', 'important', 'need to'];

    if (highUrgencyWords.some(word => input.includes(word))) {
      return 'high';
    }

    if (mediumUrgencyWords.some(word => input.includes(word))) {
      return 'medium';
    }

    return 'low';
  },

  analyzeSentimentTrend(history: any[]): { direction: 'improving' | 'stable' | 'declining'; change: number } {
    if (history.length < 2) {
      return { direction: 'stable', change: 0 };
    }

    // Simple trend analysis based on recent entries
    const recentEntries = history.slice(0, 5);
    let positiveCount = 0;
    let negativeCount = 0;

    recentEntries.forEach(entry => {
      const content = (entry.content || '').toLowerCase();
      if (content.includes('good') || content.includes('great') || content.includes('happy')) {
        positiveCount++;
      }
      if (content.includes('bad') || content.includes('frustrated') || content.includes('sad')) {
        negativeCount++;
      }
    });

    const ratio = positiveCount - negativeCount;

    if (ratio > 1) return { direction: 'improving', change: ratio };
    if (ratio < -1) return { direction: 'declining', change: Math.abs(ratio) };
    return { direction: 'stable', change: 0 };
  },

  generateSentimentInsights(polarity: string, emotions: string[], trend: any): string[] {
    const insights = [];

    if (polarity === 'positive') {
      insights.push('Current interaction shows positive sentiment - good time for goal setting or progress tracking');
    } else if (polarity === 'negative') {
      insights.push('Current sentiment suggests need for support or motivation');
    }

    if (emotions.length > 1) {
      insights.push(`Multiple emotions detected (${emotions.join(', ')}) - suggests complex emotional state`);
    }

    if (trend.direction === 'improving') {
      insights.push('Sentiment trend is improving over recent interactions');
    } else if (trend.direction === 'declining') {
      insights.push('Sentiment trend shows decline - may benefit from encouragement or advice');
    }

    return insights;
  },

  assessGainsRecency(userState: any): string {
    if (!userState || !userState.lastInteraction) return 'unknown';

    const lastInteraction = new Date(userState.lastInteraction);
    const now = new Date();
    const hoursSince = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

    if (hoursSince < 24) return 'recent';
    if (hoursSince < 72) return 'moderate';
    return 'overdue';
  },

  assessStreakStatus(userState: any): string {
    if (!userState) return 'unknown';

    const streak = userState.currentStreak || 0;

    if (streak === 0) return 'no_streak';
    if (streak < 3) return 'building';
    if (streak < 7) return 'strong';
    return 'excellent';
  },

  assessEngagementLevel(history: any[]): string {
    if (history.length === 0) return 'new_user';
    if (history.length < 3) return 'low';
    if (history.length < 10) return 'moderate';
    return 'high';
  },

  findActiveTimeOfDay(history: any[]): string {
    if (history.length === 0) return 'unknown';

    const times = history.map(h => new Date(h.timestamp)).map(d => d.getHours());
    const timeRanges = {
      morning: times.filter(h => h >= 6 && h < 12).length,
      afternoon: times.filter(h => h >= 12 && h < 18).length,
      evening: times.filter(h => h >= 18 && h < 22).length,
      night: times.filter(h => h >= 22 || h < 6).length
    };

    const mostActive = Object.entries(timeRanges).reduce((a, b) =>
      timeRanges[a[0] as keyof typeof timeRanges] > timeRanges[b[0] as keyof typeof timeRanges] ? a : b
    );

    return mostActive[0];
  },

  extractCommonTopics(history: any[]): string[] {
    const topicCounts: Record<string, number> = {};

    history.forEach(entry => {
      const content = (entry.content || '').toLowerCase();
      const topics = ['work', 'health', 'learning', 'personal', 'finance'];

      topics.forEach(topic => {
        if (content.includes(topic)) {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });
    });

    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);
  },

  assessProgressFrequency(history: any[]): string {
    if (history.length === 0) return 'none';

    const gainsEntries = history.filter(h => h.type === 'gain');
    const ratio = gainsEntries.length / history.length;

    if (ratio > 0.5) return 'high';
    if (ratio > 0.2) return 'moderate';
    return 'low';
  },

  generateProgressRecommendations(indicators: any, patterns: any): string[] {
    const recommendations = [];

    if (indicators.gainsRecency === 'overdue') {
      recommendations.push('Consider logging recent accomplishments with track_gain');
    }

    if (indicators.streakStatus === 'no_streak') {
      recommendations.push('Start building momentum by tracking small daily wins');
    }

    if (patterns.progressFrequency === 'low') {
      recommendations.push('Increase progress tracking frequency for better accountability');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue current progress tracking patterns');
    }

    return recommendations;
  },

  hasQuestions(input: string): boolean {
    return input.includes('?') ||
           ['what', 'how', 'why', 'when', 'where', 'who'].some(q => input.includes(q));
  },

  hasActionWords(input: string): boolean {
    const actionWords = ['will', 'going to', 'plan to', 'want to', 'need to', 'should'];
    return actionWords.some(word => input.includes(word));
  },

  analyzeBehaviorPatterns(history: any[]): string[] {
    const patterns = [];

    if (history.length > 10) {
      patterns.push('Consistent engagement - regular user of accountability system');
    }

    const recentActivity = history.slice(0, 3);
    const gainEntries = recentActivity.filter(h => h.type === 'gain');

    if (gainEntries.length > recentActivity.length * 0.5) {
      patterns.push('Progress-focused - frequently logs accomplishments');
    }

    const questionEntries = recentActivity.filter(h =>
      (h.content || '').includes('?') || (h.content || '').includes('how')
    );

    if (questionEntries.length > 1) {
      patterns.push('Guidance-seeking - actively asks for advice and direction');
    }

    return patterns;
  },

  generateInsightBasedSuggestions(conversationInsights: string[], behaviorPatterns: string[]): string[] {
    const suggestions = [];

    if (conversationInsights.some(i => i.includes('seeking-oriented'))) {
      suggestions.push('Use get_mentor_advice for strategic guidance');
    }

    if (conversationInsights.some(i => i.includes('action-oriented'))) {
      suggestions.push('Focus on track_gain to document action taken');
    }

    if (behaviorPatterns.some(p => p.includes('progress-focused'))) {
      suggestions.push('Consider weekly accountability_checkin for pattern review');
    }

    return suggestions;
  },

  generateComprehensiveSummary(routing: any, sentiment: any, progress: any, insights: any): string {
    const primaryRoute = routing.primaryRoute;
    const sentimentText = sentiment.currentSentiment.polarity;
    const engagementLevel = progress.progressIndicators.engagementLevel;

    return `Conversation analysis suggests ${primaryRoute} as primary action with ${sentimentText} sentiment. User shows ${engagementLevel} engagement level with ${insights.conversationInsights.length} notable communication patterns identified.`;
  },

  generateActionRecommendations(analysisResult: any, conversationText: string): string[] {
    const recommendations = [];

    // Based on routing analysis
    if (analysisResult.routing?.primaryRoute) {
      const route = analysisResult.routing.primaryRoute;
      const routeRecommendations: Record<string, string> = {
        gains_tracking: 'Use track_gain to log this accomplishment',
        mentor_advice: 'Use get_mentor_advice for strategic guidance',
        quote_request: 'Use get_daily_quote for inspiration',
        goal_setting: 'Use set_goal to formalize this objective',
        check_in: 'Use accountability_checkin for structured reflection'
      };

      if (routeRecommendations[route]) {
        recommendations.push(routeRecommendations[route]);
      }
    }

    // Based on sentiment analysis
    if (analysisResult.sentiment?.currentSentiment.polarity === 'negative') {
      recommendations.push('Consider get_daily_quote for motivation boost');
    }

    // Based on progress analysis
    if (analysisResult.progress?.progressIndicators.gainsRecency === 'overdue') {
      recommendations.push('Log recent accomplishments to maintain momentum');
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Continue engaging with accountability tools regularly');
    }

    return recommendations;
  },

  // Format the analysis result
  formatAnalysisResult(
    analysisResult: any,
    analysisType: string,
    recommendations: string[],
    historyCount: number
  ): string {
    let response = `🧠 **Conversation Analysis Results**

**Analysis Type**: ${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}
**History Context**: ${historyCount} previous interactions
**Processed**: ${new Date().toLocaleString()}

`;

    switch (analysisType) {
      case 'routing':
        response += this.formatRoutingAnalysis(analysisResult);
        break;
      case 'sentiment':
        response += this.formatSentimentAnalysis(analysisResult);
        break;
      case 'progress':
        response += this.formatProgressAnalysis(analysisResult);
        break;
      case 'insights':
        response += this.formatInsightsAnalysis(analysisResult);
        break;
      case 'comprehensive':
        response += this.formatComprehensiveAnalysis(analysisResult);
        break;
    }

    if (recommendations.length > 0) {
      response += `

**🎯 Recommended Actions**:
${recommendations.map(r => `• ${r}`).join('\n')}`;
    }

    response += `

💡 **Next Steps**: Use the analysis insights to guide your next actions with Tiffany's accountability tools.`;

    return response;
  },

  formatRoutingAnalysis(result: any): string {
    return `**🎯 Primary Route**: ${result.primaryRoute} (${result.urgencyLevel} urgency)

**📊 Route Confidence**:
${result.suggestedRoutes.map((r: any) =>
  `• ${r.route}: ${Math.round(r.confidence * 100)}% - ${r.reasoning}`
).join('\n')}

**🔍 Contextual Factors**: ${result.contextualFactors.join(', ') || 'None detected'}`;
  },

  formatSentimentAnalysis(result: any): string {
    return `**😊 Current Sentiment**: ${result.currentSentiment.polarity} (${Math.round(result.currentSentiment.confidence * 100)}% confidence)

**💭 Emotions**: ${result.currentSentiment.emotions.join(', ') || 'None detected'}

**📈 Trend**: ${result.sentimentTrend.direction} ${result.sentimentTrend.change > 0 ? `(+${result.sentimentTrend.change})` : ''}

**💡 Insights**:
${result.insights.map((i: string) => `• ${i}`).join('\n')}`;
  },

  formatProgressAnalysis(result: any): string {
    return `**📊 Progress Indicators**:
• Gains recency: ${result.progressIndicators.gainsRecency}
• Streak status: ${result.progressIndicators.streakStatus}
• Engagement level: ${result.progressIndicators.engagementLevel}

**🔍 Patterns**:
• Most active: ${result.patterns.activeTimeOfDay}
• Common topics: ${result.patterns.commonTopics.join(', ') || 'None identified'}
• Progress frequency: ${result.patterns.progressFrequency}

**💡 Recommendations**:
${result.recommendations.map((r: string) => `• ${r}`).join('\n')}`;
  },

  formatInsightsAnalysis(result: any): string {
    return `**💡 Conversation Insights**:
${result.conversationInsights.map((i: string) => `• ${i}`).join('\n')}

**🔍 Behavior Patterns**:
${result.behaviorPatterns.map((p: string) => `• ${p}`).join('\n')}

**🎯 Suggestions**:
${result.suggestions.map((s: string) => `• ${s}`).join('\n')}`;
  },

  formatComprehensiveAnalysis(result: any): string {
    return `**📋 Summary**: ${result.summary}

**🎯 Primary Route**: ${result.routing.primaryRoute}
**😊 Sentiment**: ${result.sentiment.currentSentiment.polarity}
**📊 Engagement**: ${result.progress.progressIndicators.engagementLevel}

**🔍 Key Insights**:
${result.insights.conversationInsights.concat(result.insights.behaviorPatterns).slice(0, 3).map((i: string) => `• ${i}`).join('\n')}`;
  }
};

// Export for use in main MCP server
export default analyzeConversationTool;