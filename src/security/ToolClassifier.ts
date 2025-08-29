/**
 * Tool Risk Classifier for MCP tools used in Bibble
 * Classifies tools by their potential security impact
 */

export type ToolRisk = 'safe' | 'moderate' | 'sensitive';

// Real MCP tools from Bibble's configured servers with risk classifications
const TOOL_RISK_MAP: Record<string, ToolRisk> = {
  // Safe tools - read-only operations, no system changes
  'read_file': 'safe',
  'list_directory': 'safe',
  'search_code': 'safe',
  'search_files': 'safe',
  'get_file_info': 'safe',
  'read_multiple_files': 'safe',
  'get_current_datetime': 'safe',
  'DuckDuckGoWebSearch': 'safe',
  'UrlContentExtractor': 'safe',
  'search_memory': 'safe',
  'get-library-docs': 'safe',
  'resolve-library-id': 'safe',
  'list_requests': 'safe',
  'open_task_details': 'safe',
  'get_next_task': 'safe',
  'listImageModels': 'safe',
  'listTextModels': 'safe',
  'listAudioVoices': 'safe',
  'get_file_contents': 'safe', // GitHub read operations
  'list_issues': 'safe',
  'get_issue': 'safe',
  'list_pull_requests': 'safe',
  'get_pull_request': 'safe',
  'get_pull_request_files': 'safe',
  'get_pull_request_comments': 'safe',
  'get_pull_request_reviews': 'safe',
  'get_pull_request_status': 'safe',
  'list_commits': 'safe',
  'search_code_github': 'safe', // GitHub search
  'search_issues': 'safe',
  'search_repositories': 'safe',
  'search_users': 'safe',
  'puppeteer_screenshot': 'safe', // Read-only browser operations
  'list_processes': 'safe',
  'list_sessions': 'safe',
  'read_output': 'safe',
  'get_config': 'safe',

  // Moderate tools - create/modify but not destructive
  'create_directory': 'moderate',
  'edit_block': 'moderate',
  'add_memory': 'moderate',
  'plan_task': 'moderate',
  'add_tasks_to_request': 'moderate',
  'update_task': 'moderate',
  'add_subtasks': 'moderate',
  'update_subtask': 'moderate',
  'mark_task_done': 'moderate',
  'mark_subtask_done': 'moderate',
  'add_note': 'moderate',
  'update_note': 'moderate',
  'add_dependency': 'moderate',
  'export_task_status': 'moderate',
  'generateImage': 'moderate',
  'generateImageUrl': 'moderate',
  'generateImageFromReference': 'moderate',
  'editImage': 'moderate',
  'respondText': 'moderate',
  'respondAudio': 'moderate',
  'create_issue': 'moderate', // GitHub create operations
  'add_issue_comment': 'moderate',
  'update_issue': 'moderate',
  'create_repository': 'moderate',
  'fork_repository': 'moderate',
  'create_branch': 'moderate',
  'create_or_update_file': 'moderate', // Single file operations
  'push_files': 'moderate',
  'create_pull_request': 'moderate',
  'create_pull_request_review': 'moderate',
  'update_pull_request_branch': 'moderate',
  'merge_pull_request': 'moderate',
  'puppeteer_navigate': 'moderate',
  'puppeteer_click': 'moderate',
  'puppeteer_fill': 'moderate',
  'puppeteer_select': 'moderate',
  'puppeteer_hover': 'moderate',
  'puppeteer_evaluate': 'moderate',
  'sequentialthinking': 'moderate',
  'play_notification': 'moderate',

  // Sensitive tools - potentially dangerous operations
  'execute_command': 'sensitive',
  'force_terminate': 'sensitive',
  'kill_process': 'sensitive',
  'move_file': 'sensitive',
  'delete_memory': 'sensitive',
  'delete_task': 'sensitive',
  'delete_subtask': 'sensitive',
  'delete_note': 'sensitive',
  'remove_todos': 'sensitive',
  'set_config_value': 'sensitive', // Configuration changes
};

// Default risk patterns for unknown tools
const RISK_PATTERNS = {
  sensitive: [
    /delete|remove|kill|terminate|destroy/i,
    /execute|run|cmd|command|shell/i,
    /move|mv|rename/i,
    /config|setting|preference/i,
  ],
  moderate: [
    /create|add|update|edit|modify|write/i,
    /push|commit|merge|fork/i,
    /generate|render|process/i,
  ],
  safe: [
    /read|get|list|search|find|view|show/i,
    /download|fetch|extract/i,
  ],
};

/**
 * Classify a tool by its risk level
 * @param toolName The name of the tool to classify
 * @returns Risk level: 'safe', 'moderate', or 'sensitive'
 */
export function classifyToolRisk(toolName: string): ToolRisk {
  // Check exact match first
  if (toolName in TOOL_RISK_MAP) {
    return TOOL_RISK_MAP[toolName];
  }

  // Fall back to pattern matching
  for (const pattern of RISK_PATTERNS.sensitive) {
    if (pattern.test(toolName)) return 'sensitive';
  }
  
  for (const pattern of RISK_PATTERNS.moderate) {
    if (pattern.test(toolName)) return 'moderate';
  }
  
  for (const pattern of RISK_PATTERNS.safe) {
    if (pattern.test(toolName)) return 'safe';
  }

  // Default to moderate for unknown tools (safer than assuming safe)
  return 'moderate';
}

/**
 * Get a human-readable description of what a risk level means
 */
export function getRiskDescription(risk: ToolRisk): string {
  switch (risk) {
    case 'safe':
      return 'Read-only operations that cannot modify data or system state';
    case 'moderate':
      return 'Creates or modifies data but is not destructive';
    case 'sensitive':
      return 'Potentially dangerous operations that could delete data or execute code';
  }
}

/**
 * Get risk emoji for display
 */
export function getRiskEmoji(risk: ToolRisk): string {
  switch (risk) {
    case 'safe': return '🟢';
    case 'moderate': return '🟡';
    case 'sensitive': return '🔴';
  }
}
