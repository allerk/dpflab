Gracefully shut down the current session. Distills `.claude/scratch.md` into project memory, then tears down the team (if active).

## Steps

### 1. Collect final scratch entries (team mode only)

If a team is active (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`):

1. Send `SendMessage` to each active agent with timestamp: session is shutting down — append any final findings to `.claude/scratch.md` now.
2. Wait for acknowledgments before proceeding.

Skip this step in solo or sub-agent mode.

### 2. Distill scratch → memory (always, any mode)

Read `.claude/scratch.md`. If it contains entries beyond the header comment:

1. Group entries by agent (from the `<!-- agent: ... -->` header of each entry).
2. For each entry, run the **idempotency check**: compare against existing content of the target memory file. Skip duplicates.
3. Write surviving entries to the correct files:
   - Entry from `homelander` → `.claude/memory/agents/homelander.md`
   - Entry from `black-noir` → `.claude/memory/agents/black-noir.md`
   - Entry from `team-lead` or cross-cutting → `.claude/memory/team-lead.md`
   - **Timestamp rule:** the session section header (`## Session N — YYYY-MM-DD HH:MM UTC`) must use the timestamp copied from the scratch entry's `<!-- agent: ... | YYYY-MM-DD HH:MM -->` tag — do NOT invent or manually choose a time. By this point the hook has already corrected it to UTC, so copy it as-is.
4. Update `.claude/memory/MEMORY.md` index for any file that received new entries.
5. Follow **Memory Write Rules** from `@.claude/common-prompt.md` for tags and format.
6. Clear `.claude/scratch.md` — restore to empty header only:
   ```
   <!-- session scratchpad — gitignored, cleared on /shutdown -->
   <!-- format: <!-- agent: <name> | task: <desc> | YYYY-MM-DD HH:MM --> -->
   <!-- then: [TAG] fact on next line -->
   ```

If scratch is empty: state "scratch was empty — nothing to distill."

### 3. Team teardown (team mode only)

Call `TeamDelete` to dissolve the team.

### 4. Summary

Report to the developer:
- Entries distilled: count + file paths written + tags used
- Duplicates skipped: count
- Scratch: cleared or was already empty
- Team: deleted or not applicable

Do not commit. Committing is always the developer's responsibility.
