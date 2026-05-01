# API Client Contract

## Backend contract baseline

- Backend: NestJS GraphQL-first
- Frontend transport for app data: GraphQL (Apollo)
- Frontend must not call MQTT

## Environment variables

Required:
- `REACT_APP_API_URL`
- `REACT_APP_API_GRAPHQL_URL`
- `REACT_APP_API_WS`

Rules:
- Do not hardcode API base URLs in components.
- Read URLs through environment variables only.

## Apollo integration rules

- Use existing Apollo client entrypoint: `apollo/client.ts`.
- Keep existing auth header behavior (`Authorization: Bearer <token>`).
- Keep Smart Library operations isolated from real-estate operations.

Recommended structure:
- `apollo/library/query.ts`
- `apollo/library/mutation.ts`
- `apollo/library/types.ts` (optional)

## Operation naming convention

Queries:
- `GET_LIBRARY_BOOKS`
- `GET_LIBRARY_BOOK`
- `GET_LIBRARY_REQUESTS`
- `GET_ADMIN_LIBRARY_REQUESTS`
- `GET_ADMIN_LIBRARY_ROBOTS`

Mutations:
- `CREATE_LIBRARY_DELIVERY_REQUEST`
- `CANCEL_LIBRARY_DELIVERY_REQUEST` (if backend supports)
- `UPDATE_LIBRARY_BOOK_STATUS` (admin, if backend supports)

## Error handling contract

- Use consistent UI error handling (existing sweetAlert pattern is acceptable).
- Surface backend error messages clearly for operational pages.
- Do not swallow auth errors; redirect or prompt login as needed.

## Auth/role contract

- Token source remains localStorage `accessToken`.
- Frontend role checks are UI guards only.
- Backend remains source of truth for authorization.
