# DevPay Backend — Project Overview

DevPay is a Django REST API powering an invoicing and payments SaaS. It allows developers or freelancers to manage clients, create invoices, and collect payments via Paystack.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.11 |
| Framework | Django 4.2+ |
| API | Django REST Framework |
| Auth | SimpleJWT (JWT Bearer tokens) |
| Payments | Paystack |
| Database | PostgreSQL |
| Containerization | Docker + docker-compose |
| CI | GitHub Actions |
| API Docs | drf-spectacular (OpenAPI 3.0) |

## Project Structure

```
backend/
├── core/               # Django project: settings, root URLs, wsgi/asgi
├── users/              # Authentication and user profile
├── invoices/           # Client and invoice management
├── payments/           # Paystack payment integration
├── docs/               # This documentation
├── manage.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env                # Local secrets (gitignored)
├── .env.example        # Safe template to commit
└── .github/
    └── workflows/
        └── ci.yml      # GitHub Actions CI pipeline
```

## Running Locally

```bash
# 1. Create and activate virtual environment
python -m venv env
source env/bin/activate   # Windows: env\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up .env (copy from template and fill in values)
cp .env.example .env

# 4. Run migrations
python manage.py migrate

# 5. Start the server
python manage.py runserver
```

## Running with Docker

```bash
docker-compose up --build
```

The web container automatically runs `migrate` before starting gunicorn.

## API Documentation

Once the server is running:

| URL | Description |
|---|---|
| `GET /api/schema/` | Raw OpenAPI 3.0 JSON |
| `GET /api/docs/` | Swagger UI |
| `GET /api/redoc/` | ReDoc |

See individual app docs for full endpoint details:

- [users.md](users.md)
- [invoices.md](invoices.md)
- [payments.md](payments.md)
