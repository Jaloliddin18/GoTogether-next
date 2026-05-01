# Smart Library Frontend Pages

## Student pages

## `/library/books`
Purpose:
- Search and browse books
- Filter by title, author, category, availability

Minimum UI sections:
- Search bar
- Filters panel
- Book list/grid
- Pagination
- Empty/loading/error states

Data needs:
- `books` list query with filters
- total count for pagination

## `/library/books/[id]`
Purpose:
- View one book detail
- Request robot delivery

Minimum UI sections:
- Book metadata
- Availability status
- "Request Delivery" button
- Request submission feedback

Data needs:
- `bookById` query
- `createDeliveryRequest` mutation

## `/library/tracking/[requestId]`
Purpose:
- Live status and position tracking for a request

Minimum UI sections:
- Current status badge (queued, assigned, moving, arrived, failed)
- Last update time
- Position/zone display
- Fallback when socket disconnects

Data needs:
- request summary query
- tracking WebSocket events keyed by `requestId`

## `/library/requests`
Purpose:
- Student request history

Minimum UI sections:
- Request list
- Status chips
- Date/time
- Link to tracking page for active requests

Data needs:
- paginated request history query

## Staff/admin pages

## `/_admin/library`
Purpose:
- Dashboard overview

Minimum UI sections:
- Active requests count
- Failed requests count
- Online robots count
- Recent incidents panel

## `/_admin/library/requests`
Purpose:
- Request queue management and monitoring

Minimum UI sections:
- Table with filters and pagination
- Status transitions view (read-only unless backend supports actions)

## `/_admin/library/robots`
Purpose:
- Robot status monitoring

Minimum UI sections:
- Robot list (online/offline, battery, current task)
- Error state indicators

## `/_admin/library/books`
Purpose:
- Book inventory/availability monitoring

Minimum UI sections:
- Book list table
- Availability status
- Optional search and filter

## Routing notes

- Prefer dynamic routes (`[id]`, `[requestId]`) for stable URL semantics.
- If migration risk is high, temporary query-style routes are acceptable, then migrate to dynamic routes.
