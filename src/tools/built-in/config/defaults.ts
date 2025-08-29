/**
 * Default Configuration Values for Built-in Tools
 */

import { BuiltInToolsConfig } from '../types/index.js';

export const DEFAULT_CONFIG: BuiltInToolsConfig = {
  filesystem: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedExtensions: [
      '.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx',
      '.py', '.java', '.cpp', '.c', '.h', '.hpp',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift',
      '.html', '.css', '.scss', '.sass', '.less',
      '.xml', '.yaml', '.yml', '.toml', '.ini',
      '.sh', '.bat', '.ps1', '.dockerfile',
      '.sql', '.r', '.m', '.scala', '.kt'
    ],
    blockedPaths: [
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
    ],
    defaultEncoding: 'utf8'
  },
  process: {
    timeout: 30000, // 30 seconds
    maxConcurrent: 5,
    allowedCommands: [
      'ls', 'dir', 'pwd', 'cd', 'cat', 'head', 'tail',
      'grep', 'find', 'wc', 'sort', 'uniq',
      'git', 'npm', 'node', 'python', 'python3',
      'javac', 'java', 'gcc', 'make', 'cmake',
      'docker', 'kubectl', 'helm',
      'ping', 'curl', 'wget'
    ],
    blockedCommands: [
      'sudo', 'su', 'chmod', 'chown', 'passwd',
      'rm', 'del', 'rmdir', 'rd',
      'format', 'fdisk', 'mkfs',
      'iptables', 'netsh', 'systemctl',
      'service', 'crontab', 'at',
      'dd', 'shred', 'wipe',
      'nc', 'netcat', 'telnet', 'ssh'
    ]
  },
  search: {
    maxResults: 10000,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    defaultExcludes: [
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
    ]
  },
  edit: {
    createBackups: true,
    maxUndoHistory: 50,
    validateSyntax: true
  }
};

export const SECURITY_DEFAULTS = {
  // File patterns that should never be read or written
  DANGEROUS_PATTERNS: [
    // System files
    '/etc/passwd',
    '/etc/shadow',
    '/etc/sudoers',
    'C:\\Windows\\System32\\**',
    '/System/Library/**',
    
    // SSH keys and certificates
    '**/*_rsa',
    '**/*_dsa',
    '**/*_ecdsa',
    '**/*_ed25519',
    '**/*.pem',
    '**/*.key',
    '**/*.crt',
    '**/*.p12',
    '**/*.pfx',
    '**/.ssh/**',
    
    // Environment and config files
    '**/.env',
    '**/.env.*',
    '**/config.json',
    '**/secrets.json',
    '**/credentials.json',
    
    // Database files
    '**/*.db',
    '**/*.sqlite',
    '**/*.sqlite3',
    
    // Binary and executable files
    '**/*.exe',
    '**/*.dll',
    '**/*.so',
    '**/*.dylib',
    '**/*.bin'
  ],
  
  // Commands that should never be executed
  DANGEROUS_COMMANDS: [
    'sudo', 'su', 'doas',
    'rm', 'del', 'rmdir', 'rd',
    'chmod', 'chown', 'chgrp',
    'passwd', 'usermod', 'userdel',
    'format', 'fdisk', 'parted', 'mkfs',
    'dd', 'shred', 'wipe', 'sdelete',
    'iptables', 'netsh', 'firewall-cmd',
    'systemctl', 'service', 'launchctl',
    'crontab', 'at', 'schtasks',
    'reboot', 'shutdown', 'halt',
    'mount', 'umount', 'diskutil'
  ]
};
