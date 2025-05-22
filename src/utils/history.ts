import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { HISTORY_DIR } from "../config/storage.js";
import { Config } from "../config/config.js";
import { ChatMessage, ChatHistoryEntry, MessageRole } from "../types.js";

/**
 * Chat history manager for storing and retrieving chat sessions
 */
export class ChatHistory {
  private config = Config.getInstance();
  
  /**
   * Save a chat session to history
   * @param messages Chat messages to save
   * @param title Optional title for the chat
   * @param model Model used for the chat
   * @returns Chat history entry ID
   */
  saveChat(messages: ChatMessage[], title?: string, model?: string): string {
    // Skip if history saving is disabled
    if (!this.config.get("chat.saveHistory", true)) {
      return "";
    }
    
    // Generate ID and prepare entry
    const id = uuidv4();
    const now = new Date();
    
    // Generate title if not provided
    const entryTitle = title || this.generateTitle(messages);
    
    // Create entry
    const entry: ChatHistoryEntry = {
      id,
      title: entryTitle,
      date: now.toISOString(),
      messages,
      model: model || this.config.getDefaultModel(),
    };
    
    // Save to file
    const filePath = path.join(HISTORY_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), "utf8");
    
    return id;
  }

  /**
   * Load a chat session from history
   * @param id Chat history entry ID
   * @returns Chat history entry or null if not found
   */
  loadChat(id: string): ChatHistoryEntry | null {
    try {
      const filePath = path.join(HISTORY_DIR, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content) as ChatHistoryEntry;
    } catch (error) {
      console.error("Error loading chat history:", error);
      return null;
    }
  }

  /**
   * List all chat history entries
   * @returns Array of chat history entries
   */
  listChats(): ChatHistoryEntry[] {
    try {
      // Ensure history directory exists
      if (!fs.existsSync(HISTORY_DIR)) {
        fs.mkdirSync(HISTORY_DIR, { recursive: true });
        return [];
      }
      
      // Read directory
      const files = fs.readdirSync(HISTORY_DIR)
        .filter(file => file.endsWith(".json"));
      
      // Load each file
      return files.map(file => {
        try {
          const content = fs.readFileSync(path.join(HISTORY_DIR, file), "utf8");
          return JSON.parse(content) as ChatHistoryEntry;
        } catch (error) {
          console.error(`Error reading history file ${file}:`, error);
          return null;
        }
      })
      .filter((entry): entry is ChatHistoryEntry => entry !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error listing chat history:", error);
      return [];
    }
  }

  /**
   * Delete a chat history entry
   * @param id Chat history entry ID
   * @returns True if deleted successfully
   */
  deleteChat(id: string): boolean {
    try {
      const filePath = path.join(HISTORY_DIR, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting chat history:", error);
      return false;
    }
  }

  /**
   * Clear all chat history
   * @returns Number of entries deleted
   */
  clearHistory(): number {
    try {
      if (!fs.existsSync(HISTORY_DIR)) {
        return 0;
      }
      
      const files = fs.readdirSync(HISTORY_DIR)
        .filter(file => file.endsWith(".json"));
      
      let count = 0;
      for (const file of files) {
        fs.unlinkSync(path.join(HISTORY_DIR, file));
        count++;
      }
      
      return count;
    } catch (error) {
      console.error("Error clearing chat history:", error);
      return 0;
    }
  }

  /**
   * Generate a title for a chat based on its messages
   * @param messages Chat messages
   * @returns Generated title
   */
  private generateTitle(messages: ChatMessage[]): string {
    // Find first user message
    const firstUserMessage = messages.find(m => m.role === MessageRole.User);
    
    if (!firstUserMessage) {
      return "Untitled chat";
    }
    
    // Extract first line or first few words
    const text = firstUserMessage.content;
    const firstLine = text.split("\n")[0].trim();
    
    if (firstLine.length <= 30) {
      return firstLine;
    }
    
    return firstLine.substring(0, 27) + "...";
  }
}

// Export singleton instance
export const chatHistory = new ChatHistory();
