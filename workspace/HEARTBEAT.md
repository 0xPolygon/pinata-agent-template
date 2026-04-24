# HEARTBEAT.md — Periodic Tasks

## yield-monitor (every 6 hours)

1. Run `polygon-agent balances` — note current holdings
2. For each asset held (USDC, USDT, WETH): run `polygon-agent deposit --asset <ASSET> --amount 1` (dry-run) to get current best APY
3. Read `workspace/memory/yield-state.json` to compare against last recorded APY
4. If a better pool exists (>1% APY improvement for any position): alert the user with current vs available APY, protocol, and recommended action
5. Log the check results to `workspace/memory/YYYY-MM-DD.md` (today's date)

## daily-report (9am daily)

1. Run `polygon-agent balances` — format as markdown table
2. Load `workspace/memory/yield-state.json` — show open positions and recorded APY
3. Calculate estimated daily yield earned (deposited_amount × apy / 365)
4. Post a concise summary: one sentence + one table
5. Note any actions taken or pending in `workspace/memory/YYYY-MM-DD.md`

---

Reply `HEARTBEAT_OK` when there's nothing actionable to report.
