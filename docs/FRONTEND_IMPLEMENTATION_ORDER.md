# Frontend Implementation Order

## Goal

Add Smart Library frontend features incrementally without breaking existing real-estate UI.

## Ordered steps

1. Documentation baseline
- Ensure agent and architecture docs exist and are current.

2. Environment baseline
- Maintain `.env.example` with required API and WS variables.

3. API contract layer
- Add isolated Smart Library GraphQL operations under `apollo/library`.
- Do not change real-estate operation files unless necessary.

4. Student books list page
- Build `/library/books` first.
- Include search/filter/pagination/loading/error states.

5. Book detail + request flow
- Build `/library/books/[id]`.
- Add request mutation and success/failure feedback.

6. Request history
- Build `/library/requests`.
- Link active requests to tracking page.

7. Tracking page with mock stream
- Build `/library/tracking/[requestId]` using mocked events first.

8. Real WebSocket tracking integration
- Swap mocked stream with isolated tracking client.

9. Admin pages
- Build `/_admin/library`, `/_admin/library/requests`, `/_admin/library/robots`, `/_admin/library/books`.

10. Stabilization
- Run lint/build checks.
- Fix regressions.
- Keep old routes intact until sign-off.

## Definition of done per step

- Route renders correctly in desktop and mobile layouts.
- Uses environment-driven backend URLs.
- Uses isolated GraphQL/WS contracts.
- Does not break existing real-estate pages.
