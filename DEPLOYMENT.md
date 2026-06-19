# DocVerify — Deployment Guide

Portfolio deployment for job hunting (KSA / remote). This project has **two parts**: a Next.js frontend and a Go API with PostgreSQL + S3-compatible storage.

---

## Health check (local — verified)

| Check | Result |
|-------|--------|
| Go tests | Pass |
| Go build | Pass |
| Frontend `npm run build` | Pass |
| API audit (`backend/scripts/api-audit.ps1`) | **23/23 pass** |
| Backend `/health` | `{"status":"ok"}` |

**Routes:** `/`, `/login`, `/register`, `/dashboard`, `/upload`, `/verify/[id]`, `/preview/[id]`

---

## Can the backend run on Vercel?

**No — not recommended.**

| Requirement | Vercel | What you need |
|-------------|--------|----------------|
| Next.js frontend | ✅ Perfect | Vercel |
| Go long-running API | ❌ Serverless only | Render / Railway / Fly.io |
| PostgreSQL | ❌ Not included | Neon (free) or Render Postgres |
| File storage (S3) | ❌ Not included | Cloudflare R2 (free tier) |

Vercel is ideal for the **frontend only**. The backend needs a container/VM-style host plus external database and object storage.

---

## Recommended free production stack

```
┌─────────────────┐     HTTPS      ┌──────────────────┐
│  Vercel         │ ──────────────► │  Render.com      │
│  Next.js UI     │   API calls    │  Go API (Docker) │
└─────────────────┘                └────────┬─────────┘
                                            │
                         ┌──────────────────┼──────────────────┐
                         ▼                  ▼                  ▼
                   ┌──────────┐      ┌────────────┐     ┌─────────────┐
                   │ Neon     │      │ Cloudflare │     │ (optional)  │
                   │ Postgres │      │ R2 storage │     │ Custom domain│
                   └──────────┘      └────────────┘     └─────────────┘
```

### 1. Frontend — Vercel (free)

1. Push repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import repo.
3. **Root Directory:** `frontend`
4. Framework: Next.js (auto-detected)
5. **Environment variables:**

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com` (no trailing slash) |
   | `NEXT_PUBLIC_APP_NAME` | `DocVerify` |

6. Deploy → note URL e.g. `https://docverify.vercel.app`

### 2. Database — Neon (free Postgres)

1. [neon.tech](https://neon.tech) → create project.
2. Copy connection string → use as `DB_URL` on backend.
3. Example: `postgres://user:pass@ep-xxx.region.aws.neon.tech/docverify?sslmode=require`

Migrations run automatically when the Go API starts.

### 3. File storage — Cloudflare R2 (S3-compatible, free tier)

MinIO is for local dev only. In production use R2:

1. Cloudflare dashboard → R2 → create bucket `docverify`
2. Create API token (read/write)
3. Backend env:

   ```
   S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
   S3_BUCKET=docverify
   S3_ACCESS_KEY=<r2_access_key>
   S3_SECRET_KEY=<r2_secret_key>
   S3_REGION=auto
   S3_USE_SSL=true
   ```

### 4. Backend — Render (free web service)

1. [render.com](https://render.com) → **New Web Service**
2. Connect GitHub repo, **Root Directory:** `backend`
3. **Runtime:** Docker (uses `Dockerfile`)
4. **Environment variables:**

   | Variable | Example |
   |----------|---------|
   | `PORT` | `8080` |
   | `GIN_MODE` | `release` |
   | `APP_URL` | `https://docverify-api.onrender.com` |
   | `FRONTEND_URL` | `https://docverify.vercel.app` |
   | `DB_URL` | Neon connection string |
   | `JWT_SECRET` | long random string (32+ chars) |
   | `S3_*` | R2 credentials (see above) |
   | `ALLOWED_ORIGINS` | optional extra Vercel preview URLs |

5. Deploy → copy API URL into Vercel `NEXT_PUBLIC_API_URL`.

**Free tier note:** Render sleeps after ~15 min idle; first request may take 30–60s to wake. Fine for portfolio demos.

Optional: use `backend/render.yaml` as a Render Blueprint.

---

## After deploy — smoke test

1. Open your Vercel URL → landing page loads
2. Register → login → upload `test-sample.pdf`
3. Copy verify link → open in incognito → document shows **Valid**
4. Click small doc thumbnail → `/preview/...` with red **VERIFY** stamp
5. Dashboard → stats and document list load

---

## Alternative free hosts

| Service | Best for | Free tier |
|---------|----------|-----------|
| **Render** | Go Docker API | 750 hrs/mo, sleeps when idle |
| **Railway** | Go + Postgres | Limited monthly credits |
| **Fly.io** | Go containers | Small VM allowance |
| **Oracle Cloud** | Full VPS (advanced) | Always-free ARM VM |

For a **Saudi employer demo**, Vercel + Render + Neon + R2 is enough: professional URLs, HTTPS, and no credit card on Vercel/Neon/R2 free tiers.

---

## Security checklist before sharing publicly

- [ ] Strong `JWT_SECRET` (never commit `.env`)
- [ ] `GIN_MODE=release` on production
- [ ] `FRONTEND_URL` set to exact Vercel domain
- [ ] Neon `sslmode=require`
- [ ] Do not commit `backend/.env` or `frontend/.env.local`

---

## Resume / portfolio talking points (KSA)

- **Digital document verification** (degrees, certificates — relevant to HEC / gov-tech)
- **SHA-256 tamper detection**, QR codes, public verify without login
- **Full stack:** Go, PostgreSQL, S3, Next.js, TypeScript, Docker
- **Live demo URL** on CV: `https://your-app.vercel.app`

---

## Local development (unchanged)

```powershell
# Terminal 1
cd backend
docker compose up -d postgres minio minio-init

# Terminal 2
cd backend
go run ./cmd/api

# Terminal 3
cd frontend
npm run dev
```
