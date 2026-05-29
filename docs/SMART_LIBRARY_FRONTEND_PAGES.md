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

Current frontend audit snapshot, 2026-05-15:
- The current live community route is `/community`, not `/library/community`.
- Current `/community` is still old board/article UI, not a clean Twit feed.
- Current list route: `/community?articleCategory=FREE`.
- Current detail route: `/community/detail?articleCategory=FREE&id=<articleId>`.
- Current write route: `/mypage?category=writeArticle`.
- Current member article route: `/member?memberId=<id>&category=articles`.
- Current admin route: `/_admin/community`.
- No `pages/twit*`, `pages/board*`, `pages/article*`, dynamic `/community/[id]`, dynamic `/member/[memberId]`, or `pages/library/community` route exists in the audited checkout.

Evidence files:
- `pages/community/index.tsx` imports `BoardArticle`, `BoardArticlesInquiry`, `BoardArticleCategory`, `GET_BOARD_ARTICLES`, and `LIKE_TARGET_BOARD_ARTICLE`.
- `pages/community/detail.tsx` imports `BoardArticle`, `GET_BOARD_ARTICLE`, generic `GET_COMMENTS`, `CREATE_COMMENT`, `UPDATE_COMMENT`, and `LIKE_TARGET_BOARD_ARTICLE`.
- `libs/components/common/CommunityCard.tsx` is board article shaped and navigates to `/community/detail?articleCategory=...&id=...`.
- `libs/components/community/Teditor.tsx` creates board articles through `CREATE_BOARD_ARTICLE` and uploads with target `article`.
- `libs/components/member/MemberArticles.tsx`, `libs/components/mypage/MyArticles.tsx`, and `libs/components/mypage/WriteArticle.tsx` are still article-based.
- `libs/types/board-article/*` files explicitly say the board-article module is a stub because the backend module was removed.
- `apollo/user/query.ts` and `apollo/user/mutation.ts` keep board/article operations as stub `__typename` operations.

Available Twit contract already present:
- `GET_TWITS`
- `GET_MEMBER_TWITS`
- `GET_TWIT_COMMENTS`
- `CREATE_TWIT`
- `LIKE_TWIT`
- `DELETE_TWIT`
- `CREATE_TWIT_COMMENT`
- `UPDATE_TWIT_COMMENT`
- `DELETE_TWIT_COMMENT`
- `LIKE_TWIT_COMMENT`
- Types exist under `libs/types/twit/` and `libs/types/twit-comment/`.

Important gaps before coding:
- No frontend `GET_TWIT` single-detail query exists.
- Current `TwitCommentsInquiry` type does not include a `search.twitId` field, while the backend contract expects comments to be fetched for a specific twit.
- Twit currently has `likes` and `likeCount`, but no explicit `meLiked` field in the frontend Twit type/query. Like UI may need to derive viewer liked state from `likes.includes(user._id)` unless the backend adds `meLiked`.
- Twit currently has no `views` field, so any X-style views count must be omitted or backed by a backend change.
- Existing board/article routes rely on operations that are currently stubs and should be treated as legacy/broken until replaced.

Migration recommendation:
- Keep the public `/community` route and replace its internals with a Twit-backed feed.
- Keep `/community/detail` initially if needed, but convert it to Twit detail semantics.
- Do not add new board/article routes.
- Do not delete old board/article code in the first implementation pass. Replace live route usage first, then remove stale board/article files after the Twit flow is stable.
- Convert member profile community tabs from article-based to Twit-based after the main `/community` feed works.

Recommended X-style structure, without copying X branding:
- Central feed column.
- Composer at the top for authenticated users.
- Post/Twit card with avatar, member name, handle-like secondary text if available, timestamp, text, optional image, and actions.
- Action row for reply/comment, like, and optional counts supported by the API.
- Detail page with the selected Twit and a comments/replies section.
- Avatar/name click should use `memberData._id` and navigate to `/member?memberId=<id>`, routing own profile to `/mypage` where existing behavior does that.

Recommended implementation sequence for the next coding prompt:
1. Replace `pages/community/index.tsx` board article list with a Twit feed using `GET_TWITS`.
2. Create Twit feed components under `libs/components/community/`, such as `CommunityComposer`, `TwitCard`, `TwitAuthorRow`, `TwitActionRow`, and `TwitMedia`.
3. Wire `CREATE_TWIT`, `LIKE_TWIT`, and `DELETE_TWIT` where appropriate.
4. Decide the Twit detail strategy: confirm backend single Twit query support, add a supported frontend operation if available, or use a scoped fallback.
5. Convert `pages/community/detail.tsx` from board article plus generic comments to Twit plus Twit comments.
6. Update `TwitCommentsInquiry` before wiring comment queries if backend requires `search.twitId`.
7. Convert `MemberArticles` and mypage article surfaces to member Twits in a later scoped pass.
8. Update `scss/pc/community/community.scss` and `scss/pc/community/detail.scss` for feed/detail layouts; avoid old board cards, black tabs, GoTogether copy, and real-estate banner language.
9. Verify with `yarn lint` or `yarn build` after structural community changes.

Scope boundaries:
- Do not modify backend files from this frontend task.
- Do not modify homepage files unless a shared layout dependency makes it unavoidable.
- Do not change unrelated member/profile behavior.
- Do not perform unrelated old GoTogether cleanup.
- Do not install packages unless explicitly requested and justified.

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
