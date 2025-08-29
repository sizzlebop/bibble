/**
 * Configuration Schemas for Built-in Tools
 */

import { z } from 'zod';

// Filesystem configuration schema
const FilesystemConfigSchema = z.object({
  maxFileSize: z.number().positive().default(50 * 1024 * 1024),
  allowedExtensions: z.array(z.string()).default([
    '.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx',
    '.py', '.java', '.cpp', '.c', '.h', '.hpp',
    '.cs', '.php', '.rb', '.go', '.rs', '.swift',
    '.html', '.css', '.scss', '.sass', '.less',
    '.xml', '.yaml', '.yml', '.toml', '.ini',
    '.sh', '.bat', '.ps1', '.dockerfile',
    '.sql', '.r', '.m', '.scala', '.kt'
  ]),
  blockedPaths: z.array(z.string()).default([
    '/etc/passwd',
    '/etc/shadow',
    '/etc/sudoers',
    'C:\\Windows\\System32\\config',
    'C:\\Windows\\System32\\drivers',
    '/System/Library',
    '/usr/bin/sudo',
    '**/.git/objects/**',
    '**/node_modules/**',
    '**/.env*',
    '**/*_rsa',
    '**/*_dsa',
    '**/*.pem',
    '**/*.key',
    '**/*.p12',
    '**/*.pfx'
  ]),
  defaultEncoding: z.enum(['utf8', 'utf16le', 'latin1', 'ascii', 'base64']).default('utf8')
});

// Process configuration schema
const ProcessConfigSchema = z.object({
  timeout: z.number().positive().default(30000),
  maxConcurrent: z.number().positive().default(5),
  allowedCommands: z.array(z.string()).default([
    'ls', 'dir', 'pwd', 'cd', 'cat', 'head', 'tail',
    'grep', 'find', 'wc', 'sort', 'uniq',
    'git', 'npm', 'node', 'python', 'python3',
    'javac', 'java', 'gcc', 'make', 'cmake',
    'docker', 'kubectl', 'helm',
    'ping', 'curl', 'wget'
  ]),
  blockedCommands: z.array(z.string()).default([
    'sudo', 'su', 'chmod', 'chown', 'passwd',
    'rm', 'del', 'rmdir', 'rd',
    'format', 'fdisk', 'mkfs',
    'iptables', 'netsh', 'systemctl',
    'service', 'crontab', 'at',
    'dd', 'shred', 'wipe',
    'nc', 'netcat', 'telnet', 'ssh'
  ])
});

// Search configuration schema
const SearchConfigSchema = z.object({
  maxResults: z.number().positive().default(10000),
  maxFileSize: z.number().positive().default(10 * 1024 * 1024),
  defaultExcludes: z.array(z.string()).default([
    '**/.git/**',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.vscode/**',
    '**/.idea/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/*.map',
    '**/coverage/**',
    '**/.nyc_output/**',
    '**/logs/**',
    '**/*.log'
  ])
});

// Edit configuration schema
const EditConfigSchema = z.object({
  createBackups: z.boolean().default(true),
  maxUndoHistory: z.number().positive().default(50),
  validateSyntax: z.boolean().default(true)
});

// Main configuration schema
export const BuiltInToolsConfigSchema = z.object({
  filesystem: FilesystemConfigSchema,
  process: ProcessConfigSchema,
  search: SearchConfigSchema,
  edit: EditConfigSchema
});

// Partial configuration schema for updates
export const PartialBuiltInToolsConfigSchema = z.object({
  filesystem: FilesystemConfigSchema.partial().optional(),
  process: ProcessConfigSchema.partial().optional(),
  search: SearchConfigSchema.partial().optional(),
  edit: EditConfigSchema.partial().optional()
});

// Type exports
export type ValidatedBuiltInToolsConfig = z.infer<typeof BuiltInToolsConfigSchema>;
export type PartialBuiltInToolsConfig = z.infer<typeof PartialBuiltInToolsConfigSchema>;
