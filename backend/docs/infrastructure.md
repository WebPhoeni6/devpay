# Infrastructure

## Environment Variables (`.env`)

All secrets and environment-specific config live in `.env`. The file is gitignored — `.env.example` is the safe template that gets committed.

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | Yes | Django secret key — used for JWT signing and cryptographic operations. Must be long and random. Generated with `secrets.token_hex(32)`. |
| `DEBUG` | Yes | `True` for local dev, `False` in production |
| `DATABASE_URL` | Yes | PostgreSQL connection string: `postgresql://user:pass@host:port/db` |
| `PAYSTACK_SECRET_KEY` | Yes | Paystack secret key (`sk_test_...` or `sk_live_...`) |
| `PAYSTACK_PUBLIC_KEY` | Yes | Paystack public key (`pk_test_...` or `pk_live_...`) |
| `ALLOWED_HOSTS` | Yes | Comma-separated list of allowed hostnames |

If `SECRET_KEY` is missing, Django will refuse to start with a `KeyError`. There is no default fallback — this is intentional.

## Docker (`Dockerfile` + `docker-compose.yml`)

### Dockerfile

- Base image: `python:3.11-slim` — minimal footprint
- Installs dependencies from `requirements.txt` first (layer caching)
- Copies source code
- Runs gunicorn with 2 workers on port 8000

### docker-compose.yml

Two services:

**`db`** — PostgreSQL 15
- Data persisted in a named volume `postgres_data`
- Healthcheck using `pg_isready` — the web service waits for this to pass before starting

**`web`** — Django application
- Built from the local `Dockerfile`
- Runs `python manage.py migrate` before starting gunicorn — ensures the database is always up to date on container start
- Reads all config from the `.env` file
- Depends on `db` with `condition: service_healthy` — won't start until postgres is ready

```bash
# Start everything
docker-compose up --build

# Run in background
docker-compose up -d --build

# Run a management command inside the container
docker-compose exec web python manage.py createsuperuser
```

## GitHub Actions CI (`.github/workflows/ci.yml`)

Runs automatically on:
- Push to `main` or `dev`
- Pull requests targeting `main`

### Pipeline Steps

1. **Checkout** — pulls the source code
2. **Setup Python 3.11**
3. **Install dependencies** — `pip install -r requirements.txt`
4. **Run tests** — `python manage.py test`

### Services

A PostgreSQL 15 container spins up alongside the job with a healthcheck so the DB is ready before tests run.

### Environment

| Variable | CI Value |
|---|---|
| `DATABASE_URL` | Points to the CI postgres service |
| `SECRET_KEY` | Pulled from GitHub Actions secret `SECRET_KEY`, falls back to a safe dummy for PR builds |
| `PAYSTACK_SECRET_KEY` | `sk_test_dummy` — tests don't hit real Paystack |
| `DEBUG` | `False` |

## API Documentation (drf-spectacular)

`drf-spectacular` introspects DRF viewsets and serializers to auto-generate an OpenAPI 3.0 schema.

| URL | Description |
|---|---|
| `GET /api/schema/` | Raw OpenAPI 3.0 JSON — import into Postman, Insomnia, etc. |
| `GET /api/docs/` | Swagger UI — interactive browser with JWT auth support |
| `GET /api/redoc/` | ReDoc — clean, readable reference documentation |

The Swagger UI is pre-configured with a `BearerAuth` security scheme. Click **Authorize**, paste your JWT access token, and all protected endpoints will include the `Authorization: Bearer <token>` header automatically.
