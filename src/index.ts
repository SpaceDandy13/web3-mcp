import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';
import express from 'express';

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
  console.warn('No .env file found, falling back to process.env:', result.error.message);
} else {
  console.log('Successfully loaded .env file');
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { registerSolanaTools } from "./chains/solana/solana.js";
import { registerEvmTools } from "./chains/evm/evm.js";
import { 
  registerBitcoinTools,
  registerLitecoinTools,
  registerDogecoinTools,
  registerBitcoinCashTools,
  registerCardanoTools,
} from "./chains/UTXO/index.js";
// import { registerThorchainTools } from "./chains/thorchain/thorchain.js";
import { registerRippleTools } from "./chains/ripple/ripple.js";
import { registerTonTools } from "./chains/ton/ton.js";
import { registerGeneralTools } from "./general/index.js";

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

if (isEnabled('ENABLE_EVM_TOOLS')) {
  console.error('Registering EVM chain tools...');
  registerEvmTools(server);
}

// UTXO Chain Tools
if (isEnabled('ENABLE_BITCOIN_TOOLS')) {
  console.error('Registering Bitcoin tools...');
  registerBitcoinTools(server);
}

if (isEnabled('ENABLE_LITECOIN_TOOLS')) {
  console.error('Registering Litecoin tools...');
  registerLitecoinTools(server);
}

if (isEnabled('ENABLE_DOGECOIN_TOOLS')) {
  console.error('Registering Dogecoin tools...');
  registerDogecoinTools(server);
}

if (isEnabled('ENABLE_BITCOINCASH_TOOLS')) {
  console.error('Registering Bitcoin Cash tools...');
  registerBitcoinCashTools(server);
}

if (isEnabled('ENABLE_CARDANO_TOOLS')) {
  console.error('Registering Cardano tools...');
  registerCardanoTools(server);
}

// if (isEnabled('ENABLE_THORCHAIN_TOOLS')) {
//   console.error('Registering THORChain tools...');
//   registerThorchainTools(server);
// }

if (isEnabled('ENABLE_RIPPLE_TOOLS')) {
  console.error('Registering Ripple (XRP) tools...');
  registerRippleTools(server);
}

if (isEnabled('ENABLE_TON_TOOLS')) {
  console.error('Registering TON tools...');
  registerTonTools(server);
}

// Register general tools
console.error('Registering general tools...');
registerGeneralTools(server);

// 创建 Express 应用
const app = express();
app.use(express.json()); // 解析 JSON 请求体

// SSE 和 POST 处理
let transport: SSEServerTransport | null = null;

app.get('/', (req, res) => {
  console.log('Received / request at:', new Date().toISOString());
  transport = new SSEServerTransport('/messages', res);
  server.connect(transport)
    .then(() => {
      console.log('Transport connected successfully');
    })
    .catch(err => {
      console.error('Failed to connect transport:', err);
      res.status(500).end();
    });
});

app.post('/messages', (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  } else {
    res.status(503).json({ error: 'SSE transport not initialized' });
  }
});

// 启动服务器
const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, '0.0.0.0', () => {
  console.log(`Web3 MCP server running on port ${port}`);
});