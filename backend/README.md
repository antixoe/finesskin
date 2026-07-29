# Backend

Next.js app wired to a Dockerized Postgres database.

## Setup

1. Start the database:

```bash
docker compose -f docker.compose.yml up -d db
```

2. Create `backend/.env.local` from `backend/.env.local.example`.

3. Run the app:

```bash
npm run dev
```

## Verify

- Open `http://localhost:3000` to see the connection status.
- Open `http://localhost:3000/api/db` to check the JSON health response.
