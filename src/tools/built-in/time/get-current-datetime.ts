/**
 * Get Current Date/Time Built-in Tool for Bibble
 * Provides current date and time with timezone support
 */

import { z } from 'zod';
import { BuiltInTool, ToolResult } from '../types/index.js';
import { Config } from '../../../config/config.js';

/**
 * Validates if a timezone identifier is supported
 */
function isValidTimezone(timezone: string): boolean {
  try {
    // Use Intl.supportedValuesOf to get all supported timezones if available
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      const supportedTimezones = (Intl as any).supportedValuesOf('timeZone');
      return supportedTimezones.includes(timezone);
    }
    
    // Fallback: Try to create a date and format it in the timezone
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the default timezone from Bibble configuration or defaults to UTC
 */
function getDefaultTimezone(): string {
  try {
    const config = Config.getInstance();
    const configuredTimezone = config.get('timezone.default') as string;
    
    // If user has explicitly set a timezone (not 'auto'), use it
    if (configuredTimezone && configuredTimezone !== 'auto' && isValidTimezone(configuredTimezone)) {
      return configuredTimezone;
    }
    
    // If set to 'auto', use system detection
    if (configuredTimezone === 'auto') {
      // First try environment variable
      if (process.env.TZ && isValidTimezone(process.env.TZ)) {
        return process.env.TZ;
      }
      
      // Try to detect system timezone
      const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (systemTimezone && isValidTimezone(systemTimezone)) {
        return systemTimezone;
      }
    }
    
    // If no configuration is set or 'auto' detection fails, default to UTC
  } catch (error) {
    // Fallback if config loading fails
    console.warn('Failed to load timezone configuration:', error);
  }
  
  return 'UTC';
}

/**
 * Formats date in specified timezone with offset info
 */
function formatDateTimeWithTimezone(date: Date, timezone: string): { dateTime: string; offset: string; tzName: string } {
  try {
    // Get timezone offset and name
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'longOffset',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const partsMap = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as any);
    
    // Construct ISO-like format
    const dateTime = `${partsMap.year}-${partsMap.month}-${partsMap.day}T${partsMap.hour}:${partsMap.minute}:${partsMap.second}`;
    const offset = partsMap.timeZoneName || '';
    
    // Get timezone abbreviation if possible
    const shortFormatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const shortName = shortFormatter.formatToParts(date).find(p => p.type === 'timeZoneName')?.value || timezone;
    
    return { 
      dateTime: `${dateTime}${offset}`, 
      offset: offset,
      tzName: shortName 
    };
  } catch (error) {
    // Fallback to basic formatting
    const utcTime = date.toISOString();
    return { 
      dateTime: utcTime, 
      offset: 'Z',
      tzName: timezone 
    };
  }
}

/**
 * Execute get current datetime function
 */
async function executeGetCurrentDateTime(params: { timezone?: string }): Promise<ToolResult> {
  try {
    const requestedTimezone = params.timezone;
    let timezone: string;
    
    if (requestedTimezone) {
      // User provided a timezone parameter - validate it
      if (!isValidTimezone(requestedTimezone)) {
        return {
          success: false,
          error: `Invalid timezone: ${requestedTimezone}. Please use a valid IANA timezone identifier (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo').`
        };
      }
      timezone = requestedTimezone;
    } else {
      // Use default timezone from system or fallback to UTC
      timezone = getDefaultTimezone();
    }
    
    const now = new Date();
    let formattedDateTime: string;
    let timezoneDisplayName: string;
    
    if (timezone === 'UTC') {
      // For UTC, use the standard ISO format
      formattedDateTime = now.toISOString();
      timezoneDisplayName = 'UTC';
    } else {
      // For other timezones, format with timezone info
      const { dateTime, tzName } = formatDateTimeWithTimezone(now, timezone);
      formattedDateTime = dateTime;
      timezoneDisplayName = `${timezone} (${tzName})`;
    }
    
    // Create detailed response
    const responseText = requestedTimezone 
      ? `The current date and time in ${timezoneDisplayName} is: ${formattedDateTime}`
      : `The current date and time is: ${formattedDateTime} (${timezoneDisplayName})`;
    
    // Add additional context for LLM
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });
    const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: timezone });
    
    const contextualInfo = `
${responseText}

Additional context:
- Day of week: ${dayOfWeek}
- Month: ${monthYear}
- Timezone: ${timezoneDisplayName}
- Unix timestamp: ${Math.floor(now.getTime() / 1000)}
- ISO format: ${now.toISOString()}`;

    return {
      success: true,
      data: {
        dateTime: formattedDateTime,
        timezone: timezone,
        timezoneDisplay: timezoneDisplayName,
        unixTimestamp: Math.floor(now.getTime() / 1000),
        isoString: now.toISOString(),
        dayOfWeek: dayOfWeek,
        monthYear: monthYear
      },
      message: contextualInfo.trim()
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to get current datetime: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get Current DateTime Built-in Tool Definition
 */
export const getCurrentDateTimeTool: BuiltInTool = {
  name: 'get_current_datetime',
  description: 'Get the current server date and time. Optionally specify a timezone (e.g., \'America/New_York\', \'Europe/London\', \'Asia/Tokyo\'). Defaults to server\'s configured timezone or UTC.',
  category: 'time',
  parameters: z.object({
    timezone: z.string().optional().describe('Optional timezone identifier (e.g., \'America/New_York\', \'Europe/London\', \'Asia/Tokyo\'). If not provided, uses the server\'s default timezone or UTC.')
  }).strict(),
  async execute(params: { timezone?: string }): Promise<ToolResult> {
    return await executeGetCurrentDateTime(params);
  }
};
