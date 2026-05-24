# 같이Go Frontend Agent Guide

Read this file and `MEMORY.md` before doing anything. `MEMORY.md` is the session continuity file and records where the project stopped.

---

## Global Rules

These rules apply permanently to all sessions on this project. They override any conflicting default behavior.

1. **Never run build commands** (`yarn build`, `npm run build`, or any compile/type-check command) unless the user explicitly asks for it.
2. **Never run git commands** (`git add`, `git commit`, `git push`, or any variant) without explicit instruction from the user. When a task is complete, always report what files were changed and recommend a commit message — then stop and wait for confirmation.

---

Skills are located in `.agents/` in the project root. Read relevant skill files before frontend or UI work.

## Session Update (2026-05-23) — Homepage advanced filter wiring + About hero background update

### Completed
- Wired homepage `HeaderFilter` advanced filter payload to `/books` using the existing `input` JSON contract (`BooksInquiry`) instead of flat query params.
- Updated `/books` page query handling in `pages/books/index.tsx`:
  - primary flow: parse `router.query.input` JSON
  - fallback flow: map legacy flat params (`format`, `type`, `category`, `audience`, `language`, `borrowable`, `purchasable`, `minRating`, `minPrice`, `maxPrice`, `keyword`) into `BooksInquiry.search`.
- Updated books sidebar filter behavior in `libs/components/property/BookFilter.tsx`:
  - keyword enter/clear now push router URL (`/books?input=...`) instead of only mutating local component state
  - local `searchText` and `localRating` now sync from incoming `searchFilter` so homepage -> books state stays visually consistent.
- Fixed homepage filter category option mismatch in `HeaderFilter` by replacing invalid category value `NOVEL` with valid `COMICS`.
- Updated About page hero background source in `libs/components/layout/LayoutBasic.tsx`:
  - `/about` header background changed from `/img/banner/aboutBanner.svg` to `/img/aboutUs.webp`.
- Added new static asset file: `public/img/aboutUs.webp`.

### Key rules
- Keep `/books?input=<BooksInquiry JSON>` as the canonical filter-state URL contract for books filtering.
- If compatibility is needed, support flat query params only as a read-side fallback in `/books`; write-side navigation should continue to emit `input`.
- When homepage filter enums are manually curated, ensure option values match `BookCategory` / `BookType` enums exactly to avoid silent backend filter misses.

## Session Update (2026-05-23) — Book detail hero + image resolver + card badge cleanup

### Completed
- Updated the book-detail hero heading block in `pages/books/detail.tsx` to match the shared banner style direction used by major pages:
  - heading typography changed from Sofia-centered style to Inter/Noto stack with large banner sizing
  - heading/breadcrumb placement moved to left-aligned container offset (instead of centered block).
- Fixed cross-page book-image rendering by updating `resolveMediaUrl` in `libs/utils.ts`:
  - resolver now prefers `process.env.NEXT_PUBLIC_API_URL` (with `REACT_APP_API_URL` fallback)
  - this restores correct absolute backend image URLs in `/books`, `/books/detail`, and homepage sections using `resolveMediaUrl` (including Most Borrowed).
- Updated `src/components/books/YouMayAlsoLike.tsx`:
  - removed blue shiny hover accent (neutralized hover shadow/border)
  - removed Borrowable/Purchasable availability badge
  - changed price text color to black.
- Removed book-category pill rendering from card UIs in requested scopes:
  - `libs/components/homepage/NewArrivalCard.tsx`
  - `libs/components/homepage/FeaturedBookCard.tsx`
  - `libs/components/homepage/MostBorrowedCard.tsx`
  - `libs/components/book/BookCard.tsx` (books page cards)
  - `src/components/books/YouMayAlsoLike.tsx` (book detail related cards).

### Key rules
- For frontend media URLs, prefer `NEXT_PUBLIC_API_URL` as the primary env source in this repo.
- Keep category text out of visual card badges when the request is for cleaner card surfaces; do not remove category query filters unless explicitly asked.

## Session Update (2026-05-22) — About hero stats removal + tech-stack dark/white pill pass

### Completed
- Removed the About hero stats strip from `libs/components/about/AboutHeroSection.tsx`:
  - deleted `HERO_STATS` constant (`10k+`, `2`, `3`, `1` summary values)
  - deleted the `.about-hero-stats` JSX block that rendered those four cards.
- Removed stats-only styles from `scss/pc/about/about.scss`:
  - deleted mobile `.about-hero-stats` + nested `.about-stat` block
  - deleted desktop `.about-hero-stats` + nested `.about-stat` block.
- Updated About tech-stack section styling in `scss/pc/about/about.scss`:
  - section background switched to `$color-dark`
  - heading colors set for tech-stack context (`h2` white, `p` muted)
  - pills styled as rounded white chips with dark text (`background: $color-white`, `color: $color-dark`, `border-radius: 100px`)
  - hover keeps pill text dark with primary border emphasis.
- Applied heading-position safety for tech-stack styling by covering both `.section-heading` and `.section-header` inside `.tech-stack`; JSX already had heading above pill rows, so no structural JSX move was needed.

### Key rules
- If a requested About heading rule mentions `.section-heading` but JSX uses `.section-header`, style both selectors inside the section scope instead of changing unrelated global heading behavior.
- For quick visual tweak requests on About sections, keep edits section-scoped in `about.scss` and avoid touching unrelated About blocks or i18n.

## Session Update (2026-05-22) — About page logo cloud + team heading + robot frame

### Completed
- Updated the About robot prototype visual frame to use the real TurtleBot image at `/img/logo/robot3.png` and removed inner placeholder/icon content from the outer frame.
- Repositioned the About Team heading/subtext above the team card grid using:
  - wrapper: `team-section` > `team-container`
  - heading block: `section-heading`
  - grid block: `team-grid` with all 8 member cards unchanged.
- Converted `AboutLogoCloudSection` from button-based manual carousel to auto-scroll marquee:
  - removed `useState`, `useMemo`, visible-window offset logic, and prev/next handlers/buttons
  - rendered duplicated logo sequence in `logo-cloud-track` for seamless loop
  - set heading copy to `Built With` and `The technologies powering 같이Go`
  - kept existing logo URLs unchanged (`svgl.app` sources)
- Reworked `.about-logo-cloud` rules (mobile and desktop blocks) to full-width strip behavior:
  - section width 100%, overflow hidden, top/bottom borders, white background
  - stage width 100% with no max-width constraint
  - marquee keyframes and hover-pause behavior
  - removed logo fading/muting/filtering states (no grayscale/opacity blur effects)
- Tightened marquee density to eliminate visible gaps:
  - increased repeated logo sequence count
  - reduced per-logo horizontal margin.

### Key rules
- About logo cloud should use `logo-cloud-track` marquee logic, not button pagination.
- Do not apply opacity/grayscale/blur treatment to technology logos unless explicitly requested.
- Keep existing external logo image URLs unchanged unless the user explicitly asks to replace assets.

## Session Update (2026-05-21) — Groq AI chatbot frontend + request actions

### Completed
- Replaced old `Chat.tsx` group-chat UI with `AiChatBubble.tsx`.
- Layouts now use `<AiChatBubble />`: `LayoutHome.tsx`, `LayoutFull.tsx`, `LayoutBasic.tsx`.
- Chatbot styles live in `scss/pc/chat/ai-chat.scss` and are imported by `scss/pc/main.scss`.
- Chatbot calls backend REST endpoint `${REACT_APP_API_URL}/chat/message`; `REACT_APP_API_URL` is exported from `libs/config.ts` and reads `NEXT_PUBLIC_API_URL`.
- Backend response contract consumed by frontend: `{ reply: string, books: ChatBookSuggestion[] }`.
- Assistant replies render markdown plus structured book suggestion cards.
- Book cards navigate to `/books/detail?id=<bookId>`.
- Book cards are Open-only; do not render Borrow/Purchase buttons in chat.
- Active chat history persists for 15 minutes in localStorage key `gachi_go_ai_chat_state`.
- `react-markdown` dependency added.

### Key rules
- Never hardcode frontend API URLs; use `REACT_APP_API_URL` from `libs/config.ts`.
- Do not parse assistant prose for UI actions; use structured backend response fields.
- Do not create borrow/purchase requests from chat; use book detail pages for those actions.
- Keep chat history persistence scoped to 15 minutes.
- Do not touch `apollo/client.ts`, `robot.gateway.ts`, or robot socket/tracking code for chatbot UI work.
- Chatbot favicon path is `/img/logo/final_favicon1.png`.

## Session Update (2026-05-16) — Member profile bugs + back-navigation header

### Completed
- **Bug: wrong tab on navigation** — `[memberId].tsx`: added `useEffect([memberId])` that resets `activeTab` to `0` and `twitsPage` to `1` when `memberId` changes. Next.js reuses the page component across `/member/A` → `/member/B` navigation, so state was never reset.
- **Bug: profile owner in own followers list** — `MemberFollowers.tsx`: added `.filter(follower => follower.followerId !== followInquiry.search?.followingId)` to both the empty-state check and the `.map()` render. Uses `follower.followerId` (plain GraphQL `String` scalar) compared to `followInquiry.search.followingId` (the profile owner's ID).
- **Back-navigation header** — `[memberId].tsx`: added `<div className="member-back-header">` with `ArrowBackOutlinedIcon` + member nick title as the first child of the center feed column (above the banner). Calls `router.back()`. Added `IconButton` to MUI import; added `ArrowBackOutlinedIcon` import.
- **Banner overlap fix** — `memberPage.scss`: removed `overflow: hidden` from `.member-feed-column` (it made the feed column the sticky scroll container, positioning the header 86px into the banner instead of 86px from the viewport). Back-header is not sticky — normal flow element. Added `border-radius: 4px 4px 0 0` to back-header to preserve column shape. Added `overflow: hidden` + `margin-top: 0` to banner.

### Key rules
- `overflow: hidden` on a flex parent makes it the sticky scroll container — child `position: sticky` resolves offsets from the parent's top, not the viewport. Remove `overflow: hidden` from any container where sticky children need to stick to the page scroll.
- When navigating between dynamic routes in Next.js (`/member/[memberId]`), the page component is reused — any `useState` that depends on the route param must be reset in a `useEffect([param])`.
- Self-exclusion in follower/following lists: compare `follower.followerId` (scalar String) against `followInquiry.search.followingId` — the profile owner's ID passed from the parent via `initialInput`.

---

## Session Update (2026-05-16) — Guest reply prompt on twit detail page

### Completed
- **Guest login prompt**: `pages/community/detail.tsx` — replaced the `{user?._id && <composer>}` boolean guard with a ternary. Guests now see a `.detail-login-prompt` strip with a clickable "Log in" span (routes to `/account/join`) instead of nothing.
- **Styles**: added `.detail-login-prompt` and `.login-link` to `scss/pc/community/detail.scss` in the `#community-detail-page` scope, directly above `.detail-reply-composer`. Colors: `#e2e8f0` border, `#64748b` muted text, `#2e86de` accent, `$font`.

### Key rule
- Auth-gated UI that hides completely for guests should almost always show a "Log in to …" prompt instead of blank space — blank space looks like a bug.

---

## Session Update (2026-05-16) — Member profile page, follow/unfollow real-time fix, community banner

### Completed
- **Member profile banner**: set `hero_lib.jpg` as background image in `scss/pc/member/memberPage.scss`; no overlay (user reverted overlay).
- **Default avatar**: `resolveAvatar` in `MemberFollowers.tsx` and `MemberFollowings.tsx` now returns `/img/profile/defaultUser.svg` instead of empty string when `memberImage` is absent. Removed the initials-div fallback; always renders `<img>` using `resolveAvatar`.
- **Like count in follow list**: added `<span className="follow-list-like-count">` next to the heart button in both follower and following rows, showing `memberLikes` from `followerData` / `followingData`. Style added to `memberPage.scss`.
- **Community banner**: updated `LayoutBasic.tsx` — `/community` and `/community/detail` routes now use `/img/community/digital_community.jpeg` instead of `header2.svg`.
- **Follow/unfollow real-time bug — root cause**: `MemberFollowers` and `MemberFollowings` were conditionally rendered with `{activeTab === n && ...}`, so they remounted on every tab switch. `followInquiry` reset to `initialInput` with empty `followingId`/`followerId` on each mount; a `useEffect` patched the ID asynchronously, creating a race where `skip: true` blocked the query at refetch time.
- **Fix — populated initialInput**: parent `[memberId].tsx` now passes `initialInput={{ page: 1, limit: 5, search: { followingId: memberId } }}` (and `followerId` for followings) directly, so both components start with a valid query on mount. Internal `useEffect` and `GET_MEMBER` query removed from both children.
- **Fix — header Follow button disconnected from list**: added `refetchTrigger` (number) prop to `MemberFollowers`. Parent increments it (after 300ms delay) inside `followHandler` after the subscribe/unsubscribe mutation resolves. Child watches it with `useEffect` and calls `getMemberFollowersRefetch`. Followings list does NOT need this — the header Follow button does not affect who the profile member follows.

### Key rules from this session
- `resolveAvatar` must return a fallback path, never an empty string — empty string passes a truthy check and silently skips the `<img>` render.
- Conditionally mounted components (`{condition && <Component />}`) remount on every condition change — never rely on internal `useEffect` to populate query variables that should be known at mount time; pass them via props instead.
- When two UI elements are visually related but rendered in different component trees (header button vs. list component), they are fully disconnected — use a trigger prop/counter to bridge them.
- The followings list does not need a `refetchTrigger` — following the profile member changes their followers list, not their followings list.

---

## Session Update (2026-05-16) — Comment threading, edit/delete/like, multi-image upload

### Completed
- Removed stale `likes: string[]` from all twit and twit-comment queries, mutations, and types. Replaced with `meLiked` / `likeCount` throughout `apollo/user/`, `apollo/admin/`, and `libs/types/`.
- Migrated `image: String` → `images: String[]` across `CreateTwitInput`, all twit queries/mutations, `TwitMedia`, `TwitBody`, `TwitCard`, and `CommunityComposer`. Composer supports up to 3 images with thumbnail strip and remove buttons (axios multipart upload).
- Fixed TwitMedia 3-image CSS grid on detail page: `display: grid` was scoped to `#community-list-page` and never applied to `#community-detail-page`. Added full grid declaration with explicit `px` row tracks in `detail.scss`.
- Created `libs/components/community/CommentCard.tsx`: 3-depth threading (depth 0/1/2), per-comment like with `optimisticResponse`, inline edit, and soft delete.
- Extended `detail.tsx` comment grouping to 3 buckets (`depth0` / `depth1` / `depth2`); `depth2` pool passed as prop so depth-1 cards render their own grandchildren.
- Reply button hidden when `comment.depth >= 2` (backend enforces max depth 2; deeper replies return `BAD_REQUEST`).
- Fixed `UPDATE_TWIT_COMMENT` call: input field is `commentId`, not `_id`.
- Commits: `a80f766`, `d3c5270`.

### Key rules from this session
- `UPDATE_TWIT_COMMENT` input: `{ commentId: string, text: string }` — `_id` is rejected.
- `display: grid` must be declared in each page's own SCSS scope; it does not propagate across sibling page selectors.
- `grid-template-rows: 1fr 1fr` collapses to zero without an explicit container height — use `px` row tracks.
- `CommentCard` no longer uses an `isReply` boolean; all depth logic reads `comment.depth` directly.

---

## Session Update (2026-05-15) — Like toggle fix and cleanup

### Twit like toggle (completed)

- `LIKE_TWIT` mutation fixed: argument was `$input: String! / likeTwit(input: $input)` — corrected to `$twitId: String! / likeTwit(twitId: $twitId)`. Variable call site in `TwitActionRow.tsx` updated to `variables: { twitId }`.
- `LIKE_TWIT` return fields aligned to exactly match `GET_TWITS` list item scalars: `_id · memberId · text · image · meLiked · likeCount · viewCount · deletedAt · createdAt · updatedAt`. Previously missing `viewCount` caused Apollo cache warnings.
- Cache strategy confirmed: `optimisticResponse` only. No `cache.modify`, no `refetchQueries`. Apollo merges by `_id + __typename`; server response overwrites optimistic values automatically.
- `meLiked` and `likeCount` now update instantly on click and are confirmed by server response.
- Debug `console.log` statements (`BEFORE LIKE:`, `SERVER RESPONSE:`) removed from `TwitActionRow.tsx`.
- Committed: `668399d feat: twit like toggle fully working — cleanup debug logs`

## Session Update (2026-05-15) — Community pages — X platform UI structure (completed)

- `/community` and `/community/detail` are fully migrated. Both are done pages.
- **Layout:** 3-column shell — left nav (68px) + feed (max 600px) + right rail (300px).
- **New component:** `CommunityLeftNav.tsx` — icon-only sticky nav (MUI icons).
- **CommunityShell.tsx rewritten:** "Community" heading + ruled tab bar (For you / Following / Library), right rail with search input + 4 trending items + 3 who-to-follow rows.
- **TwitActionRow.tsx:** Repost, Views, Share actions added; all text labels removed; icon + count only.
- **TwitBody.tsx:** Hashtag parser — `#word` wrapped in `.twit-hashtag` with `color: #2e86de`.
- **CommunityComposer.tsx:** Text "Image" button replaced with `ImageOutlinedIcon`; emoji and location icon buttons added (disabled, future use).
- **detail.tsx:** Sticky back-arrow header, full timestamp line, stats row (Likes/Reposts/Replies), reply composer wired to `CREATE_TWIT_COMMENT`, live replies thread from `GET_TWIT_COMMENTS`.
- **Dead code removed:** `Teditor.tsx`, `TViewer.tsx`, `write.scss` deleted; `WriteArticle.tsx` import stubbed.
- **Palette aligned** to global site tokens (`#f6f6f6` bg, `#1a1a2e` text, `#64748b` muted, `#e2e8f0` borders, `#2e86de` accent).
- **Font aligned:** Crimson Pro + Atkinson Hyperlegible `@import` removed; all community SCSS uses `$font`.
- Twit image flow (from previous session): `imagesUploader` target `twits`; normalize at render time (`http` as-is, `uploads/` prefixed with `REACT_APP_API_URL`, `/img/` local).

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
- GraphQL HTTP URI is `process.env.NEXT_PUBLIC_API_URL + '/graphql'` (set via `NEXT_PUBLIC_API_URL` in `.env.*`). Do NOT use `REACT_APP_API_GRAPHQL_URL` — that var is undefined in this project. WebSocket URI comes from `process.env.REACT_APP_API_WS`.
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
- `/community`: ✅ **Done.** X-platform 3-column feed using `GET_TWITS`, `CREATE_TWIT`, `LIKE_TWIT`, `DELETE_TWIT`. Components: `CommunityShell`, `CommunityLeftNav`, `CommunityComposer`, `CommunityFeed`, `TwitCard`, `TwitAuthorRow`, `TwitBody`, `TwitMedia`, `TwitActionRow`. Next: wire "Following" tab filter, real "Who to follow" data from `GET_MEMBERS`.
- `/community/detail`: ✅ **Done.** Sticky header, full timestamp, stats row, reply composer (`CREATE_TWIT_COMMENT`), live replies thread (`GET_TWIT_COMMENTS`). Route pattern: `/community/detail?id=<twitId>`.
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
- Community components: `CommunityShell`, `CommunityLeftNav`, `CommunityComposer`, `CommunityFeed`, `TwitCard`, `TwitAuthorRow`, `TwitBody`, `TwitMedia`, `TwitActionRow`. All fully migrated to Twit API. `Teditor`, `TViewer`, and `write.scss` deleted. `CommunityCard` is legacy/unused.
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
- `CreateTwitInput` supports `text` (max 500 chars, enforced on both frontend and backend) and optional `images: String[]` (multi-image, max 3 via `imagesUploader`).
- Important `Twit` fields: `_id`, `memberId`, `text`, `images`, `meLiked`, `likeCount`, `viewCount`, `deletedAt`, `createdAt`, `updatedAt`, and `memberData`. `meLiked` and `viewCount` are required for like toggle and view display; always include them in twit query/mutation return sets. Do not request `likes` or `image` — those fields are removed.
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
- `updateTwitComment(input: UpdateTwitCommentInput): TwitComment`: authenticated owner/admin edit. Input fields: `{ commentId: String!, text: String! }` — use `commentId`, NOT `_id`.
- `deleteTwitComment(commentId: String): TwitComment`: authenticated owner/admin soft delete.
- `likeTwitComment(commentId: String): TwitComment`: authenticated like toggle. Uses `optimisticResponse` pattern — no `cache.modify`, no `refetchQueries`.
- `removeTwitCommentByAdmin(commentId: String): TwitComment`: ADMIN-only moderation.
- Backend enforces max depth `2`. Attempting depth > 2 returns `BAD_REQUEST`. Frontend hides Reply button when `comment.depth >= 2`.
- `parentCommentId` and `depth` are used for nested replies. Backend returns a flat list; frontend splits into `depth0` / `depth1` / `depth2` buckets and builds the tree client-side.
- `getTwitComments` filters soft-deleted comments and returns `memberData` plus `meLiked` when viewer context is available.
- Important fields: `_id`, `twitId`, `memberId`, `parentCommentId`, `depth`, `text`, `likeCount`, `deletedAt`, `createdAt`, `updatedAt`, `memberData`, and `meLiked`. Do not request `likes` — that field is removed.

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
- Community feed: ✅ **Done.** X-platform UI live. Remaining: "Following" tab filter, real "Who to follow" data from `GET_MEMBERS`.
- Community detail comments: ✅ **Done.** 3-depth threading, per-comment like/edit/delete with owner guard all live.
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

---

## Session Update (2026-05-21) — MyFavorites + RecentlyVisited redesign, like wiring, Apollo cache fix

### Completed

**MyFavorites.tsx — full redesign:**
- Layout: 3-column `.bk-grid` card layout, PAGE_LIMIT=10, MUI Pagination matching `MyArticles` pattern (`pagination-config` > `pagination-box` > `Pagination` + `total-result`)
- Card structure: `.bk-card-top` (category label left, like badge right), `.bk-card-image` (160px, object-fit cover), `.bk-card-body` (`$color-bg` tint, title + author)
- Like button: `FavoriteIcon` / `FavoriteBorderIcon` toggled by `book.meLiked?.[0]?.myFavorite`; calls `LIKE_TARGET_BOOK` mutation + `refetchFavorites`; `e.stopPropagation()` prevents card navigation on heart click; shows `book.bookLikes` count
- Card click navigates to `/books/detail?id=${book._id}` (query-param format matching `pages/books/detail.tsx`)
- Auth guard: throws `Message.NOT_AUTHENTICATED` if not logged in; error shown via `sweetMixinErrorAlert`

**RecentlyVisited.tsx — redesign + routing fix:**
- Same 3-col `.bk-grid` + MUI Pagination (PAGE_LIMIT=10)
- Card top row: category label left, visited date (`formatDate(book.updatedAt)`) right
- Card click navigates to `/books/detail?id=${book._id}`

**apollo/user/mutation.ts — Apollo cache bug fix:**
- Added `meLiked { memberId likeRefId myFavorite }` to `LIKE_TARGET_BOOK` return fields
- Root cause: cache held `Book.meLiked` as a nested object from `GET_FAVORITE_BOOKS`; mutation response omitted `meLiked`; Apollo's `warnAboutDataLoss` in `writeToStore` called `String()` on the cached object → `TypeError: Cannot convert object to primitive value`

**scss/pc/mypage/mypage.scss:**
- Replaced old `#my-favorites-page` and `#recently-visited-page` blocks with shared `.bk-*` card classes
- All colors: `$color-*` variables only; all fonts: `$font` only — no hardcoded hex, no external font imports
- `.bk-card-badge`: interactive like button with hover → `$color-danger`, `.bk-card-badge--liked` active state
- `.bk-card-likes`: inline like count beside heart icon

### Key rules from this session
- Book detail navigation from MyPage uses `/books/detail?id=${book._id}` — NOT `/books/${book._id}` (no dynamic route exists; detail page reads `router.query.id`).
- `LIKE_TARGET_BOOK` mutation MUST return `meLiked { memberId likeRefId myFavorite }` — omitting it causes Apollo cache type-mismatch crash (`Cannot convert object to primitive value`).
- Never introduce non-project-standard fonts (DM Sans, Playfair Display, etc.) or hardcoded hex colors. Always use `$font` and `$color-*` from `scss/variables.scss`.
- `e.stopPropagation()` is required on the like badge click to prevent the card's `onClick` navigation from also firing.
- Category enum formatter: `raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())` — applied wherever `bookCategory` or genre enum is displayed.

---

## Session Update (2026-05-18) — MyPage Smart Library Dashboard Rebuild

### Completed (commit `bb02d33`)

**Components rebuilt/created:**
- `MyMenu.tsx` — flat 8-item nav (no section headers), MUI icons, avatar + nick + memberType at top, logout separated by border-top with `$color-danger`
- `MyProfile.tsx` — removed `memberAddress`, added `memberDesc` textarea with 200-char live counter
- `MyArticles.tsx` → "My Twits" — live `GET_MEMBER_TWITS`, `DELETE_TWIT` with `sweetConfirmAlert`, navigate to `/community/detail?id=`
- `MyFavorites.tsx` → "Saved Books" — live `GET_FAVORITE_BOOKS`, 3-col grid, like button wired, card → `/books/detail?id=`
- `RecentlyVisited.tsx` → "Recently Viewed" — live `GET_VISITED_BOOKS`, 3-col grid, card → `/books/detail?id=`
- `MyRequests.tsx` — NEW: live `GET_SESSION_REQUESTS`, client-side 3-tab filter (All/Active/History), uses real `RequestStatus` enum (14 values), status badge classes: `status-pending/active/ready/done/issue`
- `RobotTracking.tsx` — NEW: SVG 4×4 floor map (A1–D4), animated robot dot (`robot-pulse-ring` CSS animation), mock robot at `colIndex:1.5, rowIndex:0.8` mid-aisle toward B3 target, right panel with status badge + "Request Robot" button

**Components deleted:**
- `MyProperties.tsx`, `PropertyCard.tsx`, `WriteArticle.tsx`, `Article.tsx` — all property/board-article era, removed

**Bug fixes applied:**
- `pages/mypage/index.tsx`: added `initialInput` with `user._id` to `MemberFollowers` and `MemberFollowings` — fixes race condition where components remounted before `followInquiry` was populated
- `apollo/user/mutation.ts` `DELETE_TWIT`: `image` → `images` (removed field corrected)
- `apollo/user/query.ts` `GET_MEMBER_TWITS`: added missing `viewCount` field

**SCSS:** `scss/pc/mypage/mypage.scss` fully overhauled — all colors use `$color-*` SCSS variables, all fonts use `$font`, no hardcoded hex.

**Standard enforcement rule:** Never introduce non-project-standard fonts (DM Sans, Playfair Display, etc.) or hardcoded hex colors. Always use `$font` and `$color-*` from `scss/variables.scss`.

### Key rules from this session
- `GET_SESSION_REQUESTS` has no status filter on the server (`SessionRequestsInquiry` input has no status field) — client-side tab filtering with `ACTIVE_STATUSES` / `HISTORY_STATUSES` arrays is correct.
- Request cover image: `req.bookData?.bookImages?.[0]` prefixed with `REACT_APP_API_URL`; fallback `/img/profile/defaultUser.svg`.
- `AddNewProperty.tsx` must NOT be deleted — it is the reference template for the Admin Add Book panel (see section below). It is not mounted on the student MyPage.

---

## Session Update (2026-05-18) — RobotTracking SVG floor plan + live WebSocket hook

### Completed

**Phase 1 — Backend audit (read-only):**
Confirmed all modules needed for live tracking are fully implemented on the backend. No backend changes required.

Key findings:
- Robot position stored as `currentPose: { floorId, x, y, theta }` in cm / radians
- WebSocket uses plain `ws` (NestJS `WsAdapter`) — NOT Socket.IO, NOT Apollo subscriptions
- WS message format: `{ event: string, data: {} }` for both send and receive
- WS join: `ws.send(JSON.stringify({ event: 'joinRequest', data: { requestId } }))`
- Room pattern: `request:{requestId}` — backend scopes all events to requesting client
- Env var: `REACT_APP_API_WS` (confirmed from `apollo/client.ts`)
- `GET_SESSION_REQUESTS` was missing `robotData.currentPose` — added in Phase 2

**Phase 2 — Files changed:**

`apollo/user/query.ts`
- Added `currentPose { floorId x y theta }` inside `robotData` block of `GET_SESSION_REQUESTS`

`libs/hooks/useRobotSocket.ts` (NEW)
- Raw WebSocket hook; connects to `REACT_APP_API_WS`; emits `joinRequest` on open
- Handles: `joined`, `robotPosition`, `robotStatus`, `requestUpdated`, `deliveryReady`, `bookNotFound`, `robotOffline`, `error`
- Reconnect: up to 5 retries × 3s; sets `ws.onclose = null` before close on unmount to prevent spurious retry
- Resets all state when `requestId` changes

`libs/components/mypage/RobotTracking.tsx` (full rebuild)
- **SVG floor plan** at `viewBox="0 0 680 340"`, SCALE=3.4 px/cm, Y-flip: `SVG_y = (100 − real_y) × 3.4`
- 7 zones (Library Books, Commercial Books, Navigation Aisle, Reception, Charging Dock, Desk A, Desk B) drawn with engineering schematic aesthetic — dashed borders for book zones, solid for rooms
- 6 stop points (LIB_03/05/07, COM_03/05/07) at exact real-world coordinates; target stop pulsing ring
- Robot indicator: circle + directional notch, CSS `transition: transform 0.8s ease` on position, 0.4s on heading rotation
- **DeliveryTimeline**: 10 display steps ← 15 `RequestStatus` values; merged DB `timeline[]` + live socket events (deduplicated by status); step states: `completed/current/pending/failed`
- **TrackingPanel**: compact book row (60×80px cover), callnumber badge, live robot status badge, battery bar (green/yellow/red), online dot, MUI `Tooltip` on disabled "Request Robot" button
- Active request detection: status NOT in `{COMPLETED, FAILED, CANCELLED, BOOK_NOT_FOUND, QUEUED}`

`scss/pc/mypage/mypage.scss`
- Entire `#robot-tracking-page` section replaced; all CSS classes prefixed `rt-`
- Animations: `rt-pulse` (target ring), `rt-dot-pulse` (status dot blink)
- Zero hardcoded hex; zero non-`$font` family strings

### Key rules from this session
- **`RobotStatus` enum is in `libs/enums/robot.enum.ts`** — NOT `request.enum.ts`. Always import from the correct file.
- Backend WS is plain `ws`, not Socket.IO. Client must use `new WebSocket(url)` + JSON parse, not `io()` or Apollo WS link.
- NestJS `WsAdapter` message format: `{ event: string, data: {} }` in both directions.
- `robotData.currentPose` comes from `GET_SESSION_REQUESTS` (embedded in Request response) — students cannot call `getRobot` directly (ADMIN-only GraphQL query).
- Target stop point resolved from `bookCallNumber` prefix: `LIB_*` → library zone, `COM_*` → commercial zone.
- CSS `transform: translate(Npx, Mpx)` on SVG elements in modern browsers uses SVG user units (not screen px) — safe to use for robot position with `transition` for smooth animation.
- Active request = status not in `{COMPLETED, FAILED, CANCELLED, BOOK_NOT_FOUND, QUEUED}`. QUEUED is excluded because no robot is assigned yet.

---

## MyPage Pre-Build Audit (2026-05-18)

Full audit captured before the Smart Library MyPage is built. Use as the reference baseline — do not re-read every legacy file; consult this section instead.

### Routing & Entry Point
- **Main file:** `pages/mypage/index.tsx`
- **No nested routes** — single page, tab switching via URL query param
- **Pattern:** `/mypage?category={tab}`
- Mobile returns bare `<div>MY PAGE</div>` placeholder — desktop only is implemented
- Related: `pages/member/[memberId].tsx` for viewing *other* users' profiles

### Page Structure & Layout
Two-column layout — sidebar (266px) + content area (936px):
```
#my-page → .container → .my-page (Stack row)
  ├── .left-config  → <MyMenu /> sidebar
  └── .main-config  → conditional render based on router.query.category
```

Category → component mapping:

| Category value | Component | Notes |
|---|---|---|
| `myProfile` (default) | `<MyProfile />` | Profile edit + avatar upload |
| `myFavorites` | `<MyFavorites />` | Stub (property era) |
| `recentlyVisited` | `<RecentlyVisited />` | Stub (property era) |
| `followers` | `<MemberFollowers />` | Live |
| `followings` | `<MemberFollowings />` | Live |
| `myArticles` | `<MyArticles />` | Stub (board-article era) |
| `writeArticle` | `<WriteArticle />` | Stub — shows "unavailable" |
| `addProperty` | `<AddNewProperty />` | Agent-only, stub |
| `myProperties` | `<MyProperties />` | Agent-only, stub |

### Components

| Component | Path | Status |
|---|---|---|
| `MyMenu` | `libs/components/mypage/MyMenu.tsx` | Live — sidebar nav, avatar, menu, logout |
| `MyProfile` | `libs/components/mypage/MyProfile.tsx` | Live — profile edit + avatar upload |
| `MyProperties` | `libs/components/mypage/MyProperties.tsx` | Stub (property) |
| `PropertyCard` | `libs/components/mypage/PropertyCard.tsx` | Stub (property) |
| `MyFavorites` | `libs/components/mypage/MyFavorites.tsx` | Stub (property) |
| `RecentlyVisited` | `libs/components/mypage/RecentlyVisited.tsx` | Stub (property) |
| `MyArticles` | `libs/components/mypage/MyArticles.tsx` | Stub (board-article) |
| `WriteArticle` | `libs/components/mypage/WriteArticle.tsx` | Stub |
| `AddNewProperty` | `libs/components/mypage/AddNewProperty.tsx` | Stub (agent-only) |
| `MemberFollowers` | `libs/components/member/MemberFollowers.tsx` | Live — shared w/ member page |
| `MemberFollowings` | `libs/components/member/MemberFollowings.tsx` | Live — shared w/ member page |

### GraphQL — Live Operations

| Operation | Type | Used in | Notes |
|---|---|---|---|
| `UPDATE_MEMBER` | Mutation | MyProfile | Updates nick/phone/address/image; returns new `accessToken` |
| `LIKE_TARGET_MEMBER` | Mutation | Followers/Followings | |
| `SUBSCRIBE` | Mutation | Follow a member | |
| `UNSUBSCRIBE` | Mutation | Unfollow a member | |
| `GET_MEMBER_FOLLOWERS` | Query | MemberFollowers | `followingId: user._id` |
| `GET_MEMBER_FOLLOWINGS` | Query | MemberFollowings | `followerId: user._id` |

### GraphQL — Stubs (return only `{ __typename }`)
`CREATE_PROPERTY`, `UPDATE_PROPERTY`, `GET_AGENT_PROPERTIES`, `GET_PROPERTY`, `GET_FAVORITES`, `GET_VISITED`, `GET_BOARD_ARTICLES`, `LIKE_TARGET_PROPERTY`, `LIKE_TARGET_BOARD_ARTICLE`

### State Management
- Logged-in user: `useReactiveVar(userVar)` — JWT decoded at app init; never fetched per-page
- Auth guard:
  ```ts
  useEffect(() => { if (!user._id) router.push('/').then(); }, [user]);
  ```
- After `UPDATE_MEMBER`: `updateStorage()` → `updateUserInfo(newAccessToken)` refreshes `userVar`
- Each tab manages its own local `useState`

### Profile Edit
- **Avatar upload:** hidden `<input type="file">` → multipart FormData → `imageUploader` mutation → target `'member'` → relative path stored in `updateData.memberImage`
- **No banner upload** in legacy MyPage
- **Editable fields:** `memberNick`, `memberPhone`, `memberAddress`, `memberImage`
- **Mutation:** `UPDATE_MEMBER` with `MemberUpdate` input
- **Post-update:** `updateStorage()` → `updateUserInfo()` → `sweetMixinSuccessAlert()`
- **Validation:** `doDisabledCheck()` disables submit if any required field empty; no inline error messages

### Tabs Behavior
URL-based navigation, not React state:
```ts
const category = router.query?.category ?? 'myProfile';
```
`MyMenu` uses `<Link href={{ pathname: '/mypage', query: { category: '...' } }} scroll={false}>`.
Active state: black background + white text on active menu item.

### SCSS & SweetAlert Patterns
- **SCSS:** `scss/pc/mypage/mypage.scss` — white cards, 12px radius, `0px 1px 4px 0px rgba(24,26,32,0.07)` shadow, black active states
- **MUI:** `Stack`, `Typography`, `Button`, `Pagination`, `Menu`, `MenuItem`, `IconButton`, `ModeIcon`, `DeleteIcon`, `FavoriteIcon`
- `sweetConfirmAlert()` — logout/delete confirmations
- `sweetMixinSuccessAlert()` — profile update success
- `sweetTopSmallSuccessAlert()` — follow/subscribe toasts
- `sweetErrorHandling(err)` — all catch blocks

### What to Keep / What to Replace for Smart Library MyPage

**Keep (reuse as-is):**
- Auth guard pattern
- URL-based tab navigation via `router.query.category`
- Avatar upload flow (`imageUploader` mutation + multipart FormData)
- `UPDATE_MEMBER` mutation + JWT refresh sequence
- `MemberFollowers` / `MemberFollowings` components
- All `sweetAlert` patterns

**Replace (library-specific tabs):**
- `myFavorites` → My Borrowed Books
- `recentlyVisited` + `myProperties` → My Requests (with status)
- `myArticles` / `writeArticle` → My Twits or remove
- **Remove entirely:** `addProperty`, `myProperties`, agent-only guards — no agent role in the library system

---

## Planned: Admin Add Book Panel (2026-05-18)

`libs/components/mypage/AddNewProperty.tsx` is **preserved intentionally** as the reference implementation for the Admin "Add Book" form. Do NOT delete it until the Admin form is complete and tested.

**Rule:** `AddNewProperty.tsx` is NOT mounted on the student MyPage. It exists only as a template.

### What to build
Copy to `libs/components/admin/AddNewBook.tsx` and transform:

| Property field | Book equivalent |
|---|---|
| `propertyTitle` | `bookTitle` |
| `propertyPrice` | `bookPrice` (`{ amount, currency, isDiscounted }`) |
| `propertyType` | `bookType` (enum `BookType`) |
| `propertyLocation` | `bookCategory` (enum `BookCategory`) |
| `propertyAddress` | `bookCallNumber` |
| `propertyRooms/Beds/Square` | `bookPublishedYear`, `bookPages`, `bookFormat`, `bookAudience`, `bookLanguage` |
| `propertyDesc` | `bookDescription` |
| `propertyImages` | `bookImages` (max 5, target `'books'`) |

New fields to add: `bookIsbn`, `bookAuthor`, `isBorrowable` toggle, `isPurchasable` toggle.

GraphQL: `CREATE_BOOK` / `UPDATE_BOOK` from `apollo/admin/mutation.ts` (not the stub property mutations).
Route guard: `user.memberType === MemberType.ADMIN`.
After submit: redirect to `/_admin/books`.

Full spec in `WORKFLOW.md`.

---

## Session Update (2026-05-19) — RobotTracking realtime lifecycle + post-completion return route

### Completed
- `useRobotSocket` now treats terminal request statuses as locked (`COMPLETED`, `FAILED`, `CANCELLED`, `BOOK_NOT_FOUND`) so later non-terminal events (like `READY`) cannot override them.
- `requestUpdated` payload handling was hardened with requestId matching and safer timeline merge behavior.
- `RobotTracking` status rendering now prefers terminal-aware effective status and prevents stale READY fallback.
- Active-request selection was corrected to use the latest request record first (`updatedAt`/`createdAt`) to avoid showing old READY requests after a newer request is completed.
- Added automatic request refresh behavior (`GET_SESSION_REQUESTS` polling + terminal refetch path) so new request assignment and status transitions appear without manual page refresh.
- Socket tracking now follows the latest request room, not only non-terminal active requests, enabling post-completion robot movement visibility.
- After completion, map rendering can show return-to-dock route/trail when robot status is `RETURNING`/`DOCKING`/`IDLE`, using corridor-based graph nodes.
- Robot heading remains movement-aligned and route/live-trail remain graph-aligned.

### Operational rule from this session
- For RobotTracking, avoid tying WebSocket subscription strictly to “active request only”; keep latest-request room continuity when post-completion telemetry is expected.

---

## Session Update (2026-05-24) — Admin dashboard Monolith layout + MyPage admin entry

### Completed
- Wired the MyPage `ADMIN` status badge/menu entry to route admins into `/_admin/dashboard`.
- Rebuilt `pages/_admin/dashboard/index.tsx` to follow the Monolith admin dashboard structure:
  - 4-card stat row: Total Books, Total Members, Active Requests, Robots Online.
  - 2-column chart row: Member Growth line chart and Requests by Status donut chart.
  - 2-column ranked row: Top Viewed Books and Top Liked Books.
  - Recent Members table with avatar/name, type, status, joined date, and `View all -> /_admin/users`.
- Implemented dashboard charts with `chart.js/auto` canvas components because this frontend uses Chart.js, not Recharts.
- Pinned `chart.js` to exact `3.8.0` in `package.json` and `yarn.lock`.
- Improved Chart.js text clarity by setting `devicePixelRatio`, raising chart label font size to 12, and removing forced CSS canvas stretching.
- Updated admin dashboard badge pills:
  - USER, DESIGNER, ACTIVE, BLOCK use background-only pills with the requested soft colors, 20px radius, 12px uppercase text, and weight 500.

### Key rules
- Dashboard data uses existing admin GraphQL operations only: `GET_ALL_BOOKS_BY_ADMIN`, `GET_ALL_MEMBERS_BY_ADMIN`, `GET_REQUESTS`, `GET_ROBOTS`.
- Keep admin dashboard layout changes scoped to `pages/_admin/dashboard/index.tsx` and dashboard/admin rules in `scss/pc/admin/admin.scss` unless explicitly asked to touch other admin pages.
- If Chart.js text looks blurry, avoid CSS-stretching canvas dimensions; let Chart.js manage the backing canvas and set `devicePixelRatio`.
- `Top Liked Books` requires backend support for sorting `GET_ALL_BOOKS_BY_ADMIN` by `bookLikes`.
