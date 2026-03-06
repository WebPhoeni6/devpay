# Invoices App

## Purpose

Manages two core business entities: **Clients** (the people being billed) and **Invoices** (the bills themselves). Every record is scoped to the authenticated user — users can only ever see and modify their own data.

## What Was Implemented

### Models (`invoices/models.py`)

#### Client

Represents a person or business that receives invoices.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `owner` | FK → User | The DevPay user who created this client |
| `name` | CharField | Client's full name or company name |
| `email` | EmailField | Client's billing email |
| `phone` | CharField | Optional phone number |
| `created_at` | DateTimeField | Auto-set on creation |

#### Invoice

Represents a single bill issued to a client.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `owner` | FK → User | The DevPay user who owns this invoice |
| `client` | FK → Client | The client being billed |
| `title` | CharField | Short description, e.g. "Website Redesign" |
| `description` | TextField | Optional detailed breakdown |
| `amount` | DecimalField | Billing amount in naira (12 digits, 2 decimal places) |
| `status` | CharField | Choices: `draft`, `sent`, `paid`, `overdue` |
| `due_date` | DateField | When payment is due |
| `created_at` | DateTimeField | Auto-set on creation |
| `updated_at` | DateTimeField | Auto-updated on every save |

The default status for a new invoice is `draft`.

### Serializers (`invoices/serializers.py`)

**`ClientSerializer`**
- Exposes `id`, `name`, `email`, `phone`, `created_at`
- `id` and `created_at` are read-only

**`InvoiceSerializer`**
- Exposes all invoice fields
- Includes a nested `client_detail` field (read-only) that embeds the full client object so the frontend gets client info without a second request
- Validates that the `client` being assigned to an invoice belongs to the same user making the request — prevents users from assigning invoices to other users' clients

### Views (`invoices/views.py`)

Both use DRF's `ModelViewSet` which provides list, create, retrieve, update, and destroy actions out of the box.

**`ClientViewSet`**
- `get_queryset` filters by `owner=request.user` — no cross-user data leakage
- `perform_create` automatically sets `owner=request.user` on save

**`InvoiceViewSet`**
- Same ownership filtering as clients
- Uses `select_related("client")` to avoid N+1 queries when listing invoices with client details

### URL Routes (`invoices/urls.py`)

Registered via DRF's `DefaultRouter` which generates all standard REST routes automatically.

| Method | URL | Action | Auth |
|---|---|---|---|
| GET | `/api/clients/` | List all clients | JWT |
| POST | `/api/clients/` | Create a client | JWT |
| GET | `/api/clients/<id>/` | Retrieve a client | JWT |
| PUT | `/api/clients/<id>/` | Full update | JWT |
| PATCH | `/api/clients/<id>/` | Partial update | JWT |
| DELETE | `/api/clients/<id>/` | Delete a client | JWT |
| GET | `/api/invoices/` | List all invoices | JWT |
| POST | `/api/invoices/` | Create an invoice | JWT |
| GET | `/api/invoices/<id>/` | Retrieve an invoice | JWT |
| PUT | `/api/invoices/<id>/` | Full update | JWT |
| PATCH | `/api/invoices/<id>/` | Partial update | JWT |
| DELETE | `/api/invoices/<id>/` | Delete an invoice | JWT |

All endpoints require a valid JWT. Attempting to access without one returns `401 Unauthorized`.

## Data Flow Example

```
1. Create a client
   POST /api/clients/
   { "name": "Acme Corp", "email": "acme@example.com", "phone": "08012345678" }

2. Create an invoice for that client
   POST /api/invoices/
   {
     "client": "<client-uuid>",
     "title": "Logo Design",
     "amount": "150000.00",
     "status": "draft",
     "due_date": "2026-04-01"
   }

3. List invoices (returns all invoices with nested client info)
   GET /api/invoices/

4. Update status to sent
   PATCH /api/invoices/<invoice-uuid>/
   { "status": "sent" }
```

## Ownership Enforcement

Two layers protect user data isolation:

1. **QuerySet filtering** — `get_queryset` always appends `owner=request.user`, so even if a user guesses another user's UUID, the object is not returned (results in 404)
2. **Client ownership validation** — the serializer checks that the client being attached to a new invoice belongs to the requesting user
