# Codex Workflow

## Objective

Keep frontend changes predictable, reviewable, and safe for a single-developer project.

## Default workflow

1. Inspect
- Read existing related files before editing.
- Identify reuse points in layouts, Apollo operations, and page patterns.

2. Plan
- Propose minimal additive changes.
- Prefer new Smart Library routes over rewriting old domain pages.

3. Implement
- Keep edits scoped.
- Follow TypeScript + MUI + SCSS conventions already in repo.
- Avoid hidden architectural rewrites.

4. Verify
- Run relevant checks (`yarn lint`, `yarn build`, optional tests).
- Report pre-existing failures separately from new failures.

5. Report
- List changed files.
- Explain why each change was made.
- Note follow-up tasks and risks.

## Guardrails

- Do not modify unrelated source files.
- Do not install packages unless explicitly requested.
- Do not delete legacy pages/components during MVP buildout.
- Do not hardcode API endpoints.
- Do not couple Smart Library tracking to chat socket logic.

## Recommended task slicing

- Slice by route or contract, not by random component edits.
- Keep each PR/commit focused on one vertical:
  - API contract files
  - one page flow
  - one admin view
  - websocket integration
