import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import { BRAND_COLORS } from './colors.js';
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

    this.renderer = new TerminalRenderer(Object.assign({}, defaultOptions, options));
    marked.setOptions({ renderer: this.renderer, gfm: true, breaks: true });
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
      return typeof theme.hex === 'function' ? theme.hex(BRAND_COLORS.pink, text) : text;
    }
  }
}

export function styleCodeContent(code: string, lang = ''): string {
  let styled = code;
  const hex = (colorKey: keyof typeof BRAND_COLORS, text: string) => typeof theme.hex === 'function' ? theme.hex(BRAND_COLORS[colorKey], text) : text;

  if (/^(javascript|js|typescript|ts)$/.test(lang)) {
    styled = styled.replace(/\b(const|let|var|function|if|else|for|while|return|class|interface|type|import|export|from|async|await)\b/g, m => hex('purple', m));
    styled = styled.replace(/(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g, m => hex('green', m));
    styled = styled.replace(/\b\d+(\.\d+)?\b/g, m => hex('cyan', m));
  }

  if (lang === 'json') {
    styled = styled.replace(/"([^\"]+)":/g, (_, key) => hex('pink', `"${key}"`) + ':');
    styled = styled.replace(/:\s*"([^\"]*)"/g, (_, val) => ': ' + hex('green', `"${val}"`));
    styled = styled.replace(/:\s*(\d+|true|false|null)/g, (_, v) => ': ' + hex('cyan', v));
  }

  if (/^(bash|shell|sh)$/.test(lang)) {
    styled = styled.replace(/^([a-zA-Z][a-zA-Z0-9_-]*)/gm, m => hex('pink', m));
    styled = styled.replace(/(--?[a-zA-Z0-9_-]+)/g, m => hex('cyan', m));
  }

  return styled;
}

export const markdown = new MarkdownRenderer();

