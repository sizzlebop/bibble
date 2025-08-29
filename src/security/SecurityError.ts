/**
 * Security-related errors for MCP tool execution
 */

export class SecurityError extends Error {
  public readonly isSecurityError = true;
  
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly serverName: string,
    public readonly reason: 'blocked' | 'denied' | 'timeout' | 'policy'
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class ToolDeniedError extends SecurityError {
  constructor(toolName: string, serverName: string) {
    super(
      `Tool execution denied by user: ${toolName} from ${serverName}`,
      toolName,
      serverName,
      'denied'
    );
    this.name = 'ToolDeniedError';
  }
}

export class ToolBlockedError extends SecurityError {
  constructor(toolName: string, serverName: string) {
    super(
      `Tool is blocked by security policy: ${toolName} from ${serverName}`,
      toolName,
      serverName,
      'blocked'
    );
    this.name = 'ToolBlockedError';
  }
}

export class ToolTimeoutError extends SecurityError {
  constructor(toolName: string, serverName: string, timeoutMs: number) {
    super(
      `Tool execution timed out after ${timeoutMs}ms: ${toolName} from ${serverName}`,
      toolName,
      serverName,
      'timeout'
    );
    this.name = 'ToolTimeoutError';
  }
}

/**
 * Type guard to check if an error is security-related
 */
export function isSecurityError(error: any): error is SecurityError {
  return error && typeof error === 'object' && error.isSecurityError === true;
}
