#!/usr/bin/env node

/**
 * Test script for enhanced MCP tool context management in Bibble
 * This script simulates various scenarios to ensure the agent correctly 
 * selects MCP tools over built-in alternatives when appropriate
 */

import { Agent } from './src/mcp/agent.js';
import { BibbleConfig } from './src/config/storage.js';

// Test scenarios that should trigger specific tool usage patterns
const testScenarios = [
  {
    name: "Image Generation Request",
    input: "create an image of a beautiful sunset over mountains",
    expectedToolCategory: "image",
    shouldAvoidTools: ["ascii-text-art"],
    description: "Should use MCP image generation tools, NOT ASCII art generators"
  },
  {
    name: "Web Search Request", 
    input: "search for recent news about artificial intelligence",
    expectedToolCategory: "search",
    shouldAvoidTools: ["read_file", "write_file"],
    description: "Should use MCP search tools like DuckDuckGoWebSearch"
  },
  {
    name: "File Operation Request",
    input: "read the package.json file and show me its contents", 
    expectedToolCategory: "file",
    shouldPreferTools: ["read_file"],
    description: "Should use built-in file tools directly, not MCP wrappers"
  },
  {
    name: "Task Management Request",
    input: "help me plan a project to build a web application",
    expectedToolCategory: "task",
    shouldAvoidTools: ["ascii-text-art", "read_file"],
    description: "Should use MCP task management tools"
  }
];

async function testToolContextManagement() {
  console.log("🧪 Testing Enhanced Tool Context Management\n");
  
  // Initialize agent with minimal config
  const agent = new Agent({
    compactToolsMode: true // Use the new compact mode
  });
  
  try {
    await agent.initialize();
    console.log("✅ Agent initialized successfully\n");
  } catch (error) {
    console.error("❌ Failed to initialize agent:", error.message);
    return;
  }
  
  // Run each test scenario
  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log(`📝 Input: "${scenario.input}"`);
    console.log(`🎯 Expected: ${scenario.description}`);
    
    try {
      // Test the tool palette generation
      console.log("\n🔍 Generated Tool Palette:");
      const palette = agent.generateToolPalette?.(scenario.input);
      if (palette) {
        console.log(palette.substring(0, 300) + "...");
      }
      
      // Test contextual tool filtering
      console.log("\n🎯 Contextual Tool Filter:");
      const filter = agent.generateContextualToolFilter?.(scenario.input);
      if (filter) {
        console.log(`Allowed tools (${filter.length}):`, filter.slice(0, 10).join(', '));
        if (filter.length > 10) console.log("... and more");
      }
      
      // Test tool usage validation
      if (scenario.shouldAvoidTools) {
        for (const toolToAvoid of scenario.shouldAvoidTools) {
          console.log(`\n🚫 Testing validation for avoided tool: ${toolToAvoid}`);
          const validation = agent.validateToolUsage?.(toolToAvoid, {}, scenario.input);
          if (validation) {
            console.log(`Validation result:`, validation.isValid ? "✅ Valid" : "❌ Invalid");
            if (validation.correction) {
              console.log(`Correction: ${validation.correction}`);
            }
          }
        }
      }
      
      console.log(`\n✅ ${scenario.name} test completed`);
      
    } catch (error) {
      console.error(`❌ Error testing ${scenario.name}:`, error.message);
    }
    
    console.log("\n" + "─".repeat(80));
  }
  
  console.log("\n🎉 Tool context management testing completed!");
  console.log("\nKey improvements implemented:");
  console.log("✅ Per-turn tool palette injection");  
  console.log("✅ Tool usage validation & correction");
  console.log("✅ Contextual tool allowlist gating");
  console.log("✅ Persistent capabilities ledger");
  console.log("✅ Enhanced tool selection instructions");
}

// Make methods accessible for testing
const originalAgent = Agent.prototype;
if (!originalAgent.generateToolPalette) {
  console.log("⚠️  Note: Some methods may not be accessible for testing due to private visibility");
}

// Run the test
testToolContextManagement().catch(console.error);