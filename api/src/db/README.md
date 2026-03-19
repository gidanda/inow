# DB Layer

## Current state

- `DatabaseService` provides an optional Drizzle + PostgreSQL connection.
- If `DATABASE_URL` is not set, the API keeps running with the in-memory store.
- Health responses expose whether the DB is configured.

## Intended migration path

1. Keep controllers and service contracts stable.
2. Move read/write logic from `InMemoryStore` into repository classes.
3. Swap repository implementations to use `DatabaseService.db`.
4. Remove in-memory fallback only after end-to-end routes are covered by real DB tests.
