import crypto from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs';

export type SecurityDecision = 'allow' | 'deny' | 'prompt';

export interface SecurityConfig {
  defaultPolicy: 'trusted' | 'prompt' | 'preview' | 'strict';
  requireConfirmationGlobally: boolean;
  previewToolInputs: boolean;
  auditLogging: boolean;
  toolTimeout: number; // ms
  sensitiveOperations: string[];
}

export interface ServerSecurityPolicy {
  securityPolicy?: 'trusted' | 'prompt' | 'preview' | 'strict';
  allowedTools?: string[];
  blockedTools?: string[];
  requireConfirmation?: boolean;
  maxExecutionTime?: number; // ms
}

export interface AuditEntry {
  timestamp: string;
  server: string;
  tool: string;
  decision: SecurityDecision;
  durationMs?: number;
  argsHash?: string;
  error?: string;
}

function hashArgs(args: any): string {
  try {
    const json = JSON.stringify(args);
    return crypto.createHash('sha256').update(json).digest('hex').slice(0, 16);
  } catch {
    return 'unhashable';
  }
}

export class SecurityManager {
  constructor(
    private readonly getSecurityConfig: () => SecurityConfig & {
      serverPolicies: Record<string, 'trusted' | 'prompt' | 'preview' | 'strict'>;
      allowedTools: Record<string, string[]>;
      blockedTools: Record<string, string[]>;
    },
    private readonly riskClassifier: (toolName: string) => 'safe' | 'moderate' | 'sensitive',
    private readonly confirmFn: (info: { server: string; tool: string; args: any; risk: string; policy: string }) => Promise<boolean>,
    private readonly logDir: string = path.join(os.homedir(), '.bibble', 'audit')
  ) {}

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
  }

  private writeAudit(entry: AuditEntry) {
    if (!this.getSecurityConfig().auditLogging) return;
    this.ensureLogDir();
    const file = path.join(this.logDir, `mcp-${new Date().toISOString().slice(0,7)}.log`);
    fs.appendFileSync(file, JSON.stringify(entry) + os.EOL);
  }

  evaluateToolCall(toolName: string, serverName: string, args: any): SecurityDecision {
    const config = this.getSecurityConfig();

    // Check if tool is explicitly blocked for this server
    if (config.blockedTools[serverName]?.includes(toolName)) return 'deny';
    
    // Check if tool is explicitly trusted/allowed for this server
    // If a tool is in allowedTools, it should be allowed regardless of server policy
    if (config.allowedTools[serverName]?.includes(toolName)) {
      return 'allow';
    }

    const risk = this.riskClassifier(toolName);
    const policy = config.serverPolicies[serverName] || config.defaultPolicy;

    // Sensitive operations: elevate to prompt unless explicitly trusted
    if (risk === 'sensitive' && policy !== 'trusted') return 'prompt';

    // Global require confirmation overrides
    if (config.requireConfirmationGlobally) return 'prompt';

    switch (policy) {
      case 'trusted':
        return 'allow';
      case 'prompt':
      case 'preview':
      case 'strict':
        return 'prompt';
      default:
        return 'prompt';
    }
  }

  async maybeConfirm(toolName: string, serverName: string, args: any): Promise<boolean> {
    const config = this.getSecurityConfig();
    const risk = this.riskClassifier(toolName);
    const policy = config.serverPolicies[serverName] || config.defaultPolicy;

    // preview/strict can be handled by UI via confirmFn (UI decides how much to show)
    return this.confirmFn({ server: serverName, tool: toolName, args, risk, policy });
  }

  async withTimeout<T>(promise: Promise<T>, serverName: string): Promise<T> {
    const config = this.getSecurityConfig();
    const ms = config.toolTimeout;

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Tool call timed out after ${ms}ms`)), ms);
      promise.then(v => { clearTimeout(timer); resolve(v); })
             .catch(err => { clearTimeout(timer); reject(err); });
    });
  }

  log(server: string, tool: string, decision: SecurityDecision, args: any, durationMs?: number, error?: any) {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      server,
      tool,
      decision,
      durationMs,
      argsHash: hashArgs(args),
      error: error ? (error instanceof Error ? error.message : String(error)) : undefined,
    };
    this.writeAudit(entry);
  }
}

