# Smart Library Frontend Pages

## Current scope

- Build student-facing pages first
- Do not implement admin/staff dashboard pages unless explicitly requested later

## Student pages to build

## 1) `/library/books`
Purpose:
- Search and browse books
- Filter by title, author, category, availability

Minimum UI sections:
- Search bar
- Filters
- Book list/grid
- Pagination
- Empty/loading/error states

Primary data:
- Books list query

## 2) `/library/books/[id]`
Purpose:
- Show one book detail
- Start BORROW/PURCHASE request flow

Minimum UI sections:
- Book metadata
- Availability view from inventory-aware response
- BORROW and PURCHASE actions
- Request submission feedback

Primary data:
- Book detail query
- Create request mutation

## 3) `/library/requests`
Purpose:
- Show student request status/history

Minimum UI sections:
- Request list/history
- Status chips/timeline labels
- Date/time
- Link to tracking page for active requests

Primary data:
- Request history query
- Nested request fields (`bookData`, `robotData`, `inventoryData`, `memberData`)

## 4) `/library/tracking/[requestId]`
Purpose:
- Live robot/request tracking per request

Minimum UI sections:
- Current status badge
- Last update time
- Position/zone/floor rendering (keep `floorId`)
- Socket disconnect/offline indicator

Primary data:
- Request summary query
- Tracking WebSocket events keyed by `requestId`

Status display notes:
- `READY` means delivered and waiting pickup
- `READY` does not mean `COMPLETED`
- Show `BOOK_NOT_FOUND` as clear failure state
- Show offline timeout before `READY` as robot/offline delivery failure

## 5) `/library/community` (or equivalent existing community route)
Purpose:
- Twit feed with Smart Library context

Primary data:
- Twit list/create/like actions from backend contract

## 6) Profile/follow pages
Purpose:
- Member profile view and follow relationships

Primary data:
- Member profile APIs
- Follow APIs

## 7) Twit comments pages/components
Purpose:
- View/create/update/delete comments where allowed

Primary data:
- Twit comments APIs
- Respect backend behavior where deleted comments are filtered from list query

## Explicitly deferred

- `/_admin/library/*` pages are deferred in current phase
- Do not scope or implement admin dashboards until explicitly requested
