# MEMORY — 같이Go Frontend

**Last Updated:** 2026-05-09 | Commit: `bdb7e2b`
**Current Branch:** `develop`

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
