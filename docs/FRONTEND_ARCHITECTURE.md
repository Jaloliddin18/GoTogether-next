# Frontend Architecture

## Role

The frontend is the user interface layer for the Smart Library Robot Delivery system.

It should:
- Display book catalog search
- Display book details
- Allow students to request robot delivery
- Show live robot tracking
- Show request history
- Provide staff/admin monitoring pages

It should NOT:
- Control robot motors
- Communicate with MQTT
- Store permanent robot state locally
- Implement backend business rules
- Rewrite existing real-estate pages before MVP is stable

## Existing architecture

This project uses:
- Next.js Pages Router
- TypeScript
- Apollo GraphQL
- SCSS
- Material UI
- Existing layouts under `libs/components/layout`
- Existing admin pages under `pages/_admin`

## Smart Library route strategy

Create new routes instead of replacing old ones.

Student:
- `/library/books`
- `/library/books/[id]`
- `/library/tracking/[requestId]`
- `/library/requests`

Admin:
- `/_admin/library`
- `/_admin/library/requests`
- `/_admin/library/robots`
- `/_admin/library/books`

## Architecture flow

```text
Student browser
-> Next.js frontend
-> Apollo GraphQL client
-> NestJS backend GraphQL API
-> Database (via backend)

Robot tracking
Robot -> MQTT -> NestJS backend -> WebSocket -> Next.js frontend
```

## Isolation principle for live tracking

- Keep robot tracking WebSocket logic in dedicated library modules.
- Do not bind robot tracking handlers to existing chat socket handlers.
- Do not reuse chat event names for robot events.

## Backward-compatibility principle

- Existing real-estate pages remain intact during Smart Library rollout.
- New Smart Library pages are additive.
- Migration from old domain pages to library pages happens only after MVP stability.
