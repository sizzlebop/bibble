import { getAllTools } from "./dist/mcp/client.js";

/**
 * Debug script to examine the actual tool schemas being sent to Claude
 */
async function debugToolSchemas() {
    console.log("🔍 Debugging Tool Schemas...\n");

    try {
        // Get all tools from MCP servers
        const tools = await getAllTools();
        console.log(`Found ${tools.length} tools from MCP servers\n`);

        if (tools.length === 0) {
            console.log("❌ No tools found. Make sure MCP servers are configured.");
            return;
        }

        // Show first few tools in detail
        const toolsToShow = tools.slice(0, 5);

        for (let i = 0; i < toolsToShow.length; i++) {
            const tool = toolsToShow[i];
            console.log(`=== Tool ${i + 1}: ${tool.function.name} ===`);

            console.log("📋 Full Tool Definition (as sent to Claude):");
            console.log(JSON.stringify(tool, null, 2));

            console.log("\n🔍 Schema Analysis:");
            const schema = tool.function.parameters;
            console.log(`- Description: "${tool.function.description}"`);
            console.log(`- Schema Type: ${schema?.type || 'undefined'}`);
            console.log(`- Properties: ${Object.keys(schema?.properties || {}).length} fields`);
            console.log(`- Required: ${(schema?.required || []).length} fields`);
            console.log(`- Property names: [${Object.keys(schema?.properties || {}).join(', ')}]`);
            console.log(`- Required fields: [${(schema?.required || []).join(', ')}]`);

            if (schema?.properties) {
                console.log("\n📝 Property Details:");
                for (const [propName, propDef] of Object.entries(schema.properties)) {
                    const prop = propDef;
                    console.log(`  - ${propName}: ${prop.type || 'unknown'} ${prop.description ? `"${prop.description}"` : ''}`);
                }
            }

            // Show what Anthropic format would look like
            console.log("\n🧠 Anthropic Format:");
            const anthropicFormat = {
                name: tool.function.name,
                description: tool.function.description,
                input_schema: tool.function.parameters
            };
            console.log(JSON.stringify(anthropicFormat, null, 2));

            console.log("\n" + "=".repeat(60) + "\n");
        }

        // Look for the DuckDuckGoWebSearch tool specifically
        const searchTool = tools.find(t => t.function.name === "DuckDuckGoWebSearch");
        if (searchTool) {
            console.log("🔍 SPECIFIC ANALYSIS: DuckDuckGoWebSearch Tool");
            console.log("This is the tool Claude is failing to call properly:");
            console.log(JSON.stringify(searchTool, null, 2));

            const schema = searchTool.function.parameters;
            console.log("\nRequired parameters:", schema?.required || []);
            console.log("Query property:", schema?.properties?.query || "NOT FOUND");
        }

    } catch (error) {
        console.error("❌ Error debugging tool schemas:", error);
    }
}

// Run the debug script
debugToolSchemas().catch(console.error);
