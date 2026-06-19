# DocVerify Backend

## When to run Docker

Run Docker when you need **PostgreSQL** and **MinIO** (file storage). The Go API can run on your machine while those services run in containers.

### Option A — Infrastructure only (recommended while developing)

Start Postgres + MinIO, run the API locally with `go run`:

```bash
cd backend
docker compose up -d postgres minio minio-init
go mod tidy
go run ./cmd/api
```

### Option B — Everything in Docker

Build and run the full stack (postgres, minio, backend):

```bash
cd backend
docker compose up -d --build
```

### Stop Docker

```bash
cd backend
docker compose down
```

## API

- Health: `GET http://localhost:8080/health`
- Ready: `GET http://localhost:8080/ready`
- Swagger: `http://localhost:8080/swagger/index.html`

## Quick test

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Acme Corp\",\"email\":\"admin@acme.com\",\"password\":\"password123\"}"

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@acme.com\",\"password\":\"password123\"}"
```

Migrations run automatically on API startup.
