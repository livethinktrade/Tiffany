// Check Gains Submission Tool - Verify if user submitted gains today
// Part of scheduling & automation tools implementation

import { z } from 'zod';
import { ToolResponse } from '../../types/tiffany-types.js';

// Zod schema for input validation
const CheckGainsSubmissionSchema = z.object({
  userId: z.string().optional(), // Specific user ID, or check generally
  targetDate: z.string().optional(), // ISO date string, defaults to today in Central Time
  includeDetails: z.boolean().optional().default(false), // Include full submission details
  checkAllUsers: z.boolean().optional().default(false) // Check submissions from all users for analytics
});

export const checkGainsSubmissionTool = {
  name: 'check_gains_submission',
  description: 'Verify if user submitted gains today to prevent duplicate requests and enable intelligent automation',
  schema: CheckGainsSubmissionSchema,

  async execute(args: z.infer<typeof CheckGainsSubmissionSchema>): Promise<ToolResponse> {
    try {
      const {
        userId,
        targetDate,
        includeDetails = false,
        checkAllUsers = false
      } = args;

      // Get target date in Central Time Zone
      const centralDate = checkGainsSubmissionTool.getCentralTimeDate(targetDate);

      // Query Airtable for gains submissions
      const submissionCheck = await checkGainsSubmissionTool.checkAirtableSubmissions({
        userId,
        targetDate: centralDate,
        includeDetails,
        checkAllUsers
      });

      // Generate result based on findings
      const result = checkGainsSubmissionTool.generateSubmissionResult(submissionCheck, {
        userId,
        targetDate: centralDate,
        includeDetails,
        checkAllUsers
      });

      return {
        content: [{
          type: 'text',
          text: `📊 **Gains Submission Check**\n\n${result.summary}\n\n---\n\n**Check Details:**\n- Date: ${centralDate}\n- User: ${userId || 'All users'}\n- Found: ${result.submissionCount} submission(s)\n- Status: ${result.hasSubmitted ? '✅ Submitted' : '❌ Not submitted'}`
        }],
        metadata: {
          toolName: 'check_gains_submission',
          submissionCheck: {
            hasSubmitted: result.hasSubmitted,
            submissionCount: result.submissionCount,
            targetDate: centralDate,
            userId: userId || null,
            lastSubmissionDate: result.lastSubmissionDate,
            reason: result.reason
          },
          checkParameters: {
            userId,
            targetDate: centralDate,
            includeDetails,
            checkAllUsers
          },
          automationReady: true // This result can be used by automation systems
        }
      };

    } catch (error) {
      console.error('Error checking gains submission:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ **Gains submission check failed**: ${error.message}\n\nUnable to verify submission status. Default assumption: Not submitted (safe for automation).`
        }],
        isError: true,
        metadata: {
          toolName: 'check_gains_submission',
          error: error.message,
          fallback: {
            hasSubmitted: false, // Safe default for automation
            reason: 'Check failed - assuming not submitted for safety'
          }
        }
      };
    }
  },

  // Helper method to get date in Central Time Zone
  getCentralTimeDate(targetDate?: string): string {
    let dateToCheck: Date;

    if (targetDate) {
      dateToCheck = new Date(targetDate);

      // Validate the date
      if (isNaN(dateToCheck.getTime())) {
        throw new Error(`Invalid date format: ${targetDate}. Please use ISO date format (YYYY-MM-DD) or valid date string.`);
      }
    } else {
      // Get current time in Central Time Zone
      const now = new Date();
      // Create a new date in Central timezone
      const centralTime = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now);

      // centralTime is in YYYY-MM-DD format
      const [year, month, day] = centralTime.split('-');
      return `${month}/${day}/${year}`;
    }

    // Format as YYYY-MM-DD first
    const centralDateString = dateToCheck.toISOString().split('T')[0];

    // Convert to MM/DD/YYYY format that Airtable uses
    const [year, month, day] = centralDateString.split('-');
    return `${month}/${day}/${year}`;
  },

  // Check Airtable for gains submissions
  async checkAirtableSubmissions(params: {
    userId?: string,
    targetDate: string,
    includeDetails: boolean,
    checkAllUsers: boolean
  }): Promise<any> {
    const { targetDate, includeDetails, checkAllUsers } = params;

    // Build Airtable query
    const baseUrl = 'https://api.airtable.com/v0';
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = 'Daily_Gains';
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      throw new Error('Missing Airtable configuration (BASE_ID or API_KEY)');
    }

    // Create filter formula for target date
    let filterFormula = `{Date} = "${targetDate}"`;

    // Note: Current Daily_Gains schema doesn't include User_ID field
    // User filtering is not supported with current schema
    if (params.userId && !checkAllUsers) {
      console.log(`⚠️ User filtering requested but not supported by current Daily_Gains schema`);
      console.log(`   Checking all submissions for date: ${targetDate}`);
    }

    const encodedFormula = encodeURIComponent(filterFormula);
    const queryUrl = `${baseUrl}/${baseId}/${tableName}?filterByFormula=${encodedFormula}`;

    console.log(`🔍 Checking gains submissions for date: ${targetDate}`);
    if (params.userId) console.log(`👤 User filter: ${params.userId}`);

    const response = await fetch(queryUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable query failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Process results
    const records = data.records || [];

    console.log(`📊 Found ${records.length} submission(s) for ${targetDate}`);

    return {
      records,
      count: records.length,
      targetDate,
      includeDetails: includeDetails ? records.map(r => ({
        id: r.id,
        fields: r.fields,
        createdTime: r.createdTime
      })) : null
    };
  },

  // Generate submission result with business logic
  generateSubmissionResult(airtableResult: any, checkParams: any): any {
    const { records, count, targetDate } = airtableResult;
    const { userId, checkAllUsers } = checkParams;

    // Determine if submissions exist
    const hasSubmitted = count > 0;

    // Get most recent submission if any
    let lastSubmissionDate = null;
    if (records.length > 0) {
      // Sort by created time and get the most recent
      const sortedRecords = records.sort((a: any, b: any) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      );
      lastSubmissionDate = sortedRecords[0].createdTime;
    }

    // Generate reason/explanation
    let reason: string;
    let summary: string;

    if (hasSubmitted) {
      if (checkAllUsers || !userId) {
        reason = `Found ${count} submission(s) on ${targetDate}`;
        summary = `📈 ${count} submission(s) found for ${targetDate}`;
      } else if (userId) {
        // Note: User-specific filtering not supported by current schema
        reason = `Found ${count} submission(s) on ${targetDate} (user filtering not supported by current schema)`;
        summary = `⚠️ Found ${count} submission(s) for ${targetDate} - user-specific check not available with current schema`;
      }
    } else {
      if (checkAllUsers || !userId) {
        reason = `No submissions found on ${targetDate}`;
        summary = `📭 No gains submissions found for ${targetDate}`;
      } else if (userId) {
        // Note: User-specific filtering not supported by current schema
        reason = `No submissions found on ${targetDate} (user filtering not supported by current schema)`;
        summary = `❌ No submissions found for ${targetDate} - cannot verify user-specific submission with current schema`;
      }
    }

    return {
      hasSubmitted,
      submissionCount: count,
      lastSubmissionDate,
      reason,
      summary,
      targetDate,
      records: airtableResult.includeDetails ? airtableResult.includeDetails : undefined
    };
  },

  // Helper method for automation integration
  shouldSendReminder(hasSubmitted: boolean, submissionCount: number): boolean {
    // Business logic: Send reminder if no submissions today
    return !hasSubmitted || submissionCount === 0;
  },

  // Helper method to get submission analytics
  async getSubmissionAnalytics(days: number = 7): Promise<any> {
    const analytics = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const dateString = checkGainsSubmissionTool.getCentralTimeDate(checkDate.toISOString());

      try {
        const dayResult = await checkGainsSubmissionTool.checkAirtableSubmissions({
          targetDate: dateString,
          includeDetails: false,
          checkAllUsers: true
        });

        analytics.push({
          date: dateString,
          submissionCount: dayResult.count,
          hasSubmissions: dayResult.count > 0
        });
      } catch (error) {
        analytics.push({
          date: dateString,
          submissionCount: 0,
          hasSubmissions: false,
          error: error.message
        });
      }
    }

    return analytics;
  }
};

export default checkGainsSubmissionTool;