# DocVerify Frontend (Next.js)

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **TanStack Query** — data fetching
- **Axios** — API client
- **react-dropzone** — file upload (ready for Upload page)

## Prerequisites

1. **Docker** — Postgres + MinIO running
2. **Go API** — `go run ./cmd/api` in `backend/` (port 8080)

## Setup

```powershell
cd frontend
npm install
```

Copy env if needed:

```powershell
copy .env.example .env.local
```

## Run dev server

```powershell
npm run dev
```

Open **http://localhost:3000**

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx    # Protected
│   ├── upload/page.tsx       # Protected (placeholder)
│   └── verify/[shortId]/     # Public verify
├── components/
│   └── auth-guard.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useDocuments.ts
├── lib/
│   ├── api/client.ts         # All API calls
│   ├── auth/token.ts         # JWT in localStorage
│   └── types.ts
└── providers/
    └── query-provider.tsx
```

## Routes

| Route | Auth | Status |
|-------|------|--------|
| `/` | No | Landing |
| `/login` | No | Working |
| `/register` | No | Working |
| `/dashboard` | Yes | Working (basic table) |
| `/upload` | Yes | Placeholder — build next |
| `/verify/:shortId` | No | Working |

## Environment

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` |

## Full dev workflow

**Terminal 1 — Docker**
```powershell
cd backend
docker compose up -d postgres minio minio-init
```

**Terminal 2 — Backend**
```powershell
cd backend
go run ./cmd/api
```

**Terminal 3 — Frontend**
```powershell
cd frontend
npm run dev
```

## Next build steps

1. Upload page with drag-drop + QR modal
2. Revoke button on dashboard
3. Status badges component
4. Apply ChatGPT design system / polish UI
