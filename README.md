# OpenClaw Agent Template

> **This is a base template.** It is intentionally generic. Clone it and customize it to build _your_ agent — a frontend dev, a data pipeline monitor, a personal assistant, a Discord bot, whatever you want. Do NOT treat this as a finished agent or specialize it in place.

## What This Is

A vanilla starting point for building agents on [Pinata Agents](https://agents.pinata.cloud). It provides:

- A documented `manifest.json` with every available option explained
- A workspace structure with personality, memory, and safety conventions
- A bootstrap flow so the agent figures out who it is on first run

**What this is NOT:** a specific agent. The placeholder name, description, and personality are examples. Replace them.

## Structure

```
manifest.json                # Agent config — all available options documented in _docs
workspace/
  BOOTSTRAP.md               # First-run conversation guide (self-deletes after setup)
  SOUL.md                    # Agent personality and principles — customize this
  AGENTS.md                  # Workspace conventions, memory system, safety rules
  IDENTITY.md                # Agent name, vibe, emoji (filled in during bootstrap)
  USER.md                    # Notes about the human (learned over time)
  TOOLS.md                   # Environment-specific notes
  HEARTBEAT.md               # Periodic tasks (empty by default)
```

## Manifest Options

The `manifest.json` includes a `_docs` block documenting every available field. Here's an overview:

| Section      | What it does                                                                 |
| ------------ | ---------------------------------------------------------------------------- |
| **agent**    | Name, description, vibe, emoji                                               |
| **model**    | Default AI model (optional — users pick in the UI)                           |
| **secrets**  | Encrypted API keys and credentials                                           |
| **skills**   | Attachable skill packages from ClawHub (max 20)                              |
| **tasks**    | Cron-scheduled prompts (max 20)                                              |
| **scripts**  | Lifecycle hooks — `build` runs after git push, `start` runs on agent boot    |
| **routes**   | Port forwarding for web apps/APIs (max 10)                                   |
| **channels** | Telegram, Discord, Slack configuration                                       |
| **template** | Marketplace listing metadata                                                 |

Remove the `_docs` block before submitting to the marketplace.

## What's Included in the Manifest

The template manifest works out of the box with these sections:

```json
{
  "version": 1,
  "agent": { "name": "...", "description": "...", "vibe": "...", "emoji": "..." },
  "template": { "slug": "...", "category": "...", "partnerName": "...", "tags": [...] },
  "secrets": [{ "name": "MY_SECRET", "description": "...", "required": false }],
  "tasks": [{ "name": "daily-check", "prompt": "...", "schedule": "0 9 * * *", "enabled": true }]
}
```

### Field Details

**`secrets`** — Declare API keys or credentials your agent needs. Values are stored encrypted and injected as environment variables at runtime — never put actual secret values in the manifest.

```json
"secrets": [
  { "name": "COINGECKO_API_KEY", "description": "API key from coingecko.com/api", "required": true },
  { "name": "SLACK_WEBHOOK", "description": "Slack incoming webhook URL", "required": false }
]
```

**`tasks`** — Schedule prompts sent to your agent on a cron schedule. Max 20.

```json
"tasks": [
  { "name": "daily-report", "prompt": "Generate report", "schedule": "0 9 * * *", "enabled": true },
  { "name": "price-check", "prompt": "Check BTC and ETH prices", "schedule": "*/30 * * * *", "enabled": true }
]
```

Common cron patterns:
- `0 9 * * *` — daily at 9am
- `*/30 * * * *` — every 30 minutes
- `0 */6 * * *` — every 6 hours
- `0 9 * * 1` — every Monday at 9am

## Optional Sections (Add When You Need Them)

These sections require additional setup (app code, valid CIDs, or platform accounts) — don't add them until you have the backing infrastructure.

**`skills`** — Attach skill packages from ClawHub. Max 20. Each skill is referenced by its IPFS content ID.

```json
"skills": [
  { "cid": "bafkrei...", "name": "web-search" },
  { "cid": "bafkrei...", "name": "code-interpreter" }
]
```

**`channels`** — Connect your agent to messaging platforms. Each channel supports a `dmPolicy`:
- `"pairing"` — users must enter a pairing code to start a conversation
- `"open"` — anyone can message the agent
- `"closed"` — DMs disabled

```json
"channels": {
  "telegram": { "enabled": true, "dmPolicy": "pairing", "allowFrom": [123456789] },
  "discord": { "enabled": true, "dmPolicy": "open" },
  "slack": { "enabled": true }
}
```

## Serving a Web App (Scripts + Routes)

If your agent runs a server, API, or frontend dev server, you need two things in `manifest.json`:

1. **`scripts`** — lifecycle hooks that install deps and start the server
2. **`routes`** — port forwarding rules that expose the server to the internet

Example from a Vite + React agent:

```json
{
  "scripts": {
    "build": "cd workspace/projects/myapp && npm install --include=dev",
    "start": "cd workspace/projects/myapp && npx vite --host 0.0.0.0"
  },
  "routes": [
    {
      "port": 5173,
      "path": "/app",
      "protected": false
    }
  ]
}
```

**Important details:**

- `build` runs after every git push — use it to install dependencies or compile assets
- `start` runs on agent boot — use it to launch your server or long-running process
- Your server **must bind to `0.0.0.0`**, not `localhost`, or it won't be reachable
- Set `protected: false` for public routes, or `true` (default) to require auth
- Use `__AGENT_HOST__` as a placeholder in config files — it gets replaced at runtime with the agent's public hostname
- For WebSocket/HMR setups (e.g. Vite), connect via WSS on port 443 through `__AGENT_HOST__`

Example Vite config using the host placeholder:

```ts
export default defineConfig({
  base: "/app",
  server: {
    host: "0.0.0.0",
    allowedHosts: ["__AGENT_HOST__"],
    hmr: {
      host: "__AGENT_HOST__",
      protocol: "wss",
      clientPort: 443,
    },
  },
});
```

## How to Use

1. Import this repo when creating an agent on [Pinata Agents](https://agents.pinata.cloud)
2. Edit `manifest.json` — change the agent name, description, tags, and add any options you need (scripts, routes, channels, etc.)
3. Edit the workspace files — give your agent a personality, tools, and purpose
4. If your agent runs a server or app, add `scripts` and `routes` as shown above
