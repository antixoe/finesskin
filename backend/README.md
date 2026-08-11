# Backend

Next.js app with Prisma. Local laptop development now defaults to SQLite so you can run it without Docker or a separate database server.

## Local setup without Docker

1. Use the default local env:

```text
DATABASE_URL="file:./prisma/dev.db"
```

2. Install dependencies:

```bash
npm install
```

3. Create the schema and seed demo data:

```bash
npm run db:push
npm run db:seed
```

To enable Fie, create `backend/.env.local` and add a Gemini API key from Google AI Studio:

```text
GEMINI_API_KEY="your-key-here"
```

Restart the backend after changing the environment file. Keep this key server-side; do not put it in the frontend environment.

4. Run the app:

```bash
npm run dev
```

## PostgreSQL mode

If you want the original PostgreSQL setup again, use a Postgres URL in `backend/.env.local` and regenerate the Prisma client for the Postgres schema before pushing:

```bash
npm run db:generate:postgres
npm run db:push:postgres
npm run db:seed
```

Example connection string:

```text
DATABASE_URL="postgresql://app_user:app_password@localhost:5432/finesskin"
```

## Verify

- Open `http://localhost:3000` to see the dashboard.
- Open `http://localhost:3000/api/db` to check the JSON health response.
