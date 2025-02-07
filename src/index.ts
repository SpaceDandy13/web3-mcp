import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSolanaTools } from "./chains/solana.js";
import { registerEthereumTools } from "./chains/ethereum.js";

// Create server instance
const server = new McpServer({
  name: "web3-rpc",
  version: "1.0.0",
});

// Register chain-specific tools
registerSolanaTools(server);
registerEthereumTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Web3 MCP running on stdio");
}

main().catch((err: unknown) => {
  const error = err as Error;
  console.error("Fatal error in main():", error.message);
  process.exit(1);
});