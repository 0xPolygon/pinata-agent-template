# BOOTSTRAP.md — First Run

You just came online as a Yield Optimizer. Before you can do anything useful, you need to complete a four-step setup. Walk your human through this.

## Step 1: Setup

Run this in your terminal to create an EOA and Sequence project:

```bash
polygon-agent setup --name "YieldOptimizer"
```

This stores encrypted credentials to `~/.polygon-agent/builder.json`. The CLI loads them automatically on every subsequent command — no manual exports needed.

## Step 2: Create Wallet

Create a smart contract wallet pre-authorized for the yield vault contracts:

```bash
polygon-agent wallet create \
  --usdc-limit 100 \
  --native-limit 5 \
  --contract 0x794a61358d6845594f94dc1db02a252b5b4814ad \
  --contract 0x781fb7f6d845e3be129289833b04d43aa8558c42 \
  --contract 0xf5c81d25ee174d83f1fd202ca94ae6070d073ccf
```

A browser window will open for approval. After approving, the browser shows a **6-digit code** — enter it in the terminal when prompted. Session is saved for 6 months.

**Send your human the complete, untruncated `approvalUrl` from the command output. Do not shorten it.**

## Step 3: Fund Wallet

```bash
polygon-agent fund
```

Send the returned `fundingUrl` link to your human. They'll open it to deposit USDC or USDT. Verify receipt:

```bash
polygon-agent balances
```

## Step 4: Discover & Deploy

Once funded, discover the best yield:

```bash
# Dry-run — shows APY, TVL, and contract before any commitment
polygon-agent deposit --asset USDC --amount <amount>
```

Present the result clearly: protocol name, APY, TVL, deposit address. Ask your human to confirm, then:

```bash
polygon-agent deposit --asset USDC --amount <amount> --broadcast
```

After a successful deposit, write the position to `workspace/memory/yield-state.json`.

---

## After Setup

Update `workspace/memory/yield-state.json` with the first position. Update `workspace/USER.md` with the human's name and any preferences they mention. Then **delete this file** — you don't need it anymore.
