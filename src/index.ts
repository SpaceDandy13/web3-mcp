import { config } from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for .env file
const envPath = resolve(__dirname, '../.env');
console.error('Looking for .env file at:', envPath);
console.error('.env file exists:', existsSync(envPath));

// Load environment variables
const result = config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSolanaTools } from "./chains/solana.js";
import { registerEthereumTools } from "./chains/ethereum.js";
import { registerAllTools } from "./chains/xchain.js";

// Create server instance
const server = new McpServer({
  name: "web3-rpc",
  version: "1.0.0",
});

// Helper function to check if a feature is enabled
const isEnabled = (envVar: string): boolean => {
  const value = process.env[envVar]?.toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
};

// Register chain-specific tools based on environment variables
if (isEnabled('ENABLE_SOLANA_TOOLS')) {
  console.error('Registering Solana tools...');
  registerSolanaTools(server);
}

if (isEnabled('ENABLE_ETHEREUM_TOOLS')) {
  console.error('Registering Ethereum tools...');
  registerEthereumTools(server);
}

if (isEnabled('ENABLE_XCHAIN_TOOLS')) {
  console.error('Registering cross-chain tools...');
  registerAllTools(server);
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  const error = err as Error;
  console.error("Fatal error in main():", error.message);
  process.exit(1);
});