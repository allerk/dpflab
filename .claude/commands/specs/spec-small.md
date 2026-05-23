---
description: Transform a human-written specification into a well-structured Org-mode file for Spec-Driven Development
argument-hint: <path-to-spec-or-inline-text> [output-path]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(mkdir:*), Bash(date:*)
---

# Spec → Org (SDD Preparation)

You are preparing a **Spec-Driven Development (SDD)** artifact. Your job is to take the loose, human-written specification supplied in `$ARGUMENTS` and transform it into a **rigorous, well-documented `.org` file** that can serve as the single source of truth for downstream implementation work.

## Input

`$ARGUMENTS` may be one of:
1. A path to an existing file (e.g. `docs/idea.md`, `notes/feature.txt`) — read it.
2. A path plus an output path (e.g. `docs/idea.md specs/feature.org`) — read the first, write to the second.
3. Inline free-form text describing the feature/system — use it directly.

If no output path is given, default to `specs/<kebab-case-title>.org` and `mkdir -p` the directory.

## Workflow

1. **Ingest** the input. If it's a path, read it. If the path doesn't exist, treat the argument as inline spec text.
2. **Analyze** the raw spec. Identify:
    - The core problem / goal
    - Implicit assumptions that should be made explicit
    - Missing pieces (acceptance criteria, edge cases, non-functional requirements, data shapes, interfaces)
    - Ambiguities that need flagging
3. **Restructure** into the Org skeleton below. Do **not** invent requirements that aren't implied by the source — instead, list them under `Open Questions` so a human can resolve them.
4. **Write** the `.org` file. Use proper Org-mode syntax: headings with `*`, `#+TITLE:`, `#+AUTHOR:`, `#+DATE:`, property drawers, TODO keywords, tags, and source blocks.
5. **Report** back with a short summary: file path, sections produced, count of open questions, and any TODO items that need human attention before development starts.

## Required Org Structure

Produce a file with exactly this skeleton (filled in from the spec):

```org
#+TITLE: <Concise feature name>
#+AUTHOR: <from git config if available, else "TBD">
#+DATE: <today's date, YYYY-MM-DD>
#+STARTUP: overview
#+TODO: TODO(t) IN-PROGRESS(p) BLOCKED(b) | DONE(d) CANCELLED(c)
#+TAGS: spec(s) design(d) impl(i) test(e) docs(o)
#+OPTIONS: toc:2 num:t

* Overview                                                              :spec:
  :PROPERTIES:
  :STATUS:   draft
  :VERSION:  0.1.0
  :END:

** Problem Statement
   <1–3 paragraphs: what problem, for whom, why now>

** Goals
   - <bulleted, measurable goals>

** Non-Goals
   - <explicit out-of-scope items — critical for SDD>

** Success Criteria
   - <how we know it's done; observable / testable>

* Context & Background                                                  :spec:
** Current State
** Stakeholders / Users
** Constraints & Assumptions

* Requirements                                                          :spec:
** Functional Requirements
   Each requirement gets its own subheading with an ID:
*** TODO FR-001: <short name>
    :PROPERTIES:
    :PRIORITY: <P0|P1|P2>
    :END:
    <Description, inputs, outputs, behavior>

** Non-Functional Requirements
*** Performance
*** Security
*** Observability
*** Accessibility / i18n (if applicable)

* Design                                                             :design:
** Architecture Overview
** Data Model
   Use src blocks for schemas / types:
   #+BEGIN_SRC text
   <schema or type definitions>
   #+END_SRC
** Interfaces / API
** Key Flows
** Trade-offs Considered

* Acceptance Criteria & Test Plan                                      :test:
** Given/When/Then scenarios
*** Scenario: <name>
    - Given …
    - When …
    - Then …
** Edge Cases
** Test Strategy (unit / integration / e2e)

* Implementation Plan                                                  :impl:
** Phases / Milestones
*** TODO Phase 1: <name>
    - [ ] task
    - [ ] task
** Rollout / Migration
** Rollback Strategy

* Open Questions                                                        :spec:
   Anything ambiguous in the source spec — DO NOT silently resolve these.
   - [ ] Question 1 …
   - [ ] Question 2 …

* Risks & Mitigations                                                   :spec:
   | Risk | Likelihood | Impact | Mitigation |
   |------+------------+--------+------------|
   |      |            |        |            |

* References                                                            :docs:
   - Original spec: <path or "inline">
   - Related docs: …

* Changelog                                                             :docs:
   - <YYYY-MM-DD> v0.1.0 — Initial conversion from human spec.
```

## Rules

- **Faithful transformation, not invention.** If the source doesn't say it, don't assert it — put it under `Open Questions` instead.
- **Make implicit things explicit.** Assumptions, non-goals, and edge cases that a reasonable engineer would infer should be surfaced (and clearly labeled as inferred where appropriate).
- **Every functional requirement gets an ID** (`FR-001`, `FR-002`, …) so downstream commits, branches, and tests can reference them.
- **Use proper Org syntax.** Heading levels with `*`, property drawers with `:PROPERTIES:`/`:END:`, TODO keywords, tags in `:tag:` form, tables with `|`, source blocks with `#+BEGIN_SRC`/`#+END_SRC`.
- **Keep it skimmable.** Bullets over prose where possible. Short sentences. No marketing language.
- **Don't fabricate dates, authors, or versions** beyond today's date and `0.1.0` for a fresh spec.

## Final Output to the User

After writing the file, respond with:

1. The path of the created `.org` file.
2. A bullet list of the top-level sections produced.
3. The count and titles of items in `Open Questions` — these are the things the human needs to answer before development begins.
4. Any inferred assumptions you made that you want them to verify.

## Output

Into the specs/ folder. Create if not exists.s