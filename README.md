# HeadsUp

A self-contained web UI for the Headscale API.

## Configuration

Set env vars (the app reads both `VITE_*` and non-prefixed variants):

- `VITE_BASE_URL` (or `BASE_URL`) – base URL to your Headscale instance
- `VITE_APIKEY` (or `APIKEY`) – API key used as `Authorization: Bearer <key>`

Create a local `.env`:

```bash
cp .env.example .env
```

## Run

```bash
npm install
npm run dev
```

## Security note

When creating secrets like **PreAuth keys** and **API keys**, the UI will display the secret exactly once in a dedicated dialog and does not persist it.
