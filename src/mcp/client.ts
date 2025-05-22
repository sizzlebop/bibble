import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Config } from "../config/config.js";
import { BibbleConfig } from "../config/storage.js";

// Tool types
export type ToolName = string;
export type ToolParameter = Record<string, unknown>;

export interface ChatCompletionInputTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface ChatCompletionInputMessageTool {
  role: "tool";
  tool_call_id: string;
  name: string;
  content: string;
}

export interface McpClientOptions {
  servers?: BibbleConfig["mcpServers"];
}

/**
 * MCP Client for connecting to MCP servers
 */
export class McpClient {
  protected clients: Map<ToolName, Client> = new Map();
  public readonly availableTools: ChatCompletionInputTool[] = [];
  private config = Config.getInstance();

  constructor(options: McpClientOptions = {}) {
    this.initializeServers(options.servers);
  }

  /**
   * Initialize MCP servers from config or options
   */
  private initializeServers(servers?: BibbleConfig["mcpServers"]): void {
    // Use provided servers or get them from config
    const mcpServers = servers || this.config.getMcpServers();

    // Log servers for debugging
    console.log(`Initializing ${mcpServers.length} MCP servers`);
  }

  /**
   * Connect to an MCP server and add its tools
   * @param server Server configuration
   */
  async addMcpServer(server: BibbleConfig["mcpServers"][0]): Promise<void> {
    try {
      // Create transport
      const transport = new StdioClientTransport({
        command: server.command,
        args: server.args,
        env: { ...server.env, PATH: process.env.PATH ?? "" },
      });

      // Create client
      const mcp = new Client({
        name: "bibble-mcp-client",
        version: "1.0.0"
      });

      // Connect to server
      await mcp.connect(transport);

      // Get available tools
      const toolsResult = await mcp.listTools();
      console.log(
        `Connected to MCP server "${server.name}" with tools:`,
        toolsResult.tools.map(({ name }) => name)
      );

      // Register tools with client map
      for (const tool of toolsResult.tools) {
        this.clients.set(tool.name, mcp);
      }

      // Add tools to available tools list
      this.availableTools.push(
        ...toolsResult.tools.map((tool) => {
          return {
            type: "function",
            function: {
              name: tool.name,
              description: tool.description || "",
              parameters: tool.inputSchema,
            },
          } as ChatCompletionInputTool;
        })
      );
    } catch (error) {
      console.error(`Failed to connect to MCP server "${server.name}":`, error);
      throw error;
    }
  }

  /**
   * Load all tools from configured servers
   */
  async loadTools(): Promise<void> {
    const mcpServers = this.config.getMcpServers();

    if (mcpServers.length === 0) {
      console.warn("No MCP servers configured.");
      return;
    }

    // Connect to all servers in parallel
    await Promise.all(
      mcpServers
        .filter(server => server.enabled)
        .map(server => this.addMcpServer(server))
    );
  }

  /**
   * Call a tool with arguments
   * @param toolName Tool name
   * @param toolArgs Tool arguments
   */
  async callTool(toolName: string, toolArgs: any): Promise<{ content: string }> {
    // Handle built-in tools
    if (toolName === "task_complete") {
      return this.handleTaskComplete();
    }

    if (toolName === "ask_question") {
      return this.handleAskQuestion();
    }

    // Handle MCP server tools
    const client = this.clients.get(toolName);

    if (!client) {
      return {
        content: `Error: No MCP client found for tool: ${toolName}`
      };
    }

    try {
      // Ensure toolArgs is a proper object
      let processedArgs = toolArgs;

      // If it's a string (failed JSON parsing), try to parse it again
      // or create an empty object as fallback
      if (typeof toolArgs === 'string') {
        try {
          processedArgs = JSON.parse(toolArgs);
        } catch (parseError) {
          console.warn(`Could not parse tool arguments for ${toolName}:`, parseError);
          // For built-in tools like task_complete that don't need args, use empty object
          processedArgs = {};
        }
      }

      const result = await client.callTool({
        name: toolName,
        arguments: processedArgs
      });

      return {
        content: result.content && Array.isArray(result.content) && result.content.length > 0
          ? result.content[0].text || String(result.content[0])
          : "No content returned from tool"
      };
    } catch (error) {
      console.error(`Error calling tool ${toolName}:`, error);
      return {
        content: `Error executing tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Handle the task_complete built-in tool
   * @returns Tool result
   */
  private handleTaskComplete(): Promise<{ content: string }> {
    return Promise.resolve({
      content: "Task completed successfully. The assistant has finished the requested task."
    });
  }

  /**
   * Handle the ask_question built-in tool
   * @returns Tool result
   */
  private handleAskQuestion(): Promise<{ content: string }> {
    return Promise.resolve({
      content: "Question acknowledged. Please provide the requested information."
    });
  }

  /**
   * Close all clients
   */
  async close(): Promise<void> {
    const closePromises = Array.from(this.clients.values()).map(client => {
      return client.close().catch(err => {
        console.error("Error closing MCP client:", err);
      });
    });

    await Promise.all(closePromises);
    this.clients.clear();
  }
}
