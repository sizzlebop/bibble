/**
 * Standalone Content Extractor Tool for Bibble
 * Allows the agent to extract content from URLs for research workflows
 */

import { z } from 'zod';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { EnhancedWebContentExtractor } from './research/content-extractor.js';

// Global content extractor instance
let globalContentExtractor: EnhancedWebContentExtractor | null = null;

/**
 * Get or create the global content extractor
 */
function getContentExtractor(): EnhancedWebContentExtractor {
  if (!globalContentExtractor) {
    globalContentExtractor = new EnhancedWebContentExtractor();
  }
  return globalContentExtractor;
}

/**
 * Execute content extraction function
 */
async function executeContentExtraction(params: { 
  urls: string[]; 
  maxUrls?: number; 
}): Promise<any> {
  try {
    const contentExtractor = getContentExtractor();
    const urlsToProcess = params.urls.slice(0, params.maxUrls || 5);
    
    // Extract content from multiple URLs
    const extractedContent = await contentExtractor.extractMultiple(urlsToProcess);
    
    // Filter successful extractions
    const successfulExtractions = extractedContent.filter(content => content.success);
    const failedExtractions = extractedContent.filter(content => !content.success);
    
    if (successfulExtractions.length === 0) {
      return {
        success: false,
        error: 'No content could be extracted from the provided URLs',
        data: {
          totalUrls: urlsToProcess.length,
          successfulExtractions: 0,
          failedExtractions: failedExtractions.length,
          failureReasons: failedExtractions.map(f => ({ url: f.url, error: f.error }))
        }
      };
    }
    
    // Format extracted content for the LLM
    const formattedContent = successfulExtractions.map((content, index) => {
      return `EXTRACTED CONTENT ${index + 1}:
URL: ${content.url}
TITLE: ${content.title}
WORD COUNT: ${content.wordCount}
CONTENT:
${content.content}

---`;
    }).join('\n\n');
    
    return {
      success: true,
      data: {
        totalUrls: urlsToProcess.length,
        successfulExtractions: successfulExtractions.length,
        failedExtractions: failedExtractions.length,
        extractedContent: successfulExtractions,
        formattedContent: formattedContent
      },
      message: `Successfully extracted content from ${successfulExtractions.length} out of ${urlsToProcess.length} URLs.`
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: `Content extraction failed: ${errorMessage}`,
      data: {
        urls: params.urls,
        error: errorMessage
      }
    };
  }
}

/**
 * Content Extractor Built-in Tool Definition
 */
export const contentExtractorTool: BuiltInTool = {
  name: 'extract_content',
  description: 'Extract full text content from web URLs for research and analysis. Useful for getting detailed content from search results to create comprehensive documents.',
  category: 'web',
  parameters: z.object({
    urls: z.array(z.string().url()).min(1, 'At least one URL is required').max(10, 'Maximum 10 URLs allowed'),
    maxUrls: z.number().min(1).max(10).default(5).optional().describe('Maximum number of URLs to process (default: 5)')
  }).strict(),
  async execute(params: { urls: string[]; maxUrls?: number }): Promise<any> {
    return await executeContentExtraction(params);
  }
};