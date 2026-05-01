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

## Solo dev branch workflow

I am working alone and may work directly on `dev`.

Before any Codex coding task:
- Check current branch with `git branch --show-current`.
- Check working tree with `git status`.
- If there are existing uncommitted changes, warn me before editing.

## Codex commit policy

Codex may prepare commits, but should not commit blindly.

After implementing a task, Codex should:
1. Run the relevant verification command:
   - backend: `npm run build`, plus `npm run test` or `npm run lint` if relevant
   - frontend: `yarn build`, plus `yarn lint` or `yarn test` if relevant
2. Run `git status`.
3. Show a concise summary of changed files.
4. Show the proposed commit message.
5. Ask for confirmation before committing, unless my prompt explicitly says `commit after successful build`.

Preferred commit format:
- `Add backend book module`
- `Add backend robot module`
- `Add backend request lifecycle`
- `Add frontend book search page`
- `Add frontend tracking page`
- `Fix frontend book search loading state`
- `Update Smart Library docs`

## If I explicitly request auto-commit

If my prompt includes:
`commit after successful build`

Then Codex may:
1. Run build/lint/test as requested.
2. Commit only if verification passes or only pre-existing unrelated failures are clearly identified.
3. Use a clean descriptive commit message.
4. Never push unless I explicitly ask.

## Push policy

Codex must not run `git push` unless I explicitly ask.

## Bad change recovery

If Codex makes bad changes before commit, suggest:
- `git restore .`
- `git clean -fd` only if I want to remove untracked files

If a bad commit was made and not pushed, suggest:
- `git reset --soft HEAD~1` to keep changes
- `git reset --hard HEAD~1` only if I want to discard changes completely
