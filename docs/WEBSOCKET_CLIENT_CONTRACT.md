# WebSocket Client Contract

## Purpose

Define how Smart Library live tracking must use WebSocket without colliding with existing chat socket behavior.

## Non-negotiable rules

- Do not connect frontend to MQTT.
- Do not mix robot tracking handlers with existing chat/general socket handlers.
- Do not overwrite chat `onmessage` logic with tracking logic.

## Isolation strategy

Use dedicated modules for tracking:
- `libs/library/ws/trackingClient.ts`
- `libs/library/ws/trackingEvents.ts`
- `libs/library/ws/useTracking.ts` (hook, optional)

Keep chat behavior in existing chat modules untouched.

## Event model (example)

Incoming events should be namespaced and explicit:
- `library.tracking.connected`
- `library.tracking.update`
- `library.tracking.status_changed`
- `library.tracking.error`

Payload baseline:
- `requestId: string`
- `robotId: string`
- `status: string`
- `position: { floorId?: string, x?: number, y?: number, zone?: string }`
- `updatedAt: string`

Status meaning notes for UI:
- `READY` means delivered and ready for pickup
- `READY` does not mean `COMPLETED`
- Offline timeout before `READY` should be displayed as delivery failure

## Connection lifecycle

- Connect only when tracking page or dashboard needs live data.
- Reconnect with bounded retry/backoff.
- Cleanly close socket on unmount.
- Provide stale-state indicator if disconnected.

## Fallback behavior

If WebSocket is unavailable:
- Keep last known tracking state visible.
- Show a reconnecting/offline indicator.
- Optionally poll GraphQL fallback endpoint if backend provides it.
