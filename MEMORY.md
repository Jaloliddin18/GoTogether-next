# MEMORY — 같이Go Frontend

**Last Updated:** 2026-05-14 | Commit: `07a76fa`
**Current Branch:** `homepage`

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
bdb7e2b feat: define admin related queries
f6910da feat: define admin mutations
258736f feat: sync frontend twit interfaces with backend admin operations
d2fab3a feat: add claude code agent setup for frontend
f2abf8a fix: convert library dto files to frontend ts interfaces
f03ea5e fix: modify frontend enums matching the backend
3684ce3 fix: deduplicate library member contracts by reusing shared frontend enums and helper types
bae3913 feat: add smart library frontend contract enums and types boundary
```
