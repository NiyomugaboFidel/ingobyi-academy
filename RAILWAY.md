# Deploy Ingobyi Academy on Railway

Railway runs **3 services** from this monorepo:

| Service | Root directory | URL |
|---------|----------------|-----|
| **PostgreSQL** | (Railway plugin) | internal only |
| **API** | `/backend` | `https://your-api.up.railway.app` |
| **Frontend** | `/frontend` | `https://your-app.up.railway.app` |

---

## 1. Create Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → select `ingobyi-academy`
3. **Add PostgreSQL**: Project → **+ New** → **Database** → **PostgreSQL**

---

## 2. Deploy the API (backend)

1. **+ New** → **GitHub Repo** → same repo
2. **Settings** → **Root Directory** → `backend`
3. **Settings** → **Networking** → **Generate Domain** (e.g. `ingobyi-api-production.up.railway.app`)
4. **Variables** tab — add:

```env
NODE_ENV=production
FRONTEND_URL=https://YOUR-FRONTEND-DOMAIN.up.railway.app

DATABASE_URL=${{Postgres.DATABASE_URL}}

JWT_SECRET=<openssl rand -hex 32>
REFRESH_SECRET=<openssl rand -hex 32>
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d

COOKIE_SECURE=true
COOKIE_DOMAIN=

ENABLE_SWAGGER=true
SHOW_DEMO_CREDENTIALS=true
RUN_SEED=false

THROTTLE_TTL=60
THROTTLE_LIMIT=200

# Optional — image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional — email OTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@ingobyi.com
```

5. Deploy. Migrations run automatically (`npm run start:railway`).
6. Verify: `https://YOUR-API-DOMAIN.up.railway.app/api/health`

---

## 3. Deploy the frontend

1. **+ New** → **GitHub Repo** → same repo again
2. **Root Directory** → `frontend`
3. **Networking** → **Generate Domain** (e.g. `ingobyi-app-production.up.railway.app`)
4. **Variables** — set **before** build (Next.js bakes `NEXT_PUBLIC_*` at build time):

```env
NODE_ENV=production

NEXT_PUBLIC_API_URL=https://YOUR-API-DOMAIN.up.railway.app/api
NEXT_PUBLIC_WS_URL=https://YOUR-API-DOMAIN.up.railway.app
NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true
```

5. Deploy and open `https://YOUR-FRONTEND-DOMAIN.up.railway.app`

---

## 4. Link frontend URL on API

After frontend has a domain, update **API service** variables:

```env
FRONTEND_URL=https://YOUR-FRONTEND-DOMAIN.up.railway.app
```

Redeploy API so CORS and WebSocket allow the frontend origin.

---

## 5. Seed demo data (first time)

Install [Railway CLI](https://docs.railway.app/develop/cli):

```bash
npm i -g @railway/cli
railway login
cd backend
railway link          # select project + API service
railway run npm run prisma:seed
```

Demo login: `super@ingobyi.com` / `password123`

---

## Service reference

Copy from `backend/.env.railway.example` and `frontend/.env.railway.example`.

### Railway variable references

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `FRONTEND_URL` | `https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}` *(if service named `frontend`)* |
| `NEXT_PUBLIC_API_URL` | `https://${{api.RAILWAY_PUBLIC_DOMAIN}}/api` *(if service named `api`)* |

Rename services in Railway to `api` and `frontend` to use these references, or paste full URLs manually.

---

## Custom domains

1. Railway → service → **Settings** → **Custom Domain**
2. Point DNS CNAME to Railway
3. Update `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`
4. Redeploy **both** services

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API build fails | Check `DATABASE_URL` is linked to Postgres |
| Frontend can't reach API | `NEXT_PUBLIC_API_URL` must include `/api` and use `https://` |
| Login works, refresh fails | `COOKIE_SECURE=true`, `FRONTEND_URL` exact match, empty `COOKIE_DOMAIN` |
| CORS error | Update `FRONTEND_URL` on API, redeploy API |
| WebSocket fails | `NEXT_PUBLIC_WS_URL` = API origin (no `/api`) |
| DB connection error | Use `${{Postgres.DATABASE_URL}}`; Railway adds SSL automatically |
| Env change not applied (frontend) | Redeploy frontend — `NEXT_PUBLIC_*` needs rebuild |

### Logs

```bash
railway logs -s api
railway logs -s frontend
```

---

## Production checklist (after in-house testing)

- [ ] `ENABLE_SWAGGER=false`
- [ ] `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false`
- [ ] `SHOW_DEMO_CREDENTIALS=false` on API if used
- [ ] Strong `JWT_SECRET` / `REFRESH_SECRET` (never use defaults)
- [ ] Do **not** run seed in production
- [ ] Configure SMTP + Cloudinary
- [ ] Custom domains + HTTPS (Railway provides TLS)
