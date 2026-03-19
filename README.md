# inow

MVP monorepo structure for the `inow` mobile app and API.

## Workspaces

- `mobile/`: Expo + React Native app
- `api/`: NestJS API
- `docs/`: product, API, DB, UX, and implementation documents

## Scripts

- `npm run dev:mobile`
- `npm run dev:api`
- `npm run lint`
- `npm run test`
- `npm run typecheck`

## Environment

Copy `.env.example` to `.env` and fill in the required values before running the app or API.

## Local Database

Run PostgreSQL locally with Docker:

```bash
docker compose up -d postgres
```

The default local connection string is already set in `.env.example`:

```env
DATABASE_URL=postgres://inow:inow@localhost:5432/inow
```

After the database is up:

```bash
npm run build --workspace api
npm run db:migrate --workspace api
npm run db:seed --workspace api
```

## Local Upload Storage

Uploaded files are stored under `api/storage/uploads` in local development.
