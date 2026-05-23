# Agent System — Next Iteration Backlog

> Scope: improvements to the Claude Code agent infrastructure in this project.
> Not product features. Prioritised by impact on reliability and determinism.

---

## 1. Script-backed commands (reduce LLM randomness)

Replace natural-language slash-command instructions with actual scripts that Claude invokes via Bash. The scripts handle the mechanical, deterministic parts; Claude handles only the intelligent parts (summarising, deciding what to save, etc.).

### 1.1 Startup scratch check script
- `scripts/agent/check-scratch.js` — reads `.claude/scratch.md`, exits 0 if empty, prints summary of entries if non-empty
- CLAUDE.md startup rule calls this script instead of asking Claude to "read and summarise"
- Output format: JSON so Claude can parse it reliably

### 1.2 Scratch distillation script
- `scripts/agent/distill-scratch.js` — reads scratch, groups by agent, returns structured JSON
- `/shutdown` command invokes it and receives clean data to write to memory files
- Removes the "Claude must parse scratch format correctly" dependency

### 1.3 Memory write script
- `scripts/agent/write-memory.js <file> <tag> <content>` — appends a tagged entry to the correct `.claude/memory/` file and updates `MEMORY.md` index
- `/save-project-memory` and `/shutdown` invoke it instead of using Write/Edit tools directly
- Guarantees format consistency regardless of which agent is writing

### 1.4 Team bootstrap script
- `scripts/agent/start-team.sh` — validates env (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), pre-loads files, prints a ready-to-paste TeamCreate instruction
- Reduces the chance Claude skips a step in `/start:start-ai-team`

### 1.5 Team shutdown script
- `scripts/agent/shutdown-team.sh` — runs distill-scratch, clears scratch, prints summary
- `/shutdown` calls it before TeamDelete

---

## 2. Containerised workspace

Goal: reproducible environment; all agents run inside a container; developer has shell access.

- `Dockerfile` — Node 24 LTS + Claude Code CLI + project deps
- `docker-compose.yml` — mounts project dir as volume, exposes port 3000
- `.devcontainer/devcontainer.json` — VS Code Remote Containers support
- Ensure `.claude/` directory and SQLite data volume survive container restarts
- Document: how to run Claude Code CLI inside the container (`claude` command path)
- Consider: whether `~/.claude/` (personal memory, settings) should be mounted from host

---

## 3. New-agent wizard command

Goal: adding a new agent should take 2 minutes, not 20.

- `.claude/commands/new-agent.md` — interactive command that prompts for:
  - Agent name (kebab-case)
  - Role description (one sentence)
  - Skills (from existing `.claude/skills/` list)
  - Model preference (default: `claude-sonnet-4-6`)
  - Color label
- Creates:
  - `.claude/agents/<name>.md` with proper frontmatter and role section
  - `.claude/memory/agents/<name>.md` stub (frontmatter only)
  - Adds entry to `.claude/memory/MEMORY.md` index
- Registers agent with active team if one is running (via SendMessage to team-lead)
- Validates: no name collision with existing agents

---

## 4. Investigate TaskList for agent teams

Anthropic documentation mentions a task list mechanism for agent teams. Research and evaluate.

- Read Anthropic docs on `TaskCreate` / `TaskList` / `TaskUpdate` tools available to agents
- Understand: are tasks shared across agents in a team, or per-agent?
- Evaluate: can `.org` files (already used for specs) serve as the task list format, or should we use the native TaskCreate API?
- If TaskCreate is useful: integrate into `/start:start-ai-team` — team-lead creates tasks at session start, agents pick them up
- If `.org` is better: define a convention where team-lead writes a session `.org` file at startup that all agents read

---

## 5. Auto-spec before execution

Goal: for any non-trivial request, Claude automatically generates a `.org` spec file and executes it — no manual `/spec-small` invocation needed.

### How it should work
1. Developer sends a request (natural language or inline description)
2. Claude detects it's non-trivial (not a one-liner fix) and auto-runs spec generation
3. A `.org` file is created in `specs/` using the existing `spec-small.md` format
4. Developer reviews open questions (if any) — or Claude proceeds immediately if none
5. Claude executes against the spec, updating TODO items as it goes (`IN-PROGRESS` → `DONE`)
6. At completion, spec reflects final state (all TODOs resolved)

### What needs to be defined
- Threshold for "non-trivial": multi-file changes, new features, anything with open questions
- Where auto-specs land: `specs/YYYY-MM-DD-<kebab-title>.org`
- Whether developer confirmation is required before execution starts (likely yes for first iteration)
- How the spec file is kept in sync as Claude works (live updates vs. final-state-only)

### Connection to task list (item 4)
If TaskCreate is adopted, the `.org` spec becomes the human-readable view and TaskCreate entries become the machine-trackable view — generated from the same spec at execution time.

---

## Notes

- Items 1.x should be done before containerisation — scripts are easier to test locally first
- Item 3 can be done independently at any time
- All scripts should be `node` (ES module, `.js`) to stay consistent with `ensure-utc-timestamps.js`
- Scripts in `scripts/agent/` are Claude-invocable via Bash tool, not direct user commands
