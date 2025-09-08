// utilities/text.ts
// Minimal, dependency-free helpers to make terminal rendering sane.

const ANSI_PATTERN = /\x1B\[[0-?]*[ -/]*[@-~]/g;

export function stripAnsi(input: string): string {
  return input.replace(ANSI_PATTERN, '');
}

export function trimBom(input: string): string {
  // Remove UTF-8 BOM if present
  return input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
}

export function normalizeNewlines(input: string): string {
  return input.replace(/\r\n?/g, '\n');
}

export function sanitizeForTerminal(input: string): string {
  return normalizeNewlines(trimBom(input)).replace(/[^\S\n]+\n/g, '\n');
}

// Very simple visible-width calc (ANSI stripped, counts code points)
export function visibleWidth(input: string): number {
  return Array.from(stripAnsi(input)).length;
}

// Hard wrap by visible columns, breaking long unbroken tokens too.
export function hardWrap(input: string, columns: number): string {
  const lines = normalizeNewlines(input).split('\n');
  const out: string[] = [];
  for (const line of lines) {
    const raw = stripAnsi(line);
    if (visibleWidth(raw) <= columns) {
      out.push(line);
      continue;
    }
    // Greedy wrap at spaces; if none, force-break long tokens.
    let current = '';
    for (const word of raw.split(/(\s+)/)) {
      const w = word; // already stripped
      if (visibleWidth(current + w) <= columns) {
        current += w;
        continue;
      }
      if (visibleWidth(w) > columns) {
        // Force-break the long token into chunks
        let i = 0;
        while (i < w.length) {
          const chunk = Array.from(w).slice(i, i + columns).join('');
          if (current) {
            out.push(current);
            current = '';
          }
          out.push(chunk);
          i += columns;
        }
      } else {
        // push current and start new line with this word
        if (current) out.push(current);
        current = w;
      }
    }
    if (current) out.push(current);
  }
  return out.join('\n');
}

// For JSON files: pretty print safely if possible.
export function prettyIfJson(pathLike: string, text: string): string {
  if (!/\.json$/i.test(pathLike)) return text;
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text; // Not valid JSON? Show raw text.
  }
}

// ANSI escape utilities for better terminal compatibility
export function escapeAnsi(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\x1B/g, '\\x1B')
    .replace(/\u001B/g, '\\u001B');
}

export function unescapeAnsi(input: string): string {
  return input
    .replace(/\\x1B/g, '\x1B')
    .replace(/\\u001B/g, '\u001B')
    .replace(/\\\\/g, '\\');
}

// Ensure ANSI sequences work across different terminals
export function ensureAnsiCompatibility(input: string): string {
  // For terminals that don't support certain ANSI sequences, provide fallbacks
  if (process.env.TERM === 'dumb' || process.env.NO_COLOR) {
    return stripAnsi(input);
  }
  return input;
}

// Safe gradient application with fallback
export function safeGradient(gradientFn: (text: string) => string, text: string): string {
  try {
    const result = gradientFn(text);
    return ensureAnsiCompatibility(result);
  } catch (error) {
    // Fallback to plain text if gradient fails
    return text;
  }
}
