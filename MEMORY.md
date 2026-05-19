# MEMORY — 같이Go Frontend

**Last Updated:** 2026-05-19
**Current Branch:** `myPage`

---

## Today's Session Update (2026-05-19, RobotTracking realtime completion lifecycle + return path)

### Completed today
- Fixed stale READY override by enforcing terminal-priority request status handling in `libs/hooks/useRobotSocket.ts`.
- Added requestId-guarded socket event handling and safer timeline updates for `requestUpdated` payloads.
- Updated `RobotTracking` effective status resolution to be terminal-aware and to avoid regressions from stale non-terminal updates.
- Changed request selection to prioritize latest request timestamp and avoid fallback to older READY entries.
- Added auto-refresh behavior for `GET_SESSION_REQUESTS` (`pollInterval`) so request assignment/status changes appear without manual page reload.
- Kept WebSocket tracking bound to the latest request id to preserve post-completion telemetry visibility.
- Added post-completion route rendering behavior so map can show return-to-dock path/trail after `COMPLETED` when robot emits `RETURNING`/`DOCKING`/`IDLE`.
- Preserved planned/live route graph logic and heading behavior while stabilizing terminal lifecycle rendering.

### Current stopping point
- RobotTracking now updates without manual refresh for request lifecycle changes and can visually follow post-completion return telemetry.
- Frontend build passes with existing unrelated warnings (`react-i18next` init notice and demo `+input` logs).

### Exact next task
- Validate end-to-end with persistent simulator listener mode so request creation triggers automatic robot movement without one-shot command runs.

---

## Today's Session Update (2026-05-16, Comment Threading + Edit/Delete/Like)

### Completed today
- Removed stale `likes: string[]` field from all GraphQL queries and mutations across `apollo/user/`, `apollo/admin/`, and `libs/types/twit-comment/twit-comment.ts`. Replaced with `meLiked` / `likeCount` throughout.
- Migrated single `image: String` to multi-image `images: String[]` across twit types, queries, mutations, components (`TwitMedia`, `TwitBody`, `TwitCard`, `CommunityComposer`).
- Rewrote `CommunityComposer` to support batch image upload (max 3) via axios multipart with thumbnail strip and remove buttons.
- Fixed TwitMedia 3-image CSS grid on detail page — `display: grid` was scoped to `#community-list-page` and never reached `#community-detail-page`. Added explicit grid rules with `px` row tracks to `detail.scss`.
- Created `libs/components/community/CommentCard.tsx` — handles 3-depth comment threading (depth 0/1/2), per-comment like (optimisticResponse), inline edit, and soft delete.
- Extended `pages/community/detail.tsx` comment grouping from 2 buckets to 3 (`depth0` / `depth1` / `depth2`) and passed `depth2` pool to depth-0 CommentCards so depth-1 children can render their own replies.
- Fixed `UPDATE_TWIT_COMMENT` call: backend input field is `commentId`, not `_id`.
- Reply button hidden when `comment.depth >= 2` (backend returns `BAD_REQUEST` above depth 2).

### Key gotchas recorded
- `UPDATE_TWIT_COMMENT` input: `{ commentId: string, text: string }` — `_id` is rejected by backend.
- `display: grid` must be declared in each page's own SCSS scope — it does not inherit across sibling page selectors.
- `grid-template-rows: 1fr 1fr` collapses to 0 without an explicit container height — use explicit `px` row tracks.

### Commits
- `a80f766` fix: community page UI fixes and image grid improvements
- `d3c5270` feat: add comment threading, edit, delete, and like functionality

### Current stopping point
- Working tree is clean after commit `d3c5270`.
- Comment like, edit, delete, and 3-depth threading are all live.

### Exact next task
- QA comment threading in browser (reply at depth 0 → 1 → 2; verify Reply button hidden at depth 2; verify edit/delete owner guard).
- Continue with remaining pages per implementation order below.

### Uncommitted/untracked files
- None (`git status`: working tree clean).

---

## Today's Session Update (2026-05-15, Twit Upload URL Resolution)

### Completed today
- Fixed Twit media URL resolution so backend upload paths are resolved against API base URL (`REACT_APP_API_URL`) instead of frontend origin.
- Updated shared `TwitMedia` rendering rule used by both feed cards and detail view via `TwitBody`.
- Applied explicit handling:
  - `http...` -> use as-is
  - `uploads/...` -> `${REACT_APP_API_URL}/uploads/...`
  - `/uploads/...` -> `${REACT_APP_API_URL}/uploads/...`
  - other `/...` -> use as-is
- Committed all current community changes:
  - `99aa9c4` feat: finalize twit community updates and image url resolution

### Build/verification result
- Ran `npm run build`.
- Build failed due local Node version mismatch: current `18.16.1`, Next.js requires `>=18.17.0`.

### Current stopping point
- Twit image path resolution is now backend-aware for relative upload paths and remains unchanged in stored `createTwit.image`.
- Working tree is clean after commit `99aa9c4`.

### Exact next task
- Upgrade local Node runtime to `>=18.17.0` (recommended Node 20 LTS) and rerun `npm run build` for full structural verification.
- Then continue scoped Twit UX QA and planned member/mypage Twit-surface migration.

### Uncommitted/untracked files
- None (`git status`: working tree clean).

---

## Today's Session Update (2026-05-15, Community Twit Refactor)

### Completed today
- Added frontend `GET_TWIT` query integration and converted `/community/detail?id=<twitId>` to Twit detail data.
- Replaced legacy `/community` board/article list UI with Twit feed UI powered by:
  - `GET_TWITS`
  - `CREATE_TWIT`
  - `LIKE_TWIT`
  - `DELETE_TWIT`
- Added reusable community feed components:
  - `CommunityShell`
  - `CommunityComposer`
  - `CommunityFeed`
  - `TwitCard`
  - `TwitAuthorRow`
  - `TwitBody`
  - `TwitMedia`
  - `TwitActionRow`
- Added Twit composer image upload using old Nestar upload pattern:
  - `imagesUploader(files, target: "twits")`
  - Store returned relative path directly in `createTwit.image`
- Applied Twit image display normalization rule:
  - if starts with `http`, use as-is
  - if starts with `/`, use as-is
  - otherwise prefix `/` (e.g. `uploads/twits/...` -> `/uploads/twits/...`)
- Ran `npm run build` successfully after refactor and upload-rule wiring.

### Current stopping point
- Live `/community` now uses Twit feed structure (no live board/article tabs).
- `/community/detail` remains query-route based and uses `GET_TWIT`.
- Twit comments remain deferred (current `TwitCommentsInquiry` does not include twit target search fields).

### Exact next task
- Stabilize/QA Twit community UX details (compose, like, delete, empty/error states) and then migrate member/mypage article tabs to Twit-based surfaces in a separate scoped task.

### Uncommitted/untracked files
- In-progress community frontend changes:
  - `pages/community/index.tsx`
  - `pages/community/detail.tsx`
  - `scss/pc/community/community.scss`
  - `libs/components/community/CommunityComposer.tsx`
  - `libs/components/community/CommunityFeed.tsx`
  - `libs/components/community/CommunityShell.tsx`
  - `libs/components/community/TwitActionRow.tsx`
  - `libs/components/community/TwitAuthorRow.tsx`
  - `libs/components/community/TwitBody.tsx`
  - `libs/components/community/TwitCard.tsx`
  - `libs/components/community/TwitMedia.tsx`

---

## Today's Session Update (2026-05-15)

### Completed today
- Audited the current board/article/community/twit/member frontend structure without editing application source.
- Saved the community audit snapshot and future implementation plan into `docs/SMART_LIBRARY_FRONTEND_PAGES.md`.

### Current audit result
- Current live community UI is `/community`, and it is still old board/article-based.
- Board/article GraphQL operations are stub `__typename` operations and should be treated as legacy/broken until replaced.
- Twit operations and types already exist in `apollo/user/*` and `libs/types/twit*`, but no live page uses them yet.
- No `pages/library/community`, `pages/twit*`, dynamic `/community/[id]`, or dynamic `/member/[memberId]` route exists in the current checkout.

### Exact next task
- Convert `/community` into a Smart Library Twit feed using the audit notes in `docs/SMART_LIBRARY_FRONTEND_PAGES.md`.
- Keep the route stable at `/community` initially, replace internals with Twit feed components, and defer deleting board/article files until the Twit flow is stable.

### Uncommitted/untracked files
- Documentation changes only: `docs/SMART_LIBRARY_FRONTEND_PAGES.md` and `MEMORY.md`.

---

## Today's Session Update (2026-05-14)

### Commits completed today
- `07a76fa` fix: modify homepage card components' like functionality
- `30340c6` feat: remove unused homepage sections and orphaned homepage assets
- `ffe913e` feat: restyle homepage category dropdown with unified MUI icon cards
- `d81b7a6` feat: replace homepage format and type image cards with unified MUI icon cards
- `ee93e41` feat: replace fiber hero visuals with minimalist sky copy
- `18526a8` fix: switch fiber image references to new fiber assets
- `c37d47d` fix: sync homepage dropdown toggle state and panel stacking
- `1308874` fix: internalize homepage diced hero content and navigation
- `9b645a8` fix: enlarge diced hero image frames while preserving section proportions
- `5e9d2af` fix: change the images in DicedHeroSection
- `d485634` fix: refresh homepage media assets and interactive event image positioning

### Completed today (based on commits above)
- Updated homepage media assets and interactive events presentation.
- Reworked Diced Hero content/navigation and image framing.
- Refined `HeaderFilter` UX: dropdown state/stacking fixes and unified MUI icon-card styling for category/format/type.
- Replaced fiber visuals/assets and adjusted related homepage presentation.
- Removed unused homepage sections/components and orphaned assets.
- Finalized homepage card like functionality wiring across the homepage components.

### Current stopping point
- Branch `homepage` is at `07a76fa` with a clean working tree.
- Homepage like-functionality fixes are committed and no local edits are pending.

### Exact next task
- Start the next scoped homepage task from `homepage` branch using commit `07a76fa` as the baseline.

### Uncommitted/untracked files
- None (`git status`: working tree clean).

### Project rule reminder
- Use only `feat:` or `fix:` commit prefixes.
- Build professional, complete product behavior; do not treat MVP as weak/minimal.

---

## What Is Complete

### Enums (`libs/enums/`)
- `book.enum.ts` — BookType, BookCategory, BookAudience, BookFormat, BookLanguage, BookStatus
- `book-inventory.enum.ts` — BookInventoryType, BookInventoryStatus, BookStorageZone
- `request.enum.ts` — RequestType, RequestStatus, DeliveryDestinationType, PaymentStatus, RequestErrorCode
- `robot.enum.ts` — RobotStatus
- `common.enum.ts`, `member.enum.ts`, `comment.enum.ts`, `like.enum.ts`, `view.enum.ts`

### Types (`libs/types/`)
- `book/` — Book, Books, BookPrice, BookDimensions, BookRating; CreateBookInput, BooksInquiry, AllBooksInquiry, OrdinaryInquiry; UpdateBookInput, UpdateBookAvailabilityInput
- `book-inventory/` — BookInventory, BookInventories, BookShelf, BookInventoryLocation, BookInventoryPickup; CreateBookInventoryInput, BookInventoriesInquiry; UpdateBookInventoryInput, UpdateBookInventoryStatusInput
- `request/` — RequestTask, Requests, RequestDestination, RequestBookData, RequestRobotData, RequestInventoryData, RequestMemberData, RequestTimelineItem, RequestError; CreateDeliveryRequestInput, RequestsInquiry, SessionRequestsInquiry; UpdateRequestStatusInput, CancelRequestInput
- `robot/` — Robot, Robots, RobotPose; CreateRobotInput, RobotsInquiry; UpdateRobotInput
- `twit/` — Twit, Twits; CreateTwitInput, TwitsInquiry, AllTwitsSearch, AllTwitsInquiry; TwitUpdate
- `twit-comment/` — TwitComment, TwitComments; CreateTwitCommentInput, TwitCommentsInquiry; UpdateTwitCommentInput
- `member/`, `property/`, `follow/`, `like/`, `comment/`, `view/` — legacy types kept as-is
- **Note:** `libs/types/library/` no longer exists — all library types live in dedicated per-domain folders above

### Pages (`pages/library/`)
- `pages/library/index.tsx` — library landing page
- `pages/library/books/index.tsx` — book list/search page (Apollo query-driven)

### Apollo (`apollo/`)
- `apollo/admin/query.ts` — GET_ALL_MEMBERS_BY_ADMIN, GET_ALL_BOOKS_BY_ADMIN (and other admin queries)
- `apollo/admin/mutation.ts` — UPDATE_MEMBER_BY_ADMIN, CREATE_BOOK, and other admin mutations
- `apollo/user/query.ts`, `apollo/user/mutation.ts` — user-facing operations
- **Note:** `apollo/library/` directory does not exist — library queries are in user and admin files

### Agent / Claude Setup
- `CLAUDE.md` — full project guide (authoritative)
- `AGENTS.md` — 3-line redirect to CLAUDE.md and MEMORY.md
- `.claudeignore` — ignores node_modules, .next, .env, etc.
- `.claude/commands/update-memory.md` — /update-memory slash command
- Build workflow note: do not run `yarn build` after every small tweak; run it for major structural changes, not text swaps, favicon edits, or minor style fixes.

---

## What Is In Progress

Nothing currently in progress. One unstaged file: `.claude/commands/update-memory.md` (routine update — not a feature change).

---

## What Is Next

Per CLAUDE.md implementation order:

1. **`pages/library/books/[bookId].tsx`** — book detail page with BORROW/PURCHASE button and request mutation
2. **`pages/library/requests/index.tsx`** — student request history page
3. **`pages/library/tracking/[requestId].tsx`** — live robot tracking via WebSocket
4. **`pages/library/community/index.tsx`** — Twit feed page (uses Twit types now complete)
5. **`pages/member/[memberId].tsx`** — transform existing member profile page

---

## Known Issues

- **TotalCounter and MeLiked** are defined in `libs/types/property/property.ts`. All new library types import from there. Must be moved to a shared location before the property module is removed.
- **Legacy real-estate pages** still present under `pages/property/`, `pages/agent/`, etc. — do not delete until explicitly asked.
- **`apollo/library/` is absent** — user may be placing library queries inside `apollo/user/` and `apollo/admin/`. Confirm before building book detail page.

---

## Recent Commits

```
d3c5270 feat: add comment threading, edit, delete, and like functionality
a80f766 fix: community page UI fixes and image grid improvements
ce808b4 fix: update agents.md
668399d feat: twit like toggle fully working — cleanup debug logs
d5af3e3 fix: wire twit detail viewCount into stats and action row
b711118 fix: remove Library tab from community feed
38481a8 feat: community feed tabs wired to getTwits feedType (FOR_YOU / FOLLOWING)
99aa9c4 feat: finalize twit community updates and image url resolution
```
