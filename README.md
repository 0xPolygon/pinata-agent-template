# OpenClaw Agent Template

> **This is a base template.** It is intentionally generic. Clone it and customize it to build _your_ agent — a frontend dev, a data pipeline monitor, a personal assistant, a Discord bot, whatever you want. Do NOT treat this as a finished agent or specialize it in place. Do NOT change the personality, soul, or identity files to match a specific use case — those are for the end user to fill in.

## What This Is

A vanilla starting point for building agents on [Pinata Agents](https://agents.pinata.cloud). It provides:

- A documented `manifest.json` with every available option explained in `_docs`
- A workspace structure with personality, memory, and safety conventions
- A bootstrap flow so the agent figures out who it is on first run
- A working example server (`workspace/server/`) showing how scripts, routes, and tasks wire together

**What this is NOT:** a specific agent. The agent name, description, personality, and example server are placeholders. Replace them with your own.

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
  server/                    # Example Express server — replace with your own app
    src/
      index.ts               # Health endpoint + dashboard page
      dashboard.html         # Minimal status page
    ecosystem.config.js      # pm2 process config
    package.json
    tsconfig.json
```

## Manifest Options

The `manifest.json` includes a `_docs` block documenting every available field. Here's an overview:

| Section      | What it does                                                                 |
| ------------ | ---------------------------------------------------------------------------- |
| **agent**    | Name, description, vibe, emoji                                               |
| **secrets**  | Encrypted API keys and credentials                                           |
| **skills**   | Attachable skill packages from ClawHub (max 20)                              |
| **tasks**    | Scheduled prompts — cron (`'0 9 * * *'`) or milliseconds (`'600000ms'`)      |
| **scripts**  | Lifecycle hooks — `build` runs after git push, `start` runs on agent boot    |
| **routes**   | Port forwarding for web apps/APIs (max 10)                                   |
| **channels** | Telegram, Discord, Slack configuration                                       |
| **template** | Marketplace listing metadata                                                 |

Remove the `_docs` block before submitting to the marketplace.

## Serving a Web App (Scripts + Routes + Tasks)

This template includes a working example. Here's how the pieces connect:

**`scripts`** handle the lifecycle:
- `build` runs after every git push — installs deps and compiles TypeScript
- `start` runs on agent boot — launches the server via pm2

**`routes`** expose the server to the internet:
- Maps port 3000 to the `/dashboard` URL path
- `protected: false` makes it publicly accessible (set `true` to require auth)

**`tasks`** keep things healthy:
- A health-check task runs every 10 minutes and restarts the server if it's down
- Schedule supports both cron expressions (`'0 9 * * *'`) and milliseconds (`'600000ms'`)

```json
{
  "scripts": {
    "build": "cd ./workspace/server && npm install --include=dev && npm run build",
    "start": "cd ./workspace/server && ./node_modules/.bin/pm2 start ecosystem.config.js"
  },
  "routes": [
    { "port": 3000, "path": "/dashboard", "protected": false }
  ],
  "tasks": [
    {
      "name": "health-check",
      "prompt": "Run curl -sf http://localhost:3000/health to check if the server is up. If it fails, restart it. Reply with: OK, RESTARTED, or FAILED.",
      "schedule": "600000ms"
    }
  ]
}
```

**Important details:**

- Your server **must bind to `0.0.0.0`**, not `localhost`, or it won't be reachable
- Use pm2 (`ecosystem.config.js`) to manage the process — it handles restarts and logs
- The example server has a `/health` endpoint the watchdog task checks

## How to Use

1. Import this repo when creating an agent on [Pinata Agents](https://agents.pinata.cloud)
2. Edit `manifest.json` — change the agent name, description, tags, secrets, and configure scripts/routes/tasks for your use case
3. Edit the workspace files — give your agent a personality, tools, and purpose
4. Replace `workspace/server/` with your own app, or remove it if your agent doesn't need a server
