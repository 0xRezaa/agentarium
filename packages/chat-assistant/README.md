# chat-assistant

This project demos a simple chat-assistant app that is driven by WebLLM.
Conversations allow branching and are stored in Postgres.

## Development

```sh
npm install
npm run db:up -w @0xrezaa/chat-assistant
npm run dev -w @0xrezaa/chat-assistant
```

The frontend runs on Vite's local dev server. The Hono API defaults to
`http://localhost:3000`, or another port when `PORT` is set.

pgAdmin is available at `http://localhost:5050` after `db:up`.

- Email: `admin@local.test`
- Password: `admin`
- Registered server: `chat-assistant`
- Database password: `chat_assistant`
