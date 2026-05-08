# 같이Go Frontend Agent Guide

## Purpose

Repo-level instructions for Codex and other coding agents working on the frontend.

## Project identity

This repository is the frontend for 같이Go, a Smart Library Robot Delivery system.

Current phase:
- Student-facing frontend first
- Admin/staff dashboard frontend is deferred unless explicitly requested

The frontend lets students:
- Search books
- View book details
- Request robot delivery
- Track robot position live
- View request history

The frontend can later let staff/admin users:
- Monitor active delivery requests
- Monitor robot health
- View failed requests
- Manage book availability

## Existing frontend stack

- Framework: Next.js 14.2.0 + React 18.2.0
- Router: Next.js Pages Router
- Language: TypeScript
- Package manager: Yarn
- Styling: SCSS + Material UI
- Data layer: Apollo GraphQL
- Existing GraphQL client: `apollo/client.ts`
- Existing GraphQL operation folders: `apollo/user`, `apollo/admin`
- Existing layouts: `libs/components/layout`
- Existing admin route group: `pages/_admin`
- Existing auth token: localStorage `accessToken`
- Existing frontend is currently domain-coupled to real-estate pages/components

## Backend relationship

The backend is a separate NestJS GraphQL-first backend.

Frontend communicates with backend using:
- GraphQL for normal app data
- WebSocket for live robot tracking

Frontend must NOT communicate with MQTT directly.
MQTT is only between backend and robot.

## Migration principle

The goal is to transform the existing real-estate Nestar project into the 같이Go Smart Library Robot Delivery project.

### 1. Keep useful infrastructure

- NestJS/Next.js project structure
- GraphQL/Apollo setup
- MongoDB/Mongoose setup
- Auth/JWT/roles
- Layouts
- Admin structure
- Shared UI patterns
- Styling system

### 2. Replace domain-specific real-estate features

- Property domain becomes Book/Catalog domain
- Property detail becomes Book detail
- Property search becomes Book search
- Property admin becomes Book availability/admin
- Agent pages may be removed or repurposed later
- Real-estate homepage sections should later become Smart Library homepage sections

### 3. Removal policy

- Do not delete old real-estate modules/pages first.
- First build working Smart Library MVP.
- Then update navigation/homepage to Smart Library.
- Then remove old real-estate files only after checking imports and build.
- Remove old files gradually, one domain area at a time.

### 4. Codex rule for later removals

When removing old real-estate code later, Codex must:
- Search for imports/usages first
- List files to delete
- Explain risk
- Ask for confirmation
- Run build after deletion
- Never delete large folders without confirmation

## Important rules

- I am the only developer on this frontend project.
- I may work directly on `dev`.
- Do not rewrite the whole frontend.
- Do not delete existing real-estate pages/components unless explicitly requested.
- Add Smart Library features incrementally under new routes.
- Prefer new routes under `pages/library/*` and `pages/_admin/library/*`.
- Follow existing project style and folder conventions.
- Reuse existing layouts, Apollo setup, MUI, and SCSS patterns.
- Keep changes small and testable.
- Do not hardcode backend URLs in components.
- Use existing environment variable pattern where possible.
- Do not implement backend business rules in the frontend.
- Do not connect frontend directly to MQTT.
- Do not add AI assistant UI before the core MVP works.
- Do not modify `apollo/client.ts` unless necessary and planned first.
- Do not mix robot tracking WebSocket code with existing chat/general socket code.
- For non-trivial tasks, use inspect -> plan -> implement.

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

Preferred commit prefix:
- `feat:`
- `fix:`

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

## Target frontend routes

Student routes:
- `pages/library/books/index.tsx`
- `pages/library/books/[id].tsx` preferred, or `pages/library/books/detail.tsx` if matching existing route style is safer
- `pages/library/tracking/[requestId].tsx` preferred, or `pages/library/tracking.tsx` if matching existing route style is safer
- `pages/library/requests.tsx`

Staff/admin routes (deferred for current student-first phase):
- `pages/_admin/library/index.tsx`
- `pages/_admin/library/requests.tsx`
- `pages/_admin/library/robots.tsx`
- `pages/_admin/library/books.tsx`

## Safe implementation order

1. Create frontend context docs
2. Add `.env.example` if missing
3. Add isolated GraphQL operation files under `apollo/library`
4. Add Book Search page under `pages/library/books`
5. Add Book Detail + Request page
6. Add Request History page
7. Add Live Tracking page with mocked WebSocket data
8. Connect real WebSocket tracking
9. Add Community Twit feed pages
10. Add Profile/follow/comments pages
11. Polish UI for final demo

## Build/test expectations

Before finishing coding tasks, run relevant commands:
- `yarn build`
- `yarn lint`
- `yarn test` if available

If commands fail due to pre-existing issues, report clearly.
