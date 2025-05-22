import MarkdownIt from "markdown-it";
import chalk from "chalk";
import { Config } from "../config/config.js";

/**
 * Markdown renderer for the terminal
 */
export class MarkdownRenderer {
  private md: MarkdownIt;
  private config = Config.getInstance();
  
  constructor() {
    this.md = new MarkdownIt({
      html: false,
      linkify: true,
      typographer: true,
    });
  }

  /**
   * Render markdown text to terminal-friendly format
   * @param text Markdown text to render
   */
  render(text: string): string {
    // Skip markdown rendering if disabled in config
    if (!this.config.get("ui.useMarkdown", true)) {
      return text;
    }
    
    // Parse markdown
    const tokens = this.md.parse(text, {});
    let result = "";
    
    // Process tokens
    for (const token of tokens) {
      switch (token.type) {
        case "heading_open":
          // Get heading level
          const level = parseInt(token.tag.slice(1));
          result += this.renderHeading(level);
          break;
        
        case "paragraph_open":
          // Add newline before paragraph
          if (result.length > 0) {
            result += "\n";
          }
          break;
        
        case "paragraph_close":
          // Add newline after paragraph
          result += "\n";
          break;
        
        case "bullet_list_open":
          // Add newline before list
          if (result.length > 0 && !result.endsWith("\n\n")) {
            result += "\n";
          }
          break;
        
        case "list_item_open":
          // Add bullet point
          result += "• ";
          break;
        
        case "list_item_close":
          // Add newline after list item
          result += "\n";
          break;
        
        case "code_block":
          // Format code block
          result += this.renderCodeBlock(token.content, token.info);
          break;
        
        case "fence":
          // Format fenced code block
          result += this.renderCodeBlock(token.content, token.info);
          break;
        
        case "code_inline":
          // Format inline code
          result += this.renderInlineCode(token.content);
          break;
        
        case "strong_open":
          // Bold text
          result += chalk.bold("");
          break;
        
        case "em_open":
          // Italic text
          result += chalk.italic("");
          break;
        
        case "text":
          // Plain text
          result += token.content;
          break;
        
        case "link_open":
          // Extract href attribute
          const href = token.attrs?.find(([name]) => name === "href")?.[1] || "";
          result += `${chalk.blue.underline("")}`;
          break;
        
        case "link_close":
          // Add link URL
          result += ` (${chalk.blue.underline(token.href)})`;
          break;
      }
    }
    
    return result.trim();
  }

  /**
   * Render heading with appropriate formatting
   * @param level Heading level (1-6)
   * @returns Formatted heading prefix
   */
  private renderHeading(level: number): string {
    // Format heading based on level
    switch (level) {
      case 1:
        return `\n${chalk.bold.underline("")}`;
      case 2:
        return `\n${chalk.bold("")}`;
      case 3:
        return `\n${chalk.underline("")}`;
      default:
        return "\n";
    }
  }

  /**
   * Render code block with syntax highlighting
   * @param content Code content
   * @param language Language identifier
   * @returns Formatted code block
   */
  private renderCodeBlock(content: string, language: string): string {
    // Add code block formatting
    return `\n${chalk.bgBlack.white("```" + (language || ""))}
${chalk.bgBlack.white(content)}
${chalk.bgBlack.white("```")}\n`;
  }

  /**
   * Render inline code
   * @param content Code content
   * @returns Formatted inline code
   */
  private renderInlineCode(content: string): string {
    return chalk.bgBlack.white(` ${content} `);
  }
}

// Export singleton instance
export const markdown = new MarkdownRenderer();
