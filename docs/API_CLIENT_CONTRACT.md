# API Client Contract

## Backend contract baseline

- Backend: NestJS GraphQL-first backend
- Frontend app data transport: GraphQL (Apollo)
- Frontend live transport: WebSocket
- Frontend must not call MQTT directly

## Environment variable rules

- Do not hardcode backend URLs in components
- Keep API and WS endpoints environment-driven using this repo's established pattern

## Domain organization

Keep frontend API modules organized by backend domain:
- `book`
- `bookInventory`
- `robot`
- `request`
- `twit`
- `follow`
- `member`
- `twitComment`

Prefer isolated Smart Library operations (for example under `apollo/library/*`) rather than mixing with legacy real-estate operations.

## Request flow contract for frontend

- Student creates BORROW or PURCHASE request
- Backend decides assignment and lifecycle transitions
- Frontend should not reproduce backend assignment rules in UI

Common status expectations for UI:
- `READY` = delivered and waiting for pickup
- `READY` != `COMPLETED`
- `BOOK_NOT_FOUND` = actionable failure message
- Offline timeout before `READY` = delivery failure state
- After `READY`, robot data may show reusable state (`IDLE`, `currentRequestId: null`)

## Nested request payload fields

Request-related pages can consume nested response fields:
- `bookData`
- `robotData`
- `inventoryData`
- `memberData`

## Pickup model contract

Use only fixed gripper pickup fields from backend inventory models:
- `gripperOpenWidthCm`
- `gripperCloseWidthCm`
- `gripHoldSeconds`
- `pickupDirection`

Do not use removed fork/container fields.

## Error handling contract

- Show backend request/robot failure states with student-friendly language
- Keep auth failures visible and route user to login flow when appropriate
