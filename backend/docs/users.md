# Users App

## Purpose

Handles user registration, authentication, and profile retrieval. This app owns the custom `User` model that replaces Django's default user.

## What Was Implemented

### Custom User Model (`users/models.py`)

Django's built-in `User` is replaced with a custom model extending `AbstractBaseUser` and `PermissionsMixin`.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated, not editable |
| `email` | EmailField | Unique — used as the login identifier |
| `full_name` | CharField | Required |
| `is_active` | BooleanField | Defaults to `True` |
| `is_staff` | BooleanField | Defaults to `False` — controls admin access |
| `date_joined` | DateTimeField | Auto-set on creation |

`USERNAME_FIELD = "email"` — users log in with their email, not a username.

A custom `UserManager` handles `create_user` and `create_superuser`, ensuring passwords are always hashed via `set_password`.

### Serializers (`users/serializers.py`)

**`RegisterSerializer`**
- Accepts `email`, `full_name`, `password`
- Validates that the email is not already taken
- Calls `create_user` so the password is always stored as a hash — the plain-text password never touches the database

**`UserSerializer`**
- Read-only serializer exposing `id`, `email`, `full_name`, `date_joined`
- Used for the `/me/` endpoint and included in the register response

### Views (`users/views.py`)

**`RegisterView`** — `POST /api/auth/register/`
- Public endpoint (no auth required)
- Creates the user via `RegisterSerializer`
- Immediately returns an access token + refresh token alongside the user object so the frontend can log the user in right after signup without a second request

**`MeView`** — `GET /api/auth/me/`
- Requires a valid JWT in the `Authorization: Bearer <token>` header
- Returns the profile of the currently authenticated user

### URL Routes (`users/urls.py`)

| Method | URL | View | Auth |
|---|---|---|---|
| POST | `/api/auth/register/` | `RegisterView` | No |
| POST | `/api/auth/login/` | SimpleJWT `TokenObtainPairView` | No |
| POST | `/api/auth/token/refresh/` | SimpleJWT `TokenRefreshView` | No |
| GET | `/api/auth/me/` | `MeView` | JWT |

Login and token refresh are provided directly by `djangorestframework-simplejwt` — no custom view needed.

## Authentication Flow

```
Register  →  POST /api/auth/register/   →  { access, refresh, user }
Login     →  POST /api/auth/login/      →  { access, refresh }
           (body: { "email": "...", "password": "..." })

Refresh   →  POST /api/auth/token/refresh/  →  { access }
           (body: { "refresh": "..." })

Profile   →  GET /api/auth/me/
           (header: Authorization: Bearer <access_token>)
```

Access tokens expire after **1 day**. Refresh tokens expire after **7 days**.

## Security Notes

- Passwords are hashed by Django's `PBKDF2PasswordHasher` before storage
- JWT signing uses `HS256` with the Django `SECRET_KEY`
- The `SECRET_KEY` is loaded from `.env` and never has a default fallback — the app will refuse to start if it is missing
