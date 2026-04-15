# TOOLS.md — Yield Optimizer Playbook

Everything you need to run the full yield optimization flow using the Polygon Agent CLI.

## CLI Entry Point

```bash
polygon-agent <command>
```

Installed via `npm install -g github:0xPolygon/polygon-agent-kit`. The `scripts.build` in manifest.json installs it automatically on agent boot.

**All write commands are dry-run by default. Add `--broadcast` to execute.**

---

## Phase 1: First-Run Setup

Run these once when the agent first starts. The bootstrap guide in BOOTSTRAP.md walks through this interactively.

```bash
# 1. Create EOA + Sequence project (stores access key to ~/.polygon-agent/builder.json)
polygon-agent setup --name "YieldOptimizer"

# 2. Create ecosystem wallet — pre-whitelist yield vault contracts
polygon-agent wallet create \
  --usdc-limit 100 \
  --native-limit 5 \
  --contract 0x794a61358d6845594f94dc1db02a252b5b4814ad \
  --contract 0x781fb7f6d845e3be129289833b04d43aa8558c42 \
  --contract 0xf5c81d25ee174d83f1fd202ca94ae6070d073ccf
# → Opens browser for approval. User approves, gets 6-digit code, enters it here.
# → Session saved to ~/.polygon-agent/wallets/main.json

# 3. Get funding URL (NEVER construct this manually)
polygon-agent fund
# → Sends fundingUrl to user. Open it to deposit USDC/USDT/POL.

# 4. Verify
polygon-agent balances
```

---

## Phase 2: Yield Discovery (Dry-Run First)

Trails resolves the best pool at runtime — no hardcoded addresses.

```bash
# Discover best USDC pool (highest TVL, all protocols)
polygon-agent deposit --asset USDC --amount 0.3

# Filter by protocol
polygon-agent deposit --asset USDC --amount 0.3 --protocol aave
polygon-agent deposit --asset USDC --amount 0.3 --protocol morpho

# Other assets
polygon-agent deposit --asset USDT --amount 0.3
polygon-agent deposit --asset WETH --amount 0.001
```

Dry-run output shows:
- `protocol` — aave or morpho
- `poolApy` — current APY (snapshot)
- `poolTvl` — total value locked
- `depositAddress` — exact contract that will receive funds

---

## Phase 3: Execute Deposit

```bash
# Execute after confirming dry-run output
polygon-agent deposit --asset USDC --amount 0.3 --broadcast
polygon-agent deposit --asset USDT --amount 0.5 --broadcast --protocol morpho
```

After a successful broadcast, save to `workspace/memory/yield-state.json`:
```json
{
  "positions": [
    {
      "asset": "USDC",
      "amount": 0.3,
      "protocol": "morpho",
      "poolAddress": "<from dry-run>",
      "apy": 4.2,
      "depositedAt": "2026-04-13T12:00:00Z"
    }
  ]
}
```

---

## Monitoring Loop

Run on every heartbeat:

```bash
# Check balances
polygon-agent balances

# Discover current best APY (dry-run only)
polygon-agent deposit --asset USDC --amount 1
polygon-agent deposit --asset USDT --amount 1
```

Compare `poolApy` from output vs `apy` in `yield-state.json`. Alert if difference > 1%.

---

## Swap Tokens

```bash
# Swap POL → USDC before depositing
polygon-agent swap --from POL --to USDC --amount 1          # dry-run
polygon-agent swap --from POL --to USDC --amount 1 --broadcast

# Custom slippage
polygon-agent swap --from USDC --to USDT --amount 5 --slippage 0.005 --broadcast
```

---

## Bridge Cross-Chain

```bash
polygon-agent swap --from USDC --to USDC --amount 0.5 --to-chain arbitrum --broadcast
polygon-agent swap --from USDC --to USDC --amount 1 --to-chain base --broadcast
```

Valid `--to-chain`: `polygon`, `mainnet`, `arbitrum`, `optimism`, `base`

---

## Vault Contract Whitelist

Pre-whitelist these when running `wallet create --contract <addr>`.

### Polygon Mainnet (chainId 137)

| Protocol | Asset | Address |
|----------|-------|---------|
| Aave V3 Pool (all markets) | USDC, USDT, WETH, WMATIC | `0x794a61358d6845594f94dc1db02a252b5b4814ad` |
| Morpho Compound USDC | USDC | `0x781fb7f6d845e3be129289833b04d43aa8558c42` |
| Morpho Compound WETH | WETH | `0xf5c81d25ee174d83f1fd202ca94ae6070d073ccf` |
| Morpho Compound POL | POL | `0x3f33f9f7e2d7cfbcbdf8ea8b870a6e3d449664c2` |

### Katana (chainId 747474) — Morpho Vaults

| Vault | Asset | TVL | Address |
|-------|-------|-----|---------|
| Gauntlet USDT | USDT | ~$97M | `0x1ecdc3f2b5e90bfb55ff45a7476ff98a8957388e` |
| Steakhouse Prime USDC | USDC | ~$54M | `0x61d4f9d3797ba4da152238c53a6f93fb665c3c1d` |
| Yearn OG ETH | WETH | ~$16M | `0xfade0c546f44e33c134c4036207b314ac643dc2e` |
| Yearn OG USDC | USDC | ~$16M | `0xce2b8e464fc7b5e58710c24b7e5ebfb6027f29d7` |
| Gauntlet USDC | USDC | ~$8M | `0xe4248e2105508fcbad3fe95691551d1af14015f7` |
| Yearn OG USDT | USDT | ~$8M | `0x8ed68f91afbe5871dce31ae007a936ebe8511d47` |
| Gauntlet WETH | WETH | ~$6M | `0xc5e7ab07030305fc925175b25b93b285d40dcdff` |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Deposit session rejected` | Pool contract not in whitelist — re-create wallet with `--contract <depositAddress>` from dry-run |
| `Builder configured already` | Add `--force` to setup command |
| `Missing SEQUENCE_PROJECT_ACCESS_KEY` | Run `polygon-agent setup` first |
| `Missing wallet` | Run `wallet list`, then `wallet create` |
| `Session expired` | Re-run `wallet create` (6-month expiry) |
| `swap`: no route found | Try smaller amount or different pair |
| `Protocol X not yet supported` | Use `swap` to get the yield-bearing token directly |

---

## Key Rules

- **`fund`** — always run `polygon-agent fund` to get the URL. Never construct it manually.
- **`deposit`** — always dry-run first, show the user the APY and address, then ask to broadcast.
- **Session permissions** — wallet must have `--contract` flags for each vault before depositing. Add them at wallet creation time.
- **Fee preference** — CLI auto-selects USDC over native POL for fees.
