# Ingobyi Academy

Multi-tenant learning platform for schools, training centers, and organizations.

## Run locally (fastest — recommended for development)

**Requirements:** Node 20+, PostgreSQL on `localhost:5432`

```bash
# 1. Database (if not already running)
cd backend && docker compose up -d postgres   # needs Docker + compose plugin
# OR use your local PostgreSQL with credentials in backend/.env

# 2. First-time setup
cd backend && npm install && npx prisma migrate deploy && npm run prisma:seed
cd frontend && npm install

# 3. Start both servers
make dev
# or: ./scripts/dev-local.sh
# or: npm run dev
```

**Production mode (local):**

```bash
npm run build   # build backend + frontend once
npm run start   # API :3001 + frontend :3000
```

- **Frontend:** http://localhost:3000  
- **API:** http://localhost:3001/api  
- **Demo login:** `super@ingobyi.com` / `password123`

> **Note:** Frontend dev uses `--webpack` (not Turbopack) because Turbopack can hang on this project.

## Run with Docker (in-house testers)

See **[DEPLOY.md](DEPLOY.md)** for full instructions.

## Deploy on Railway (testing / shareable URL)

See **[RAILWAY.md](RAILWAY.md)** — two services (`backend` + `frontend`) + PostgreSQL, auto-deploy from GitHub.

```bash
./scripts/railway-setup.sh    # checklist + generate JWT secrets
./scripts/railway-seed.sh      # demo users (after deploy)
./scripts/railway-health.sh https://your-api.up.railway.app https://your-app.up.railway.app
```

```bash
make docker-init    # create .env with secrets
make docker-check   # verify Docker access
make docker-up      # build & start nginx + API + web + postgres
make docker-seed    # demo users (first time)
```

**Docker setup on Ubuntu:**
```bash
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# log out and back in, then:
make docker-up
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend hangs / blank page | Kill stale process: `kill -9 $(lsof -t -i:3000)` then `make dev` |
| `EADDRINUSE :3000` | Port in use — run command above |
| `docker: permission denied` | `sudo usermod -aG docker $USER` and re-login |
| `docker compose not found` | `sudo apt install docker-compose-plugin` |
| API 401 / login fails | Run `cd backend && npm run prisma:seed` |
| DB connection error | Check `DATABASE_URL` in `backend/.env` |

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind |
| Backend | NestJS 10, Prisma, PostgreSQL |
| Auth | JWT + httpOnly refresh cookies |
