#!/usr/bin/env node

// Debug script to check MCP tool loading and system prompt generation
// This will help us understand what tools are being loaded and how they're formatted

import { Agent } from './dist/index.js';

console.log('🔍 Debugging MCP Tools Loading and System Prompt Generation\n');

try {
  // Create an agent instance (this will load tools and generate system prompt)
  console.log('1. Creating Agent instance...');
  const agent = new Agent();
  
  console.log('2. Initializing agent (loading MCP tools)...');
  await agent.initialize();
  
  // Get the conversation to see the system prompt
  console.log('3. Getting conversation messages...');
  const conversation = agent.getConversation();
  
  // Find the system message with tools
  const systemMessage = conversation.find(msg => msg.role === 'system');
  
  if (systemMessage) {
    console.log('✅ System message found!');
    console.log('📊 System prompt length:', systemMessage.content.length, 'characters');
    
    // Look for tools section
    const toolsSection = systemMessage.content.match(/# Available Tools(.*?)(?=\n# |$)/s);
    if (toolsSection) {
      console.log('✅ Tools section found in system prompt!');
      console.log('📋 Tools section preview (first 500 chars):');
      console.log('---');
      console.log(toolsSection[0].substring(0, 500) + '...');
      console.log('---');
      
      // Count how many tools are mentioned
      const toolMatches = toolsSection[0].match(/### \w+/g);
      if (toolMatches) {
        console.log(`🔧 Found ${toolMatches.length} tools in system prompt:`);
        toolMatches.forEach(match => {
          console.log(`  - ${match.replace('### ', '')}`);
        });
      }
      
      // Check for specific Context7 tools
      if (toolsSection[0].includes('context7') || toolsSection[0].includes('Context7')) {
        console.log('✅ Context7 tools found in system prompt!');
      } else {
        console.log('❌ No Context7 tools found in system prompt');
      }
      
      // Look for search/documentation related tools
      const searchTools = toolsSection[0].match(/###\s+(\w*search\w*|\w*doc\w*|\w*find\w*)/gi);
      if (searchTools) {
        console.log('🔍 Search/documentation related tools found:');
        searchTools.forEach(tool => console.log(`  - ${tool.replace('###', '').trim()}`));
      }
      
    } else {
      console.log('❌ No tools section found in system prompt!');
      console.log('🔍 System prompt preview (first 1000 chars):');
      console.log('---');
      console.log(systemMessage.content.substring(0, 1000));
      console.log('---');
    }
  } else {
    console.log('❌ No system message found in conversation');
  }
  
  // Also check the raw available tools
  console.log('\n4. Checking raw available tools...');
  if (agent.availableTools) {
    console.log(`✅ Found ${agent.availableTools.length} raw tools loaded:`);
    agent.availableTools.forEach(tool => {
      console.log(`  - ${tool.function.name}: "${tool.function.description}"`);
      console.log(`    Parameters: ${Object.keys(tool.function.parameters?.properties || {}).join(', ')}`);
    });
  } else {
    console.log('❌ No availableTools property found on agent');
  }
  
} catch (error) {
  console.error('💥 Error during diagnostics:', error);
  console.error('Stack:', error.stack);
}

console.log('\n🏁 Diagnostics complete!');
