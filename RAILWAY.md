# Deploy Ingobyi Academy on Railway (testing)

Use **two separate Railway services** from the same GitHub repo — one for the API, one for the frontend. Do **not** run both in a single service or with `concurrently`.

| Service | Root directory | Build | Start |
|---------|----------------|-------|-------|
| **PostgreSQL** | Railway plugin | — | — |
| **API** | `backend` | `npm run build` | `npm run start:railway` |
| **Frontend** | `frontend` | `npm run build` | `npm run start` |

Config files (auto-detected when root directory is set):

- `backend/railway.toml` + `backend/nixpacks.toml`
- `frontend/railway.toml` + `frontend/nixpacks.toml`

---

## Quick setup (dashboard)

### 0. Prepare locally (optional)

```bash
./scripts/railway-setup.sh   # prints secrets + deploy checklist
```

### 1. Create project

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. **+ New** → **Database** → **PostgreSQL**

### 2. Backend (API) service

1. **+ New** → **GitHub Repo** → same repository
2. **Settings** → **Root Directory** → `backend`
3. **Settings** → rename service to `api` (optional, for variable references)
4. **Networking** → **Generate Domain** → note URL, e.g. `https://ingobyi-api.up.railway.app`
5. **Variables** — copy from `backend/.env.railway.example`:

```env
NODE_ENV=staging
FRONTEND_URL=https://YOUR-FRONTEND.up.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}

JWT_SECRET=<openssl rand -hex 32>
REFRESH_SECRET=<openssl rand -hex 32>
JWT_EXPIRES_IN=1h
REFRESH_EXPIRES_IN=180d

COOKIE_SECURE=true
COOKIE_DOMAIN=

ENABLE_SWAGGER=true
RUN_SEED=false

THROTTLE_TTL=60
THROTTLE_LIMIT=200
```

6. Deploy. On each start the API runs `prisma migrate deploy` automatically via `npm run start:railway`.
7. Verify: `curl https://YOUR-API.up.railway.app/api/health`

> **Important:** Railway must use start command `npm run start:railway` (configured in `backend/railway.toml`).  
> Do **not** use `npm start` or `npm run start:prod` — those skip migrations.

### 3. Frontend service

1. **+ New** → **GitHub Repo** → same repository
2. **Root Directory** → `frontend`
3. Rename service to `frontend` (optional)
4. **Networking** → **Generate Domain**
5. **Variables** — set **before** first build (`NEXT_PUBLIC_*` is baked at build time):

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://YOUR-API.up.railway.app/api
NEXT_PUBLIC_WS_URL=https://YOUR-API.up.railway.app
NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true
```

Or with service references (if services are named `api` and `frontend`):

```env
NEXT_PUBLIC_API_URL=https://${{api.RAILWAY_PUBLIC_DOMAIN}}/api
NEXT_PUBLIC_WS_URL=https://${{api.RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true
```

6. Deploy and open the frontend URL.

### 4. Link CORS (required)

Update **API** service:

```env
FRONTEND_URL=https://YOUR-FRONTEND.up.railway.app
```

Redeploy the API so CORS, cookies, and WebSockets accept the frontend origin.

### 5. Seed demo data (first time only)

**Option A — Railway CLI (recommended)**

```bash
npm i -g @railway/cli
railway login
./scripts/railway-seed.sh
```

**Option B — one-time env var**

Set on API service: `RUN_SEED=true` → deploy → set back to `false` → redeploy.

Demo login: `super@ingobyi.com` / `password123` (also `student@ingobyi.com`)

### 6. Smoke test

```bash
./scripts/railway-health.sh \
  https://YOUR-API.up.railway.app \
  https://YOUR-FRONTEND.up.railway.app
```

---

## Auto-deploy on git push

Railway redeploys each service when files under its **Root Directory** change.

| Push changes in… | Redeploys |
|------------------|-----------|
| `backend/**` | API service only |
| `frontend/**` | Frontend service only |

Connect both services to the same branch (e.g. `main`) in **Settings → Source**.

---

## Environment templates

| File | Service |
|------|---------|
| `backend/.env.railway.example` | API variables |
| `frontend/.env.railway.example` | Frontend variables |

### Important variables

| Variable | Where | Notes |
|----------|-------|-------|
| `DATABASE_URL` | API | `${{Postgres.DATABASE_URL}}` |
| `FRONTEND_URL` | API | Exact frontend URL, `https://`, no trailing slash |
| `NEXT_PUBLIC_API_URL` | Frontend | Must end with `/api` |
| `NEXT_PUBLIC_WS_URL` | Frontend | API origin, **no** `/api` |
| `PORT` | Both | Set by Railway — do not override |
| `RUN_SEED` | API | `true` once for demo data, then `false` |

---

## CLI cheat sheet

```bash
# Logs
railway link          # in backend/ or frontend/
railway logs

# Seed
./scripts/railway-seed.sh

# Shell on API container
cd backend && railway run sh

# Redeploy from CLI
railway up
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API build fails | Link `DATABASE_URL=${{Postgres.DATABASE_URL}}` to Postgres plugin |
| Frontend can't reach API | `NEXT_PUBLIC_API_URL` must be `https://.../api` — redeploy frontend after change |
| Login works, refresh fails | `COOKIE_SECURE=true`, `FRONTEND_URL` matches browser URL exactly, empty `COOKIE_DOMAIN` |
| CORS error | Update `FRONTEND_URL` on API, redeploy API |
| WebSocket fails | `NEXT_PUBLIC_WS_URL` = API origin without `/api` |
| Env change not applied (frontend) | Redeploy frontend — `NEXT_PUBLIC_*` requires rebuild |
| Migrations failed | Check API logs; ensure Postgres is running and `DATABASE_URL` is set |
| `Permission` table does not exist | Migrations not applied — use `start:railway`, or run `make railway-migrate` locally |
| Seed fails | Use `./scripts/railway-seed.sh` or set `RUN_SEED=true` once |

---

## Production checklist (after testing)

- [ ] `NODE_ENV=production` on API
- [ ] `ENABLE_SWAGGER=false`
- [ ] `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false`
- [ ] `RUN_SEED=false` (never seed production)
- [ ] Strong `JWT_SECRET` / `REFRESH_SECRET`
- [ ] Configure SMTP + Cloudinary
- [ ] Custom domains + update all URLs

For Docker-based in-house hosting instead, see **[DEPLOY.md](DEPLOY.md)**.
