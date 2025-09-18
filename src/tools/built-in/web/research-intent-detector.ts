/**
 * Research Intent Detection System for Bibble
 * Automatically detects whether user wants comprehensive research or quick lookup
 */

export interface ResearchIntent {
  intentType: 'comprehensive_research' | 'quick_lookup' | 'fact_check';
  confidence: number;
  reasoning: string[];
  suggestedTool: string;
  estimatedComplexity: 'low' | 'medium' | 'high' | 'very_high';
}

/**
 * Analyze user query to determine research intent
 */
export function detectResearchIntent(userQuery: string): ResearchIntent {
  const query = userQuery.toLowerCase().trim();
  const reasoning: string[] = [];
  let intentType: 'comprehensive_research' | 'quick_lookup' | 'fact_check' = 'quick_lookup';
  let confidence = 0;
  let complexity: 'low' | 'medium' | 'high' | 'very_high' = 'low';

  // Strong indicators for comprehensive research
  const comprehensiveIndicators = [
    // Direct requests for research/documentation
    /\b(research|investigate|analyze|study|examine|explore)\s+(?:about|on|into)?\s*\w+/,
    /create\s+(?:a\s+)?(?:comprehensive|detailed|thorough|complete|full)\s+(?:report|document|analysis|study)/,
    /write\s+(?:a\s+)?(?:research\s+)?(?:paper|report|document|analysis)/,
    /generate\s+(?:a\s+)?(?:comprehensive|detailed|thorough)\s+(?:report|document|analysis)/,
    /prepare\s+(?:a\s+)?(?:detailed|comprehensive|thorough)\s+(?:report|analysis|study)/,
    /compile\s+(?:information|data|research)\s+(?:about|on)/,
    
    // Academic/professional research language
    /\b(?:comprehensive|thorough|detailed|in-depth|extensive)\s+(?:research|analysis|study|investigation)\b/,
    /\b(?:literature\s+review|systematic\s+review|meta-analysis|survey\s+of)\b/,
    /\b(?:academic|scholarly|scientific)\s+(?:research|study|analysis)\b/,
    
    // Document creation requests
    /save\s+(?:the\s+)?(?:results?|findings?|information)\s+to\s+(?:a\s+)?(?:file|document)/,
    /create\s+(?:a\s+)?(?:file|document|report)\s+(?:about|on|for)/,
    /document\s+everything\s+(?:about|you\s+find)/,
    /put\s+(?:all\s+)?(?:the\s+)?(?:information|findings?|results?)\s+in\s+(?:a\s+)?(?:file|document)/,
    
    // Complexity indicators
    /\b(?:complete\s+guide|ultimate\s+guide|definitive\s+guide|handbook|manual)\b/,
    /\b(?:history\s+and|overview\s+and|theory\s+and|pros\s+and\s+cons|comparison\s+of)\b/,
    /\b(?:everything\s+about|all\s+aspects\s+of|comprehensive\s+overview)\b/
  ];

  // Medium indicators for research (could go either way)
  const mediumResearchIndicators = [
    /\b(?:explain|describe|tell\s+me\s+about)\s+.{20,}/,  // Long explanations
    /\b(?:how\s+(?:does|do|can|to)|what\s+(?:is|are)|why\s+(?:is|do|does))\s+.{30,}/,  // Complex questions
    /\b(?:overview|summary|background|context)\s+(?:of|on|about)\b/,
    /\b(?:detailed|thorough|complete)\s+(?:explanation|description|breakdown)\b/
  ];

  // Strong indicators for quick lookup
  const quickLookupIndicators = [
    // Simple factual questions
    /^\s*(?:what|who|when|where|which|how\s+(?:much|many|long|old))\s+(?:is|are|was|were|do|does|did)\s+[^?]*\??\s*$/,
    /^\s*(?:is|are|was|were|do|does|did|can|could|will|would)\s+[^?]*\??\s*$/,
    
    // Quick search requests
    /\b(?:quickly?\s+)?(?:search\s+for|look\s+up|find\s+(?:out\s+)?(?:about|info\s+on))\b/,
    /\b(?:just\s+)?(?:tell\s+me|show\s+me|give\s+me)\s+(?:the\s+)?(?:answer|information|details?)\b/,
    /\b(?:quick|brief|short|simple)\s+(?:answer|explanation|info|information|summary)\b/,
    /\b(?:what\s+is|who\s+is|when\s+is|where\s+is)\s+(?:the\s+)?\w+\s*\??\s*$/,
    
    // Conversational queries without documentation intent
    /\b(?:can\s+you|could\s+you|please)\s+(?:tell|explain|show)\s+me\b/,
    /\bi\s+(?:want\s+to\s+know|need\s+to\s+know|wonder)\b/,
    /\b(?:just\s+)?(?:curious\s+about|wondering\s+about)\b/
  ];

  // Fact-checking indicators
  const factCheckIndicators = [
    /\b(?:is\s+it\s+true\s+that|verify\s+that|check\s+if|confirm\s+that)\b/,
    /\b(?:fact\s*check|verify|confirm|validate)\s+(?:this|the\s+)?(?:claim|statement|information)\b/,
    /\b(?:true\s+or\s+false|accurate\s+or\s+not|correct\s+that)\b/,
    /^\s*(?:true|false)\s*[:\-]?\s+/,
    /\bdid\s+.+\s+(?:really|actually)\s+(?:happen|occur|say|do)\b/
  ];

  // Check for comprehensive research indicators first
  for (const pattern of comprehensiveIndicators) {
    if (pattern.test(query)) {
      intentType = 'comprehensive_research';
      confidence += 25;
      reasoning.push(`Strong research indicator found: "${query.match(pattern)?.[0]}"`);
    }
  }

  // Check for fact-checking indicators
  for (const pattern of factCheckIndicators) {
    if (pattern.test(query)) {
      if (intentType !== 'comprehensive_research') {
        intentType = 'fact_check';
      }
      confidence += 20;
      reasoning.push(`Fact-checking indicator found: "${query.match(pattern)?.[0]}"`);
    }
  }

  // Check for medium research indicators
  for (const pattern of mediumResearchIndicators) {
    if (pattern.test(query)) {
      if (intentType === 'quick_lookup') {
        confidence += 15;
        reasoning.push(`Medium complexity indicator found: "${query.match(pattern)?.[0]}"`);
      }
    }
  }

  // Check for quick lookup indicators
  for (const pattern of quickLookupIndicators) {
    if (pattern.test(query)) {
      if (intentType === 'quick_lookup') {
        confidence += 20;
        reasoning.push(`Quick lookup indicator found: "${query.match(pattern)?.[0]}"`);
      } else {
        // Conflicting signals - reduce confidence
        confidence -= 10;
        reasoning.push(`Conflicting quick lookup signal detected`);
      }
    }
  }

  // Analyze query characteristics
  const wordCount = query.split(/\s+/).length;
  const hasQuestionMark = query.includes('?');
  const hasMultipleSentences = query.split(/[.!?]+/).filter(s => s.trim().length > 0).length > 1;
  const hasSpecificKeywords = /\b(?:document|report|file|save|create|generate|comprehensive|detailed|thorough)\b/.test(query);

  // Adjust based on query characteristics
  if (wordCount > 20 && !hasQuestionMark) {
    if (intentType !== 'comprehensive_research') {
      confidence += 10;
      reasoning.push(`Long query without question mark suggests research intent`);
    }
    complexity = wordCount > 40 ? 'very_high' : 'high';
  } else if (wordCount < 10 && hasQuestionMark) {
    if (intentType === 'quick_lookup') {
      confidence += 15;
      reasoning.push(`Short question suggests quick lookup`);
    }
    complexity = 'low';
  } else {
    complexity = 'medium';
  }

  if (hasMultipleSentences) {
    if (intentType !== 'quick_lookup') {
      confidence += 10;
      reasoning.push(`Multiple sentences suggest complex request`);
    }
    complexity = complexity === 'low' ? 'medium' : complexity;
  }

  if (hasSpecificKeywords) {
    if (intentType === 'comprehensive_research') {
      confidence += 15;
      reasoning.push(`Document/research keywords found`);
    }
  }

  // Default confidence adjustments
  if (confidence === 0) {
    if (intentType === 'quick_lookup') {
      confidence = 60; // Default assumption for ambiguous queries
      reasoning.push(`Default assumption: quick lookup for ambiguous query`);
    }
  }

  // Cap confidence at reasonable levels
  confidence = Math.min(confidence, 95);
  confidence = Math.max(confidence, 10);

  // If confidence is too low and we detected research, default to quick lookup
  if (confidence < 30 && intentType === 'comprehensive_research') {
    intentType = 'quick_lookup';
    confidence = 50;
    reasoning.push(`Low confidence research signal - defaulting to quick lookup`);
  }

  // Determine suggested tool
  let suggestedTool = '';
  switch (intentType) {
    case 'comprehensive_research':
      suggestedTool = 'comprehensive_research';
      break;
    case 'fact_check':
      suggestedTool = 'fact_check';
      break;
    case 'quick_lookup':
    default:
      suggestedTool = 'quick_information_lookup';
      break;
  }

  return {
    intentType,
    confidence,
    reasoning,
    suggestedTool,
    estimatedComplexity: complexity
  };
}

/**
 * Generate explanation for the detected intent
 */
export function explainIntent(intent: ResearchIntent): string {
  const intentLabels = {
    'comprehensive_research': 'Comprehensive Research with Document Generation',
    'quick_lookup': 'Quick Information Lookup',
    'fact_check': 'Fact Verification'
  };

  const complexityLabels = {
    'low': 'Low complexity - simple query',
    'medium': 'Medium complexity - moderate detail required',
    'high': 'High complexity - detailed analysis needed',
    'very_high': 'Very high complexity - extensive research required'
  };

  let explanation = `**Intent Detection Results:**\n\n`;
  explanation += `- **Detected Intent:** ${intentLabels[intent.intentType]}\n`;
  explanation += `- **Confidence:** ${intent.confidence}%\n`;
  explanation += `- **Complexity:** ${complexityLabels[intent.estimatedComplexity]}\n`;
  explanation += `- **Suggested Tool:** ${intent.suggestedTool}\n\n`;
  
  if (intent.reasoning.length > 0) {
    explanation += `**Reasoning:**\n`;
    intent.reasoning.forEach((reason, index) => {
      explanation += `${index + 1}. ${reason}\n`;
    });
  }

  return explanation;
}

/**
 * Smart research dispatcher that automatically chooses the right tool
 */
export async function smartResearchDispatch(
  userQuery: string,
  availableTools: { [toolName: string]: any }
): Promise<{
  toolName: string;
  parameters: any;
  explanation: string;
  confidence: number;
}> {
  const intent = detectResearchIntent(userQuery);
  const explanation = explainIntent(intent);
  
  let toolName = '';
  let parameters: any = {};

  switch (intent.intentType) {
    case 'comprehensive_research':
      toolName = 'comprehensive_research';
      parameters = {
        topic: userQuery.trim(),
        createMultipleDocs: intent.estimatedComplexity === 'very_high'
      };
      break;

    case 'fact_check':
      toolName = 'fact_check';
      // Extract the claim from the query
      let claim = userQuery.trim();
      claim = claim.replace(/^(?:fact\s*check|verify|check\s+if|is\s+it\s+true\s+that)\s*/i, '');
      claim = claim.replace(/\?$/, '');
      parameters = {
        claim: claim
      };
      break;

    case 'quick_lookup':
    default:
      toolName = 'quick_information_lookup';
      parameters = {
        query: userQuery.trim()
      };
      break;
  }

  return {
    toolName,
    parameters,
    explanation,
    confidence: intent.confidence
  };
}