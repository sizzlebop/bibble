#!/usr/bin/env node

// Debug script to check what system prompt is being generated
import { Agent } from './dist/mcp/agent.js';
import { Config } from './dist/config/storage.js';

async function debugSystemPrompt() {
  try {
    console.log("Creating agent to debug system prompt...\n");
    
    const config = new Config();
    const agent = new Agent(config);
    
    // Initialize the agent to generate the system prompt
    await agent.initialize({
      model: "claude-3-5-sonnet-20241022",
      userGuidelines: "Test guidelines"
    });
    
    // Get the conversation to see the system prompt
    const conversation = agent.getConversation();
    const systemMessage = conversation.find(msg => msg.role === 'system');
    
    if (systemMessage) {
      console.log("=== SYSTEM PROMPT ===");
      console.log(systemMessage.content);
      console.log("\n=== END SYSTEM PROMPT ===");
      
      // Check if it contains proper tool documentation
      if (systemMessage.content.includes('DuckDuckGoWebSearch')) {
        console.log("\n✅ System prompt contains DuckDuckGoWebSearch tool");
        
        // Check if it shows required parameters
        if (systemMessage.content.includes('Required Parameters')) {
          console.log("✅ System prompt shows required parameters");
        } else {
          console.log("❌ System prompt missing required parameters section");
        }
        
        // Check for query parameter
        if (systemMessage.content.includes('query')) {
          console.log("✅ System prompt mentions query parameter");
        } else {
          console.log("❌ System prompt missing query parameter");
        }
      } else {
        console.log("❌ System prompt missing DuckDuckGoWebSearch tool");
      }
    } else {
      console.log("❌ No system message found");
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

debugSystemPrompt();
