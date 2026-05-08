# MEMORY — 같이Go Frontend

**Last Updated:** 2026-05-09 | Commit: `f2abf8a`
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
- `twit/` — Twit, Twits; CreateTwitInput, TwitsInquiry
- `twit-comment/` — TwitComment, TwitComments; CreateTwitCommentInput, TwitCommentsInquiry; UpdateTwitCommentInput
- `member/`, `property/`, `follow/`, `like/`, `comment/`, `view/` — legacy types kept as-is

### Pages (`pages/library/`)
- `pages/library/index.tsx` — library landing page
- `pages/library/books/index.tsx` — book list/search page

### Apollo
- `apollo/library/` — directory exists; query.ts status needs verification

---

## What Is In Progress

Nothing currently in progress.

---

## What Is Next

1. **Verify** `apollo/library/query.ts` — create or complete book list GraphQL queries (GET_BOOKS, GET_BOOK)
2. **`pages/library/books/[bookId].tsx`** — book detail page with BORROW/PURCHASE button and request mutation
3. **`pages/library/requests/index.tsx`** — student request history page
4. **`pages/library/tracking/[requestId].tsx`** — live robot tracking via WebSocket
5. **`pages/library/community/index.tsx`** — Twit feed page

---

## Known Issues

- **TotalCounter and MeLiked** are defined in `libs/types/property/property.ts`. All new library types currently import from there. These must be moved to a shared location (e.g., `libs/types/common.ts`) before the property module is removed.
- **Legacy real-estate pages** still present under `pages/property/`, `pages/agent/`, etc. — do not delete until explicitly asked.
- **`apollo/library/query.ts`** — `ls` showed the file but `head` returned "No such file or directory"; verify actual state before implementing book detail page.

---

## Recent Commits

```
f2abf8a fix: convert library dto files to frontend ts interfaces
f03ea5e fix: modify frontend enums matching the backend
3684ce3 fix: deduplicate library member contracts by reusing shared frontend enums and helper types
bae3913 feat: add smart library frontend contract enums and types boundary
305b22f feat: add smart library book list page and apollo library query
58216f5 feat: align frontend markdown guidance with student-first smart library backend scope
be7380f Clarify frontend migration strategy
4f4dfa7 Update backend Codex workflow
```
