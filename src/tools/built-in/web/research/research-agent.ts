/**
 * Enhanced Research Agent for Bibble
 * General-purpose intelligent research with cross-platform technical expertise
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  ResearchAgent,
  ResearchSession,
  ResearchConfig,
  ResearchProgress,
  SearchQuery,
  SearchResult,
  SearchType,
  SearchStrategy,
  TechnicalErrorPattern,
  ResearchContext,
  TECHNICAL_ERROR_PATTERNS
} from '../types/index.js';
import { EnhancedWebContentExtractor } from './content-extractor.js';
import { searchMultipleEngines, getSearchEngineConfig } from './search-engine.js';

/**
 * Default research configuration optimized for general research
 */
const DEFAULT_CONFIG: ResearchConfig = {
  maxSearches: 5,
  maxResultsPerSearch: 15,
  maxContentExtractions: 6, // Balanced for good coverage
  timeoutMs: 120000, // 2 minutes
  enableContentExtraction: true,
  enableFollowUpSearches: true,
  relevanceThreshold: 15, // Moderate threshold for diverse content
  searchStrategies: [],
  minSearches: 1
};

/**
 * Enhanced Research Agent with general-purpose and technical capabilities
 */
export class EnhancedResearchAgent extends EventEmitter implements ResearchAgent {
  private contentExtractor: EnhancedWebContentExtractor;
  private activeSessions: Map<string, ResearchSession> = new Map();
  private progressCallbacks: Map<string, (progress: ResearchProgress) => void> = new Map();
  
  /**
   * Emit structured event for subscribers
   */
  private emitStructuredEvent(event: { type: 'progress' | 'done' | 'error'; percent: number; data: any; sessionId: string }): void {
    this.emit(event.type, event);
  }

  constructor() {
    super();
    this.contentExtractor = new EnhancedWebContentExtractor();
  }

  /**
   * Start a new research session
   */
  async startResearch(
    query: string, 
    config: Partial<ResearchConfig> = {}
  ): Promise<ResearchSession> {
    const sessionId = uuidv4();
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    const session: ResearchSession = {
      id: sessionId,
      query,
      originalQuestion: query,
      startTime: new Date(),
      status: 'initializing',
      searches: [],
      extractedContent: [],
      totalResults: 0,
      relevantResults: 0
    };

    this.activeSessions.set(sessionId, session);
    
    // Start the research process asynchronously
    this.conductResearch(sessionId, finalConfig).catch(error => {
      console.error(`Research session ${sessionId} failed:`, error);
      session.status = 'failed';
      session.endTime = new Date();
    });

    return session;
  }

  /**
   * Get progress for a research session
   */
  getProgress(sessionId: string): ResearchProgress | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    const totalSteps = 5; // Clean, Initialize, Search, Extract, Analyze
    let currentStep = 0;
    let stepName = 'Initializing';

    switch (session.status) {
      case 'cleaning':
        currentStep = 0;
        stepName = 'Optimizing search query';
        break;
      case 'initializing':
        currentStep = 1;
        stepName = 'Analyzing research topic';
        break;
      case 'searching':
        const searchCount = session.searches.length;
        const maxSearches = 5;
        if (searchCount === 0) {
          stepName = 'Starting web search...';
          currentStep = 2;
        } else {
          stepName = `Performing search ${searchCount}/${maxSearches}...`;
          currentStep = 2 + (searchCount / maxSearches) * 0.8;
        }
        break;
      case 'extracting':
        currentStep = 3;
        stepName = 'Extracting detailed content';
        break;
      case 'analyzing':
        currentStep = 4;
        stepName = 'Analyzing and synthesizing results';
        break;
      case 'completed':
      case 'failed':
        currentStep = 4;
        stepName = session.status === 'completed' ? 'Research completed' : 'Research failed';
        break;
    }

    const progress = Math.round((currentStep / totalSteps) * 100);

    return {
      sessionId,
      currentStep: stepName,
      progress,
      status: session.status,
      currentQuery: session.searches[session.searches.length - 1]?.query || undefined,
      resultsFound: session.totalResults,
      contentExtracted: session.extractedContent.length,
      estimatedTimeRemaining: this.estimateTimeRemaining(session)
    };
  }

  /**
   * Stop a research session
   */
  async stopResearch(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status !== 'completed' && session.status !== 'failed') {
      session.status = 'failed';
      session.endTime = new Date();
    }
  }

  /**
   * Get a specific research session
   */
  getSession(sessionId: string): ResearchSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get all research sessions
   */
  getAllSessions(): ResearchSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Conduct the actual research process
   */
  private async conductResearch(sessionId: string, config: ResearchConfig): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      // Phase 0: Clean and enhance the query
      session.status = 'cleaning';
      this.updateProgress(sessionId);

      const cleanedQuery = await this.enhanceQuery(session.query);
      if (cleanedQuery && cleanedQuery !== session.query) {
        session.query = cleanedQuery;
      }

      // Phase 1: Initialize and analyze query
      session.status = 'initializing';
      this.updateProgress(sessionId);
      
      const searchStrategies = this.generateSearchStrategies(session.query);
      
      // Phase 2: Execute searches
      session.status = 'searching';
      this.updateProgress(sessionId);
      
      outer: for (const strategy of searchStrategies.slice(0, config.maxSearches)) {
        const allQueries: string[] = [...strategy.queryTemplates];
        if (config.enableFollowUpSearches && strategy.followUpQueries?.length) {
          allQueries.push(...strategy.followUpQueries);
        }

        let attempt = 0;
        for (const q of allQueries) {
          const searchQuery = await this.executeSearchWithQuery(session, strategy, q, config);
          attempt++;
          if (searchQuery) {
            session.searches.push(searchQuery);
            session.totalResults += searchQuery.resultCount;
            this.updateProgress(sessionId);
          }

          const minSearches = Math.max(1, config.minSearches ?? 1);
          if (session.searches.length >= minSearches) {
            if (this.hasEnoughResults(session, config)) {
              break outer;
            }
          }

          if (session.searches.length >= config.maxSearches) {
            break outer;
          }
        }
      }

      // Phase 3: Extract content from top results
      if (config.enableContentExtraction && session.totalResults > 0) {
        session.status = 'extracting';
        this.updateProgress(sessionId);
        
        await this.extractRelevantContent(session, config);
      }

      // Phase 4: Analyze and summarize
      session.status = 'analyzing';
      this.updateProgress(sessionId);
      
      session.contextSummary = this.generateContextSummary(session);
      session.relevantResults = this.countRelevantResults(session, config.relevanceThreshold);

      // Complete the session
      session.status = session.relevantResults > 0 ? 'completed' : 'insufficient_results';
      session.endTime = new Date();

      this.updateProgress(sessionId);

      // Emit final structured event
      const context = this.generateResearchContext(sessionId);
      const statusFlag: 'success' | 'limited' = session.status === 'completed' ? 'success' : 'limited';
      this.emitStructuredEvent({
        type: 'done',
        percent: 100,
        data: { context, status: statusFlag },
        sessionId
      });

    } catch (error) {
      session.status = 'failed';
      session.endTime = new Date();
      console.error(`Research failed for session ${sessionId}:`, error);
      this.emitStructuredEvent({
        type: 'error',
        percent: 100,
        data: { error: (error as Error).message },
        sessionId
      });
    }
  }

  /**
   * Enhanced search strategy generation for general research with technical expertise
   */
  private generateSearchStrategies(query: string): SearchStrategy[] {
    const strategies: SearchStrategy[] = [];
    
    // Detect technical error patterns (Windows, Linux, cross-platform)
    const detectedError = this.detectErrorPattern(query);
    if (detectedError) {
      strategies.push({
        name: `error_${detectedError.errorType}`,
        description: `Search for ${detectedError.errorType} solutions`,
        queryTemplates: detectedError.searchQueries.map(q => q.replace('{command}', query)),
        maxResults: 10,
        contentExtraction: true,
        followUpQueries: []
      });
    }

    // Main general search strategy
    const baseFollowUps: string[] = [];
    const qBare = query.replace(/["']/g, '').trim();
    const qQuoted = `"${qBare}"`;
    const words = qBare.split(/\s+/);
    
    // Detect query type for tailored follow-ups
    const looksLikePerson = words.length >= 2 && words.length <= 5 && 
                           words.every(word => /^[A-Z][a-z]+$/.test(word));
    const looksLikeTech = /\b(error|fix|install|configure|setup|troubleshoot|debug|issue|problem)\b/i.test(query) ||
                         /\b(windows|linux|macos|ubuntu|debian|server|database|code|programming)\b/i.test(query);
    const looksLikeWindows = /\b(windows|microsoft|win10|win11|powershell|cmd|registry|bsod)\b/i.test(query);
    const looksLikeLinux = /\b(linux|ubuntu|debian|bash|shell|terminal|unix)\b/i.test(query);

    if (looksLikePerson) {
      baseFollowUps.push(
        qQuoted,
        `${qBare} linkedin profile`,
        `${qBare} biography`,
        `${qBare} professional background`,
        `${qBare} career achievements`
      );
    } else if (looksLikeTech) {
      baseFollowUps.push(
        qQuoted,
        `${qBare} solution guide`,
        `${qBare} troubleshooting steps`,
        `${qBare} how to fix`
      );
    } else {
      baseFollowUps.push(
        qQuoted,
        `${qBare} overview`,
        `${qBare} explanation`,
        `${qBare} guide`
      );
    }

    strategies.push({
      name: 'general',
      description: 'General comprehensive search',
      queryTemplates: [query],
      maxResults: 12,
      contentExtraction: true,
      followUpQueries: baseFollowUps
    });

    // Windows-specific search strategy
    if (looksLikeWindows) {
      strategies.push({
        name: 'windows_specific',
        description: 'Windows-focused technical search',
        queryTemplates: [
          `${query} windows`,
          `${query} microsoft support`,
          `${query} windows 10 11`
        ],
        maxResults: 8,
        contentExtraction: true,
        followUpQueries: [
          `${query} powershell solution`,
          `${query} registry fix`,
          `${query} windows troubleshooting`
        ]
      });
    }

    // Linux-specific search strategy
    if (looksLikeLinux) {
      strategies.push({
        name: 'linux_specific',
        description: 'Linux-focused technical search',
        queryTemplates: [
          `${query} linux`,
          `${query} ubuntu debian`,
          `${query} command line`
        ],
        maxResults: 8,
        contentExtraction: true,
        followUpQueries: [
          `${query} bash script`,
          `${query} terminal solution`,
          `${query} unix fix`
        ]
      });
    }

    // Technical documentation search
    if (looksLikeTech) {
      strategies.push({
        name: 'documentation',
        description: 'Official documentation and guides',
        queryTemplates: [
          `${query} documentation`,
          `${query} official guide`,
          `${query} manual`
        ],
        maxResults: 6,
        contentExtraction: true,
        followUpQueries: [
          `${query} tutorial`,
          `${query} examples`,
          `${query} best practices`
        ]
      });

      // Community and forum search for technical queries
      strategies.push({
        name: 'community',
        description: 'Community forums and discussions',
        queryTemplates: [
          `${query} stackoverflow`,
          `${query} reddit`,
          `${query} forum discussion`
        ],
        maxResults: 6,
        contentExtraction: true,
        followUpQueries: [
          `${query} community solution`,
          `${query} user experiences`
        ]
      });
    }

    // People-focused strategy for biography/profile queries
    if (looksLikePerson) {
      strategies.push({
        name: 'people_profile',
        description: 'People and professional profiles',
        queryTemplates: [
          `${qBare} site:linkedin.com`,
          `${qBare} biography professional`,
          `${qBare} career background`,
          `${qBare} achievements`
        ],
        maxResults: 8,
        contentExtraction: true,
        followUpQueries: [
          `${qBare} education`,
          `${qBare} work experience`,
          `${qBare} publications`,
          `${qBare} awards`
        ]
      });
    }

    return strategies;
  }

  /**
   * Execute a search using a specific strategy
   */
  private async executeSearchWithQuery(
    session: ResearchSession,
    strategy: SearchStrategy,
    explicitQuery: string,
    config: ResearchConfig
  ): Promise<SearchQuery | null> {
    try {
      const queryId = uuidv4();
      const searchQuery: SearchQuery = {
        id: queryId,
        query: explicitQuery || session.query,
        searchType: this.determineSearchType(strategy.name, explicitQuery),
        timestamp: new Date(),
        results: [],
        resultCount: 0,
        strategy
      };

      // For now, we'll create a placeholder for search results
      // This will be replaced with actual search engine integration
      const results = await this.performWebSearch(
        searchQuery.query,
        Math.min(strategy.maxResults, config.maxResultsPerSearch),
        config.searchEngineOverrides
      );

      searchQuery.results = results;
      searchQuery.resultCount = results.length;

      return searchQuery;

    } catch (error) {
      console.error(`Search failed for query "${explicitQuery}":`, error);
      return null;
    }
  }

  /**
   * Perform web search using integrated search engines
   */
  private async performWebSearch(
    query: string,
    maxResults: number,
    overrides?: {
      preferredEngine?: 'duckduckgo' | 'bing' | 'google' | 'brave';
      bingApiKey?: string;
      googleApiKey?: string;
      googleSearchEngineId?: string;
      braveApiKey?: string;
    }
  ): Promise<SearchResult[]> {
    try {
      const searchConfig = getSearchEngineConfig();
      const results = await searchMultipleEngines(query, maxResults, {
        ...searchConfig,
        ...(overrides || {}),
        enableFallback: true
      });
      
      // Calculate relevance scores for results that don't have them
      return results.map((result, index) => ({
        ...result,
        relevanceScore: result.relevanceScore || this.calculateRelevanceScore(result, query)
      }));
      
    } catch (error) {
      console.error(`Web search failed for query "${query}":`, error);
      return [];
    }
  }
  
  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(result: any, query: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = (result.title || '').toLowerCase();
    const snippetLower = (result.snippet || '').toLowerCase();
    const urlLower = (result.link || '').toLowerCase();

    let score = 30; // Base score

    // Query word matching
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    for (const word of queryWords) {
      if (titleLower.includes(word)) score += 15;
      if (snippetLower.includes(word)) score += 10;
      if (urlLower.includes(word)) score += 5;
    }

    // Technical content bonus
    const techTerms = ['windows', 'linux', 'troubleshoot', 'fix', 'error', 'solution', 'guide', 'tutorial'];
    for (const term of techTerms) {
      if (titleLower.includes(term) || snippetLower.includes(term)) {
        score += 8;
        break;
      }
    }

    // Authoritative domain bonus
    const authDomains = [
      'stackoverflow.com', 'github.com', 'microsoft.com', 'docs.microsoft.com',
      'askubuntu.com', 'superuser.com', 'serverfault.com'
    ];
    for (const domain of authDomains) {
      if (urlLower.includes(domain)) {
        score += 20;
        break;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Enhanced query optimization
   */
  private async enhanceQuery(query: string): Promise<string> {
    try {
      // Basic query cleaning and enhancement
      let enhanced = query.trim();
      
      // Fix common typos and l33t speak
      const replacements: Array<[RegExp, string]> = [
        [/\b3rr0r\b/gi, 'error'],
        [/\b1nst4ll\b/gi, 'install'],
        [/\bw1nd0ws\b/gi, 'windows'],
        [/\bl1nux\b/gi, 'linux'],
        [/\bf1x\b/gi, 'fix'],
        [/\bh3lp\b/gi, 'help'],
        [/\bc0nf1g\b/gi, 'config'],
        [/\bs3tup\b/gi, 'setup']
      ];
      
      for (const [pattern, replacement] of replacements) {
        enhanced = enhanced.replace(pattern, replacement);
      }
      
      // Remove excessive punctuation
      enhanced = enhanced.replace(/[!?]{2,}/g, '');
      
      // Normalize whitespace
      enhanced = enhanced.replace(/\s+/g, ' ').trim();
      
      return enhanced;
    } catch (error) {
      console.warn('Query enhancement failed:', error);
      return query;
    }
  }

  /**
   * Extract content from the most relevant search results
   */
  private async extractRelevantContent(session: ResearchSession, config: ResearchConfig): Promise<void> {
    const allUrls: string[] = [];
    
    for (const search of session.searches) {
      for (const result of search.results) {
        if (result.relevanceScore && result.relevanceScore >= config.relevanceThreshold) {
          allUrls.push(result.link);
        }
      }
    }

    const prioritizedUrls = this.contentExtractor.prioritizeUrls(allUrls);
    const urlsToExtract = prioritizedUrls.slice(0, config.maxContentExtractions);

    if (urlsToExtract.length > 0) {
      const extractedContent = await this.contentExtractor.extractMultiple(urlsToExtract);
      session.extractedContent = extractedContent.filter(content => content.success);
    }
  }

  /**
   * Generate a context summary from the research session
   */
  private generateContextSummary(session: ResearchSession): string {
    const summaryParts: string[] = [];
    
    summaryParts.push(`Research Summary for: "${session.query}"`);
    summaryParts.push(`Total searches performed: ${session.searches.length}`);
    summaryParts.push(`Total results found: ${session.totalResults}`);
    summaryParts.push(`Content extracted from: ${session.extractedContent.length} pages`);
    
    if (session.extractedContent.length > 0) {
      summaryParts.push('\nKey Sources:');
      session.extractedContent.forEach((content, index) => {
        if (content.success && content.wordCount > 50) {
          summaryParts.push(`${index + 1}. ${content.title} (${content.wordCount} words)`);
          summaryParts.push(`   ${content.url}`);
        }
      });
    }

    return summaryParts.join('\n');
  }

  /**
   * Enhanced error pattern detection for cross-platform support
   */
  private detectErrorPattern(query: string): TechnicalErrorPattern | null {
    for (const pattern of TECHNICAL_ERROR_PATTERNS) {
      if (pattern.patterns.some(regex => regex.test(query))) {
        return pattern;
      }
    }
    return null;
  }

  private determineSearchType(strategyName: string, query: string): SearchType {
    if (strategyName.startsWith('error_')) return 'error_lookup';
    if (strategyName.includes('documentation')) return 'documentation';
    if (strategyName.includes('forum') || strategyName.includes('community')) return 'forum_discussion';
    if (strategyName.includes('windows')) return 'windows_specific';
    if (strategyName.includes('linux')) return 'linux_specific';
    if (strategyName.includes('people')) return 'people_profile';
    if (/\b(error|fix|install|troubleshoot|debug)\b/i.test(query)) return 'technical';
    return 'general';
  }

  private hasEnoughResults(session: ResearchSession, config: ResearchConfig): boolean {
    const relevantCount = this.countRelevantResults(session, config.relevanceThreshold);
    const extractedCount = session.extractedContent.filter(c => c.success).length;

    return (relevantCount >= 3 && session.totalResults >= 10) ||
           extractedCount >= 3 ||
           relevantCount >= 6;
  }

  private countRelevantResults(session: ResearchSession, threshold: number): number {
    let count = 0;
    for (const search of session.searches) {
      for (const result of search.results) {
        if (result.relevanceScore && result.relevanceScore >= threshold) {
          count++;
        }
      }
    }
    return count;
  }

  private estimateTimeRemaining(session: ResearchSession): number | undefined {
    const elapsed = Date.now() - session.startTime.getTime();
    const totalEstimate = 90000; // 1.5 minutes estimate
    return Math.max(0, totalEstimate - elapsed);
  }

  private updateProgress(sessionId: string): void {
    const callback = this.progressCallbacks.get(sessionId);
    if (callback) {
      const progress = this.getProgress(sessionId);
      if (progress) {
        callback(progress);
        this.emitStructuredEvent({
          type: 'progress',
          percent: progress.progress,
          data: progress,
          sessionId
        });
      }
    }
  }

  /**
   * Register a progress callback for UI updates
   */
  onProgress(sessionId: string, callback: (progress: ResearchProgress) => void): void {
    this.progressCallbacks.set(sessionId, callback);
  }

  /**
   * Generate comprehensive research context for AI integration
   */
  generateResearchContext(sessionId: string): ResearchContext | null {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    if (!['completed', 'insufficient_results', 'failed'].includes(session.status) && session.totalResults === 0) {
      return null;
    }

    let relevantContent = '';
    const sources: string[] = [];

    // First, add extracted content (highest quality)
    const extractedContent = session.extractedContent
      .filter(content => content.success && content.wordCount > 100)
      .map(content => `EXTRACTED CONTENT:\n${content.title}\n${content.content.substring(0, 3000)}...`)
      .join('\n\n---\n\n');

    if (extractedContent) {
      relevantContent += extractedContent;
      sources.push(...session.extractedContent
        .filter(content => content.success)
        .map(content => content.url));
    }

    // Then, add search results for broader context
    const allResults = session.searches.flatMap(search => search.results);
    const topResults = allResults
      .filter(result => result.relevanceScore && result.relevanceScore >= 15)
      .slice(0, 15)
      .map((result: SearchResult) => 
        `SEARCH RESULT:\n${result.title}\n${result.snippet}\nSource: ${result.link}\nRelevance: ${result.relevanceScore}%`
      )
      .join('\n\n---\n\n');

    if (topResults) {
      if (relevantContent) {
        relevantContent += '\n\n=== ADDITIONAL SEARCH RESULTS ===\n\n' + topResults;
      } else {
        relevantContent = topResults;
      }

      const searchSources = allResults.slice(0, 10).map((result: SearchResult) => result.link);
      sources.push(...searchSources.filter(source => !sources.includes(source)));
    }

    const confidence = Math.min(100, Math.max(20, (session.relevantResults / 6) * 100));

    return {
      sessionId,
      query: session.query,
      relevantContent,
      sources,
      confidence,
      lastUpdated: session.endTime || new Date()
    };
  }

  /**
   * Get the most recent research context from any completed session
   */
  getMostRecentContext(): ResearchContext | null {
    let mostRecentSession: ResearchSession | null = null;
    let mostRecentTime = 0;

    for (const session of this.activeSessions.values()) {
      if (['completed', 'insufficient_results'].includes(session.status) && session.endTime) {
        const sessionTime = session.endTime.getTime();
        if (sessionTime > mostRecentTime) {
          mostRecentTime = sessionTime;
          mostRecentSession = session;
        }
      }
    }

    if (mostRecentSession) {
      return this.generateResearchContext(mostRecentSession.id);
    }

    return null;
  }
}
