#!/usr/bin/env node

import { Anthropic } from "@anthropic-ai/sdk";

// Simple test to verify Claude can call tools with parameters
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "your-api-key-here"
});

const tools = [
  {
    name: "DuckDuckGoWebSearch",
    description: "Search the web using DuckDuckGo search engine",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query string"
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default: 10)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_current_datetime",
    description: "Get the current server date and time",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

const systemPrompt = `You are a helpful assistant with access to tools.

CRITICAL: Before calling any tool, you MUST:
1. Think about what parameters the tool needs
2. Check if the tool has required parameters
3. Ensure you provide ALL required parameters
4. Use <thinking> tags to plan your tool usage

For example, if you want to search for "AI news", you need to call DuckDuckGoWebSearch with:
- query: "AI news" (required)
- maxResults: 10 (optional)

Never call a tool without providing all required parameters.`;

async function testToolCalling() {
  console.log("Testing Claude tool calling...\n");

  const testCases = [
    "Can you check the current date and time?",
    "Can you search for the latest AI news?"
  ];

  for (const query of testCases) {
    console.log(`\n=== Testing: "${query}" ===`);
    
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [
          { role: "user", content: query }
        ],
        tools: tools,
        system: systemPrompt,
        thinking: { type: "enabled", budget_tokens: 1024 }
      });

      console.log("\nClaude's response:");
      for (const content of response.content) {
        if (content.type === "text") {
          console.log("Text:", content.text);
        } else if (content.type === "tool_use") {
          console.log("Tool call:", {
            name: content.name,
            input: content.input
          });
          
          // Check if required parameters are provided
          const tool = tools.find(t => t.name === content.name);
          if (tool && tool.input_schema.required) {
            const missingParams = tool.input_schema.required.filter(
              param => !(param in content.input)
            );
            if (missingParams.length > 0) {
              console.log("❌ Missing required parameters:", missingParams);
            } else {
              console.log("✅ All required parameters provided");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

testToolCalling();
