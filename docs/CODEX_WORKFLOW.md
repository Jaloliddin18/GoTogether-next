# Codex Workflow

## Objective

Keep frontend changes safe, incremental, and aligned with Smart Library backend scope.

## Required pre-check before editing

1. Run `git branch --show-current`
2. Run `git status --short --branch`
3. If any tracked file is modified, stop and report status before making edits

## Scope discipline

- Documentation/setup tasks: modify markdown files only unless explicitly asked otherwise
- Current frontend phase: student-facing only
- Do not create admin dashboard pages unless explicitly requested
- Do not delete legacy real-estate pages/components unless explicitly requested

## Implementation guardrails

- Reuse existing frontend conventions (Pages Router, Apollo, MUI, SCSS)
- Keep API modules/types organized by backend domain
- Do not hardcode backend URLs
- Do not connect frontend directly to MQTT
- Keep robot tracking WebSocket logic isolated from chat/general socket logic
- Use fixed-gripper terminology, not fork-lift or moving-arm terminology

## Verification

After changes, run relevant frontend validation when available:
- `yarn build`
- or `yarn lint`

Report pre-existing failures separately from new failures.

## Commit/push policy

- Do not commit until user confirmation (unless explicitly overridden in the prompt)
- Do not push unless explicitly requested
- Suggested commit prefixes must use only:
  - `feat:`
  - `fix:`

## Session Note (2026-05-15)

- Community migration status:
  - Live `/community` now uses Twit feed APIs (`GET_TWITS`, `CREATE_TWIT`, `LIKE_TWIT`, `DELETE_TWIT`).
  - `/community/detail` uses `GET_TWIT` on query route `/community/detail?id=<twitId>`.
- Twit image handling status:
  - Upload uses `imagesUploader` target `twits`.
  - Persist the returned relative path exactly in `createTwit.image`.
  - Render normalization rule is: `http` as-is, `/` as-is, otherwise prefix `/`.
