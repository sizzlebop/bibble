/**
 * Quick Information Lookup Tool for Bibble
 * Provides immediate answers without creating documents
 */

import { z } from 'zod';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { 
  ResearchConfig 
} from './types/index.js';
import { EnhancedResearchAgent } from './research/research-agent.js';
import { getSearchEngineConfig } from './research/search-engine.js';

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
 * Quick lookup configuration optimized for fast answers
 */
const QUICK_LOOKUP_CONFIG: ResearchConfig = {
  maxSearches: 3, // Fewer searches for speed
  maxResultsPerSearch: 8, // Fewer results per search
  maxContentExtractions: 3, // Minimal content extraction
  timeoutMs: 45000, // 45 seconds for quick response
  enableContentExtraction: true,
  enableFollowUpSearches: false, // Disable for speed
  relevanceThreshold: 20, // Higher threshold for quality
  searchStrategies: [],
  minSearches: 1 // Single search minimum
};

/**
 * Format quick lookup response
 */
function formatQuickResponse(
  query: string,
  researchContext: any,
  additionalInfo: {
    searchCount: number;
    totalResults: number;
    contentExtracted: number;
    confidence: number;
    sources: string[];
  }
): string {
  // Extract the most relevant information for a concise answer
  let content = researchContext.relevantContent;
  
  // Truncate content to a reasonable length for quick answers (max 3000 chars)
  if (content.length > 3000) {
    content = content.substring(0, 3000) + '...';
  }
  
  const response = `QUICK INFORMATION LOOKUP: ${query}

${content}

**Quick Facts:**
- Confidence Level: ${additionalInfo.confidence}%
- Sources Consulted: ${additionalInfo.sources.length}
- Search Queries: ${additionalInfo.searchCount}
- Results Analyzed: ${additionalInfo.totalResults}

**Top Sources:**
${additionalInfo.sources.slice(0, 5).map((source, i) => `${i + 1}. ${source}`).join('\n')}

*This is a quick information lookup. For comprehensive research with detailed documentation, use the comprehensive_research tool.*`;

  return response;
}

/**
 * Execute quick information lookup
 */
async function executeQuickLookup(params: {
  query: string;
  focusArea?: string;
  preferredEngine?: 'duckduckgo' | 'bing' | 'google' | 'brave';
}): Promise<any> {
  try {
    const researchAgent = getResearchAgent();
    
    // Enhanced query for better results
    let searchQuery = params.query;
    if (params.focusArea) {
      searchQuery = `${params.query} ${params.focusArea}`;
    }
    
    // Quick lookup configuration
    const researchConfig: Partial<ResearchConfig> = {
      ...QUICK_LOOKUP_CONFIG,
      searchEngineOverrides: params.preferredEngine ? { preferredEngine: params.preferredEngine } : undefined
    };
    
    // Start quick research session
    const session = await researchAgent.startResearch(searchQuery, researchConfig);
    
    // Wait for completion with quick timeout
    const maxWaitTime = 60000; // 1 minute maximum for quick lookup
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
          error: 'Quick lookup timeout - the search took too long to complete. Try a more specific query or check your internet connection.',
          data: {
            sessionId: session.id,
            query: params.query,
            partialResults: researchAgent.getProgress(session.id)
          }
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
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
        error: `Could not find information about "${params.query}". The topic may be too specific, newly emerging, or may require different search terms. Try rephrasing your question or using broader terms.`,
        data: {
          sessionId: session.id,
          query: params.query,
          status: session.status,
          searchesPerformed: session.searches?.length || 0,
          totalResults: session.totalResults || 0,
          suggestion: 'Try using more general terms or checking the spelling of specific names/terms.'
        }
      };
    }
    
    // Format quick response
    const additionalInfo = {
      searchCount: session.searches?.length || 0,
      totalResults: session.totalResults || 0,
      contentExtracted: session.extractedContent?.length || 0,
      confidence: context.confidence,
      sources: context.sources
    };
    
    const quickResponse = formatQuickResponse(params.query, context, additionalInfo);
    
    return {
      success: true,
      data: {
        sessionId: session.id,
        query: params.query,
        confidence: context.confidence,
        sourcesAnalyzed: context.sources.length,
        searchesPerformed: session.searches?.length || 0,
        contentLength: context.relevantContent.length,
        results: quickResponse
      },
      message: `Found information about "${params.query}" with ${context.confidence}% confidence from ${context.sources.length} sources.`
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Quick lookup failed: ${errorMessage}. Please check your internet connection and try again.`,
      data: {
        query: params.query,
        error: errorMessage
      }
    };
  }
}

/**
 * Quick Information Lookup Tool Definition
 */
export const quickInformationLookupTool: BuiltInTool = {
  name: 'quick_information_lookup',
  description: 'Quickly search for and provide immediate information about any topic. Fast responses without creating documents. Use this for quick questions, fact-checking, or when you just need a brief answer rather than comprehensive research.',
  category: 'web',
  parameters: z.object({
    query: z.string().min(2, 'Search query must be at least 2 characters'),
    focusArea: z.string().optional(),
    preferredEngine: z.enum(['duckduckgo', 'bing', 'google', 'brave']).optional()
  }).strict(),
  async execute(params: {
    query: string;
    focusArea?: string;
    preferredEngine?: 'duckduckgo' | 'bing' | 'google' | 'brave';
  }): Promise<any> {
    return await executeQuickLookup(params);
  }
};

/**
 * Fact Check Tool - specialized for verification
 */
export const factCheckTool: BuiltInTool = {
  name: 'fact_check',
  description: 'Quickly verify facts, claims, or statements by searching reliable sources. Provides confidence ratings and source verification. Use for fact-checking specific claims or statements.',
  category: 'web',
  parameters: z.object({
    claim: z.string().min(5, 'Claim to fact-check must be at least 5 characters'),
    context: z.string().optional(),
    preferredEngine: z.enum(['duckduckgo', 'bing', 'google', 'brave']).optional()
  }).strict(),
  async execute(params: {
    claim: string;
    context?: string;
    preferredEngine?: 'duckduckgo' | 'bing' | 'google' | 'brave';
  }): Promise<any> {
    try {
      const researchAgent = getResearchAgent();
      
      // Create fact-checking query
      let factCheckQuery = `"${params.claim}" fact check verification`;
      if (params.context) {
        factCheckQuery += ` ${params.context}`;
      }
      
      // Specialized fact-checking configuration
      const researchConfig: Partial<ResearchConfig> = {
        ...QUICK_LOOKUP_CONFIG,
        maxSearches: 4, // More searches for verification
        maxResultsPerSearch: 10,
        maxContentExtractions: 4,
        relevanceThreshold: 25, // Higher threshold for fact-checking
        searchEngineOverrides: params.preferredEngine ? { preferredEngine: params.preferredEngine } : undefined
      };
      
      const session = await researchAgent.startResearch(factCheckQuery, researchConfig);
      
      // Wait for completion
      const maxWaitTime = 75000; // 75 seconds for fact-checking
      const startTime = Date.now();
      const pollInterval = 500;
      
      while (
        session.status !== 'completed' && 
        session.status !== 'failed' && 
        session.status !== 'insufficient_results'
      ) {
        if (Date.now() - startTime > maxWaitTime) {
          await researchAgent.stopResearch(session.id);
          return {
            success: false,
            error: 'Fact check timeout - verification took too long to complete.',
            data: {
              sessionId: session.id,
              claim: params.claim
            }
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        const currentSession = researchAgent.getSession(session.id);
        if (currentSession) {
          session.status = currentSession.status;
          session.endTime = currentSession.endTime;
        }
      }
      
      const context = researchAgent.generateResearchContext(session.id);
      
      if (!context || !context.relevantContent) {
        return {
          success: false,
          error: `Could not find sufficient information to fact-check: "${params.claim}". This claim may be too specific, newly emerging, or may require specialized sources.`,
          data: {
            sessionId: session.id,
            claim: params.claim,
            status: session.status
          }
        };
      }
      
      // Format fact-checking response
      let verificationStatus = 'UNVERIFIED';
      if (context.confidence >= 80) {
        verificationStatus = 'WELL-SUPPORTED';
      } else if (context.confidence >= 60) {
        verificationStatus = 'PARTIALLY VERIFIED';
      } else if (context.confidence >= 40) {
        verificationStatus = 'MIXED EVIDENCE';
      } else {
        verificationStatus = 'INSUFFICIENT EVIDENCE';
      }
      
      const factCheckResponse = `FACT CHECK RESULTS

**Claim:** ${params.claim}

**Verification Status:** ${verificationStatus}
**Confidence Level:** ${context.confidence}%
**Sources Analyzed:** ${context.sources.length}

**Evidence Summary:**
${context.relevantContent.substring(0, 2000)}${context.relevantContent.length > 2000 ? '...' : ''}

**Key Sources:**
${context.sources.slice(0, 6).map((source, i) => `${i + 1}. ${source}`).join('\n')}

**Analysis Notes:**
- This fact-check is based on ${session.searches?.length || 0} search queries
- ${session.extractedContent?.length || 0} detailed sources were analyzed
- Verification confidence is ${context.confidence}%
- Status: ${verificationStatus}

*For claims requiring high certainty, consult additional authoritative sources.*`;
      
      return {
        success: true,
        data: {
          sessionId: session.id,
          claim: params.claim,
          verificationStatus: verificationStatus,
          confidence: context.confidence,
          sourcesAnalyzed: context.sources.length,
          results: factCheckResponse
        },
        message: `Fact check completed: ${verificationStatus} (${context.confidence}% confidence from ${context.sources.length} sources)`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Fact check failed: ${errorMessage}`,
        data: {
          claim: params.claim,
          error: errorMessage
        }
      };
    }
  }
};