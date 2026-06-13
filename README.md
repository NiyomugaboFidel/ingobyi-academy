# Ingobyi Academy

Multi-tenant learning platform — schools, training centers, and organizations.

| | Stack |
|---|--------|
| Frontend | Next.js 16, React 19, Tailwind |
| Backend | NestJS 10, Prisma, PostgreSQL 16 |
| Deploy | Docker Compose (full stack) |

## Run with Docker (recommended)

```bash
make docker-init    # creates .env + secrets
make docker-up      # postgres + API + frontend + nginx
make docker-seed    # demo users (first time)
```

**App:** http://localhost  
**Demo:** `super@ingobyi.com` / `password123`

See **[DEPLOY.md](DEPLOY.md)** for Docker / LAN hosting.

### Railway (cloud)

See **[RAILWAY.md](RAILWAY.md)** — deploy API + frontend + Postgres on Railway.

```text
backend/   → Railway service (root: /backend)
frontend/  → Railway service (root: /frontend)
Postgres   → Railway database plugin
```

## Development

**Option A — Docker hot reload**
```bash
make docker-dev
# Frontend http://localhost:3000  API http://localhost:3001/api
```

**Option B — Local Node**
```bash
cd backend && docker compose up -d postgres
cd backend && npm install && npm run prisma:migrate && npm run prisma:seed && npm run start:dev
cd frontend && npm install && npm run dev
```

## Project layout

```
ingobyi-academy/
├── docker-compose.yml       # Full stack (staging/production)
├── docker-compose.dev.yml   # Dev overlay (hot reload)
├── nginx/                   # Reverse proxy config
├── scripts/                 # docker-init.sh, docker-up.sh
├── backend/                 # NestJS API
├── frontend/                # Next.js app
└── DEPLOY.md                # Deployment guide
```

## Tests

```bash
cd backend && npm run test:e2e   # 21 integration tests
cd frontend && npm run build
```
