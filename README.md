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
  projects/
    hello-test/              # Vite + React + TS starter project (served at /app)
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
  "scripts": {
    "build": "cd ./workspace/projects/hello-test && npm install --include=dev",
    "start": "cd ./workspace/projects/hello-test && npx vite --host 0.0.0.0 --port 5173"
  },
  "routes": [{ "port": 5173, "path": "/app", "protected": false }],
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

### How Port Forwarding Works

Your agent runs inside a container behind a reverse proxy. When you define a route like `{ "port": 5173, "path": "/app" }`, the platform sets up path-based routing:

1. External requests to `https://<agent-host>/app/...` are matched by prefix
2. The gateway forwards them to your container on the specified port
3. **The path prefix is preserved** — your server receives `/app/...`, not `/...`

This means your app must be configured to serve from the route path. For Vite, set `base` to match:

```ts
// workspace/projects/hello-test/vite.config.ts
export default defineConfig({
  base: "/app",          // Must match the route path in manifest.json
  plugins: [react()],
  server: {
    host: "0.0.0.0",    // Required — localhost won't be reachable from the proxy
    port: 5173,          // Must match the route port in manifest.json
    strictPort: true,    // Fail if port is taken instead of picking another
    allowedHosts: true,  // Accept requests from the proxy hostname
    hmr: false,          // HMR doesn't work through the gateway — disable it
  },
});
```

**If you're serving a different framework** (Express, Fastify, Next.js, etc.), the same rules apply: bind to `0.0.0.0`, listen on the port you declared, and mount your app at the route path.

The agent's public URL follows this pattern: `https://<agent-id>.agents.pinata.cloud/<path>`. You can derive your agent ID from the runtime hostname (strip the `-0` suffix from the host).

## How to Use

1. Import this repo when creating an agent on [Pinata Agents](https://agents.pinata.cloud)
2. Edit `manifest.json` — change the agent name, description, tags, and add any options you need (scripts, routes, channels, etc.)
3. Edit the workspace files — give your agent a personality, tools, and purpose
4. If your agent runs a server or app, add `scripts` and `routes` as shown above
