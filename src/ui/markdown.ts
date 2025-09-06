import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
// Using direct hex values to avoid type key mismatches
import { gradient } from './gradient.js';
import { Config } from '../config/config.js';
import { theme } from './theme.js';

export class MarkdownRenderer {
  private config: Config | null = null;
  private renderer: any;

  constructor(options?: any) {
    try {
      this.config = (Config as any).getInstance ? (Config as any).getInstance() : null;
      if (this.config && typeof this.config.set === 'function') this.config.set('ui.useMarkdown', true);
    } catch {
      this.config = null;
    }

    const defaultOptions: any = {
      reflowText: true,
      width: process.stdout.columns ? Math.min(process.stdout.columns - 4, 100) : 80,
      showSectionPrefix: false,
      tab: 2,
      paragraph: (text: string) => text + '\n',
      list: (body: string) => body,
      firstHeading: gradient.pinkCyan,
      heading: theme.brand,
      code: theme.code,
      blockquote: theme.dim,
      html: theme.dim,
      strong: theme.brand,
      em: theme.accent,
      del: theme.dim,
      link: theme.info,
      href: theme.dim
    };

  this.renderer = new (TerminalRenderer as any)(Object.assign({}, defaultOptions, options));
  marked.setOptions({ renderer: this.renderer as any, gfm: true, breaks: true });
  }

  render(text: string): string {
    if (this.config && typeof this.config.get === 'function') {
      const enabled = this.config.get('ui.useMarkdown', true);
      if (!enabled) return text;
    }

    try {
      return marked.parse(text).toString().trim();
    } catch (err) {
      console.error('Markdown rendering error:', err);
  return typeof theme.hex === 'function' ? theme.hex('#FF5FD1', text) : text;
    }
  }
}

export function styleCodeContent(code: string, lang = ''): string {
  let styled = code;
  const hex = (hexColor: string, text: string) => typeof theme.hex === 'function' ? theme.hex(hexColor, text) : text;

  if (/^(javascript|js|typescript|ts)$/.test(lang)) {
  styled = styled.replace(/\b(const|let|var|function|if|else|for|while|return|class|interface|type|import|export|from|async|await)\b/g, m => hex('#C792EA', m));
  styled = styled.replace(/(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g, m => hex('#00FF9C', m));
  styled = styled.replace(/\b\d+(\.\d+)?\b/g, m => hex('#7AE7FF', m));
  }

  if (lang === 'json') {
  styled = styled.replace(/"([^\"]+)":/g, (_, key) => hex('#FF5FD1', `"${key}"`) + ':');
  styled = styled.replace(/:\s*"([^\"]*)"/g, (_, val) => ': ' + hex('#00FF9C', `"${val}"`));
  styled = styled.replace(/:\s*(\d+|true|false|null)/g, (_, v) => ': ' + hex('#7AE7FF', v));
  }

  if (/^(bash|shell|sh)$/.test(lang)) {
  styled = styled.replace(/^([a-zA-Z][a-zA-Z0-9_-]*)/gm, m => hex('#FF5FD1', m));
  styled = styled.replace(/(--?[a-zA-Z0-9_-]+)/g, m => hex('#7AE7FF', m));
  }

  return styled;
}

export const markdown = new MarkdownRenderer();

