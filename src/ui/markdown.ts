import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import chalk from "chalk";
import { Config } from "../config/config.js";
import { BRAND_COLORS, theme } from "./theme.js";
import { terminal } from "./colors.js";

/**
 * Beautiful markdown renderer for the terminal using marked-terminal
 * Features Pink Pixel theming with stunning colors and formatting
 */
export class MarkdownRenderer {
  private config = Config.getInstance();
  
  constructor() {
    // Configure marked with our beautiful Pink Pixel terminal renderer
    // Proper styling functions for marked-terminal compatibility
    const terminalConfig = {
      // Basic styling with proper function format for marked-terminal
      firstHeading: (text: string) => chalk.hex(BRAND_COLORS.pink).bold(text),
      heading: (text: string) => chalk.hex(BRAND_COLORS.cyan).bold(text),
      blockquote: (text: string) => chalk.hex(BRAND_COLORS.cyan).italic(text),
      code: (text: string) => chalk.hex(BRAND_COLORS.purple).bgBlack(text),
      codespan: (text: string) => chalk.hex(BRAND_COLORS.purple).bgBlack(text),
      del: (text: string) => chalk.strikethrough(text),
      em: (text: string) => chalk.hex(BRAND_COLORS.cyan).italic(text),
      strong: (text: string) => chalk.hex(BRAND_COLORS.pink).bold(text),
      hr: (text: string) => chalk.hex(BRAND_COLORS.pink)(text),
      link: (text: string) => chalk.hex(BRAND_COLORS.cyan).underline(text),
      listitem: (text: string) => chalk.hex(BRAND_COLORS.pink)(text),
      paragraph: (text: string) => chalk.hex(BRAND_COLORS.bright)(text),
      table: (text: string) => chalk.hex(BRAND_COLORS.bright)(text),
      tablerow: (text: string) => chalk.hex(BRAND_COLORS.bright)(text),
      tablecell: (text: string) => chalk.hex(BRAND_COLORS.bright)(text),
      
      // Layout options
      width: 80,
      reflowText: true,
      showSectionPrefix: false,
      tab: 2,
      
      // Provide required properties that marked-terminal expects
      unescape: true,
      emoji: true,
    };
    
    marked.use(markedTerminal(terminalConfig));
  }

  /**
   * Render markdown text to beautiful terminal format
   * @param text Markdown text to render
   */
  render(text: string): string {
    // Skip markdown rendering if disabled in config
    if (!this.config.get("ui.useMarkdown", true)) {
      return text;
    }
    
    try {
      // Use marked with our beautiful terminal renderer
      const rendered = marked.parse(text);
      return rendered.toString().trim();
    } catch (error) {
      // Fallback to plain text with a subtle error indicator
      console.error('Markdown rendering error:', error);
      return terminal.hex(BRAND_COLORS.bright, text);
    }
  }
  
  /**
   * Apply basic syntax highlighting to code content
   * @param code Code content
   * @param lang Language identifier
   */
  private styleCodeContent(code: string, lang: string): string {
    // Basic syntax highlighting for common languages
    let styledCode = code;
    
    if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
      // Highlight keywords
      styledCode = styledCode.replace(
        /\b(const|let|var|function|if|else|for|while|return|class|interface|type|import|export|from|async|await)\b/g,
        (match) => terminal.hex(BRAND_COLORS.purple, match)
      );
      
      // Highlight strings
      styledCode = styledCode.replace(
        /(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g,
        (match) => terminal.hex(BRAND_COLORS.green, match)
      );
      
      // Highlight numbers
      styledCode = styledCode.replace(
        /\b\d+(\.\d+)?\b/g,
        (match) => terminal.hex(BRAND_COLORS.cyan, match)
      );
    }
    
    if (lang === 'json') {
      // Highlight JSON keys
      styledCode = styledCode.replace(
        /"([^"]+)":/g,
        (match, key) => terminal.hex(BRAND_COLORS.pink, `"${key}"`) + ':'
      );
      
      // Highlight string values
      styledCode = styledCode.replace(
        /:\s*"([^"]*)"/g,
        (match, value) => ': ' + terminal.hex(BRAND_COLORS.green, `"${value}"`)
      );
      
      // Highlight numbers and booleans
      styledCode = styledCode.replace(
        /:\s*(\d+|true|false|null)/g,
        (match, value) => ': ' + terminal.hex(BRAND_COLORS.cyan, value)
      );
    }
    
    if (lang === 'bash' || lang === 'shell' || lang === 'sh') {
      // Highlight commands
      styledCode = styledCode.replace(
        /^([a-zA-Z][a-zA-Z0-9_-]*)/gm,
        (match) => terminal.hex(BRAND_COLORS.pink, match)
      );
      
      // Highlight flags
      styledCode = styledCode.replace(
        /(--?[a-zA-Z0-9_-]+)/g,
        (match) => terminal.hex(BRAND_COLORS.cyan, match)
      );
    }
    
    return styledCode;
  }
}

// Export singleton instance
export const markdown = new MarkdownRenderer();
