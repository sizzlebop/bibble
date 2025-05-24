import { Anthropic } from "@anthropic-ai/sdk";
import { Config } from "./dist/config-JD3KD6WS.js";

/**
 * Simple test to verify Claude tool calling works
 * Run with: node test-claude-tools.mjs
 */

async function testClaudeTools() {
    console.log("🔍 Testing Claude Tool Calling...\n");

    // Get API key from config
    const config = Config.getInstance();
    const apiKey = config.getApiKey("anthropic");
    
    if (!apiKey) {
        console.error("❌ Anthropic API key not found in config");
        console.log("Please run: bibble config api-key");
        return;
    }

    const anthropic = new Anthropic({
        apiKey: apiKey,
    });

    // Test 1: Simple weather tool (from Anthropic's example)
    console.log("=== Test 1: Simple Weather Tool ===");
    const weatherTool = {
        name: "get_weather",
        description: "Get the current weather for a location",
        input_schema: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "City name or zip code"
                },
                unit: {
                    type: "string",
                    description: "Temperature unit: celsius or fahrenheit"
                }
            },
            required: ["location"]
        }
    };

    try {
        console.log("Sending tool to Claude:", JSON.stringify(weatherTool, null, 2));
        
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: "What's the weather like in New York City?"
                }
            ],
            tools: [weatherTool]
        });

        console.log("Claude Response:");
        for (const content of response.content) {
            if (content.type === "text") {
                console.log("Text:", content.text);
            } else if (content.type === "tool_use") {
                console.log("✅ SUCCESS! Claude called tool:", content.name);
                console.log("With arguments:", JSON.stringify(content.input, null, 2));
                return true;
            }
        }
        
        console.log("❌ No tool calls detected");
        return false;
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        return false;
    }
}

// Test 2: Simple no-parameter tool
async function testSimpleNoParamTool() {
    console.log("\n=== Test 2: No Parameters Tool ===");
    
    const config = Config.getInstance();
    const apiKey = config.getApiKey("anthropic");
    
    const anthropic = new Anthropic({
        apiKey: apiKey,
    });

    const timeTool = {
        name: "get_current_time",
        description: "Get the current time",
        input_schema: {
            type: "object",
            properties: {},
            required: []
        }
    };

    try {
        console.log("Sending tool to Claude:", JSON.stringify(timeTool, null, 2));
        
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: "What time is it right now?"
                }
            ],
            tools: [timeTool]
        });

        console.log("Claude Response:");
        for (const content of response.content) {
            if (content.type === "text") {
                console.log("Text:", content.text);
            } else if (content.type === "tool_use") {
                console.log("✅ SUCCESS! Claude called tool:", content.name);
                console.log("With arguments:", JSON.stringify(content.input, null, 2));
                return true;
            }
        }
        
        console.log("❌ No tool calls detected");
        return false;
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        return false;
    }
}

// Run tests
async function runAllTests() {
    console.log("🧪 Running Claude Tool Tests\n");
    
    const test1Result = await testClaudeTools();
    const test2Result = await testSimpleNoParamTool();
    
    console.log("\n📊 Results:");
    console.log(`Test 1 (Weather Tool): ${test1Result ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`Test 2 (Time Tool): ${test2Result ? "✅ PASSED" : "❌ FAILED"}`);
    
    if (test1Result || test2Result) {
        console.log("\n🎉 At least one test passed! Claude can call tools.");
        console.log("If some tests failed, check:");
        console.log("- Tool descriptions are clear");
        console.log("- Required parameters are properly specified");
        console.log("- User query clearly requests the tool functionality");
    } else {
        console.log("\n❌ All tests failed. Possible issues:");
        console.log("- API key problems");
        console.log("- Model access issues");
        console.log("- Tool schema format problems");
        console.log("- Network connectivity");
    }
}

runAllTests().catch(console.error);
