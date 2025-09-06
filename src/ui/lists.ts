// ui/lists.ts — bullets, numbers, tasks, key/value, and columns
import stripAnsi from 'strip-ansi';
import { symbols as sym } from './symbols.js';
import { theme } from './theme.js';

export function bulletList(items: Array<string | { text: string }>): string {
  const lines = items.map((it) => {
    const text = typeof it === 'string' ? it : it.text;
    return `${theme.cyan(sym.bullet)} ${text}`;
  });
  return lines.join('\n');
}

export function numberedList(items: Array<string | { text: string }>): string {
  const lines = items.map((it, i) => {
    const text = typeof it === 'string' ? it : it.text;
    return `${theme.cyan(String(i + 1) + '.') } ${text}`;
  });
  return lines.join('\n');
}

export function taskList(tasks: Array<{ text: string; done?: boolean }>): string {
  const lines = tasks.map(({ text, done }) => {
    const box = done ? theme.ok('[x]') : theme.dim('[ ]');
    return `${box} ${text}`;
  });
  return lines.join('\n');
}

export function keyValueList(entries: Record<string, string | number | boolean>): string {
  const lines = Object.entries(entries).map(([k, v]) => theme.label(k, String(v)));
  return lines.join('\n');
}

export function columns(
  columns: Array<{ title?: string; lines: string[] }>,
  opts: { gap?: number; maxWidth?: number } = {}
): string {
  const gap = ' '.repeat(Math.max(2, opts.gap ?? 4));
  const maxWidth = opts.maxWidth ?? (process.stdout.columns || 100);

  // naive width sharing
  const per = Math.floor((maxWidth - gap.length * (columns.length - 1)) / columns.length);
  const normalize = (s: string) => {
    const raw = stripAnsi(s);
    return raw.length <= per ? s.padEnd(per) : s.slice(0, per - 1) + '…';
  };

  const rows: string[] = [];
  const maxLines = Math.max(...columns.map(c => c.lines.length + (c.title ? 1 : 0)));

  for (let i = 0; i < maxLines; i++) {
    const parts: string[] = [];
    for (const c of columns) {
      if (c.title && i === 0) {
        parts.push(normalize(theme.accent(c.title)));
      } else {
        const idx = c.title ? i - 1 : i;
        const line = idx >= 0 && idx < c.lines.length ? c.lines[idx] : '';
        parts.push(normalize(line));
      }
    }
    rows.push(parts.join(gap));
  }
  return rows.join('\n');
}
