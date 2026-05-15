# 같이Go Frontend Agent Guide

Read this file and `MEMORY.md` before doing anything. `MEMORY.md` is the session continuity file and records where the project stopped.

Do not run `yarn build` after every small change; reserve it for major structural changes, not text swaps, favicon changes, or minor style fixes.

Skills are located in `.agents/` in the project root. Read relevant skill files before frontend or UI work.

## Session Update (2026-05-15)

- `/community` was refactored from legacy board/article UI into a Twit feed structure.
- `/community/detail` now uses Twit detail query data (`GET_TWIT`) with route pattern `/community/detail?id=<twitId>`.
- New Twit community components were added under `libs/components/community/` (`CommunityShell`, `CommunityComposer`, `CommunityFeed`, `TwitCard`, `TwitAuthorRow`, `TwitBody`, `TwitMedia`, `TwitActionRow`).
- Twit image flow now follows old Nestar upload style:
  - `imagesUploader` with target `twits`
  - store returned relative path directly in `createTwit.image`
  - normalize only at render time (`http` keep, `/` keep, otherwise prefix `/`)
- Board/article code still exists in the repo for now and is not deleted yet; only live `/community` and `/community/detail` are migrated.

## Frontend Audit (2026-05-14)

### Project Overview
- Framework: Next.js `14.2.0` with React `18.2.0` and TypeScript.
- Routing: Pages Router only. `pages/` exists; `app/` and `src/` do not exist.
- Styling: global SCSS imported from `pages/_app.tsx`, plus MUI `ThemeProvider` using `scss/MaterialTheme`. Component-level styling often uses MUI `sx` and SCSS class names together.
- Data fetching/state: Apollo Client with `useQuery`, `useMutation`, Apollo reactive vars (`userVar`, `themeVar`, `socketVar`), and local component state.
- Product areas visible in the frontend: Smart Library homepage/book discovery, auth, member/mypage, community, CS, admin pages, and remaining legacy Nestar real-estate surfaces.
- Current branding is mixed: homepage/footer/navigation use 같이Go Smart Library assets and copy, while several page titles, SEO metadata, legacy routes, and placeholders still say Nestar/property/agent.

### Directory Map
- `pages/`: Next.js routes. Active route groups include homepage, books, community, account, mypage, member, CS, about, agent detail, and `_admin`.
- `apollo/`: GraphQL client and operation documents. `apollo/user` contains user-facing operations, `apollo/admin` contains admin operations, and `apollo/library/query.ts` re-exports book queries from `apollo/user/query.ts`.
- `libs/auth/`: JWT storage, login/signup mutations, decoded user state hydration.
- `libs/components/`: shared UI and domain components. Important subfolders: `homepage`, `layout`, `property`, `community`, `member`, `mypage`, `admin`, `cs`, `common`.
- `libs/enums/` and `libs/types/`: frontend enums and TypeScript interfaces for book, book inventory, request, robot, twit, twit comments, member, follow, property, comments, likes, views, and legacy board articles.
- `libs/hooks/`: currently contains `useDeviceDetect`.
- `scss/`: global SCSS. `scss/pc` holds desktop page styles; `scss/mobile/main.scss` holds mobile styles; `scss/MaterialTheme` holds MUI theme objects.
- `public/`: static assets. Active Smart Library assets are under `public/img/homepage`, `public/img/logo`, `public/img/donor`, and `public/video`; legacy property/community/icons assets are still present.
- `.agents/skills/find-skills/SKILL.md`: installed local skill for skill discovery only; it is not a frontend implementation skill.

### Commands
- Install: `yarn install` is implied by `yarn.lock`; do not install packages unless explicitly requested.
- Dev: `yarn dev`.
- Build: `yarn build`; do not run automatically after small UI/text/doc changes.
- Start production build: `yarn start`.
- Lint: `yarn lint`.
- Changelog: `yarn changelog`.
- No dedicated `typecheck` or `test` script is present in `package.json`.

### Coding Conventions
- Components are mostly function components with `NextPage` for pages and HOC layout wrappers such as `withLayoutMain`, `withLayoutBasic`, `withLayoutFull`, and `withAdminLayout`.
- Imports use relative paths. No path aliases were found in `tsconfig.json` or current imports.
- Naming is still partly legacy: `/books` components and styles often use `PropertyList`, `PropertyCard`, `property-*` SCSS IDs/classes, and property DTO names.
- Styling uses SCSS page IDs/classes (`#pc-wrap`, `#property-list-page`, `.home-page`) plus MUI `Stack`, `Box`, `Typography`, `Button`, `Menu`, `Pagination`, and `sx`.
- Icons primarily come from `@mui/icons-material`; some navigation/admin icons come from `phosphor-react`. Do not introduce a new icon library unless requested.
- Responsive branching uses `useDeviceDetect()` and returns either `'desktop'` or `'mobile'`. Many mobile branches are placeholders.
- User feedback uses `libs/sweetAlert.ts`. Existing like-toggle success pattern is `sweetTopSmallSuccessAlert('success', 800)` after successful mutation; failures commonly use `sweetMixinErrorAlert(err.message).then()`.
- Forms are mostly local state plus native inputs/MUI controls. Auth validates nickname/password/phone client-side before calling `logIn` or `signUp`.

### API Integration
- Apollo setup is in `apollo/client.ts`. It uses `apollo-upload-client` for HTTP GraphQL and `WebSocketLink` for subscriptions, split by operation type.
- GraphQL HTTP URI comes from `process.env.REACT_APP_API_GRAPHQL_URL`; WebSocket URI comes from `process.env.REACT_APP_API_WS`.
- Auth token handling is in `libs/auth/index.ts`: `accessToken` is stored in `localStorage`, decoded with `jwt-decode`, and written into `userVar`.
- `apollo/store.ts` defines global reactive vars. `userVar` is the primary auth/user state used by layout and components.
- User-facing Smart Library operations confirmed in `apollo/user/query.ts`: `GET_BOOKS`, `GET_BOOK`, `GET_FAVORITE_BOOKS`, `GET_VISITED_BOOKS`, request queries, follow queries, twit queries, and twit-comment queries.
- User-facing Smart Library mutations confirmed in `apollo/user/mutation.ts`: `LIKE_TARGET_BOOK`/`LIKE_BOOK`, delivery request create/cancel, twit create/like/delete, twit-comment create/update/delete/like, follow subscribe/unsubscribe, member update/login/signup.
- `LIKE_BOOK` expects `variables: { input: bookId }` because the mutation is `mutation LikeTargetBook($input: String!)`.
- Admin Smart Library operations exist for members, books, book inventories, requests, robots, twits, comments, and twit comments in `apollo/admin/query.ts` and `apollo/admin/mutation.ts`.
- Several legacy operations are stubs returning only `__typename`: `GET_PROPERTIES`, `GET_PROPERTY`, board article operations, favorite/visited legacy property queries, and legacy property/admin mutations. Any page still relying on these needs verification before assuming it works.

### Pages/Routes Audit
- `/`: homepage using `withLayoutMain`; shows New Arrivals, Diced Hero, Most Borrowed, Advertisement, Featured Books, Orbiting Avatars CTA, plus desktop-only Interactive Events and Library Features. Homepage book likes are wired through `LIKE_BOOK` and synchronize by `bookLikeSyncTick`.
- `/books`: legacy-named `PropertyList` under `pages/books/index.tsx`; currently imports property types/components and uses stubbed `GET_PROPERTIES`/`LIKE_TARGET_PROPERTY`. Treat as legacy/incomplete for Smart Library until refactored to book queries.
- `/books/detail`: legacy property detail page using `PropertyDetail`, property components, map/contact form, comments, and stubbed property queries. Needs Smart Library refactor before treating as a book detail page.
- `/community`: legacy board-article community list. It uses `GET_BOARD_ARTICLES` and `LIKE_TARGET_BOARD_ARTICLE`, which are currently stubbed in `apollo/user/query.ts`/`mutation.ts`; needs verification/refactor toward Twit if community work resumes.
- `/community/detail`: legacy board-article detail/comment page. Contains duplicated nested `updateButtonHandler` code in the current file; inspect carefully before editing.
- `/account/join`: login/signup page wired to `logIn` and `signUp`; signup sends `memberType: 'USER'`.
- `/mypage`: authenticated user dashboard with category query routing. Uses MyProfile, MyProperties, MyFavorites, RecentlyVisited, MyArticles, WriteArticle, followers, and followings. Several children are still property/article legacy surfaces.
- `/member`: public member page with properties, followers, followings, and articles tabs. Follow and member-like handlers are wired with current follow/member operations.
- `/agent/detail`: legacy agent detail page still using property cards/comments. Preserve if explicitly requested; otherwise treat as legacy.
- `/about`: desktop page is still mostly real-estate/Nestar copy; mobile is placeholder.
- `/cs`: customer service page with Notice/FAQ components; mobile is placeholder.
- `/_admin`: redirects to `/_admin/users` and uses `withAdminLayout`, which requires `MemberType.ADMIN`.
- `/_admin/users`: active admin member list/update page.
- `/_admin/properties` and `/_admin/community`: legacy property/board-article admin pages that call currently stubbed legacy operations; verify before using.
- `/_admin/cs/faq`, `/_admin/cs/inquiry`, and `/_admin/cs/notice`: placeholder/static admin pages with commented handlers and hardcoded pagination values.
- No `pages/library/*`, request history page, robot tracking page, or dynamic `[bookId]` book detail route exists in the current tree.

### Component Audit
- Layout components: `LayoutHome`, `LayoutBasic`, `LayoutFull`, `LayoutAdmin`, `Top`, `Footer`, `Chat`.
- Homepage components: `HeaderFilter`, `NewArrivals`, `NewArrivalCard`, `MostBorrowed`, `MostBorrowedCard`, `FeaturedBooks`, `FeaturedBookCard`, `DicedHeroSection`, `Advertisement`, `InteractiveEvents`, `LibraryFeatures`, `OrbitingAvatarsCTA`.
- Book-related active homepage components use `Book` types and `GET_BOOKS`. The `/books` route still uses legacy property components and should not be assumed to be a completed book module.
- Community components: `CommunityCard`, `Teditor`, `TViewer`, plus legacy board-article pages. Twit API contracts exist, but current pages still reference board-article names.
- Member/mypage components: `MemberMenu`, `MemberFollowers`, `MemberFollowings`, `MemberProperties`, `MemberArticles`, `MyMenu`, `MyProfile`, `MyProperties`, `MyFavorites`, `RecentlyVisited`, `WriteArticle`, `AddNewProperty`.
- Admin components: member list, property list, community article list, CS lists, and admin menu. Some admin CS components are static placeholders.
- Request/robot frontend components are not present yet; only request/robot types and GraphQL admin/user operations exist.

### Styling/Design Audit
- Global desktop container width is `1300px` under `#pc-wrap .container`.
- Font stack is defined in `scss/variables.scss`: Inter, Noto Sans KR, `-apple-system`, sans-serif.
- Theme colors include MUI primary `#E92C28`, secondary `#1646C1`, and homepage Smart Library blues such as `#2E86DE` in CSS variables and inline styles.
- Homepage hero uses `/img/homepage/inha_hero.jpg` as a full-width background in `scss/pc/main.scss`, with overlaid copy and `HeaderFilter`.
- Current homepage card components use MUI `sx` heavily rather than SCSS-only styling.
- Swiper is used for homepage carousels and related property/detail carousels; Swiper CSS is imported in layout files and `_app` setup includes `swiper-css.d.ts`.
- Static images from backend records are usually rendered as `${REACT_APP_API_URL}/${imagePath}`. Local homepage/logo/static assets use `/img/...`.
- Mobile implementation is incomplete in many routes and components; many mobile branches return placeholder text rather than full UI.

### Risks And Cleanup Opportunities
- `/books` and `/books/detail` are route names for books but still use legacy property data, property components, property styling, and stubbed property GraphQL operations.
- Legacy GraphQL stubs in `apollo/user` and `apollo/admin` can cause silent UI breakage because pages expect full payloads but operations return only `__typename`.
- BoardArticle/community pages are still legacy while Twit/TwitComment contracts exist. Avoid mixing these models without a scoped migration.
- `apollo/library/query.ts` exists but only re-exports book queries; most operations still live in `apollo/user` and `apollo/admin`.
- Naming inconsistencies are widespread: properties vs books, agents vs members, board articles vs twits, Nestar vs 같이Go.
- SEO metadata in `pages/_document.tsx` still describes real estate/Nestar.
- Many mobile routes are placeholders and should not be reported as complete.
- Admin CS pages are mostly static placeholders.
- `useDeviceDetect` depends on user-agent and updates in an effect with `[device]`; treat behavior carefully if changing responsive logic.
- Some files contain console logging and legacy placeholder copy; remove only when in scope.

### Future Codex Session Rules
- Read `AGENTS.md` and `MEMORY.md` first.
- Run `git branch --show-current` and `git status` before editing. For commit-oriented work, also check recent log.
- Stop and report before editing if tracked application source files are dirty.
- Do not install packages unless explicitly requested.
- Do not push.
- Do not commit without confirmation.
- Use only `feat:` or `fix:` commit prefixes.
- Keep frontend work scoped to the requested page/component; do not widen into unrelated legacy cleanup.
- Preserve existing project patterns: Pages Router, Apollo hooks, MUI/SCSS styling, SweetAlert helpers, `useDeviceDetect`, and relative imports.
- Do not change backend files from this frontend repo task.
- Update `MEMORY.md` after each frontend session with where work stopped and the exact next task.
- Build professional, complete product behavior; do not treat MVP as weak/minimal.

## Backend Integration Audit (2026-05-14)

### Backend Project Location
- Backend path inspected: `/Users/khonimkulovjaloliddin/Desktop/같이Go`.
- Important backend docs inspected: `apps/nestar-api/AGENTS.md` and `docs/BACKEND_PROGRESS.md`.
- Backend app root: `apps/nestar-api`.
- Main backend code roots: `apps/nestar-api/src/components`, `apps/nestar-api/src/schemas`, `apps/nestar-api/src/libs/dto`, `apps/nestar-api/src/libs/enums`, `apps/nestar-api/src/robot-comm`, and `apps/nestar-api/src/socket`.

### Backend Architecture Overview
- Runtime/framework: NestJS with Apollo GraphQL, Mongoose, JWT auth, GraphQL Upload middleware, MQTT, and plain `ws` WebSocket support.
- GraphQL setup lives in `apps/nestar-api/src/app.module.ts`; schema is generated with `autoSchemaFile: true`, playground is enabled, and upload handling is mounted through `graphqlUploadExpress` in `main.ts`.
- Domain pattern is consistent: component module + resolver + service, DTO inputs in `src/libs/dto`, enums in `src/libs/enums`, and Mongoose schemas in `src/schemas`.
- Main active Smart Library domains: `member/auth`, `book`, `book-inventory`, `robot`, `request`, `twit`, `follow`, and `twit-comment`.
- Legacy domains still present: `property` is not present in the inspected backend, but old Nestar-style `board-article`, generic `comment`, `like`, and `view` modules still exist.
- Auth guards: `AuthGuard` requires a bearer token, `WithoutGuard` accepts optional bearer token and sets viewer context when valid, and `RolesGuard` enforces `@Roles(MemberType.ADMIN)` or other role metadata.
- Admin-only GraphQL operations are normally marked with `@UseGuards(RolesGuard)` plus `@Roles(MemberType.ADMIN)`.

### Auth And Token Usage
- `signup(input: MemberInput)` and `login(input: LoginInput)` are public member mutations and return `Member` with `accessToken`.
- Frontend authenticated GraphQL calls should send `Authorization: Bearer <token>`.
- Optional-viewer reads use `WithoutGuard`; these can return viewer-specific fields such as `meLiked` or `meFollowed` when a valid token is present.
- `createDeliveryRequest` and `getSessionRequests` support either authenticated members or guest `sessionId` behavior.
- Upload mutations require auth.
- Admin/member management, book admin mutation, inventory, robot, admin request list/detail/status updates, and admin moderation APIs require ADMIN role.

### Book API Contract
- `createBook(input: CreateBookInput): Book`: ADMIN-only catalog creation. Frontend usage is admin catalog UI only.
- `getBooks(input: BooksInquiry): Books`: public/optional-auth list query. Use for book lists, homepage sections, search/filter pages, and category pages. Important inputs include `page`, `limit`, `sort`, `direction`, and `search` fields such as `keyword`, `bookTitle`, `bookAuthor`, `bookIsbn`, `bookCallNumber`, `bookCategory`, `bookType`, `bookAudience`, `bookFormat`, `bookLanguage`, `bookStatus`, `isBorrowable`, `isPurchasable`, `minPrice`, `maxPrice`, and `minRating`.
- `getBook(bookId: String): Book`: public/optional-auth detail query. The backend argument name is `bookId`; frontend GraphQL may still use an `$input` variable if it maps to `bookId: $input`.
- `updateBook(input: UpdateBookInput): Book`: ADMIN-only catalog update.
- `removeBookByAdmin(bookId: String): Book`: ADMIN-only soft/remove path.
- `likeTargetBook(bookId: String): Book`: authenticated like toggle. Frontend must pass a string book id, not an object input.
- `getFavoriteBooks(input: OrdinaryInquiry): Books`: authenticated member favorites.
- `getVisitedBooks(input: OrdinaryInquiry): Books`: authenticated recently visited books.
- Important `Book` response fields: `_id`, `bookTitle`, `bookAuthor`, `bookIsbn`, `bookCallNumber`, `bookImages`, `bookType`, `bookCategory`, `bookAudience`, `bookFormat`, `bookLanguage`, `bookPublishedYear`, `bookPages`, `bookDescription`, `bookPrice`, `bookDimensions`, `isBorrowable`, `isPurchasable`, `bookLikes`, `bookViews`, `bookComments`, `bookRank`, `bookRating`, `bookStatus`, `createdAt`, `updatedAt`, and `meLiked`.
- Integration risk: frontend like mutations must match backend `bookId: String` / `$input: String!` style. Object-style `{ likeRefId, likeGroup }` is not valid for book likes in this backend.

### BookInventory API Contract
- All inspected BookInventory GraphQL operations are ADMIN-only.
- `createBookInventory(input: CreateBookInventoryInput): BookInventory`: creates physical stock for a catalog book.
- `getBookInventory(bookInventoryId: String): BookInventory`: admin detail read.
- `getBookInventories(input: BookInventoriesInquiry): BookInventories`: admin list/search.
- `updateBookInventory(input: UpdateBookInventoryInput): BookInventory`: admin update.
- `updateBookInventoryStatus(input: UpdateBookInventoryStatusInput): BookInventory`: admin status-only update.
- `removeBookInventoryByAdmin(bookInventoryId: String): BookInventory`: admin removal.
- Important inventory fields: `bookId`, `bookInventoryType`, `bookStorageZone`, `bookInventoryStatus`, `bookTotalQuantity`, `bookSoldQuantity`, `bookReservedQuantity`, `bookBorrowedQuantity`, `bookShelf`, `bookLocation`, and `bookPickup`.
- Current `bookPickup` fields are fixed-gripper fields: `gripperOpenWidthCm`, `gripperCloseWidthCm`, `gripHoldSeconds`, and `pickupDirection`.
- Old fork/container pickup fields are not present in current backend DTO/schema: `mastHeightCm`, `forkDepthCm`, `gripWidthCm`, `requiresContainer`, and `containerId`.
- Frontend rule: normal student UI should not expose exact inventory shelf, location, robot coordinates, or pickup calibration. These fields are admin/internal unless an admin inventory screen is explicitly requested.

### Robot API Contract
- All inspected Robot GraphQL operations are ADMIN-only.
- `createRobot(input: CreateRobotInput): Robot`: create admin robot record.
- `getRobot(robotId: String): Robot`: read by human/robot-facing `robotId` string, not Mongo `_id`.
- `getRobots(input: RobotsInquiry): Robots`: admin robot list/search.
- `updateRobot(input: UpdateRobotInput): Robot`: admin update path.
- Important robot fields: `_id`, `robotId`, `name`, `status`, `battery`, `isOnline`, `lastSeenAt`, `currentPose`, `currentRequestId`, `createdAt`, and `updatedAt`.
- Frontend/admin dashboard can use `status`, `battery`, `isOnline`, `lastSeenAt`, `currentPose`, and `currentRequestId` for operations monitoring.
- Student UI should show request-facing delivery state, not raw robot administration controls or exact internal telemetry unless explicitly designed as tracking.

### Request API Contract
- `createDeliveryRequest(input: CreateRequestInput): Request`: optional-auth request creation. Requires either logged-in member context or `sessionId`.
- `getRequest(requestId: String): Request`: ADMIN-only detail read.
- `getRequests(input: RequestsInquiry): Requests`: ADMIN-only list/search.
- `getSessionRequests(input: SessionRequestsInquiry): Requests`: optional-auth member or guest session history.
- `updateRequestStatus(input: UpdateRequestStatusInput): Request`: ADMIN-only/system-style status update. Do not wire this to normal student UI.
- `cancelRequest(input: CancelRequestInput): Request`: optional-auth cancellation. Backend permits owner member, matching guest session, or admin behavior depending on request ownership/session.
- BORROW behavior: `requestType = BORROW`, backend uses `LIBRARY` inventory, frontend must provide student desk destination, `destinationType = STUDENT_DESK`, and `paymentStatus = NOT_REQUIRED`.
- PURCHASE behavior: `requestType = PURCHASE`, backend uses `COMMERCIAL` inventory, backend uses reception destination, `destinationType = RECEPTION`, and `paymentStatus = PAY_AT_RECEPTION`.
- If no online idle robot is available, backend creates the request as `QUEUED` rather than rejecting it.
- Request creation validates that the book exists, is not deleted, supports the requested action, and has `bookCallNumber`.
- Frontend book detail should expose two student actions when allowed by book flags: `BORROW` to deliver to study desk and `PURCHASE` to deliver to reception.
- Important request nested response fields include `bookData`, `robotData`, `inventoryData`, and `memberData`.
- Integration risk: `inventoryData` can include admin/internal location and pickup fields; student UI should avoid exposing those directly.

### Twit Community API Contract
- `createTwit(input: CreateTwitInput): Twit`: authenticated community post creation.
- `getTwits(input: TwitsInquiry): Twits`: authenticated feed query. Backend returns viewer's twits plus followed members' twits.
- `getMemberTwits(input: TwitsInquiry): Twits`: optional-auth member profile twit list.
- `likeTwit(twitId: String): Twit`: authenticated like toggle.
- `deleteTwit(twitId: String): Twit`: authenticated owner soft delete.
- Admin moderation APIs exist for all twits through admin resolver paths.
- `CreateTwitInput` supports `text` and optional `image`.
- Important `Twit` fields: `_id`, `memberId`, `text`, `image`, `likes`, `likeCount`, `deletedAt`, `createdAt`, `updatedAt`, and `memberData`.
- Frontend community pages should use Twit/TwitComment APIs for new community work. Existing board-article frontend pages are legacy and should not be mixed into new Twit work without a scoped migration.

### Follow API Contract
- Current backend follow mutation names are `subscribe(memberId: String)` and `unsubscribe(memberId: String)`, not `followMember` and `unfollowMember`.
- Current backend follow list queries are `getMemberFollowers(input: FollowInquiry)` and `getMemberFollowings(input: FollowInquiry)`.
- `checkFollowing` was not found in the inspected backend checkout.
- Follow target selection is inside `FollowInquiry.search`: use `followingId` for followers and `followerId` for followings.
- Backend prevents self-follow.
- Follow list payloads include viewer state such as `meFollowed` and `meLiked`, plus member data through `followerData` or `followingData`.
- Frontend Follow, Following, and Follow Back buttons should use `meFollowed` from list/profile data when available instead of adding a separate helper call.

### Member Profile API Contract
- `getMember(memberId: String): Member` is the inspected public/optional-auth profile query.
- `getMemberProfile` was not found in this backend checkout; treat any frontend expectation for `getMemberProfile` as needs verification before wiring.
- Important member fields include `_id`, `memberType`, `memberStatus`, `memberAuthType`, `memberPhone`, `memberNick`, `memberFullName`, `memberImage`, `memberAddress`, `memberDesc`, `memberBooks`, `memberTwits`, `memberFollowers`, `memberFollowings`, `memberPoints`, `memberLikes`, `memberViews`, `memberComments`, `memberRank`, `memberWarnings`, `memberBlocks`, `createdAt`, `updatedAt`, `accessToken`, `meLiked`, and `meFollowed`.
- Profile UI can derive counts from member counter fields and follow state from `meFollowed` when present.

### Twit Nested Comment API Contract
- `createTwitComment(input: CreateTwitCommentInput): TwitComment`: authenticated comment/reply creation.
- `getTwitComments(input: TwitCommentsInquiry): TwitComments`: optional-auth flat comment list for a twit.
- `updateTwitComment(input: UpdateTwitCommentInput): TwitComment`: authenticated owner/admin edit.
- `deleteTwitComment(commentId: String): TwitComment`: authenticated owner/admin soft delete.
- `likeTwitComment(commentId: String): TwitComment`: authenticated like toggle.
- `removeTwitCommentByAdmin(commentId: String): TwitComment`: ADMIN-only moderation.
- Backend enforces max depth `2`.
- `parentCommentId` and `depth` are used for nested replies. Backend returns a flat list; frontend builds the nested tree.
- `getTwitComments` filters soft-deleted comments and returns `memberData` plus `meLiked` when viewer context is available.
- Important fields: `_id`, `twitId`, `memberId`, `parentCommentId`, `depth`, `text`, `likes`, `likeCount`, `deletedAt`, `createdAt`, `updatedAt`, `memberData`, and `meLiked`.

### Upload/Image Integration
- Upload mutations live in `member.resolver.ts`: `imageUploader(file, target)` and `imagesUploader(files, target)`.
- Uploads require auth and accept png/jpg/jpeg MIME types.
- Upload middleware limits files to about 1.5MB each and max 10 files.
- Backend stores files under `uploads/${target}/${uuid.ext}` and serves them from `/uploads`.
- Frontend should store returned path strings in fields such as `bookImages` and Twit `image`, then render them with the backend API base URL when they are backend-uploaded paths.
- Existing frontend local assets under `/img/...` should remain local paths and should not be prefixed with the backend API URL.

### WebSocket And Robot Tracking Integration
- Backend uses plain `ws` via `WsAdapter`, not Socket.IO rooms.
- Client should send event `joinRequest` with `{ requestId }` to subscribe to request tracking.
- Backend internally groups clients in `request:{requestId}` rooms.
- Server event names include `robotPosition`, `robotStatus`, `requestUpdated`, `robotOffline`, `bookNotFound`, and `deliveryReady`.
- MQTT is backend-to-robot transport. Frontend should not speak MQTT directly.
- Per backend docs, WebSocket browser/client verification still needs verification before treating live tracking as production-ready.

### Known Frontend/Backend Integration Risks
- Frontend still has old Nestar/real-estate names and GraphQL stubs in several areas; verify operation payloads before wiring pages.
- Book like mutations must send a string id to `likeTargetBook`; object-style like inputs will trigger GraphQL `BAD_USER_INPUT`.
- Frontend routes named `/books` still use many property-era components and types.
- BoardArticle frontend pages are legacy while backend Twit APIs are the current community direction.
- Request and inventory responses may expose internal robot/inventory fields. Student pages should show user-facing delivery state only.
- `getMemberProfile`, `followMember`, `unfollowMember`, and `checkFollowing` were requested in older planning language but are not present in this inspected backend checkout.
- GraphQL nullable fields exist across nested response data. Frontend components should guard optional `bookData`, `robotData`, `inventoryData`, `memberData`, `meLiked`, and `meFollowed`.
- Upload path handling can break if frontend prefixes local `/img/...` assets with the backend API URL or fails to prefix backend upload paths.

### Backend Changes Still Needed For Frontend Integration
- No BookInventory pickup refactor remains in the inspected backend; current backend already uses fixed-gripper pickup fields.
- `getMemberProfile` is not present. If the frontend requires a richer profile aggregate, verify whether to use `getMember` plus Twit/Follow queries or add backend API in a separate backend task.
- `followMember`, `unfollowMember`, and `checkFollowing` are not present. Frontend should use `subscribe`, `unsubscribe`, and `meFollowed` unless backend API names change in a separate backend task.
- WebSocket request-tracking client behavior needs verification before building a polished live tracking UI.

### Frontend Integration Roadmap
- Book list integration: replace property-era assumptions with `getBooks` fields and backend `Book` model names.
- Book detail integration: use `getBook(bookId)`, preserve `meLiked`, and expose BORROW/PURCHASE actions based on `isBorrowable` and `isPurchasable`.
- Borrow/purchase flow: call `createDeliveryRequest` with correct `requestType`, desk destination for BORROW, and guest/member session handling.
- Request history/status: use `getSessionRequests` for student/guest-facing history and hide admin-only update controls.
- Community feed: migrate new community UI to `getTwits`, `createTwit`, `likeTwit`, and `deleteTwit`.
- Profile page: use `getMember`, `getMemberTwits`, `getMemberFollowers`, and `getMemberFollowings`.
- Followers/following tabs: use `subscribe`, `unsubscribe`, and `meFollowed`.
- Twit comments/replies: use `getTwitComments`, build a nested tree client-side, and enforce UI depth to match backend max depth `2`.
- Admin inventory/robot/request pages can be built later using ADMIN-only APIs and should stay separate from normal student UI.

### Backend Integration Rules For Future Frontend Sessions
- Read `AGENTS.md` and `MEMORY.md` first.
- Check branch/status before editing and stop if tracked application source files are dirty.
- Do not install packages unless explicitly requested.
- Do not push.
- Do not commit without confirmation.
- Use only `feat:` or `fix:` commit prefixes.
- Keep frontend work scoped to the requested page/component.
- Use this Backend Integration Audit before wiring GraphQL APIs.
- Do not modify backend files from frontend tasks unless the user explicitly switches scope to backend.
- Update `MEMORY.md` after each frontend session with where work stopped.
- Build professional, complete product behavior; do not treat MVP as weak/minimal.
