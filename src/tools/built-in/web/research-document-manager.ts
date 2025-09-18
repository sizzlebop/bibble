/**
 * Research Document Management System for Bibble
 * Manages research documents, organization, and retrieval
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { BuiltInTool } from '../../../ui/tool-display.js';

export interface ResearchDocument {
  id: string;
  title: string;
  topic: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
  characterCount: number;
  wordCount: number;
  sourcesCount: number;
  confidence: number;
  tags: string[];
  category: string;
  isMultiPart: boolean;
  partNumber?: number;
  totalParts?: number;
  relatedDocuments: string[];
}

export interface ResearchIndex {
  documents: ResearchDocument[];
  lastUpdated: Date;
  totalDocuments: number;
  totalCharacters: number;
  categories: string[];
  tags: string[];
}

/**
 * Get the research directory path
 */
function getResearchDirectory(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd();
  const researchDir = path.join(homeDir, 'Bibble-Research');
  
  if (!fs.existsSync(researchDir)) {
    fs.mkdirSync(researchDir, { recursive: true });
  }
  
  return researchDir;
}

/**
 * Get the research index file path
 */
function getIndexPath(): string {
  return path.join(getResearchDirectory(), '.research-index.json');
}

/**
 * Load the research index
 */
function loadResearchIndex(): ResearchIndex {
  const indexPath = getIndexPath();
  
  if (!fs.existsSync(indexPath)) {
    const emptyIndex: ResearchIndex = {
      documents: [],
      lastUpdated: new Date(),
      totalDocuments: 0,
      totalCharacters: 0,
      categories: [],
      tags: []
    };
    saveResearchIndex(emptyIndex);
    return emptyIndex;
  }
  
  try {
    const data = fs.readFileSync(indexPath, 'utf8');
    const index = JSON.parse(data) as ResearchIndex;
    
    // Convert date strings back to Date objects
    index.lastUpdated = new Date(index.lastUpdated);
    index.documents.forEach(doc => {
      doc.createdAt = new Date(doc.createdAt);
      doc.updatedAt = new Date(doc.updatedAt);
    });
    
    return index;
  } catch (error) {
    console.warn('Error loading research index, creating new one:', error);
    const emptyIndex: ResearchIndex = {
      documents: [],
      lastUpdated: new Date(),
      totalDocuments: 0,
      totalCharacters: 0,
      categories: [],
      tags: []
    };
    saveResearchIndex(emptyIndex);
    return emptyIndex;
  }
}

/**
 * Save the research index
 */
function saveResearchIndex(index: ResearchIndex): void {
  const indexPath = getIndexPath();
  index.lastUpdated = new Date();
  
  try {
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving research index:', error);
  }
}

/**
 * Generate document ID from topic
 */
function generateDocumentId(topic: string): string {
  const cleanTopic = topic.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
  const timestamp = Date.now().toString(36);
  return `${cleanTopic}_${timestamp}`.toLowerCase();
}

/**
 * Analyze document content to extract metadata
 */
function analyzeDocument(filePath: string, topic: string): Partial<ResearchDocument> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Extract metadata from document
    let sourcesCount = 0;
    let confidence = 0;
    let title = topic;
    
    for (const line of lines) {
      if (line.includes('**Sources Analyzed:**')) {
        const match = line.match(/\d+/);
        if (match) sourcesCount = parseInt(match[0]);
      }
      if (line.includes('**Research Confidence:**')) {
        const match = line.match(/(\d+)%/);
        if (match) confidence = parseInt(match[1]);
      }
      if (line.startsWith('# ')) {
        title = line.substring(2).replace('Comprehensive Research Report:', '').trim();
      }
    }
    
    const characterCount = content.length;
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    // Auto-categorize based on content
    let category = 'General';
    if (/\b(?:technology|software|programming|computer|ai|artificial intelligence)\b/i.test(content)) {
      category = 'Technology';
    } else if (/\b(?:science|research|study|analysis|biology|chemistry|physics)\b/i.test(content)) {
      category = 'Science';
    } else if (/\b(?:business|finance|economy|market|company|corporate)\b/i.test(content)) {
      category = 'Business';
    } else if (/\b(?:history|historical|ancient|medieval|modern|past|events)\b/i.test(content)) {
      category = 'History';
    } else if (/\b(?:health|medical|medicine|disease|treatment|healthcare)\b/i.test(content)) {
      category = 'Health';
    } else if (/\b(?:education|learning|school|university|academic|student)\b/i.test(content)) {
      category = 'Education';
    }
    
    // Extract tags from content
    const tags: string[] = [];
    const tagPatterns = [
      /\b(?:artificial intelligence|machine learning|deep learning|AI|ML|DL)\b/gi,
      /\b(?:blockchain|cryptocurrency|bitcoin|ethereum|NFT)\b/gi,
      /\b(?:climate change|global warming|sustainability|renewable energy)\b/gi,
      /\b(?:programming|software development|coding|algorithms)\b/gi,
      /\b(?:healthcare|medicine|medical research|pharmaceutical)\b/gi,
      /\b(?:education|e-learning|online learning|MOOC)\b/gi,
      /\b(?:business strategy|market analysis|competitive analysis)\b/gi,
    ];
    
    for (const pattern of tagPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const tag = match.toLowerCase();
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
      }
    }
    
    return {
      title,
      characterCount,
      wordCount,
      sourcesCount,
      confidence,
      category,
      tags
    };
  } catch (error) {
    console.warn('Error analyzing document:', error);
    return {
      title: topic,
      characterCount: 0,
      wordCount: 0,
      sourcesCount: 0,
      confidence: 0,
      category: 'General',
      tags: []
    };
  }
}

/**
 * Register a new research document
 */
export function registerResearchDocument(
  topic: string,
  filePaths: string[],
  additionalMetadata?: {
    sourcesCount?: number;
    confidence?: number;
    tags?: string[];
    category?: string;
  }
): ResearchDocument[] {
  const index = loadResearchIndex();
  const documents: ResearchDocument[] = [];
  
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    const analyzed = analyzeDocument(filePath, topic);
    
    const document: ResearchDocument = {
      id: generateDocumentId(topic) + (filePaths.length > 1 ? `_part${i + 1}` : ''),
      title: analyzed.title || topic,
      topic,
      filePath,
      createdAt: new Date(),
      updatedAt: new Date(),
      characterCount: analyzed.characterCount || 0,
      wordCount: analyzed.wordCount || 0,
      sourcesCount: additionalMetadata?.sourcesCount || analyzed.sourcesCount || 0,
      confidence: additionalMetadata?.confidence || analyzed.confidence || 0,
      tags: [...(analyzed.tags || []), ...(additionalMetadata?.tags || [])],
      category: additionalMetadata?.category || analyzed.category || 'General',
      isMultiPart: filePaths.length > 1,
      partNumber: filePaths.length > 1 ? i + 1 : undefined,
      totalParts: filePaths.length > 1 ? filePaths.length : undefined,
      relatedDocuments: filePaths.length > 1 ? filePaths.filter(fp => fp !== filePath) : []
    };
    
    documents.push(document);
    index.documents.push(document);
  }
  
  // Update index statistics
  index.totalDocuments = index.documents.length;
  index.totalCharacters = index.documents.reduce((total, doc) => total + doc.characterCount, 0);
  index.categories = [...new Set(index.documents.map(doc => doc.category))];
  index.tags = [...new Set(index.documents.flatMap(doc => doc.tags))];
  
  saveResearchIndex(index);
  return documents;
}

/**
 * List research documents with filtering
 */
async function listResearchDocuments(params: {
  category?: string;
  tag?: string;
  searchTerm?: string;
  sortBy?: 'date' | 'title' | 'size' | 'confidence';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}): Promise<any> {
  try {
    const index = loadResearchIndex();
    let documents = [...index.documents];
    
    // Apply filters
    if (params.category) {
      documents = documents.filter(doc => 
        doc.category.toLowerCase() === params.category!.toLowerCase()
      );
    }
    
    if (params.tag) {
      documents = documents.filter(doc => 
        doc.tags.some(tag => tag.toLowerCase().includes(params.tag!.toLowerCase()))
      );
    }
    
    if (params.searchTerm) {
      const searchTerm = params.searchTerm.toLowerCase();
      documents = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.topic.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort documents
    const sortBy = params.sortBy || 'date';
    const sortOrder = params.sortOrder || 'desc';
    
    documents.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'size':
          aValue = a.characterCount;
          bValue = b.characterCount;
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'date':
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Apply limit
    if (params.limit) {
      documents = documents.slice(0, params.limit);
    }
    
    const summary = `RESEARCH DOCUMENT LIBRARY

**Total Documents:** ${index.totalDocuments}
**Total Content:** ${index.totalCharacters.toLocaleString()} characters
**Categories:** ${index.categories.join(', ')}
**Last Updated:** ${index.lastUpdated.toLocaleDateString()}

**Filtered Results:** ${documents.length} documents

${documents.map((doc, i) => `
**${i + 1}. ${doc.title}**
- Topic: ${doc.topic}
- Category: ${doc.category}
- Size: ${doc.characterCount.toLocaleString()} characters (${doc.wordCount.toLocaleString()} words)
- Confidence: ${doc.confidence}% | Sources: ${doc.sourcesCount}
- Created: ${doc.createdAt.toLocaleDateString()}
- Tags: ${doc.tags.join(', ') || 'None'}
- File: ${doc.filePath}${doc.isMultiPart ? ` (Part ${doc.partNumber}/${doc.totalParts})` : ''}
`).join('\n')}

**Available Categories:** ${index.categories.join(', ')}
**Popular Tags:** ${index.tags.slice(0, 10).join(', ')}`;
    
    return {
      success: true,
      data: {
        documents,
        totalDocuments: index.totalDocuments,
        filteredCount: documents.length,
        categories: index.categories,
        tags: index.tags,
        results: summary
      },
      message: `Found ${documents.length} research documents${params.category ? ` in ${params.category}` : ''}${params.tag ? ` tagged with ${params.tag}` : ''}${params.searchTerm ? ` matching "${params.searchTerm}"` : ''}`
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Failed to list research documents: ${errorMessage}`,
      data: {
        error: errorMessage
      }
    };
  }
}

/**
 * Get research document statistics
 */
async function getResearchStatistics(): Promise<any> {
  try {
    const index = loadResearchIndex();
    const researchDir = getResearchDirectory();
    
    // Calculate additional statistics
    const byCategory = index.categories.map(category => ({
      category,
      count: index.documents.filter(doc => doc.category === category).length,
      totalCharacters: index.documents
        .filter(doc => doc.category === category)
        .reduce((total, doc) => total + doc.characterCount, 0)
    }));
    
    const topTags = index.tags.slice(0, 15);
    const avgConfidence = index.documents.length > 0 
      ? Math.round(index.documents.reduce((sum, doc) => sum + doc.confidence, 0) / index.documents.length)
      : 0;
    
    const avgCharacters = index.documents.length > 0
      ? Math.round(index.totalCharacters / index.documents.length)
      : 0;
    
    const multiPartDocs = index.documents.filter(doc => doc.isMultiPart).length;
    
    const statsReport = `RESEARCH LIBRARY STATISTICS

**Overview:**
- Total Documents: ${index.totalDocuments}
- Total Content: ${index.totalCharacters.toLocaleString()} characters
- Average Document Size: ${avgCharacters.toLocaleString()} characters
- Average Confidence: ${avgConfidence}%
- Multi-part Documents: ${multiPartDocs}
- Research Directory: ${researchDir}

**By Category:**
${byCategory.map(cat => 
  `- ${cat.category}: ${cat.count} documents (${cat.totalCharacters.toLocaleString()} chars)`
).join('\n')}

**Popular Research Tags:**
${topTags.join(', ')}

**Recent Activity:**
${index.documents
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  .slice(0, 5)
  .map((doc, i) => `${i + 1}. ${doc.title} (${doc.createdAt.toLocaleDateString()})`)
  .join('\n')}

**Quality Metrics:**
- High Confidence (80%+): ${index.documents.filter(doc => doc.confidence >= 80).length} documents
- Medium Confidence (60-79%): ${index.documents.filter(doc => doc.confidence >= 60 && doc.confidence < 80).length} documents
- Lower Confidence (<60%): ${index.documents.filter(doc => doc.confidence < 60).length} documents

Last Updated: ${index.lastUpdated.toLocaleString()}`;
    
    return {
      success: true,
      data: {
        totalDocuments: index.totalDocuments,
        totalCharacters: index.totalCharacters,
        avgCharacters,
        avgConfidence,
        categories: byCategory,
        topTags,
        multiPartDocs,
        researchDirectory: researchDir,
        lastUpdated: index.lastUpdated,
        results: statsReport
      },
      message: `Research library contains ${index.totalDocuments} documents with ${index.totalCharacters.toLocaleString()} total characters`
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Failed to get research statistics: ${errorMessage}`,
      data: {
        error: errorMessage
      }
    };
  }
}

/**
 * Research Document Manager Tool Definition
 */
export const researchDocumentManagerTool: BuiltInTool = {
  name: 'research_document_manager',
  description: 'Manage and organize research documents created by comprehensive research. List documents by category, search, view statistics, and organize your research library.',
  category: 'web',
  parameters: z.object({
    action: z.enum(['list', 'statistics', 'search']),
    category: z.string().optional(),
    tag: z.string().optional(),
    searchTerm: z.string().optional(),
    sortBy: z.enum(['date', 'title', 'size', 'confidence']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    limit: z.number().min(1).max(100).default(20)
  }).strict(),
  async execute(params: {
    action: 'list' | 'statistics' | 'search';
    category?: string;
    tag?: string;
    searchTerm?: string;
    sortBy?: 'date' | 'title' | 'size' | 'confidence';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  }): Promise<any> {
    if (params.action === 'statistics') {
      return await getResearchStatistics();
    } else {
      return await listResearchDocuments({
        category: params.category,
        tag: params.tag,
        searchTerm: params.searchTerm,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        limit: params.limit
      });
    }
  }
};