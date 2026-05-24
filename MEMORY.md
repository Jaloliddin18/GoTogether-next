# MEMORY — 같이Go Frontend

**Last Updated:** 2026-05-24
**Current Branch:** `admin`

---

## Today's Session Update (2026-05-24, book detail hierarchy cleanup + Apollo error 17 fix)

### Completed today
- Removed the top-card `Catalog Record` block from `pages/books/detail.tsx` to reduce crowding in the main decision area.
- Updated lower metadata tabs in `src/components/books/BookDetailTabs.tsx`:
  - renamed tab title to `Library Information`
  - moved/kept catalog fields under `CATALOG RECORD` (category, type, format, language, audience, pages, published year, ISBN, call number)
  - retained `PHYSICAL DETAILS` (width, height, weight)
  - removed `READING GUIDE` and `BORROWING POLICY` sections
- Fixed recurring Apollo runtime invariant error code `17` in `apollo/client.ts` by ensuring `createIsomorphicLink()` always returns a valid link chain in SSR and client paths.

### Current stopping point
- Book detail top card is now lighter and no longer duplicates catalog-heavy metadata.
- Catalog/physical details are centralized in the lower Library Information tab.
- Apollo client initialization now has a guaranteed link path in SSR, which addresses the reported runtime error loop.

### Exact next task
- If requested, run a focused browser QA pass on `/books/detail?id=<bookId>` to confirm tab content, spacing, and query stability in both first-load and client-navigation flows.

## Today's Session Update (2026-05-24, book cover full-image rendering)

### Completed today
- Fixed book-cover cropping by switching cover media fit from `cover` to `contain` in requested frontend surfaces:
  - `libs/components/homepage/NewArrivalCard.tsx`
  - `libs/components/homepage/FeaturedBookCard.tsx`
  - `libs/components/homepage/MostBorrowedCard.tsx`
  - `libs/components/book/BookCard.tsx`
  - `src/components/books/YouMayAlsoLike.tsx`
  - `pages/books/detail.tsx` (main cover + thumbnails)
- Added light neutral image-stage backgrounds/padding in those book-cover wrappers so full covers render cleanly without crop.
- Preserved non-book hero/banner behavior (book-detail top banner remains unchanged).
- Updated New Arrivals and Featured cards to resolve cover URLs via `resolveMediaUrl(...)` for consistent external/relative cover handling.

### Verification
- Ran `npm run build` (explicitly requested during the task).
- Build failed due an unrelated pre-existing type error:
  - `libs/components/member/MemberArticles.tsx:105`
  - `currentUserId` prop passed to `TwitCard`, but `TwitCardProps` does not define that prop.

### Current stopping point
- Book cards and book detail cover areas now show full cover images without cutting off artwork/text.
- Working tree includes this cover-rendering fix plus memory/agent documentation update.

### Exact next task
- If requested, fix the unrelated `TwitCardProps` type mismatch so `npm run build` can complete successfully.

## Today's Session Update (2026-05-24, admin members/cs page design alignment)

### Completed today
- Redesigned `/_admin/users` (`pages/_admin/users/index.tsx`) to match the rebuilt admin panel design system used by dashboard/books/community/inventory/requests/robots:
  - uses `admin-page`, `admin-filters`, `admin-table`, `admin-pagination` structure
  - preserves real data wiring: `GET_ALL_MEMBERS_BY_ADMIN`
  - preserves admin actions: `UPDATE_MEMBER_BY_ADMIN` with inline member type/status updates.
- Redesigned CS admin pages to the same visual system:
  - `pages/_admin/cs/notice.tsx`
  - `pages/_admin/cs/faq.tsx`
  - `pages/_admin/cs/inquiry.tsx`
- Removed legacy tab/list/table placeholder scaffolding on those CS pages and replaced with consistent table-card style and filter bars matching the other admin pages.
- Reused existing shared badge classes to keep status/type pill visuals consistent with the current admin theme.

### Current stopping point
- Members page is visually unified and still fully backend-driven for list/update behavior.
- CS pages are now design-aligned with the modern admin panel but remain mock-data placeholders (no backend CS wiring yet).

### Exact next task
- Wire CS admin pages (`notice`, `faq`, `inquiry`) to backend GraphQL queries/mutations and replace local/mock rows with real data/actions.

## Today's Session Update (2026-05-24, admin panels wiring + community admin moderation)

### Completed today
- Implemented real-data admin panels for:
  - `/_admin/inventory` (`pages/_admin/inventory/index.tsx`)
  - `/_admin/requests` (`pages/_admin/requests/index.tsx`)
  - `/_admin/robots` (`pages/_admin/robots/index.tsx`)
- Inventory panel:
  - wired `GET_BOOK_INVENTORIES`
  - added filters (status/type/zone), ID search, pagination
  - added actions: `UPDATE_BOOK_INVENTORY_STATUS`, `UPDATE_BOOK_INVENTORY`, `removeBookInventoryByAdmin`.
- Requests panel:
  - wired `GET_REQUESTS`
  - added filters (status/type/payment/destination), search, pagination
  - added guarded transition actions via `UPDATE_REQUEST_STATUS`
  - added purchase payment update action (`Mark Paid`).
- Robots panel:
  - wired `GET_ROBOTS`
  - added filters (status/online), search, pagination
  - added create robot flow via `CREATE_ROBOT`
  - added inline robot updates via `UPDATE_ROBOT` (name/status/online/battery/currentRequestId).
- Community public moderation:
  - admins can delete non-owned twits from `/community` and `/community/detail`
  - delete handler attempts `DELETE_TWIT` first, then `REMOVE_TWIT_BY_ADMIN` fallback when backend enforces admin-only removal for non-owners.
- Twit contract and rendering fixes:
  - admin GraphQL twit docs updated from `image` to `images` and include `viewCount`:
    - `apollo/admin/query.ts`
    - `apollo/admin/mutation.ts`
  - twit update type aligned to images array (`libs/types/twit/twit.update.ts`)
  - removed localStorage like-state workaround from `libs/components/community/TwitActionRow.tsx`; now uses server `meLiked`/`likeCount` with optimistic UI.
- Community component prop wiring updated:
  - `CommunityFeed` and `TwitCard` now use `canDelete` instead of owner-only delete prop.
- Admin community list typed cleanup:
  - `pages/_admin/community/index.tsx` now reads `twit.viewCount` directly.

### Current stopping point
- Inventory, Requests, and Robots admin pages are now live and mutation-enabled (core scope).
- Public community moderation now supports admin delete behavior with backend-safe fallback.
- Twit media/like handling is aligned to current backend contract (`images`, `meLiked`, `likeCount`).

### Exact next task
- Runtime QA pass against live backend data:
  - verify inventory/request/robot mutations and table refresh behavior
  - verify admin delete on non-owned twits from both feed and detail pages
  - verify twit likes remain consistent across navigation/reload.

## Today's Session Update (2026-05-23, homepage advanced filter wiring + about hero image replacement)

### Completed today
- Wired homepage `libs/components/homepage/HeaderFilter.tsx` advanced filter search action to push `/books` with `query.input` as a serialized `BooksInquiry` object (instead of flat query params).
- Updated `pages/books/index.tsx` to support both query entry paths:
  - parse canonical `input` JSON when present
  - fallback-map legacy flat query keys into `BooksInquiry.search` when `input` is absent.
- Updated `libs/components/property/BookFilter.tsx`:
  - keyword enter/clear now route through `/books?input=...` so keyword filter actually applies through the same URL contract
  - local keyword and rating display now sync from `searchFilter` on external navigation changes.
- Fixed advanced filter category option mismatch in `HeaderFilter` by replacing invalid category value `NOVEL` with `COMICS`.
- Replaced About hero header background for `/about` in `libs/components/layout/LayoutBasic.tsx`:
  - from `/img/banner/aboutBanner.svg`
  - to `/img/aboutUs.webp`.
- Added the new hero background asset file at `public/img/aboutUs.webp`.

### Current stopping point
- Homepage advanced filter and books-page filtering now share a unified URL contract (`/books?input=<BooksInquiry JSON>`) with backward-compatible flat-query parsing on read.
- About page top hero/header uses the new `aboutUs.webp` image.
- Working tree includes these updated files plus the new image asset.

### Exact next task
- Frontend runtime QA pass:
  - from homepage advanced filter -> `/books` result correctness
  - refresh/deep-link persistence for filter state
  - `/about` hero visual check (desktop + mobile crop/alignment).

## Today's Session Update (2026-05-23, Book cards cleanup + image render fix + hero heading alignment)

### Completed today
- Updated book-detail hero heading in `pages/books/detail.tsx` to match shared large-banner typography/placement patterns:
  - switched to Inter/Noto stack and large heading scale
  - moved from centered hero copy to left-aligned container offset.
- Fixed image URL resolution source in `libs/utils.ts`:
  - `resolveMediaUrl` now uses `NEXT_PUBLIC_API_URL` first (with `REACT_APP_API_URL` fallback)
  - this restores image rendering consistency for `/books`, `/books/detail`, and homepage sections using resolver-based media (including Most Borrowed).
- Updated `src/components/books/YouMayAlsoLike.tsx`:
  - removed shiny blue hover accent
  - removed Borrowable/Purchasable badge
  - changed price text color to black.
- Removed category badge rendering on book cards across requested surfaces:
  - homepage: `NewArrivalCard.tsx`, `FeaturedBookCard.tsx`, `MostBorrowedCard.tsx`
  - books list page cards: `libs/components/book/BookCard.tsx`
  - detail related cards: `src/components/books/YouMayAlsoLike.tsx`.

### Current stopping point
- Book cards now render without category pills on homepage, books list, and detail related cards.
- Books/detail/MostBorrowed image paths now resolve via the correct API base env flow.
- Book detail hero heading is aligned to the same visual direction as other major page banners.

### Exact next task
- Frontend visual QA pass on `/`, `/books`, and `/books/detail?id=<id>` to confirm card overlays, image rendering, and hero alignment at desktop + mobile breakpoints.

## Today's Session Update (2026-05-22, About hero stats strip removal + tech stack pills)

### Completed today
- Removed the About hero stats summary from `libs/components/about/AboutHeroSection.tsx`:
  - deleted `HERO_STATS` constant
  - deleted `.about-hero-stats` render block.
- Removed stats-only style blocks from `scss/pc/about/about.scss`:
  - mobile `.about-hero-stats` / `.about-stat`
  - desktop `.about-hero-stats` / `.about-stat`.
- Updated About tech-stack section style rules in `scss/pc/about/about.scss`:
  - `.tech-stack` background changed to `$color-dark`
  - tech heading text colors adjusted (`h2` white, `p` muted)
  - tech pills now white with dark text (`background: $color-white`, `color: $color-dark`)
  - pill shape kept rounded (`border-radius: 100px`) with primary border hover emphasis.
- Added section-scoped heading selector coverage for both `.section-heading` and `.section-header` under `.tech-stack`; no JSX layout change was needed because the heading was already above the pill rows.

### Current stopping point
- About hero no longer renders the 4-stat strip.
- Tech stack section uses dark section background with white chips and dark chip text.

### Exact next task
- Continue About-only visual polish if requested, keeping changes strictly section-scoped.

## Today's Session Update (2026-05-22, About logo cloud marquee + team heading placement)

### Completed today
- Replaced the About robot prototype frame content with the real TurtleBot image (`/img/logo/robot3.png`) inside the existing outer frame.
- Updated Team section structure in `pages/about/index.tsx`:
  - heading/subtext moved out of the grid column
  - structure now uses `team-section` > `team-container` > `section-heading` and `team-grid`
  - team member cards remained unchanged.
- Reworked `libs/components/about/AboutLogoCloudSection.tsx`:
  - removed prev/next button carousel logic (`useState`, `useMemo`, arrow handlers/buttons)
  - switched to auto-scroll marquee track rendering
  - duplicated logo list sequence for seamless looping
  - updated heading to `Built With` and `The technologies powering 같이Go`
  - kept existing logo URLs unchanged.
- Reworked `.about-logo-cloud` SCSS in `scss/pc/about/about.scss` (mobile + desktop blocks only):
  - full-width wrapper with `border-top` and `border-bottom`
  - stage now full width with no max-width clipping
  - added `@keyframes marquee` and hover-pause behavior
  - removed all logo opacity/blur/grayscale/faded-position styling
  - tightened spacing and increased repeated logos to remove visible gaps in the strip.

### Current stopping point
- About page logo cloud now uses continuous marquee auto-scroll with full-color logos and denser spacing.
- Team section heading is centered above the team grid in the requested structure.
- Robot prototype frame now shows the real TurtleBot image only.

### Exact next task
- Continue scoped About page cleanup only when requested; keep edits section-bounded and avoid touching i18n or unrelated pages.

## Today's Session Update (2026-05-22, About hero/intro section)

### Completed today
- Added `libs/components/about/AboutHeroSection.tsx` as the first About page hero/intro section.
- Adapted the 21st.dev-style structure into 같이Go Smart Library conventions: intro copy, service cards, central robot-delivery visual, prototype-oriented stats, and CTA.
- Used existing `/img/homepage/robot_delivery.webp` asset instead of external image URLs.
- Used existing MUI icons because `lucide-react` is not installed.
- Used existing `framer-motion` dependency for subtle viewport animations with reduced-motion support.
- Wired the hero CTA to the existing `/books` route because this checkout does not have `pages/library/*`.
- Replaced the old inline hero in `pages/about/index.tsx` and added mobile hero rendering instead of the previous mobile placeholder.
- Updated only About page styles in `scss/pc/about/about.scss`, including mobile wrapper styles for the hero.
- Removed the old visible placeholder blocks below the new hero: "The Library Crisis", the four crisis/stat cards, the benefit-card row, and the old three-card "How It Works" section.
- Removed the now-unused About-page imports/constants and pruned the dead About-only SCSS selectors for those removed blocks.
- Added `libs/components/about/AboutWorkflowSection.tsx` as the second About page section, directly below the hero.
- The workflow section uses a custom React-state accordion with a desktop preview card and mobile inline preview cards; no Radix, shadcn, Tailwind, lucide, or external image dependency was added.
- Workflow content explains the student-facing delivery path: browse, choose borrow/purchase, confirm destination, robot task handoff, track delivery status, and receive the book.
- Added `libs/components/about/AboutArchitectureSection.tsx` as the third About page section, directly below the hero and workflow sections.
- Replaced the older inline desktop-only architecture block with a cleaner website-friendly system flow: Student Web Platform, Backend + Database, MQTT Communication, Cognitive Processing, and TurtleBot + Gripper.
- Added three supporting architecture detail cards for mission dispatch, route/vision logic, and the live feedback loop.
- The architecture section uses existing MUI icons and SCSS project tokens only; no poster image, external image, new dependency, shadcn, Tailwind, global theme change, or direct MQTT frontend behavior was added.
- Removed the unsupported "Market Opportunity" section from the About page, including market-size, ROI, competing-solution, and global-expansion claims.
- Redesigned the old "Meet the Hardware / 같이Go Delivery Robot" block as a cleaner "Meet the Robot Prototype" section with an icon-based TurtleBot visual card instead of the empty "Robot photo coming soon" box.
- Replaced the old animated "By the Numbers" metrics with a static "Prototype Scope" section using school-project scope only: 50+ catalog records, 15-20 physical demo books, 1 TurtleBot prototype, borrow + purchase request flows, and real-time robot telemetry.
- Replaced the old About pricing/business-model content with "Simple Library Pricing" for students: Borrow / Free, Purchase / Book price, and Robot Delivery / Included.
- Removed unsupported pricing claims from the About pricing section, including hardware unit cost, system infrastructure cost, operations annual fee, SaaS license, maintenance and AI updates, and 24/7 support wording.
- Added `id="about-workflow"` to the About workflow section so the Robot Delivery pricing CTA can scroll to the workflow explanation.
- Added `libs/components/about/AboutLogoCloudSection.tsx` as the final About page content section before the shared layout footer.
- The logo-cloud section now uses the uploaded/reference logo set: Nvidia, Supabase, OpenAI, Turso, Vercel, GitHub, Claude AI, and Clerk.
- Implemented the logo cloud with SCSS only: desktop CSS marquee with reduced-motion support, and static stacked logo cards on mobile. No shadcn/Tailwind structure, `react-use-measure`, or new dependency was added.
- Updated the logo-cloud section background back to white while keeping the individual logo cards dark so the light wordmark SVGs remain visible.
- Restyled the About logo-cloud section to match the screenshot reference more closely: white background, centered "Already used by / Best in the Game" heading, functional black MUI-chevron arrow buttons, a bordered horizontal logo strip, sharp center logo, and faded/blurred side logos.

### Verification
- `npm run build` passed.
- Build still prints the existing `+input` static-generation logs from the account join page.

### Current stopping point
- `/about` now starts with a Smart Library-specific hero/intro section.
- The second `/about` section now explains how Smart Library delivery works with an accordion and active preview panel.
- The third `/about` section now explains the prototype system architecture in a clean card-based flow.
- The following About sections now stay prototype-honest: robot prototype and prototype scope.
- The About pricing section is now student-facing and prototype-honest instead of institution/investor-facing.
- The final About page content section is now a quiet technology strip above the shared footer.
- The old duplicated/problem/benefit/workflow sections are no longer rendered.
- Remaining About page sections after the hero still contain older mixed prototype/business copy and can be cleaned up in separate scoped passes.

### Exact next task
- Continue About page section-by-section cleanup after the hero if requested, keeping each pass scoped.

---

## Today's Session Update (2026-05-21, Groq AI chatbot frontend)

### Completed today
- Replaced the old broadcast group chat component with `libs/components/AiChatBubble.tsx`.
- Deleted `libs/components/Chat.tsx`.
- Installed `react-markdown` and wired assistant markdown rendering.
- Added `scss/pc/chat/ai-chat.scss` and imported it from `scss/pc/main.scss`.
- Updated `LayoutHome.tsx`, `LayoutFull.tsx`, and `LayoutBasic.tsx` to render `<AiChatBubble />`.
- Fixed chatbot logo path to `/img/logo/final_favicon1.png`.
- Chat API base uses `REACT_APP_API_URL` from `libs/config.ts`; that value is sourced from `process.env.NEXT_PUBLIC_API_URL`.
- Frontend consumes backend `/chat/message` response shape `{ reply, books }`.
- Assistant messages can render structured clickable book cards from `books`.
- Book cards route to `/books/detail?id=<bookId>`.
- Added quick prompt chips for common catalog/robot questions.
- Removed in-chat Borrow/Purchase actions; chat book cards now show only `Open`.
- Added 15-minute localStorage persistence for active chat history under `gachi_go_ai_chat_state`.
- Preserved `apollo/client.ts` and did not touch robot websocket code.

### Verification
- Frontend build passed with `yarn build`.
- Backend build passed from backend repo with `npm run build`.
- Remaining frontend build noise is pre-existing: `+input` log from `pages/account/join.tsx` and `react-i18next` static-generation warnings.

### Key rules from this session
- Do not hardcode frontend API URLs; `REACT_APP_API_URL` is the compatibility export in `libs/config.ts`, backed by `NEXT_PUBLIC_API_URL`.
- Do not parse AI prose for actions. Use backend structured fields like `books` for UI cards.
- Do not create borrow/purchase requests from chat; book cards should only open detail pages.
- Chat history should persist for 15 minutes across route navigation, then expire automatically.
- Do not touch `apollo/client.ts` or robot gateway/socket files for chatbot UI work.
- `/books/detail` is still query-param based: `/books/detail?id=<bookId>`.

### Current stopping point
- Chatbot UI, book suggestions, Open-only book cards, and 15-minute chat persistence are implemented and build cleanly.
- Live end-to-end QA with running frontend/backend, MongoDB, and real `GROQ_API_KEY` is still needed.

### Exact next task
- Runtime QA: ask for books, verify cards appear only when asked, click Open, and verify `/books/detail?id=<bookId>` navigation.

---

## Today's Session Update (2026-05-21, MyFavorites + RecentlyVisited redesign + like wiring)

### Completed today
- Redesigned `MyFavorites.tsx`: 3-col `.bk-grid` card layout, PAGE_LIMIT=10, MUI Pagination (same pattern as MyArticles). Cards show category label, like badge with count, cover image, title, author.
- Redesigned `RecentlyVisited.tsx`: same 3-col grid + pagination. Cards show category label + visited date at top, cover, title, author.
- Wired like button in MyFavorites: `LIKE_TARGET_BOOK` mutation + `refetchFavorites`; `FavoriteIcon`/`FavoriteBorderIcon` toggled by `meLiked[0]?.myFavorite`; `e.stopPropagation()` on heart click.
- Fixed card navigation in both panels: routes to `/books/detail?id=${book._id}` (not `/books/${book._id}` — no dynamic route exists).
- Fixed Apollo cache crash (`TypeError: Cannot convert object to primitive value`): added `meLiked { memberId likeRefId myFavorite }` to `LIKE_TARGET_BOOK` mutation return fields in `apollo/user/mutation.ts`. Omitting it caused `writeToStore` to try `String()` on the cached nested object.
- SCSS: replaced old saved-books and viewed-books styles with shared `.bk-*` classes in `scss/pc/mypage/mypage.scss`. All `$font` and `$color-*` only — no hardcoded hex, no external fonts.

### Current stopping point
- All changes committed. Working tree clean.

### Exact next task
- Book detail page (`pages/library/books/[bookId].tsx`) — Smart Library book detail with BORROW/PURCHASE button and `createDeliveryRequest` mutation.

### Uncommitted/untracked files
- None (committed in this session).

---

## Today's Session Update (2026-05-20, Twit posting bug fixes)

### Completed today
- Fixed image upload URL in `CommunityComposer.tsx`: replaced undefined `process.env.REACT_APP_API_GRAPHQL_URL` with `process.env.NEXT_PUBLIC_API_URL}/graphql`. Any twit post with images was silently failing before this fix.
- Aligned twit text character limit with backend: changed frontend limit from 500 → 280 → back to 500 after backend was also raised to 500. Both sides now consistently enforce 500 chars.
  - `CommunityComposer.tsx`: `submitHandler` guard, `/500` counter hint, Post button disabled condition all updated.

### Current stopping point
- Working tree is clean after commit `fd8a163`.

### Exact next task
- Test twit posting end-to-end (text-only and with images) against running backend.

### Uncommitted/untracked files
- None (`git status`: working tree clean).

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
fd8a163 fix: fix twit image upload URL and raise text limit to 500 characters
d3c5270 feat: add comment threading, edit, delete, and like functionality
a80f766 fix: community page UI fixes and image grid improvements
ce808b4 fix: update agents.md
668399d feat: twit like toggle fully working — cleanup debug logs
d5af3e3 fix: wire twit detail viewCount into stats and action row
b711118 fix: remove Library tab from community feed
38481a8 feat: community feed tabs wired to getTwits feedType (FOR_YOU / FOLLOWING)
99aa9c4 feat: finalize twit community updates and image url resolution
```

---

## Session Update (2026-05-24) — Admin dashboard layout and admin entry

### Completed
- MyPage admin status/role entry now links admins to `/_admin/dashboard`.
- Admin dashboard was redesigned to match the Monolith admin dashboard structure while using 같이Go data:
  - 4 stat cards: Total Books, Total Members, Active Requests, Robots Online.
  - Chart row: Member Growth line chart and Requests by Status donut chart.
  - Ranked lists: Top Viewed Books and Top Liked Books.
  - Recent Members table with `View all -> /_admin/users`.
- Dashboard charts use `chart.js/auto`; `chart.js` is pinned to exact `3.8.0`.
- Chart blur fix applied by using Chart.js `devicePixelRatio`, 12px chart labels, and no forced canvas width/height stretching in SCSS.
- Dashboard badge styles updated to requested soft pill colors for USER, DESIGNER, ACTIVE, and BLOCK.

### Verification
- Frontend build was not run because project instructions and the task explicitly said not to run build.
- Backend build was run from the backend repo after enabling `bookLikes` admin sorting and passed.

### Current stopping point
- Frontend dashboard UI changes are implemented and ready for runtime browser QA.
- Backend must be restarted after the `bookLikes` sort validation change for `Top Liked Books` to stop returning `Bad Request Exception`.
