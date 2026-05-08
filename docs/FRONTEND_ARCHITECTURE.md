# Frontend Architecture

## Project identity

- Product: 같이Go Smart Library/bookstore robot delivery
- Current frontend phase: student-facing features first
- Admin/staff dashboard frontend scope is intentionally deferred for now

## Backend capabilities available to frontend

Frontend can rely on completed backend domains and flows:
- Book APIs
- BookInventory APIs
- Robot APIs
- Request APIs for BORROW and PURCHASE
- Request status lifecycle updates from backend
- MQTT-backed robot command lifecycle (backend-managed)
- WebSocket robot/request tracking gateway
- Twit feed backend
- Follow backend
- Member profile backend
- Twit comments backend (deleted comments filtered from list query)

## Transport and ownership boundaries

- App data transport: GraphQL (Apollo)
- Live tracking transport: WebSocket
- Frontend must not communicate with MQTT directly
- Backend is the source of truth for request/robot lifecycle

## Request lifecycle meaning for UI

- Student creates BORROW or PURCHASE request
- Backend assigns book/inventory/robot when possible
- Backend publishes robot commands over MQTT
- Robot telemetry updates backend state
- Backend pushes live updates over WebSocket

UI semantics:
- `READY` means delivered and ready for student pickup
- `READY` does not mean `COMPLETED`
- `COMPLETED` should represent finalized student pickup/flow when product logic uses it
- `BOOK_NOT_FOUND` should be shown as a clear failure state
- Offline timeout before `READY` should be shown as robot/offline delivery failure
- After `READY`, frontend should reflect robot availability again (`IDLE`, `currentRequestId: null`)

## Robot and pickup model vocabulary

Use fixed gripper terminology only:
- Robot has no fork lift
- Robot has no moving arm
- Robot has a fixed gripper that opens/closes
- Delivery sequence: drive to pickup coordinate -> open gripper -> close on book -> carry -> open to release

BookInventory pickup fields supported by backend:
- `gripperOpenWidthCm`
- `gripperCloseWidthCm`
- `gripHoldSeconds`
- `pickupDirection`

Do not reintroduce removed fork/container concepts in UI labels or types.

## Coordinate model note

- Keep `floorId` in coordinate/map models even for the one-floor demo.

## Request-related nested data

Request outputs can include nested objects that frontend pages can render directly:
- `bookData`
- `robotData`
- `inventoryData`
- `memberData`

## Migration and naming policy

- Keep legacy real-estate pages intact during student MVP rollout
- Add Smart Library pages incrementally under `pages/library/*`
- Do not reintroduce real-estate naming in new frontend modules
