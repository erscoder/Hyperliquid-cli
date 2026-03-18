---
name: hyperliquid-cli
description: >
  Use the `hl` CLI to interact with the Hyperliquid DEX from OpenClaw agents.
  Supports market data (price, markets), account info (balance, positions, orders, history, transfers),
  trading (place/cancel orders), and leverage management — all via shell exec, no MCP server needed.
  Use when asked to: check BTC/ETH price on Hyperliquid, view open positions, place or cancel orders,
  check account balance, set leverage, or query trade history on Hyperliquid.
---

# hyperliquid-cli

CLI tool for Hyperliquid DEX. All commands output JSON by default (agent-friendly). Add `--pretty` for humans.

## Installation

```bash
npm install -g hyperliquid-cli
# or from source:
cd /Users/kike/clawd/projects/hyperliquid-cli && npm install -g .
```

## Auth

Set env vars or use `hl config set`:

```bash
export HL_WALLET_ADDRESS=0x...   # required for account commands
export HL_PRIVATE_KEY=0x...      # required for trading commands
```

Or persist:
```bash
hl config set walletAddress 0x...
hl config set privateKey 0x...
```

## Commands

### Market Data (no auth required)
```bash
hl price BTC                    # {"symbol":"BTC","price":74250.5}
hl price ETH --pretty           # symbol: ETH / price: 2316.35
hl markets                      # list all perp markets with maxLeverage
```

### Account (requires HL_WALLET_ADDRESS)
```bash
hl balance                      # accountValue, marginUsed, withdrawable
hl positions                    # open positions with unrealizedPnl, entryPrice
hl history --limit 20           # recent trade fills
hl transfers --limit 10         # deposit/withdrawal history
```

### Orders (requires HL_PRIVATE_KEY)
```bash
hl orders list                  # open orders
hl orders place --symbol BTC --side buy --size 0.001 --price 70000   # limit
hl orders place --symbol ETH --side sell --size 0.1                  # market (no --price)
hl orders cancel --symbol BTC --id 12345
hl orders cancel-all
hl orders cancel-all --symbol BTC
```

### Leverage (requires HL_PRIVATE_KEY)
```bash
hl leverage set --symbol BTC --value 10
```

### Config
```bash
hl config get        # show config (key masked)
hl config set <key> <value>
```

## Output Parsing (agents)

```bash
# Get price as number
PRICE=$(hl price BTC | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).price))")

# Check for open positions
hl positions | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).length + ' positions'))"
```

Or simpler with `jq` if available:
```bash
hl price BTC | jq '.price'
hl positions | jq '[.[] | {coin, size, unrealizedPnl}]'
```

## Testnet

Add `--testnet` to any command:
```bash
hl price BTC --testnet
hl orders place --symbol BTC --side buy --size 0.001 --price 70000 --testnet
```

## Error Handling

On error, commands exit with code 1 and print `{"error":"..."}` to stderr.
Always check exit code when using in scripts:
```bash
if ! hl price BTC > /dev/null 2>&1; then
  echo "hl not installed or API unreachable"
fi
```
