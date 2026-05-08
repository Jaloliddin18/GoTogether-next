# Frontend Implementation Order

## Goal

Ship student-facing Smart Library frontend features that map directly to completed backend scope.

## Current phase boundary

- Student-facing development first
- Admin/staff dashboard frontend is intentionally skipped for now

## Ordered steps

1. Book list page
- Build `/library/books`
- Include loading/empty/error/pagination states

2. Book detail page
- Build `/library/books/[id]`
- Render inventory-aware availability details

3. BORROW/PURCHASE actions
- Add request creation actions on book detail
- Treat backend as source of truth for assignment/lifecycle logic

4. Request status/history page
- Build `/library/requests`
- Show clear status language, including `READY` vs `COMPLETED`

5. Robot tracking UI
- Build `/library/tracking/[requestId]`
- Use WebSocket updates for live request/robot status
- Keep GraphQL snapshot fallback path if needed

6. Community Twit feed
- Wire frontend to Twit backend capabilities

7. Profile/follow/comments pages
- Wire profile/follow/twit-comment features
- Keep terminology student-friendly and domain-correct

## Rules during implementation

- Do not create admin dashboard pages unless explicitly requested
- Do not reintroduce old real-estate naming in new modules
- Do not use removed fork/container fields
- Use fixed gripper language and fields only
- Keep `floorId` in coordinate models
