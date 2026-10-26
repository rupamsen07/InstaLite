# InstaLite API

## Setup

1. Install dependencies with `npm install`.
2. Create a PostgreSQL database and copy `.env.example` to `.env`.
3. Set `DATABASE_URL` in `.env` to the database connection string.
4. Apply the Prisma schema with `npx prisma migrate dev --name init`.
5. Start the API with `npm start`.

The API listens on port `3000` by default. Set `PORT` in `.env` to use another
port. `GET /health` returns `{ "status": "OK" }`.

## Routes

Users: `POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`,
`DELETE /users/:id`.

Posts: `POST /posts`, `GET /posts`, `GET /posts/:id`, `PATCH /posts/:id`,
`DELETE /posts/:id`.
