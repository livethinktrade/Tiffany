// Airtable Integration Service for Tiffany MCP
// Preserves n8n workflow data schema and field mappings

import {
  Gain,
  Quote,
  TiffanyUserState,
  MemoryEntry,
  Goal,
  AirtableRecord,
  AirtableCreateRequest,
  AirtableResponse,
  ToolError
} from '../types/tiffany-types.js';

export class AirtableService {
  private baseUrl: string;
  private apiKey: string;
  private baseId: string;

  // Table mappings from actual Airtable schema (discovered via API)
  private tables = {
    gains: 'Daily_Gains', // Store Gains table
    userState: 'User_State', // Store User State table
    quotes: 'Inspirational_Quotes', // Quote collection table
    wishlist: 'Wishlist', // Wishlist table
    kpi: 'KPI_Tracking' // KPI tracking table
  };

  constructor() {
    this.baseUrl = 'https://api.airtable.com/v0';
    this.apiKey = process.env.AIRTABLE_API_KEY || '';
    this.baseId = process.env.AIRTABLE_BASE_ID || '';

    if (!this.apiKey || !this.baseId) {
      console.warn('Airtable credentials not configured');
    }
  }

  // Generic request method with error handling and rate limiting
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    if (!this.apiKey || !this.baseId) {
      throw new Error('Airtable credentials not configured');
    }

    const url = `${this.baseUrl}/${this.baseId}/${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Airtable request failed:', error);
      throw this.createToolError('AIRTABLE_REQUEST_FAILED', error.message, { endpoint, method });
    }
  }

  // Gains Management - Using actual Daily_Gains schema
  async storeGain(gain: Gain): Promise<AirtableRecord> {
    // Get today's date in Central Time Zone
    const centralTime = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/');
    const todayCST = `${centralTime[2]}-${centralTime[0]}-${centralTime[1]}`; // YYYY-MM-DD format

    // Map impact to mood context (Good, Neutral, Struggling)
    const moodMapping = {
      'large': 'Good',
      'medium': 'Good',
      'small': 'Neutral'
      // 'Struggling' would be used for negative impacts if supported
    };

    const gainRecord = {
      records: [{
        fields: {
          'Date': todayCST,
          'Gain_1': gain.description,
          'User_Response': gain.reflection || `${gain.category} - ${gain.description}`,
          'Mood_Context': moodMapping[gain.impact as keyof typeof moodMapping] || 'Good'
          // Note: Gain_2 and Gain_3 would be used for multiple gains per day
        }
      }]
    };

    const response = await this.makeRequest<AirtableResponse>(
      'POST',
      this.tables.gains,
      gainRecord
    );

    return response.records[0];
  }

  async getGainsByUser(userId: string, limit: number = 50): Promise<Gain[]> {
    const filterFormula = `{User ID} = "${userId}"`;
    const endpoint = `${this.tables.gains}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=${limit}&sort[0][field]=Timestamp&sort[0][direction]=desc`;

    const response = await this.makeRequest<AirtableResponse>('GET', endpoint);

    return response.records.map(record => ({
      id: record.fields['ID'] as string,
      description: record.fields['Description'] as string,
      category: record.fields['Category'] as string,
      impact: record.fields['Impact'] as 'small' | 'medium' | 'large',
      points: record.fields['Points'] as number,
      userId: record.fields['User ID'] as string,
      timestamp: record.fields['Timestamp'] as string,
      airtableId: record.id,
      tags: record.fields['Tags'] ? (record.fields['Tags'] as string).split(', ') : undefined,
      reflection: record.fields['Reflection'] as string || undefined
    }));
  }

  // User State Management
  async storeUserState(userState: TiffanyUserState): Promise<AirtableRecord> {
    // Check if user state already exists
    const existingState = await this.getUserState(userState.id);

    const stateRecord = {
      'User ID': userState.id,
      'Last Interaction': userState.lastInteraction,
      'Gains Count': userState.gainsCount,
      'Current Streak': userState.currentStreak,
      'Total Points': userState.totalPoints,
      'Memory Context': JSON.stringify(userState.memoryContext),
      'Preferences': JSON.stringify(userState.preferences),
      'Goals': JSON.stringify(userState.goals),
      'Created At': userState.createdAt,
      'Updated At': userState.updatedAt
    };

    if (existingState) {
      // Update existing record
      const response = await this.makeRequest<AirtableRecord>(
        'PATCH',
        `${this.tables.userState}/${existingState.airtableId}`,
        { fields: stateRecord }
      );
      return response;
    } else {
      // Create new record
      const response = await this.makeRequest<AirtableResponse>(
        'POST',
        this.tables.userState,
        { records: [{ fields: stateRecord }] }
      );
      return response.records[0];
    }
  }

  async getUserState(userId: string): Promise<TiffanyUserState | null> {
    const filterFormula = `{User ID} = "${userId}"`;
    const endpoint = `${this.tables.userState}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`;

    try {
      const response = await this.makeRequest<AirtableResponse>('GET', endpoint);

      if (response.records.length === 0) {
        return null;
      }

      const record = response.records[0];
      return {
        id: record.fields['User ID'] as string,
        lastInteraction: record.fields['Last Interaction'] as string,
        gainsCount: record.fields['Gains Count'] as number,
        currentStreak: record.fields['Current Streak'] as number,
        totalPoints: record.fields['Total Points'] as number,
        memoryContext: JSON.parse(record.fields['Memory Context'] as string || '[]'),
        preferences: JSON.parse(record.fields['Preferences'] as string || '{}'),
        goals: JSON.parse(record.fields['Goals'] as string || '[]'),
        createdAt: record.fields['Created At'] as string,
        updatedAt: record.fields['Updated At'] as string,
        airtableId: record.id
      } as TiffanyUserState & { airtableId: string };
    } catch (error) {
      console.error('Error fetching user state:', error);
      return null;
    }
  }

  // Quote Management - Updated to work with actual Airtable schema
  async storeQuote(quote: Quote): Promise<AirtableRecord> {
    // Only use fields that actually exist in the Inspirational_Quotes table:
    // - Quote (text content)
    // - Author (who said it)
    // - Lesson Category (the category)
    // - Used_Date (when last used) - not set on creation

    const quoteRecord = {
      records: [{
        fields: {
          'Quote': quote.text,
          'Author': quote.author || 'Anonymous',
          'Lesson Category': quote.category || 'General'
          // Used_Date is omitted - will be set when quote is first used
        }
      }]
    };

    const response = await this.makeRequest<AirtableResponse>(
      'POST',
      this.tables.quotes,
      quoteRecord
    );

    return response.records[0];
  }

  async getRandomQuote(
    category?: string,
    style?: string,
    excludeUsed: boolean = false
  ): Promise<Quote | null> {
    let filterFormula = '';
    const filters: string[] = [];

    if (category) {
      filters.push(`{Category} = "${category}"`);
    }
    if (style) {
      filters.push(`{Style} = "${style}"`);
    }
    if (excludeUsed) {
      filters.push(`{Used} = FALSE()`);
    }

    if (filters.length > 0) {
      filterFormula = `AND(${filters.join(', ')})`;
    }

    const endpoint = filterFormula
      ? `${this.tables.quotes}?filterByFormula=${encodeURIComponent(filterFormula)}`
      : this.tables.quotes;

    try {
      const response = await this.makeRequest<AirtableResponse>('GET', endpoint);

      if (response.records.length === 0) {
        return null;
      }

      // Select random quote from results
      const randomIndex = Math.floor(Math.random() * response.records.length);
      const record = response.records[randomIndex];

      return {
        id: record.fields['ID'] as string,
        text: record.fields['Text'] as string,
        author: record.fields['Author'] as string,
        category: record.fields['Category'] as string,
        style: record.fields['Style'] as 'inspirational' | 'practical' | 'philosophical',
        used: record.fields['Used'] as boolean,
        usageCount: record.fields['Usage Count'] as number,
        lastUsed: record.fields['Last Used'] as string || undefined,
        tags: record.fields['Tags'] ? (record.fields['Tags'] as string).split(', ') : undefined,
        personalizedFor: record.fields['Personalized For'] as string || undefined,
        airtableId: record.id
      } as Quote & { airtableId: string };
    } catch (error) {
      console.error('Error fetching random quote:', error);
      return null;
    }
  }

  // Get multiple quotes with filtering (needed by get_random_quote tool)
  // Using actual Airtable schema: "Quote", "Author", "Lesson Category", "Used_Date"
  async getQuotes(options: {
    category?: string;
    style?: 'inspirational' | 'practical' | 'philosophical';
    excludeIds?: string[];
    onlyUnused?: boolean;
    limit?: number;
  } = {}): Promise<Quote[]> {
    const { category, style, excludeIds, onlyUnused, limit = 50 } = options;

    // Build filter formula based on actual Airtable schema
    const filters: string[] = [];

    // Category filter - map to actual "Lesson Category" field
    if (category) {
      filters.push(`{Lesson Category} = "${category}"`);
    }

    // Style filter - not available in current schema, so skip
    // The n8n workflow probably doesn't use style filtering

    // Only unused filter - check if Used_Date is empty
    if (onlyUnused) {
      filters.push(`{Used_Date} = ""`);
    }

    // ExcludeIds filter - use record ID since there's no custom ID field
    if (excludeIds && excludeIds.length > 0) {
      const excludeFilters = excludeIds.map(id => `RECORD_ID() != "${id}"`);
      filters.push(...excludeFilters);
    }

    let filterFormula = '';
    if (filters.length > 0) {
      filterFormula = filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`;
    }

    const endpoint = filterFormula
      ? `${this.tables.quotes}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=${limit}`
      : `${this.tables.quotes}?maxRecords=${limit}`;

    try {
      const response = await this.makeRequest<AirtableResponse>('GET', endpoint);

      return response.records.map(record => {
        // Parse Used_Date to determine if quote has been used recently
        const usedDate = record.fields['Used_Date'] as string || '';
        const hasBeenUsed = !!usedDate;

        return {
          // Use Airtable record ID as the quote ID since no custom ID field exists
          id: record.id,
          text: record.fields['Quote'] as string,
          author: record.fields['Author'] as string,
          category: record.fields['Lesson Category'] as string,
          // Default style since not in schema - could be inferred from category later
          style: 'inspirational' as const,
          used: hasBeenUsed,
          usageCount: hasBeenUsed ? 1 : 0,
          lastUsed: usedDate || undefined,
          tags: undefined, // Not in current schema
          personalizedFor: undefined, // Not in current schema
          airtableId: record.id,
          // Additional fields with defaults
          rating: null,
          ratingCount: 0,
          usedBy: [],
          language: 'en',
          addedBy: 'system',
          verified: true, // Assume curated quotes are verified
          publicDomain: false,
          createdAt: record.createdTime || new Date().toISOString(),
          updatedAt: usedDate || record.createdTime || new Date().toISOString()
        } as Quote & { airtableId: string };
      });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }

  // Get quotes with intelligent time-based prioritization (avoids recent repeats)
  async getQuotesWithTimePrioritization(options: {
    category?: string;
    style?: 'inspirational' | 'practical' | 'philosophical';
    excludeIds?: string[];
    limit?: number;
  } = {}): Promise<Quote[]> {
    const { category, style, excludeIds, limit = 50 } = options;

    // Build filter formula (no onlyUnused filter - we want all quotes for time-based sorting)
    const filters: string[] = [];

    if (category) {
      filters.push(`{Lesson Category} = "${category}"`);
    }

    // Style filter skipped since not in schema

    // ExcludeIds filter - use record ID since there's no custom ID field
    if (excludeIds && excludeIds.length > 0) {
      const excludeFilters = excludeIds.map(id => `RECORD_ID() != "${id}"`);
      filters.push(...excludeFilters);
    }

    let filterFormula = '';
    if (filters.length > 0) {
      filterFormula = filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`;
    }

    // Get all matching quotes (no maxRecords limit initially for proper sorting)
    const endpoint = filterFormula
      ? `${this.tables.quotes}?filterByFormula=${encodeURIComponent(filterFormula)}`
      : this.tables.quotes;

    try {
      const response = await this.makeRequest<AirtableResponse>('GET', endpoint);

      const quotes = response.records.map(record => {
        const usedDate = record.fields['Used_Date'] as string || '';
        const hasBeenUsed = !!usedDate;

        return {
          id: record.id,
          text: record.fields['Quote'] as string,
          author: record.fields['Author'] as string,
          category: record.fields['Lesson Category'] as string,
          style: 'inspirational' as const,
          used: hasBeenUsed,
          usageCount: hasBeenUsed ? 1 : 0,
          lastUsed: usedDate || undefined,
          tags: undefined,
          personalizedFor: undefined,
          airtableId: record.id,
          rating: null,
          ratingCount: 0,
          usedBy: [],
          language: 'en',
          addedBy: 'system',
          verified: true,
          publicDomain: false,
          createdAt: record.createdTime || new Date().toISOString(),
          updatedAt: usedDate || record.createdTime || new Date().toISOString(),
          // Add calculated fields for prioritization
          daysSinceUsed: this.calculateDaysSinceUsed(usedDate),
          priority: this.calculateQuotePriority(usedDate)
        } as Quote & {
          airtableId: string;
          daysSinceUsed: number;
          priority: number;
        };
      });

      // Sort by priority (highest first) - never used quotes get highest priority
      quotes.sort((a: any, b: any) => b.priority - a.priority);

      // Return up to the requested limit
      return quotes.slice(0, limit);

    } catch (error) {
      console.error('Error fetching quotes with time prioritization:', error);
      return [];
    }
  }

  // Calculate how many days since a quote was last used
  private calculateDaysSinceUsed(usedDate: string): number {
    if (!usedDate) {
      return Infinity; // Never used
    }

    const used = new Date(usedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - used.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Calculate priority score for quote selection (higher = more likely to be selected)
  private calculateQuotePriority(usedDate: string): number {
    if (!usedDate) {
      return 1000; // Never used quotes get highest priority
    }

    const daysSince = this.calculateDaysSinceUsed(usedDate);

    // Exponential decay - recent quotes get very low priority
    if (daysSince < 7) {
      return 1; // Very low priority for quotes used in last week
    } else if (daysSince < 30) {
      return daysSince * 2; // Moderate priority for quotes used in last month
    } else if (daysSince < 90) {
      return daysSince * 5; // Good priority for quotes used in last 3 months
    } else {
      return daysSince * 10; // High priority for quotes not used in 3+ months
    }
  }

  // Add quote to database (helper method for adding new quotes)
  async addQuote(quote: Quote): Promise<AirtableRecord> {
    return await this.storeQuote(quote);
  }

  async updateQuoteUsage(quoteId: string, userId?: string): Promise<void> {
    // quoteId is the Airtable record ID (since we use record.id as the quote ID)
    // Update the Used_Date field to mark the quote as used in Central Time

    // Get current time in Central Time Zone (same logic as in storeGain)
    const centralTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Convert to ISO format for Airtable storage
    const centralTimeISO = new Date(centralTime).toISOString();

    await this.makeRequest<AirtableRecord>(
      'PATCH',
      `${this.tables.quotes}/${quoteId}`,
      {
        fields: {
          'Used_Date': centralTimeISO
        }
      }
    );
  }

  // Conversation and Memory Management
  async storeMemoryEntry(entry: MemoryEntry): Promise<AirtableRecord> {
    const memoryRecord = {
      records: [{
        fields: {
          'ID': entry.id,
          'User ID': entry.userId,
          'Content': entry.content,
          'Timestamp': entry.timestamp,
          'Type': entry.type,
          'Importance': entry.importance,
          'Metadata': JSON.stringify(entry.metadata || {}),
          'Created Date': new Date().toISOString().split('T')[0]
        }
      }]
    };

    const response = await this.makeRequest<AirtableResponse>(
      'POST',
      this.tables.conversations,
      memoryRecord
    );

    return response.records[0];
  }

  async getMemoryEntries(
    userId: string,
    limit: number = 20,
    type?: string
  ): Promise<MemoryEntry[]> {
    let filterFormula = `{User ID} = "${userId}"`;
    if (type) {
      filterFormula = `AND({User ID} = "${userId}", {Type} = "${type}")`;
    }

    const endpoint = `${this.tables.conversations}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=${limit}&sort[0][field]=Timestamp&sort[0][direction]=desc`;

    const response = await this.makeRequest<AirtableResponse>('GET', endpoint);

    return response.records.map(record => ({
      id: record.fields['ID'] as string,
      userId: record.fields['User ID'] as string,
      content: record.fields['Content'] as string,
      timestamp: record.fields['Timestamp'] as string,
      type: record.fields['Type'] as MemoryEntry['type'],
      importance: record.fields['Importance'] as 'low' | 'medium' | 'high',
      metadata: JSON.parse(record.fields['Metadata'] as string || '{}'),
      airtableId: record.id
    }));
  }

  // Goal Management
  async storeGoal(goal: Goal): Promise<AirtableRecord> {
    const goalRecord = {
      records: [{
        fields: {
          'ID': goal.id,
          'Description': goal.description,
          'Deadline': goal.deadline || '',
          'Priority': goal.priority,
          'Status': goal.status,
          'Progress': goal.progress,
          'Category': goal.category,
          'User ID': goal.userId,
          'Milestones': JSON.stringify(goal.milestones),
          'Created At': goal.createdAt,
          'Updated At': goal.updatedAt
        }
      }]
    };

    const response = await this.makeRequest<AirtableResponse>(
      'POST',
      this.tables.goals,
      goalRecord
    );

    return response.records[0];
  }

  async getGoalsByUser(userId: string, status?: string): Promise<Goal[]> {
    let filterFormula = `{User ID} = "${userId}"`;
    if (status) {
      filterFormula = `AND({User ID} = "${userId}", {Status} = "${status}")`;
    }

    const endpoint = `${this.tables.goals}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=Created At&sort[0][direction]=desc`;

    const response = await this.makeRequest<AirtableResponse>('GET', endpoint);

    return response.records.map(record => ({
      id: record.fields['ID'] as string,
      description: record.fields['Description'] as string,
      deadline: record.fields['Deadline'] as string || undefined,
      priority: record.fields['Priority'] as 'low' | 'medium' | 'high' | 'critical',
      status: record.fields['Status'] as 'active' | 'completed' | 'paused' | 'cancelled',
      progress: record.fields['Progress'] as number,
      category: record.fields['Category'] as string,
      userId: record.fields['User ID'] as string,
      milestones: JSON.parse(record.fields['Milestones'] as string || '[]'),
      createdAt: record.fields['Created At'] as string,
      updatedAt: record.fields['Updated At'] as string,
      airtableId: record.id
    }));
  }

  // Health check and connection testing
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<AirtableResponse>('GET', `${this.tables.userState}?maxRecords=1`);
      return true;
    } catch (error) {
      console.error('Airtable connection test failed:', error);
      return false;
    }
  }

  // Get statistics for monitoring
  async getDatabaseStats(): Promise<{
    totalGains: number;
    totalUsers: number;
    totalQuotes: number;
    totalGoals: number;
    lastActivity: string;
  }> {
    try {
      const [gainsResponse, usersResponse, quotesResponse, goalsResponse] = await Promise.all([
        this.makeRequest<AirtableResponse>('GET', `${this.tables.gains}?maxRecords=1`),
        this.makeRequest<AirtableResponse>('GET', `${this.tables.userState}?maxRecords=1`),
        this.makeRequest<AirtableResponse>('GET', `${this.tables.quotes}?maxRecords=1`),
        this.makeRequest<AirtableResponse>('GET', `${this.tables.goals}?maxRecords=1`)
      ]);

      return {
        totalGains: gainsResponse.records.length,
        totalUsers: usersResponse.records.length,
        totalQuotes: quotesResponse.records.length,
        totalGoals: goalsResponse.records.length,
        lastActivity: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalGains: 0,
        totalUsers: 0,
        totalQuotes: 0,
        totalGoals: 0,
        lastActivity: 'Unknown'
      };
    }
  }

  // Error handling helper
  private createToolError(code: string, message: string, details?: any): ToolError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    };
  }

  // Batch operations for efficiency
  async storeMultipleGains(gains: Gain[]): Promise<AirtableRecord[]> {
    const batchSize = 10; // Airtable limit
    const results: AirtableRecord[] = [];

    for (let i = 0; i < gains.length; i += batchSize) {
      const batch = gains.slice(i, i + batchSize);
      const batchRequest = {
        records: batch.map(gain => ({
          fields: {
            'ID': gain.id,
            'Description': gain.description,
            'Category': gain.category,
            'Impact': gain.impact,
            'Points': gain.points,
            'User ID': gain.userId,
            'Timestamp': gain.timestamp,
            'Tags': gain.tags?.join(', ') || '',
            'Reflection': gain.reflection || ''
          }
        }))
      };

      const response = await this.makeRequest<AirtableResponse>(
        'POST',
        this.tables.gains,
        batchRequest
      );

      results.push(...response.records);
    }

    return results;
  }

  // Data migration helpers for preserving n8n workflow data
  async migrateFromN8NFormat(legacyData: any[]): Promise<void> {
    console.log('Starting data migration from n8n format...');

    for (const record of legacyData) {
      try {
        // Map n8n fields to Airtable schema
        if (record.type === 'gain') {
          await this.storeGain({
            id: record.id || `gain_${Date.now()}`,
            description: record.description,
            category: record.category || 'general',
            impact: record.impact || 'medium',
            points: record.points || 3,
            userId: record.userId || 'default',
            timestamp: record.timestamp || new Date().toISOString()
          });
        }
        // Add other record type migrations as needed
      } catch (error) {
        console.error(`Migration failed for record ${record.id}:`, error);
      }
    }

    console.log('Data migration completed');
  }
}