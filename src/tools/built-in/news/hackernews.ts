/**
 * Hacker News Tool using Hacker News API
 * Built-in tool for getting latest news from Hacker News
 */

import { z } from 'zod';
import axios from 'axios';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { createErrorResult, createSuccessResult } from '../utilities/common.js';
import { checkRateLimit } from '../utilities/security.js';

// Hacker News API interfaces
export interface HackerNewsStory {
  id: number;
  title: string;
  url?: string;
  text?: string;
  score: number;
  by: string;
  descendants: number;
  time: number;
  type: 'story' | 'comment' | 'job' | 'poll' | 'pollopt';
  kids?: number[];
  dead?: boolean;
  deleted?: boolean;
  timeAgo: string;
  domain?: string;
}

export interface HackerNewsUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

export interface HackerNewsComment {
  id: number;
  by: string;
  text: string;
  time: number;
  parent: number;
  kids?: number[];
  dead?: boolean;
  deleted?: boolean;
  timeAgo: string;
}

// Parameter schemas
const GetHackerNewsSchema = z.object({
  storyType: z.enum(['top', 'new', 'best', 'ask', 'show', 'job']).default('top'),
  maxStories: z.number().min(1).max(50).default(10),
  includeComments: z.boolean().default(false),
  maxComments: z.number().min(1).max(20).default(3)
}).strict();

const GetHackerNewsStorySchema = z.object({
  storyId: z.number().min(1, 'Story ID is required'),
  includeComments: z.boolean().default(true),
  maxComments: z.number().min(1).max(20).default(5)
}).strict();

type GetHackerNewsParams = z.infer<typeof GetHackerNewsSchema>;
type GetHackerNewsStoryParams = z.infer<typeof GetHackerNewsStorySchema>;

// Default configuration
const DEFAULT_CONFIG = {
  baseUrl: 'https://hacker-news.firebaseio.com/v0',
  requestTimeoutMs: 10000,
  rateLimitPerMinute: 100,
  cacheResultsMinutes: 5
};

// Simple cache for HN results
interface CachedHackerNews {
  data: any;
  timestamp: number;
  key: string;
}

const hackerNewsCache = new Map<string, CachedHackerNews>();

/**
 * Format time ago from Unix timestamp
 */
function formatTimeAgo(unixTime: number): string {
  const now = Date.now() / 1000;
  const diff = Math.floor(now - unixTime);
  
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .trim();
}

/**
 * Get cached data if still valid
 */
function getCachedData(key: string): CachedHackerNews | null {
  const cached = hackerNewsCache.get(key);
  
  if (cached) {
    const ageMinutes = (Date.now() - cached.timestamp) / (1000 * 60);
    if (ageMinutes < DEFAULT_CONFIG.cacheResultsMinutes) {
      return cached;
    } else {
      hackerNewsCache.delete(key);
    }
  }
  
  return null;
}

/**
 * Cache data
 */
function cacheData(key: string, data: any): void {
  hackerNewsCache.set(key, {
    data,
    timestamp: Date.now(),
    key
  });
}

/**
 * Fetch story details from Hacker News API
 */
async function fetchStory(storyId: number): Promise<HackerNewsStory | null> {
  try {
    const response = await axios.get(
      `${DEFAULT_CONFIG.baseUrl}/item/${storyId}.json`,
      { timeout: DEFAULT_CONFIG.requestTimeoutMs }
    );
    
    const story = response.data;
    if (!story || story.deleted || story.dead) {
      return null;
    }
    
    return {
      ...story,
      timeAgo: formatTimeAgo(story.time),
      domain: story.url ? extractDomain(story.url) : undefined
    };
  } catch {
    return null;
  }
}

/**
 * Fetch comment details
 */
async function fetchComment(commentId: number): Promise<HackerNewsComment | null> {
  try {
    const response = await axios.get(
      `${DEFAULT_CONFIG.baseUrl}/item/${commentId}.json`,
      { timeout: DEFAULT_CONFIG.requestTimeoutMs }
    );
    
    const comment = response.data;
    if (!comment || comment.deleted || comment.dead || comment.type !== 'comment') {
      return null;
    }
    
    return {
      ...comment,
      timeAgo: formatTimeAgo(comment.time),
      text: comment.text ? stripHtml(comment.text) : ''
    };
  } catch {
    return null;
  }
}

/**
 * Execute Hacker News stories search
 */
async function executeGetHackerNews(params: GetHackerNewsParams): Promise<any> {
  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit('hackernews-api', DEFAULT_CONFIG.rateLimitPerMinute, 60000);
    if (!rateLimitResult) {
      return createErrorResult('Rate limit exceeded. Please wait before making more Hacker News requests.');
    }

    const cacheKey = `${params.storyType}_${params.maxStories}_${params.includeComments}`;
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return createSuccessResult(cached.data, `Latest ${params.storyType} stories from Hacker News (cached)`);
    }

    console.log(`[HACKER_NEWS] Getting ${params.storyType} stories (max: ${params.maxStories})`);

    // Fetch story IDs
    const storyListUrl = `${DEFAULT_CONFIG.baseUrl}/${params.storyType}stories.json`;
    const storyListResponse = await axios.get(storyListUrl, { 
      timeout: DEFAULT_CONFIG.requestTimeoutMs 
    });
    
    const storyIds = storyListResponse.data.slice(0, params.maxStories);
    
    // Fetch story details in parallel (with concurrency limit)
    const stories: HackerNewsStory[] = [];
    const batchSize = 5; // Process 5 stories at a time to avoid overwhelming the API
    
    for (let i = 0; i < storyIds.length; i += batchSize) {
      const batch = storyIds.slice(i, i + batchSize);
      const batchPromises = batch.map((id: number) => fetchStory(id));
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(story => {
        if (story) {
          stories.push(story);
        }
      });
    }

    // Fetch comments if requested
    if (params.includeComments) {
      for (const story of stories) {
        if (story.kids && story.kids.length > 0) {
          const commentIds = story.kids.slice(0, params.maxComments);
          const commentPromises = commentIds.map(id => fetchComment(id));
          const comments = await Promise.all(commentPromises);
          
          (story as any).comments = comments.filter(c => c !== null);
        }
      }
    }

    // Cache the result
    cacheData(cacheKey, stories);

    // Format response message
    let message = `📰 Top ${stories.length} ${params.storyType} stories from Hacker News:\n\n`;
    
    stories.forEach((story, index) => {
      message += `${index + 1}. ${story.title}\n`;
      if (story.url) {
        message += `   🔗 ${story.url} (${story.domain})\n`;
      }
      message += `   👤 ${story.by} | 📊 ${story.score} points | 💬 ${story.descendants || 0} comments | ⏰ ${story.timeAgo}\n`;
      
      if (story.text) {
        const text = stripHtml(story.text);
        const truncated = text.length > 150 ? text.substring(0, 150) + '...' : text;
        message += `   📝 ${truncated}\n`;
      }
      
      if (params.includeComments && (story as any).comments?.length > 0) {
        message += `   💬 Top Comments:\n`;
        (story as any).comments.slice(0, 2).forEach((comment: HackerNewsComment) => {
          const commentText = comment.text.length > 100 ? comment.text.substring(0, 100) + '...' : comment.text;
          message += `      "${commentText}" - ${comment.by} (${comment.timeAgo})\n`;
        });
      }
      
      message += '\n';
    });

    return createSuccessResult(stories, message);

  } catch (error: any) {
    console.error('[HACKER_NEWS] Error getting stories:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return createErrorResult('Unable to connect to Hacker News API. Please check your internet connection.');
    } else if (error.code === 'ECONNABORTED') {
      return createErrorResult('Hacker News request timed out. Please try again.');
    }
    
    return createErrorResult(`Failed to get Hacker News stories: ${error.message}`);
  }
}

/**
 * Execute get specific Hacker News story
 */
async function executeGetHackerNewsStory(params: GetHackerNewsStoryParams): Promise<any> {
  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit('hackernews-api', DEFAULT_CONFIG.rateLimitPerMinute, 60000);
    if (!rateLimitResult) {
      return createErrorResult('Rate limit exceeded. Please wait before making more Hacker News requests.');
    }

    const cacheKey = `story_${params.storyId}_${params.includeComments}`;
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return createSuccessResult(cached.data, `Hacker News story #${params.storyId} (cached)`);
    }

    console.log(`[HACKER_NEWS] Getting story #${params.storyId}`);

    // Fetch story details
    const story = await fetchStory(params.storyId);
    
    if (!story) {
      return createErrorResult(`Story #${params.storyId} not found or has been deleted.`);
    }

    // Fetch comments if requested
    if (params.includeComments && story.kids && story.kids.length > 0) {
      const commentIds = story.kids.slice(0, params.maxComments);
      const commentPromises = commentIds.map(id => fetchComment(id));
      const comments = await Promise.all(commentPromises);
      
      (story as any).comments = comments.filter(c => c !== null);
    }

    // Cache the result
    cacheData(cacheKey, story);

    // Format response message
    let message = `📰 Hacker News Story #${story.id}:\n\n`;
    message += `📋 Title: ${story.title}\n`;
    
    if (story.url) {
      message += `🔗 URL: ${story.url} (${story.domain})\n`;
    }
    
    message += `👤 Author: ${story.by}\n`;
    message += `📊 Score: ${story.score} points\n`;
    message += `💬 Comments: ${story.descendants || 0}\n`;
    message += `⏰ Posted: ${story.timeAgo}\n`;
    
    if (story.text) {
      message += `\n📝 Content:\n${stripHtml(story.text)}\n`;
    }
    
    if (params.includeComments && (story as any).comments?.length > 0) {
      message += `\n💬 Top ${(story as any).comments.length} Comments:\n\n`;
      (story as any).comments.forEach((comment: HackerNewsComment, index: number) => {
        message += `${index + 1}. ${comment.by} (${comment.timeAgo}):\n`;
        message += `   ${comment.text}\n\n`;
      });
    }

    return createSuccessResult(story, message);

  } catch (error: any) {
    console.error('[HACKER_NEWS] Error getting story:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return createErrorResult('Unable to connect to Hacker News API. Please check your internet connection.');
    } else if (error.code === 'ECONNABORTED') {
      return createErrorResult('Hacker News request timed out. Please try again.');
    }
    
    return createErrorResult(`Failed to get Hacker News story: ${error.message}`);
  }
}

// Export the tools
export const getHackerNewsStoriesTool: BuiltInTool = {
  name: 'get-hackernews-stories',
  description: 'Get latest stories from Hacker News. Supports different story types (top, new, best, ask, show, job) with optional comments. No API key required.',
  category: 'news',
  parameters: GetHackerNewsSchema,
  execute: executeGetHackerNews
};

export const getHackerNewsStoryTool: BuiltInTool = {
  name: 'get-hackernews-story',
  description: 'Get a specific Hacker News story by ID with optional comments. Useful for getting detailed information about a particular story.',
  category: 'news',
  parameters: GetHackerNewsStorySchema,
  execute: executeGetHackerNewsStory
};
