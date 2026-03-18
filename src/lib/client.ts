import { PublicClient, WalletClient, HttpTransport } from '@nktkas/hyperliquid';
import { privateKeyToAccount } from 'viem/accounts';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface Config {
  privateKey?: string;
  walletAddress?: string;
  testnet?: boolean;
}

export function loadFileConfig(): Config {
  const configPath = path.join(os.homedir(), '.hl', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

export function getConfig(opts: { testnet?: boolean } = {}): Config {
  const fileConfig = loadFileConfig();
  return {
    privateKey: process.env.HL_PRIVATE_KEY || fileConfig.privateKey,
    walletAddress: process.env.HL_WALLET_ADDRESS || fileConfig.walletAddress,
    testnet: opts.testnet ?? fileConfig.testnet ?? false,
  };
}

export function saveConfig(updates: Partial<Config>): void {
  const configDir = path.join(os.homedir(), '.hl');
  const configPath = path.join(configDir, 'config.json');
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  const existing = loadFileConfig();
  fs.writeFileSync(configPath, JSON.stringify({ ...existing, ...updates }, null, 2));
}

export interface HLClients {
  info: PublicClient;
  wallet: WalletClient | null;
  config: Config;
}

export function createClient(opts: { testnet?: boolean } = {}): HLClients {
  const config = getConfig(opts);
  const transport = new HttpTransport({ isTestnet: config.testnet ?? false });
  const info = new PublicClient({ transport });

  let wallet: WalletClient | null = null;
  if (config.privateKey) {
    const account = privateKeyToAccount(config.privateKey as `0x${string}`);
    wallet = new WalletClient({ wallet: account, transport });
  }

  return { info, wallet, config };
}

export function requireWallet(config: Config): string {
  const address = config.walletAddress;
  if (!address) {
    console.error(JSON.stringify({ error: 'Wallet address required. Set HL_WALLET_ADDRESS or run: hl config set walletAddress <addr>' }));
    process.exit(1);
  }
  return address;
}

export function requireWalletClient(clients: HLClients): WalletClient {
  if (!clients.wallet) {
    console.error(JSON.stringify({ error: 'Private key required for trading. Set HL_PRIVATE_KEY or run: hl config set privateKey <key>' }));
    process.exit(1);
  }
  return clients.wallet;
}

/** Resolve coin name (e.g. "BTC") to asset index */
export async function coinToAsset(info: PublicClient, coin: string): Promise<number> {
  const meta = await info.meta();
  const idx = (meta.universe as any[]).findIndex((m: any) => m.name === coin.toUpperCase());
  if (idx === -1) throw new Error(`Unknown coin: ${coin}. Use 'hl markets' to list available symbols.`);
  return idx;
}
