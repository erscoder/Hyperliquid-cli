# @erscoder/hyperliquid-cli

[![npm version](https://img.shields.io/npm/v/@erscoder/hyperliquid-cli.svg)](https://www.npmjs.com/package/@erscoder/hyperliquid-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

**Agent-friendly CLI for the [Hyperliquid](https://hyperliquid.xyz) DEX.**

Query market data, manage positions, and execute trades — all from your terminal or AI agent.

> Part of the Hyperliquid toolset:
> - [`hyperliquid-mcp`](https://github.com/erscoder/hyperliquid-mcp) — MCP server for Claude Desktop / LLM clients
> - **`@erscoder/hyperliquid-cli`** — CLI for agents, scripts, and developers ← you are here

---

## Why a CLI?

AI agents (OpenClaw, AutoGPT, CrewAI, etc.) work better with CLI tools than with MCP servers:
- No server to spin up — just `exec` a command and parse the JSON output
- Scriptable, pipeable, composable
- Works in any shell, cron job, or automation workflow

---

## Installation

```bash
npm install -g @erscoder/hyperliquid-cli
```

Verify:
```bash
hl --version
hl --help
```

---

## Authentication

Set environment variables (recommended for agents):

```bash
export HL_WALLET_ADDRESS=0xYourWalletAddress
export HL_PRIVATE_KEY=0xYourPrivateKey   # required for trading commands
```

Or persist to `~/.hl/config.json`:

```bash
hl config set walletAddress 0xYourWalletAddress
hl config set privateKey 0xYourPrivateKey
```

> Market data commands (`hl price`, `hl markets`) don't require any credentials.

---

## Quick Start

```bash
# No auth needed
hl price BTC
# {"symbol":"BTC","price":74250.5}

hl markets
# [{"name":"BTC","szDecimals":5,"maxLeverage":50}, ...]

# With wallet set
hl balance --pretty
hl positions
hl orders list

# Trading
hl order place --symbol BTC --side buy --size 0.001 --price 70000
hl order cancel-all
```

---

## Command Reference

### 📊 Market Data

#### `hl price <symbol>`
Get current mid price for a symbol.

```bash
hl price BTC
# {"symbol":"BTC","price":74250.5}

hl price ETH --pretty
# symbol: ETH
# price: 3521.2
```

#### `hl markets`
List all available perpetual markets.

```bash
hl markets
# [{"name":"BTC","szDecimals":5,"maxLeverage":50}, ...]

hl markets --pretty
```

---

### 💰 Account

#### `hl balance`
Show account value, margin, and withdrawable USDC.

```bash
hl balance
# {"accountValue":"10523.45","totalMarginUsed":"820.00","withdrawable":"9703.45"}
```

#### `hl positions`
Show open perpetual positions.

```bash
hl positions
# [{"coin":"BTC","size":"0.01","entryPrice":"72000","unrealizedPnl":"22.50",...}]
```

#### `hl history [--limit N]`
Show recent trade fills (default: 20).

```bash
hl history --limit 5
hl history --limit 50 --pretty
```

#### `hl transfers [--limit N]`
Show deposit/withdrawal history (default: 20).

```bash
hl transfers
hl transfers --limit 10 --pretty
```

---

### 📋 Orders

#### `hl orders list`
List all open orders.

```bash
hl orders list
# [{"oid":12345,"coin":"BTC","side":"buy","size":"0.001","price":"70000",...}]

hl orders list --pretty
```

#### `hl order place`
Place a limit or market order.

```bash
# Limit order
hl order place --symbol BTC --side buy --size 0.001 --price 70000

# Market order (omit --price)
hl order place --symbol ETH --side sell --size 0.1

# Output
# {"status":"ok","response":{"type":"order","data":{"statuses":[...]}}}
```

| Flag | Required | Description |
|------|----------|-------------|
| `--symbol` | ✅ | Symbol (BTC, ETH, etc.) |
| `--side` | ✅ | `buy` or `sell` |
| `--size` | ✅ | Order size |
| `--price` | ❌ | Limit price. Omit for market order |

#### `hl order cancel --symbol <SYM> --id <orderId>`
Cancel a specific order.

```bash
hl order cancel --symbol BTC --id 12345
```

#### `hl order cancel-all [--symbol <SYM>]`
Cancel all open orders, optionally filtered by symbol.

```bash
hl order cancel-all
hl order cancel-all --symbol BTC
# {"cancelled":3,"result":{...}}
```

---

### ⚙️ Leverage

#### `hl leverage set --symbol <SYM> --value <N>`
Set cross leverage for a symbol.

```bash
hl leverage set --symbol BTC --value 10
hl leverage set --symbol ETH --value 5
```

---

### 🔧 Config

#### `hl config get`
Show current config (private key is masked).

```bash
hl config get
# {"walletAddress":"0xAbc...","privateKey":"0x1234...","testnet":false}
```

#### `hl config set <key> <value>`
Set a config value. Keys: `walletAddress`, `privateKey`, `testnet`.

```bash
hl config set walletAddress 0xYourAddress
hl config set privateKey 0xYourKey
hl config set testnet true
```

Config is stored in `~/.hl/config.json`.

---

## Output Formats

All commands output **JSON by default** — ideal for agents and scripts:

```bash
hl price BTC | jq '.price'
# 74250.5

hl positions | jq '[.[] | {coin, size, unrealizedPnl}]'
```

Add `--pretty` for human-friendly output:

```bash
hl balance --pretty
# accountValue: 10523.45
# totalMarginUsed: 820.00
# withdrawable: 9703.45
```

---

## Testnet

Add `--testnet` to any command to use the Hyperliquid testnet:

```bash
hl balance --testnet
hl order place --symbol BTC --side buy --size 0.001 --price 70000 --testnet
```

Or set it globally:
```bash
hl config set testnet true
```

---

## Using with AI Agents

### OpenClaw / Harvis
```
exec: hl price BTC
exec: hl positions --json
exec: hl order place --symbol BTC --side buy --size 0.001 --price 70000
```

### Shell scripts
```bash
PRICE=$(hl price BTC | jq -r '.price')
echo "BTC is at $PRICE"

# Check if you have open positions
POSITIONS=$(hl positions | jq 'length')
echo "Open positions: $POSITIONS"
```

### LangChain / CrewAI tool
```python
import subprocess, json

def hl(command: str) -> dict:
    result = subprocess.run(
        f"hl {command}",
        shell=True, capture_output=True, text=True
    )
    return json.loads(result.stdout)

price = hl("price BTC")["price"]
```

---

## Related Projects

| Project | Use case |
|---------|----------|
| [hyperliquid-mcp](https://github.com/erscoder/hyperliquid-mcp) | MCP server for Claude Desktop and MCP-compatible clients |
| **@erscoder/hyperliquid-cli** | CLI for agents, scripts, and developers |

**When to use which:**
- **MCP**: You're using Claude Desktop, Cursor, or another MCP client
- **CLI**: You're building agents, scripts, or need shell-level access

---

## Contributing

PRs welcome! Please:
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with conventional commits: `feat:`, `fix:`, `docs:`
4. Open a PR

---

## License

MIT © [Enrique Rubio](https://github.com/erscoder)
