/**
 * Web Search Built-in Tool for Bibble
 * Implements the BuiltInTool interface for comprehensive web research
 */

import { z } from 'zod';
import { BuiltInTool, ToolResult } from '../types/index.js';
import { 
  WebSearchConfigSchema, 
  WebSearchConfig,
  ResearchConfig 
} from './types/index.js';
import { EnhancedResearchAgent } from './research/research-agent.js';
import { searchMultipleEngines, getSearchEngineConfig } from './research/search-engine.js';

// Global research agent instance
let globalResearchAgent: EnhancedResearchAgent | null = null;

/**
 * Get or create the global research agent
 */
function getResearchAgent(): EnhancedResearchAgent {
  if (!globalResearchAgent) {
    globalResearchAgent = new EnhancedResearchAgent();
  }
  return globalResearchAgent;
}

/**
 * Execute web search function implementation
 */
async function executeWebSearch(params: WebSearchConfig): Promise<ToolResult> {
  try {
    console.log(`[WEB_SEARCH] Starting search for: "${params.query}"`);
    console.log(`[WEB_SEARCH] Configuration:`, {
      maxSearches: params.maxSearches,
      maxResultsPerSearch: params.maxResultsPerSearch,
      extractContent: params.extractContent,
      searchType: params.searchType
    });

    const researchAgent = getResearchAgent();
    const searchEngineConfig = getSearchEngineConfig();

    // Configure research based on parameters
    const researchConfig: Partial<ResearchConfig> = {
      maxSearches: params.maxSearches,
      maxResultsPerSearch: params.maxResultsPerSearch,
      maxContentExtractions: params.extractContent ? 8 : 0,
      enableContentExtraction: params.extractContent,
      enableFollowUpSearches: params.maxSearches > 1,
      relevanceThreshold: 15,
      timeoutMs: 90000, // 90 seconds for comprehensive search
      // Pass per-call preferred engine override if provided
      searchEngineOverrides: params.preferredEngine ? { preferredEngine: params.preferredEngine } : undefined
    };

    // Start research session
    const session = await researchAgent.startResearch(params.query, researchConfig);
    
    // Wait for completion with timeout
    const maxWaitTime = 120000; // 2 minutes maximum
    const startTime = Date.now();
    const pollInterval = 500; // Check every 500ms

    while (
      session.status !== 'completed' && 
      session.status !== 'failed' && 
      session.status !== 'insufficient_results'
    ) {
      if (Date.now() - startTime > maxWaitTime) {
        await researchAgent.stopResearch(session.id);
        return {
          success: false,
          error: 'Search timeout - research took too long to complete',
          data: {
            sessionId: session.id,
            partialResults: researchAgent.getProgress(session.id)
          }
        };
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Get updated session status
      const currentSession = researchAgent.getSession(session.id);
      if (currentSession) {
        session.status = currentSession.status;
        session.endTime = currentSession.endTime;
      }
    }

    // Generate research context
    const context = researchAgent.generateResearchContext(session.id);
    
    if (!context || !context.relevantContent) {
      return {
        success: false,
        error: `Search completed but no relevant results found for "${params.query}". Try a different search query or check if the topic exists.`,
        data: {
          sessionId: session.id,
          status: session.status,
          searchesPerformed: session.searches?.length || 0,
          totalResults: session.totalResults || 0
        }
      };
    }

    // Format comprehensive results for the LLM
    const searchSummary = `WEB SEARCH RESULTS for "${params.query}":

RESEARCH SUMMARY:
- Search type: ${params.searchType}
- Searches performed: ${session.searches?.length || 0}
- Total results found: ${session.totalResults || 0}
- Pages extracted: ${session.extractedContent?.length || 0}
- Research confidence: ${context.confidence}%
- Status: ${session.status}

RELEVANT CONTENT:
${context.relevantContent}

SOURCES:
${context.sources.slice(0, 12).map((source, i) => `${i + 1}. ${source}`).join('\n')}

Search completed at ${new Date().toISOString()}`;

    console.log(`[WEB_SEARCH] Search completed successfully`);
    console.log(`[WEB_SEARCH] Session: ${session.id}, Status: ${session.status}`);
    console.log(`[WEB_SEARCH] Results: ${session.totalResults}, Extracted: ${session.extractedContent?.length || 0}`);
    console.log(`[WEB_SEARCH] Context length: ${searchSummary.length} characters`);

    return {
      success: true,
      data: {
        sessionId: session.id,
        query: params.query,
        searchType: params.searchType,
        status: session.status,
        searchesPerformed: session.searches?.length || 0,
        totalResults: session.totalResults || 0,
        contentExtracted: session.extractedContent?.length || 0,
        confidence: context.confidence,
        sources: context.sources,
        results: searchSummary
      },
      message: `Found comprehensive information about "${params.query}" with ${context.confidence}% confidence from ${context.sources.length} sources.`
    };

  } catch (error) {
    console.error(`[WEB_SEARCH] Search failed:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Web search failed: ${errorMessage}. Please try again with a different query.`,
      data: {
        query: params.query,
        error: errorMessage
      }
    };
  }
}

/**
 * Web Search Built-in Tool Definition
 */
export const webSearchTool: BuiltInTool = {
  name: 'web_search',
  description: 'Search the web for comprehensive information on any topic. Supports general research, technical troubleshooting (Windows/Linux), people/biography searches, and more. Automatically extracts content from relevant pages and provides detailed context.',
  category: 'web',
  parameters: WebSearchConfigSchema,
  async execute(params: WebSearchConfig): Promise<ToolResult> {
    return await executeWebSearch(params);
  }
};

/**
 * Quick Search Tool (simplified version)
 */
export const quickWebSearchTool: BuiltInTool = {
  name: 'quick_web_search',
  description: 'Perform a quick web search for immediate answers. Faster than full web_search but with less detail.',
  category: 'web',
  parameters: z.object({
    query: z.string().min(1, 'Search query is required'),
    numResults: z.number().min(1).max(20).default(5),
    preferredEngine: z.enum(['duckduckgo', 'bing', 'google', 'brave']).optional()
  }).strict(),
  async execute(params: { query: string; numResults?: number; preferredEngine?: 'duckduckgo' | 'bing' | 'google' | 'brave' }): Promise<ToolResult> {
    try {
      const searchEngineConfig = getSearchEngineConfig();
      const results = await searchMultipleEngines(
        params.query,
        params.numResults || 5,
        {
          ...searchEngineConfig,
          ...(params.preferredEngine ? { preferredEngine: params.preferredEngine } : {})
        }
      );

      if (results.length === 0) {
        return {
          success: false,
          error: `No search results found for "${params.query}". Try a different query.`,
          data: { query: params.query, resultsCount: 0 }
        };
      }

      const formattedResults = results.map((result, index) => 
        `${index + 1}. ${result.title}\n   ${result.snippet}\n   Source: ${result.link} (${result.source})`
      ).join('\n\n');

      const summary = `QUICK WEB SEARCH RESULTS for "${params.query}":

${formattedResults}

Search completed at ${new Date().toISOString()}`;

      return {
        success: true,
        data: {
          query: params.query,
          resultsCount: results.length,
          results: results,
          summary: summary
        },
        message: `Found ${results.length} results for "${params.query}"`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Quick web search failed: ${errorMessage}`,
        data: { query: params.query, error: errorMessage }
      };
    }
  }
};

/**
 * Research Status Tool (check ongoing research)
 */
export const researchStatusTool: BuiltInTool = {
  name: 'research_status',
  description: 'Check the status of ongoing research sessions or get the most recent research results.',
  category: 'web',
  parameters: z.object({
    sessionId: z.string().optional(),
    getMostRecent: z.boolean().default(false)
  }).strict(),
  async execute(params: { sessionId?: string; getMostRecent?: boolean }): Promise<ToolResult> {
    try {
      const researchAgent = getResearchAgent();
      
      if (params.getMostRecent) {
        const context = researchAgent.getMostRecentContext();
        if (!context) {
          return {
            success: false,
            error: 'No recent research sessions found',
            data: { hasRecentResults: false }
          };
        }
        
        return {
          success: true,
          data: {
            sessionId: context.sessionId,
            query: context.query,
            confidence: context.confidence,
            sourcesCount: context.sources.length,
            lastUpdated: context.lastUpdated,
            hasResults: true,
            relevantContent: context.relevantContent.substring(0, 500) + '...'
          },
          message: `Most recent research: "${context.query}" (${context.confidence}% confidence)`
        };
      }
      
      if (params.sessionId) {
        const session = researchAgent.getSession(params.sessionId);
        const progress = researchAgent.getProgress(params.sessionId);
        
        if (!session) {
          return {
            success: false,
            error: `Research session ${params.sessionId} not found`,
            data: { sessionId: params.sessionId }
          };
        }
        
        return {
          success: true,
          data: {
            sessionId: session.id,
            query: session.query,
            status: session.status,
            progress: progress,
            searchesPerformed: session.searches.length,
            totalResults: session.totalResults,
            startTime: session.startTime,
            endTime: session.endTime
          },
          message: `Research session ${params.sessionId}: ${session.status}`
        };
      }
      
      // List all active sessions
      const allSessions = researchAgent.getAllSessions();
      const activeSessions = allSessions.filter(s => 
        s.status !== 'completed' && s.status !== 'failed'
      );
      
      return {
        success: true,
        data: {
          totalSessions: allSessions.length,
          activeSessions: activeSessions.length,
          completedSessions: allSessions.filter(s => s.status === 'completed').length,
          sessions: allSessions.map(s => ({
            id: s.id,
            query: s.query,
            status: s.status,
            startTime: s.startTime,
            totalResults: s.totalResults
          }))
        },
        message: `Found ${allSessions.length} research sessions (${activeSessions.length} active)`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Failed to get research status: ${errorMessage}`,
        data: { error: errorMessage }
      };
    }
  }
};
