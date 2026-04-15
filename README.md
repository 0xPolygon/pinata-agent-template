# Yield Optimizer Agent

An autonomous DeFi agent that discovers and deposits into the highest-yielding pools on Polygon. Powered by [Trails](https://trails.build) pool discovery — APY and vault addresses are resolved at runtime, never hardcoded. Supports Aave v3 and Morpho vaults on Polygon mainnet and Katana.

Deploy it on [Pinata Agents](https://agents.pinata.cloud) and get a yield optimizer that monitors your positions every 6 hours and alerts you when a better opportunity appears.

## What It Does

- **Discovers** the best available APY across Aave v3 and Morpho for USDC, USDT, and WETH
- **Executes** deposits into the highest-TVL pool on your confirmation
- **Monitors** positions every 6 hours via scheduled tasks, alerting when a >1% APY improvement is available
- **Reports** a daily portfolio snapshot at 9am

All commands are dry-run by default — the agent shows you exactly what it will do (APY, TVL, contract address) before asking for confirmation.

## Setup

### Prerequisites

- A funded Polygon mainnet wallet (USDC, USDT, or POL for gas)
- A [Pinata Agents](https://agents.pinata.cloud) account
- A Trails API key — get one at [https://dashboard.trails.build](https://dashboard.trails.build)

### Deploy

1. Import this repo into [agents.pinata.cloud](https://agents.pinata.cloud)
2. Deploy — the build script installs the `polygon-agent` CLI automatically
3. Start a conversation with your agent and follow the first-run guide

### Secrets & Configuration

| Secret | Required | Description |
|--------|----------|-------------|
| `TRAILS_ACCESS_KEY` | Required | Your Trails API key from [dashboard.trails.build](https://dashboard.trails.build). Used for pool discovery, swaps, and bridging. |

### First-Run Flow

The agent walks you through four steps on first conversation:

**1. Setup** — creates an EOA and Sequence project, stores credentials encrypted on disk

```bash
polygon-agent setup --name "YieldOptimizer"
```

**2. Create Wallet** — creates a smart contract wallet pre-authorized for yield vaults

```bash
polygon-agent wallet create \
  --usdc-limit 100 \
  --native-limit 5 \
  --contract 0x794a61358d6845594f94dc1db02a252b5b4814ad \
  --contract 0x781fb7f6d845e3be129289833b04d43aa8558c42 \
  --contract 0xf5c81d25ee174d83f1fd202ca94ae6070d073ccf
```

A browser window opens for approval. After approving, enter the 6-digit code shown in the browser.

**3. Fund** — run `polygon-agent fund` to get a Trails funding widget URL. Open it to deposit USDC or USDT.

**4. Optimize** — the agent dry-runs a deposit to show you the current best APY, then executes on your confirmation.

## Yield Flows

### Discover Best APY

```bash
# Dry-run — shows protocol, APY, TVL, and contract before any commitment
polygon-agent deposit --asset USDC --amount <amount>

# Filter by protocol
polygon-agent deposit --asset USDC --amount <amount> --protocol aave
polygon-agent deposit --asset USDC --amount <amount> --protocol morpho
```

### Execute Deposit

```bash
polygon-agent deposit --asset USDC --amount <amount> --broadcast
```

### Swap First if Needed

```bash
# POL → USDC before depositing
polygon-agent swap --from POL --to USDC --amount 1 --broadcast
```

### Monitor Balances

```bash
polygon-agent balances
```

## Supported Protocols

| Protocol | Assets | Chain |
|----------|--------|-------|
| Aave v3 | USDC, USDT, WETH, WMATIC | Polygon mainnet |
| Morpho Compound | USDC, WETH, POL | Polygon mainnet |
| Morpho (Gauntlet, Steakhouse, Yearn) | USDC, USDT, WETH | Katana |

## Scheduled Tasks

These run automatically once your agent is deployed and set up.

| Task | Schedule | Description |
|------|----------|-------------|
| `yield-monitor` | Every 6 hours | Checks current best APY vs open positions. Alerts if >1% better available. |
| `daily-report` | 9am daily | Portfolio snapshot: balances, positions, estimated daily yield. |

## Session Permissions

The wallet session is scoped to the pre-whitelisted vault contracts. If you want to deposit into a vault not in the whitelist, dry-run first to get its address, then re-create the wallet with `--contract <address>` added.

## File Structure

```
manifest.json                 # Agent config and scheduled tasks
workspace/
  SOUL.md                     # Agent principles and DeFi rules
  TOOLS.md                    # Full CLI command reference and vault whitelist
  AGENTS.md                   # Workspace conventions
  IDENTITY.md                 # Agent name and vibe
  HEARTBEAT.md                # Periodic monitoring tasks
  BOOTSTRAP.md                # First-run setup guide (deleted after setup)
  USER.md                     # Notes about the human (built over time)
  memory/
    yield-state.json          # Open positions, recorded APY, deposit history
    YYYY-MM-DD.md             # Daily logs
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Deposit session rejected` | Pool contract not in whitelist — re-run `wallet create` with `--contract <depositAddress>` from dry-run |
| `Builder configured already` | Add `--force` to the setup command |
| `Missing TRAILS_ACCESS_KEY` | Set `TRAILS_ACCESS_KEY` in your agent secrets or run `polygon-agent setup` |
| `Missing wallet` | Run `wallet list`, then `wallet create` |
| `Session expired` | Re-run `wallet create` (sessions last 6 months) |
| `swap: no route found` | Try a smaller amount or different pair |

## Powered By

- [Polygon Agent CLI](https://github.com/0xPolygon/polygon-agent-kit) — on-chain operations, wallet management
- [Trails](https://trails.build) — live pool discovery and DeFi routing
- [Sequence](https://sequence.xyz) — smart contract wallet infrastructure
- [Pinata Agents](https://agents.pinata.cloud) — agent hosting and scheduling
