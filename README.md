# LinkHub

Link-in-bio product: one public page for links, theme, and a shop with product collections.

Monorepo layout:

| Path | Stack | Default port |
|------|--------|--------------|
| [`api/`](api/) | Express + MongoDB + JWT | `3000` |
| [`web/`](web/) | Next.js (App Router) + React Query | `3001` |

## Features

- Auth (signup, login, email verify, forgot/reset password)
- Onboarding (username → about → socials → theme → links → tags)
- Dashboard: links, profile/photos, themes + button shapes, shop, analytics, settings
- Shop: products, buy/affiliate links, **collections** (grouped on the public page)
- Public profile at `/u/[username]` (views, clicks, shares tracked)

## Prerequisites

- Node.js **22.x**
- Yarn
- MongoDB (local or Atlas)
- Optional for uploads: [MinIO](https://min.io/) (local S3) or Cloudflare R2 / AWS S3
- Optional for email: SMTP credentials (Mailtrap works for local)

## Quick start

### 1. API

```bash
cd api
cp .env.example .env   # then add DATABASE, JWT, email — see below
yarn install
yarn dev
```

API: `http://127.0.0.1:3000`

### 2. Web

```bash
cd web
cp .env.example .env.local
yarn install
yarn dev
```

App: `http://127.0.0.1:3001`

### 3. Image uploads (optional)

From the repo root:

```bash
./scripts/start-minio.sh          # Terminal A — MinIO on :9000
./scripts/init-minio-bucket.sh    # once
```

Copy the MinIO block from [`api/.env.example`](api/.env.example) into `api/.env`, then restart the API.

## Environment

### API (`api/.env`)

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Signing secret |
| `JWT_EXPIRES_IN` | yes | e.g. `90d` |
| `JWT_COOKIE_EXPIRES_IN` | yes | Days for cookie, e.g. `90` |
| `EMAIL_FROM` | yes | Sender address |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USERNAME` / `EMAIL_PASSWORD` | yes | SMTP |
| `FRONTEND_URL` | recommended | Default `http://127.0.0.1:3001` — used in verify/reset links |
| `PORT` | no | Default `3000` |
| `S3_*` | for uploads | See `.env.example` (MinIO or R2/AWS) |

### Web (`web/.env.local`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_API_URL` | no | Default `http://127.0.0.1:3000` (browser) |
| `API_URL` | no | Server-side fetch to API; falls back to `NEXT_PUBLIC_API_URL` then `http://127.0.0.1:3000` |
| `NEXT_PUBLIC_APP_HOST` | no | Host shown in marketing URL chips (default `linkhub.app`) |

CORS on the API allows `localhost:3001` / `127.0.0.1:3001`. Update [`api/src/app.ts`](api/src/app.ts) if you use another origin.

## Scripts

**API**

```bash
yarn dev      # nodemon + tsx
yarn build    # tsc → dist/
yarn start    # node dist/server.js
```

**Web**

```bash
yarn dev      # Next on :3001
yarn build
yarn start
yarn lint
```

## API overview

Base path: `/api/v1`

| Area | Examples |
|------|----------|
| Auth / users | `/users/signup`, `/login`, `/forgotPassword`, … |
| Profiles | `/profiles/me`, `/profiles/u/:username` |
| Links | `/links/me`, `/links/u/:username`, `/links/r/:id` (click redirect) |
| Products | `/products/me`, `/products/u/:username` |
| Collections | `/collections/me`, `/collections/u/:username` |
| Themes | `/themes` |
| Analytics | `/analytics/me`, view/share recording under `/analytics/u/:username/…` |

Bruno requests live in [`api/bruno/`](api/bruno/) (dev environment included).

## Project structure

```
linkhub/
├── api/                 Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── …
│   └── bruno/           API collection
├── web/                 Next.js app
│   ├── app/             Routes (landing, auth, onboarding, profile, /u/[username])
│   ├── components/
│   └── lib/
└── scripts/             MinIO helpers
```

## License

MIT — see [`api/package.json`](api/package.json).
