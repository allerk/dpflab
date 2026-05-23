Verify if environmental variable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` value is `1`. If not, then return error.

Read `@.claude/memory/MEMORY.md` to load the full project memory index (all agents + topic files). This is the agent-team entry point for project memory — in solo mode it is not loaded automatically.

Read `@.claude/docs/architecture.md` to load full project architecture context. Pass this to homelander when spawning — black-noir does not need it.

Read `@.claude/docs/git-conventions.md` and include it in the prompt for every agent spawned — both homelander and black-noir must follow the same git/GitHub conventions.

The `Agents` team roster is located in `@.claude/agents/` Use TeamCreate tool to create a team and register those agents to the team.

Read `@.claude/common-prompt.md` file to consume general rules and requirements which applies to all agents, including the team-lead. When spawning each agent, include these rules in their prompt.