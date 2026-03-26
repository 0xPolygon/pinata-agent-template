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
| **model**    | Default AI model                                                             |
| **secrets**  | Encrypted API keys and credentials                                           |
| **skills**   | Attachable skill packages from ClawHub (max 20)                              |
| **tasks**    | Cron-scheduled prompts (max 20)                                              |
| **scripts**  | Lifecycle hooks — `build` runs after git push, `start` runs on agent boot    |
| **routes**   | Port forwarding for web apps/APIs (max 10)                                   |
| **channels** | Telegram, Discord, Slack configuration                                       |
| **template** | Marketplace listing metadata                                                 |

Remove the `_docs` block before submitting to the marketplace.

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
