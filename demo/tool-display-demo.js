#!/usr/bin/env node

// Demo script showcasing the enhanced tool display system
// This demonstrates the beautiful, interactive tool call rendering

// Since we can't import the TypeScript files directly in Node.js, 
// let's create a simple test that shows what the enhanced display would look like

console.log('\n🎨 Enhanced Tool Display Demo - Pink Pixel Style\n');

// Demo 1: File listing result
console.log('📁 Demo 1: File Listing Tool Call');
const fileListMessage = {
  role: MessageRole.Tool,
  toolName: 'list_files',
  content: JSON.stringify([
    { name: 'package.json', size: '1.8KB', modified: '2024-02-01' },
    { name: 'README.md', size: '15.2KB', modified: '2024-02-01' },
    { name: 'src', size: '-', modified: '2024-01-30', type: 'directory' },
    { name: 'dist', size: '-', modified: '2024-02-01', type: 'directory' },
  ])
};

toolDisplay.displayCall(fileListMessage, {
  showTimings: false,
  enableInteractive: false,
  maxTableRows: 10
});

// Demo 2: API response
setTimeout(() => {
  console.log('\n🌐 Demo 2: API Response Tool Call');
  const apiMessage = {
    role: MessageRole.Tool,
    toolName: 'fetch_weather',
    content: JSON.stringify({
      location: 'San Francisco, CA',
      temperature: '22°C',
      condition: 'Partly Cloudy',
      humidity: '65%',
      wind_speed: '12 mph',
      forecast: [
        { day: 'Today', high: '24°C', low: '18°C', condition: 'Partly Cloudy' },
        { day: 'Tomorrow', high: '26°C', low: '19°C', condition: 'Sunny' },
        { day: 'Friday', high: '23°C', low: '17°C', condition: 'Cloudy' }
      ]
    })
  };

  toolDisplay.displayCall(apiMessage, {
    showTimings: false,
    enableInteractive: false,
    maxTableRows: 5
  });
}, 1500);

// Demo 3: Search results
setTimeout(() => {
  console.log('\n🔍 Demo 3: Search Results Tool Call');
  const searchMessage = {
    role: MessageRole.Tool,
    toolName: 'search_codebase',
    content: JSON.stringify([
      'src/components/Button.tsx',
      'src/components/Modal.tsx', 
      'src/ui/theme.ts',
      'src/utils/helpers.js',
      'tests/components/Button.test.tsx'
    ])
  };

  toolDisplay.displayCall(searchMessage, {
    showTimings: false,
    enableInteractive: false,
    maxJsonLines: 15
  });
}, 3000);

// Demo 4: Error handling
setTimeout(() => {
  console.log('\n❌ Demo 4: Error Tool Call');
  const errorMessage = {
    role: MessageRole.Tool,
    toolName: 'compile_code',
    content: JSON.stringify({
      success: false,
      error: 'Type error in src/index.ts:42',
      details: 'Property "name" does not exist on type "User"',
      suggestions: [
        'Check if the property name is correct',
        'Ensure the interface is imported',
        'Add the missing property to the interface'
      ]
    })
  };

  toolDisplay.displayCall(errorMessage, {
    showTimings: false,
    enableInteractive: false
  });
}, 4500);

// Demo 5: Simple text result
setTimeout(() => {
  console.log('\n📝 Demo 5: Text Result Tool Call');
  const textMessage = {
    role: MessageRole.Tool,
    toolName: 'generate_summary',
    content: 'This project implements a CLI chatbot with MCP support. It features beautiful terminal UI with gradients, interactive components, and sophisticated tool call display. The system supports multiple AI providers and can be extended with custom tools.'
  };

  toolDisplay.displayCall(textMessage, {
    showTimings: false,
    enableInteractive: false
  });

  console.log('\n✨ Demo Complete! The enhanced tool display system provides:');
  console.log('  • Beautiful gradient headers with status badges');
  console.log('  • Boxed parameter and result sections'); 
  console.log('  • Intelligent formatting (tables, lists, JSON)');
  console.log('  • Syntax highlighting for JSON content');
  console.log('  • Interactive features (copy, expand/collapse)');
  console.log('  • Pink Pixel branded styling throughout');
  console.log('\nSet BIBBLE_ENHANCED_TOOLS=true to enable in chat! 🚀\n');
}, 6000);
