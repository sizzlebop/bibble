// Enhanced status badges and indicators for Bibble UI ✨

import { theme } from './theme.js';
import { iconUtils } from './tool-icons.js';
import { brandSymbols, symbols } from './symbols.js';
import { gradient } from './gradient.js';

/**
 * Application state types
 */
export type ApplicationState = 
  | 'initializing' 
  | 'ready' 
  | 'thinking' 
  | 'processing' 
  | 'streaming'
  | 'waiting'
  | 'error'
  | 'offline'
  | 'connecting';

/**
 * Status badge priority levels
 */
export type StatusPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Status badge configuration
 */
interface StatusBadge {
  icon: string;
  fallback: string;
  color: string | ((s: string) => string);
  bgColor?: string;
  text: string;
  description: string;
  priority: StatusPriority;
  animated?: boolean;
}

/**
 * Comprehensive status badge definitions
 */
export const statusBadges: Record<ApplicationState, StatusBadge> = {
  initializing: {
    icon: '⚡',
    fallback: symbols.triangleRight,
    color: theme.warning,
    text: 'Starting',
    description: 'Bibble is initializing...',
    priority: 'medium',
    animated: true
  },
  
  ready: {
    icon: '✨',
    fallback: symbols.star,
    color: theme.success,
    text: 'Ready',
    description: 'Bibble is ready for chat',
    priority: 'low'
  },
  
  thinking: {
    icon: '🤔',
    fallback: symbols.ellipsis,
    color: theme.secondary,
    text: 'Thinking',
    description: 'Processing your request...',
    priority: 'medium',
    animated: true
  },
  
  processing: {
    icon: '⚙️',
    fallback: symbols.circle,
    color: theme.info,
    text: 'Processing',
    description: 'Running tools and processing data...',
    priority: 'medium',
    animated: true
  },
  
  streaming: {
    icon: '📡',
    fallback: symbols.pointer,
    color: theme.accent,
    text: 'Streaming',
    description: 'Receiving response stream...',
    priority: 'high',
    animated: true
  },
  
  waiting: {
    icon: '⏳',
    fallback: symbols.circle,
    color: theme.dim,
    text: 'Waiting',
    description: 'Waiting for user input...',
    priority: 'low'
  },
  
  error: {
    icon: '❌',
    fallback: symbols.cross,
    color: theme.error,
    text: 'Error',
    description: 'Something went wrong',
    priority: 'critical'
  },
  
  offline: {
    icon: '🔌',
    fallback: symbols.cross,
    color: theme.error,
    text: 'Offline',
    description: 'No network connection',
    priority: 'high'
  },
  
  connecting: {
    icon: '🔄',
    fallback: symbols.radioOn,
    color: theme.warning,
    text: 'Connecting',
    description: 'Establishing connection...',
    priority: 'medium',
    animated: true
  }
};

/**
 * Progress indicator states
 */
export interface ProgressState {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showFraction?: boolean;
}

/**
 * Status badge utility functions
 */
export class StatusBadgeManager {
  private currentState: ApplicationState = 'ready';
  private statusHistory: ApplicationState[] = [];
  
  /**
   * Set the current application state
   */
  setState(state: ApplicationState): void {
    this.statusHistory.push(this.currentState);
    this.currentState = state;
    
    // Keep history to last 10 states
    if (this.statusHistory.length > 10) {
      this.statusHistory.shift();
    }
  }
  
  /**
   * Get the current state
   */
  getCurrentState(): ApplicationState {
    return this.currentState;
  }
  
  /**
   * Get the previous state
   */
  getPreviousState(): ApplicationState | undefined {
    return this.statusHistory[this.statusHistory.length - 1];
  }
  
  /**
   * Render a status badge for the current state
   */
  renderCurrentBadge(): string {
    return this.renderBadge(this.currentState);
  }
  
  /**
   * Render a status badge for a specific state
   */
  renderBadge(state: ApplicationState, compact: boolean = false): string {
    const badge = statusBadges[state];
    const icon = iconUtils.render(badge.icon, badge.fallback);
  const coloredIcon = theme.hex(badge.color as any, icon);
  const coloredText = theme.hex(badge.color as any, badge.text);
    
    if (compact) {
      return `${coloredIcon} ${coloredText}`;
    }
    
    // Full badge with description
    return `${coloredIcon} ${coloredText} ${theme.accent('—')} ${theme.text(badge.description)}`;
  }
  
  /**
   * Render an animated status badge (for states that support animation)
   */
  renderAnimatedBadge(state: ApplicationState): string {
    const badge = statusBadges[state];
    
    if (!badge.animated) {
      return this.renderBadge(state);
    }
    
    // Add animation indicators
    const sparkle = iconUtils.render(brandSymbols.sparkles, symbols.star);
    const animatedIcon = badge.animated ? `${sparkle} ${badge.icon} ${sparkle}` : badge.icon;
  const coloredIcon = theme.hex(badge.color as any, animatedIcon);
  const coloredText = theme.hex(badge.color as any, badge.text);
    
    return `${coloredIcon} ${coloredText} ${theme.accent('—')} ${theme.text(badge.description)}`;
  }
  
  /**
   * Render a progress indicator
   */
  renderProgress(progress: ProgressState): string {
    const { current, total, label, showPercentage = true, showFraction = true } = progress;
    const percentage = Math.round((current / total) * 100);
    const completed = Math.round((current / total) * 20); // 20-char progress bar
    const remaining = 20 - completed;
    
    // Create progress bar
    const progressBar = '█'.repeat(completed) + '░'.repeat(remaining);
  const coloredBar = theme.hex(theme.accent as any, progressBar);
    
    // Create progress text
    let progressText = '';
    if (showFraction) {
  progressText += `${theme.hex(theme.info as any, current.toString())}/${theme.hex(theme.dim as any, total.toString())}`;
    }
    if (showPercentage) {
      const percentText = showFraction ? ` (${percentage}%)` : `${percentage}%`;
  progressText += theme.hex(theme.secondary as any, percentText);
    }
    
    // Combine elements
    const progressIcon = iconUtils.render('📊', symbols.squareSmall);
  const result = `${theme.hex(theme.accent as any, progressIcon)} ${coloredBar} ${progressText}`;
    
    return label ? `${theme.dim(label + ':')} ${result}` : result;
  }
  
  /**
   * Render a priority badge based on status priority
   */
  renderPriorityBadge(state: ApplicationState): string {
    const badge = statusBadges[state];
    const priorityIcons = {
      low: { icon: '🟢', color: theme.success },
      medium: { icon: '🟡', color: theme.warning },
      high: { icon: '🟠', color: theme.info },
      critical: { icon: '🔴', color: theme.error }
    };
    
    const priority = priorityIcons[badge.priority];
  const coloredIcon = theme.hex(priority.color as any, priority.icon);
  const priorityText = theme.hex(priority.color as any, badge.priority.toUpperCase());
    
    return `${coloredIcon} ${priorityText}`;
  }
  
  /**
   * Create a comprehensive status display
   */
  renderFullStatus(): string {
    const currentBadge = this.renderAnimatedBadge(this.currentState);
    const priorityBadge = this.renderPriorityBadge(this.currentState);
    const separator = theme.accent('│');
    
    return `${currentBadge} ${separator} ${priorityBadge}`;
  }
  
  /**
   * Get appropriate status for different contexts
   */
  getContextualStatus(context: 'chat' | 'tool' | 'system' | 'network'): ApplicationState {
    const contextMap: Record<string, ApplicationState> = {
      chat: this.currentState === 'thinking' ? 'thinking' : 'ready',
      tool: this.currentState === 'processing' ? 'processing' : 'ready',
      system: this.currentState,
      network: this.currentState === 'offline' ? 'offline' : 'ready'
    };
    
    return contextMap[context];
  }
}

/**
 * Global status badge manager instance
 */
export const statusManager = new StatusBadgeManager();

/**
 * Quick status badge utilities
 */
export const statusUtils = {
  /**
   * Quick success badge
   */
  success(message: string): string {
  const icon = iconUtils.coloredIcon('✅', symbols.tick, theme.success);
  return `${icon} ${theme.hex(theme.success as any, message)}`;
  },
  
  /**
   * Quick error badge
   */
  error(message: string): string {
  const icon = iconUtils.coloredIcon('❌', symbols.cross, theme.error);
  return `${icon} ${theme.hex(theme.error as any, message)}`;
  },
  
  /**
   * Quick warning badge
   */
  warning(message: string): string {
  const icon = iconUtils.coloredIcon('⚠️', symbols.warning, theme.warning);
  return `${icon} ${theme.hex(theme.warning as any, message)}`;
  },
  
  /**
   * Quick info badge
   */
  info(message: string): string {
  const icon = iconUtils.coloredIcon('ℹ️', symbols.info, theme.info);
  return `${icon} ${theme.hex(theme.info as any, message)}`;
  },
  
  /**
   * Quick loading badge
   */
  loading(message: string): string {
    const icon = iconUtils.coloredIcon('⏳', symbols.ellipsis, theme.secondary);
    const sparkle = iconUtils.render(brandSymbols.sparkles, symbols.star);
  return `${sparkle} ${icon} ${theme.hex(theme.secondary as any, message)} ${sparkle}`;
  },
  
  /**
   * Create a timestamped status message
   */
  timestamped(message: string, state: ApplicationState = 'ready'): string {
    const badge = statusManager.renderBadge(state, true);
    const timestamp = theme.dim(new Date().toLocaleTimeString());
    return `[${timestamp}] ${badge} ${message}`;
  },
  
  /**
   * Create a branded status message with Pink Pixel styling
   */
  branded(message: string): string {
    const sparkle = iconUtils.render(brandSymbols.sparkles, symbols.star);
    const gradient_text = gradient.pinkCyan(message);
    return `${sparkle} ${gradient_text} ${sparkle}`;
  }
};
