# 같이Go Smart Library — Development Workflow

This file tracks planned implementation work across sessions. Update it when a task moves from planned → in-progress → done.

---

## Admin: Add Book Panel (Admin Dashboard)

**Status:** PLANNED
**Priority:** Medium — needed before library catalog can be populated

### Context
`libs/components/mypage/AddNewProperty.tsx` has been **preserved intentionally** and NOT deleted.
It is the template for the Admin "Add Book" form. Only ADMIN members can add books to the library catalog.

On the student-facing MyPage, this component is not mounted (no `addProperty` category in the router switch).
On the Admin dashboard (`/_admin/`), it will be repurposed as `AddNewBook.tsx`.

### What needs to happen

1. **Copy `AddNewProperty.tsx` → `libs/components/admin/AddNewBook.tsx`**
   - Replace all property field names with book field equivalents:
     - `propertyTitle` → `bookTitle`
     - `propertyPrice` → `bookPrice` (nested: `{ amount, currency, isDiscounted }`)
     - `propertyType` → `bookType` (enum: `BookType`)
     - `propertyLocation` → `bookCategory` (enum: `BookCategory`)
     - `propertyAddress` → `bookCallNumber`
     - `propertyRooms` / `propertyBeds` / `propertySquare` → `bookPublishedYear`, `bookPages`, `bookFormat`, `bookAudience`, `bookLanguage`
     - `propertyDesc` → `bookDescription`
     - `propertyImages` → `bookImages` (max 5, same multipart upload pattern)
   - Add fields: `bookIsbn`, `bookAuthor`, `isBorrowable` (toggle), `isPurchasable` (toggle)
   - Replace `CREATE_PROPERTY` stub → `CREATE_BOOK` mutation (defined in `apollo/admin/mutation.ts`)
   - Replace `UPDATE_PROPERTY` stub → `UPDATE_BOOK` mutation
   - Route guard: verify `user.memberType === MemberType.ADMIN` (not AGENT)

2. **Wire into Admin dashboard**
   - Add `addBook` and `editBook` routes inside `/_admin/` pages
   - Add "Add Book" button to `/_admin/books` admin book list page

3. **Image upload**
   - Use existing `imageUploader` / `imagesUploader` pattern (same as AddNewProperty)
   - Target: `'books'` (not `'member'` or `'property'`)
   - Display uploaded images with `${REACT_APP_API_URL}/${path}` prefix

4. **After create/edit**
   - Redirect to `/_admin/books` list (same as AddNewProperty redirects to myProperties)

### Key files to read before starting
- `libs/components/mypage/AddNewProperty.tsx` — reference implementation
- `apollo/admin/mutation.ts` — `CREATE_BOOK`, `UPDATE_BOOK`
- `apollo/admin/query.ts` — `GET_BOOKS_BY_ADMIN`, `GET_BOOK_BY_ADMIN`
- `libs/types/book/book.ts` — Book interface
- `libs/enums/book.enum.ts` — BookType, BookCategory, BookAudience, BookFormat, BookLanguage

### Do NOT touch
- `libs/components/mypage/AddNewProperty.tsx` — keep as reference until Admin form is built and tested
- Student-facing MyPage — no book-adding UI belongs there

---

## Student MyPage — Live Data (Phase 2)

**Status:** DONE (2026-05-18)

All panels now use live GraphQL queries:
- MyProfile → `UPDATE_MEMBER` ✅
- My Twits → `GET_MEMBER_TWITS` + `DELETE_TWIT` ✅
- Saved Books → `GET_FAVORITE_BOOKS` ✅
- Recently Viewed → `GET_VISITED_BOOKS` ✅
- My Requests → `GET_SESSION_REQUESTS` ✅
- Followers / Followings → live follow mutations ✅

---

## Robot Tracking — Live WebSocket (Phase 3)

**Status:** PLANNED
**Priority:** Low — depends on backend WebSocket stability

The `RobotTracking.tsx` component currently shows a mock floor map with a static robot position.
Live tracking uses the WebSocket client in `apollo/client.ts` (isolated robot socket).

### What needs to happen
- Subscribe to `joinRequest` on mount with `{ requestId }` from an active request
- Listen for `robotPosition`, `robotStatus`, `requestUpdated`, `robotOffline` server events
- Update robot dot `cx`/`cy` on the SVG map from `{ x, y }` in `robotPosition` payload
- Map raw robot coordinates (ROS frame) to SVG pixel positions (requires calibration per floor)
- Handle `deliveryReady` → show success state, stop tracking

### Reference
- `CLAUDE.md` WebSocket event contracts section
- `apollo/robot/` — isolated WebSocket Apollo client
