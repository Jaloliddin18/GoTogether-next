# 같이Go Smart Library — Frontend Claude Code Guide

## Project identity

**같이Go Smart Library Robot Delivery System**
University capstone project — Inha University, Korea.
This repo is the **student-facing frontend only**.

Built on top of the legacy Nestar real-estate Next.js project.
The Nestar real-estate domain is being gradually replaced by Smart Library features.

- Do not build admin dashboard pages unless explicitly asked.
- Do not delete legacy real-estate pages until explicitly asked.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.0 (Pages Router) |
| UI library | React 18.2.0 |
| Language | TypeScript |
| Styling | SCSS (`scss/pc/`, `scss/mobile/`) + Material UI |
| Data layer | Apollo Client (GraphQL) |
| Package manager | Yarn |
| i18n | next-i18next |

---

## Repo structure

```
apollo/
  client.ts          ← Apollo Client setup (WebSocket + HTTP split)
  store.ts           ← Reactive vars (userVar, themeVar, socketVar)
  user/              ← User GraphQL operations (query.ts, mutation.ts)
  admin/             ← Admin GraphQL operations (query.ts, mutation.ts)
  library/           ← Smart Library GraphQL operations (query.ts, mutation.ts)
  robot/             ← Robot WebSocket Apollo client

libs/
  auth/index.ts      ← getJwtToken(), login, signup
  hooks/
    useDeviceDetect.ts ← Mobile/desktop branching hook
  components/        ← Shared UI components + layouts
  enums/             ← TypeScript enums (book.enum.ts, request.enum.ts, robot.enum.ts, …)
  types/             ← TypeScript interfaces
    book/            ← Book, Books, BookPrice, BookRating, …
    book-inventory/  ← BookInventory, BookShelf, …
    request/         ← RequestTask, Requests, …
    robot/           ← Robot, RobotPose, …
    twit/            ← Twit, Twits, …
    twit-comment/    ← TwitComment, TwitComments, …
    member/          ← Member, Members
    property/        ← Property (legacy) + MeLiked, TotalCounter (shared)
  config.ts
  sweetAlert.ts
  utils.ts

pages/
  library/           ← Smart Library student pages
    books/
      index.tsx      ← Book list/search
      [bookId].tsx   ← Book detail + BORROW/PURCHASE (TODO)
    requests/
      index.tsx      ← Request history (TODO)
    tracking/
      [requestId].tsx ← Live robot tracking (TODO)
    community/
      index.tsx      ← Twit feed (TODO)
    index.tsx        ← Library landing
  _admin/            ← Admin pages (legacy Nestar; library admin deferred)
  property/          ← Legacy real-estate (do not delete yet)
  agent/             ← Legacy real-estate (do not delete yet)
  member/            ← Member profile pages (transform later)

scss/
  pc/                ← Desktop styles
  mobile/            ← Mobile styles

public/              ← Static assets
```

---

## Key patterns

### Apollo Client
- File: `apollo/client.ts`
- HTTP link for GraphQL queries/mutations
- WebSocket link (via `WebSocketLink`) for subscriptions — **robot tracking must use an isolated socket, not the general chat socket**
- Auth token injected via `getJwtToken()` from `libs/auth`

### Auth
- Token: `localStorage.getItem('accessToken')`
- Auth functions: `libs/auth/index.ts` (getJwtToken, login, signup)
- Apollo reactive var: `userVar` in `apollo/store.ts`

### State management
- Apollo cache + reactive vars in `apollo/store.ts`
- Use `useReactiveVar(userVar)` to read auth state in components

### Device detection
```ts
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
const { isMobile } = useDeviceDetect();
```

### GraphQL hooks
```ts
import { useQuery, useMutation } from '@apollo/client';
```

### Env variables
- `NEXT_PUBLIC_API_URL` — backend base URL
- `NEXT_PUBLIC_WS_URL` — WebSocket URL for robot tracking
- Never hardcode URLs in components

### TotalCounter and MeLiked
- Currently defined in `libs/types/property/property.ts`
- Must be moved to a shared location before the property module is deleted
- All new library types import from `../property/property` for now

---

## Backend API

- Separate NestJS + GraphQL + MongoDB repo
- GraphQL endpoint: `${NEXT_PUBLIC_API_URL}/graphql`
- WebSocket endpoint: `NEXT_PUBLIC_WS_URL` (robot tracking only)
- Frontend communicates via GraphQL for data and WebSocket for live tracking
- Frontend does NOT connect to MQTT directly

---

## WebSocket event contracts (fixed — do not rename)

| Event | Direction | Payload |
|-------|-----------|---------|
| `joinRequest` | client → server | `{ requestId }` |
| `robotPosition` | server → client | `{ robotId, requestId, floorId, x, y, theta, timestamp }` |
| `robotStatus` | server → client | `{ robotId, requestId, status, message, battery, timestamp }` |
| `requestUpdated` | server → client | `{ requestId, status, message, timestamp }` |
| `robotOffline` | server → client | `{ robotId, requestId, message, timestamp }` |
| `bookNotFound` | server → client | `{ requestId, bookId, message, timestamp }` |
| `deliveryReady` | server → client | `{ requestId, message, timestamp }` |

---

## Smart Library implementation order

1. `apollo/library/query.ts` — book queries
2. `pages/library/books/index.tsx` — book list page ✅ (created)
3. `pages/library/books/[bookId].tsx` — book detail + BORROW/PURCHASE button
4. `pages/library/requests/index.tsx` — request history
5. `pages/library/tracking/[requestId].tsx` — live robot tracking via WebSocket
6. `pages/library/community/index.tsx` — Twit feed
7. `pages/member/[memberId].tsx` — user profile (transform existing)

---

## Product rules — NEVER violate

- Do not use `property` or `agent` naming in new Smart Library code.
- Do not use fork-lift, moving-arm, fork, or container terminology.
- Robot uses a **fixed gripper** that only opens/closes.
- `READY` means delivered and ready for student pickup — not the same as `COMPLETED`.
- Do not build admin dashboard pages unless explicitly asked.
- Do not delete legacy pages until explicitly asked.
- WebSocket for robot tracking must be isolated from existing chat socket.
- Do not connect frontend directly to MQTT.

---

## Coding rules

- Before writing a new page, inspect an existing similar page first.
- Use `useDeviceDetect` for mobile/desktop branching.
- Use Apollo `useQuery`/`useMutation` hooks — never raw fetch.
- Never hardcode API URLs — always use env variables.
- Run `yarn build` after every implementation step.
- Fix all TypeScript errors before reporting done.

---

## Commit rules

- Only `feat:` or `fix:` prefixes.
- Propose commit message and wait for confirmation.
- Never run `git push` unless explicitly asked.

## Recovery

```bash
git restore .
git reset --soft HEAD~1   # undo commit, keep changes
git reset --hard HEAD~1   # undo commit, discard changes
```
