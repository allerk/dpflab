Save a fact to project-level memory at `.claude/memory/`.

**This command bypasses scratch.** It is for developer-confirmed facts that should land in memory immediately, without waiting for `/shutdown` distillation.

Apply the **Memory Write Rules** from `@.claude/common-prompt.md` — tags, file format, index update, ambiguity handling, and speculative marker are all defined there.

## Target file

- Agent-specific fact → `.claude/memory/agents/<agent-name>.md`
- Cross-cutting fact (no single agent owner) → `.claude/memory/team-lead.md`
- General project topic → `.claude/memory/<topic>.md` (create if absent)

## When NOT to use

Personal preferences, session context, behavioral notes → personal memory (`~/.claude/projects/.../memory/`). If scope is unclear, stop and ask.

In-session agent findings → write to `.claude/scratch.md` instead (they will be distilled at `/shutdown`).
