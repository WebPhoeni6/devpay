# Payments App

## Purpose

Handles the full Paystack payment lifecycle for invoices: initializing a transaction, verifying its outcome, and processing real-time webhook notifications from Paystack. When a payment succeeds, both the `Payment` record and the linked `Invoice` are automatically updated.

## What Was Implemented

### Model (`payments/models.py`)

#### Payment

Tracks a single Paystack transaction tied to an invoice.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `invoice` | OneToOneField → Invoice | Each invoice can have at most one payment record |
| `paystack_reference` | CharField | Unique transaction reference sent to Paystack |
| `paystack_access_code` | CharField | Returned by Paystack — used by the frontend to open the payment modal |
| `amount` | DecimalField | Payment amount in naira |
| `status` | CharField | Choices: `pending`, `success`, `failed` |
| `paid_at` | DateTimeField | Nullable — set when payment succeeds |
| `created_at` | DateTimeField | Auto-set on creation |

### Paystack Client (`payments/paystack.py`)

A thin, focused wrapper around the Paystack REST API. All Paystack logic lives here, separate from view logic.

**`generate_reference()`**
- Uses `secrets.token_hex(16)` — Python's cryptographically secure random generator
- Produces a 32-character hex string, e.g. `a3f1c9d2e8b74050...`
- Unpredictable and collision-resistant

**`initialize_transaction(email, amount_naira, reference, callback_url)`**
- Calls `POST https://api.paystack.co/transaction/initialize`
- Converts naira to kobo (multiplies by 100) before sending — Paystack requires amounts in the smallest currency unit
- Returns Paystack's response containing `authorization_url` and `access_code`

**`verify_transaction(reference)`**
- Calls `GET https://api.paystack.co/transaction/verify/<reference>`
- Returns the full transaction object from Paystack including its current status

**`verify_webhook_signature(payload_bytes, signature_header)`**
- Implements Paystack's required webhook security: HMAC SHA512 of the raw request body, keyed with `PAYSTACK_SECRET_KEY`
- Uses `hmac.compare_digest` for constant-time comparison — prevents timing attacks
- Returns `True` if the signature is valid

### Serializers (`payments/serializers.py`)

**`PaymentSerializer`**
- Read-only — exposes payment details to the frontend after initialization or verification

**`InitializePaymentSerializer`**
- Validates the incoming `invoice_id` (UUID) and optional `callback_url`

### Views (`payments/views.py`)

**`InitializePaymentView`** — `POST /api/payments/initialize/`

1. Validates the request body with `InitializePaymentSerializer`
2. Looks up the invoice — returns 404 if it doesn't belong to the authenticated user
3. Checks if the invoice is already paid — returns 400 if so
4. Calls `generate_reference()` to create a fresh cryptographic reference
5. Calls `initialize_transaction()` to register the transaction with Paystack
6. Creates (or updates) a `Payment` record with `status=pending`
7. Returns `{ authorization_url, access_code, reference }` to the frontend

The frontend uses `authorization_url` to redirect the user to the Paystack payment page, or `access_code` to open the inline Paystack popup.

**`VerifyPaymentView`** — `GET /api/payments/verify/<reference>/`

1. Looks up the `Payment` by reference, scoped to the authenticated user's invoices
2. Calls `verify_transaction()` to check status with Paystack
3. If Paystack reports `success`:
   - Sets `payment.status = success` and `payment.paid_at = now()`
   - Sets `invoice.status = paid`
   - Saves both records
4. Returns the updated `PaymentSerializer` response

**`WebhookView`** — `POST /api/payments/webhook/`

- No authentication — Paystack calls this directly, not the user
- Reads the raw request body and verifies the `x-paystack-signature` header via HMAC SHA512
- If the signature is invalid, the request is silently dropped (still returns 200 — Paystack requires this)
- Handles the `charge.success` event:
  - Looks up the payment by reference
  - If not already marked as success, updates `Payment` and `Invoice` status
- Always returns `HTTP 200` — Paystack will retry webhooks if it receives anything else

### URL Routes (`payments/urls.py`)

| Method | URL | View | Auth |
|---|---|---|---|
| POST | `/api/payments/initialize/` | `InitializePaymentView` | JWT |
| GET | `/api/payments/verify/<reference>/` | `VerifyPaymentView` | JWT |
| POST | `/api/payments/webhook/` | `WebhookView` | None (HMAC verified) |

## Payment Flow

```
Frontend                          Backend                        Paystack
   |                                 |                               |
   |-- POST /api/payments/initialize/ -->                            |
   |        { invoice_id }           |                               |
   |                                 |-- POST /transaction/initialize -->
   |                                 |<-- { authorization_url, ... } --
   |<-- { authorization_url, ref } --                               |
   |                                 |                               |
   |-- redirect user to authorization_url --------------------------->
   |                                 |                               |
   |                           (user pays)                           |
   |                                 |                               |
   |                                 |<-- POST /webhook/ (charge.success)
   |                                 |    (signature verified)       |
   |                                 |    payment.status = success   |
   |                                 |    invoice.status = paid      |
   |                                 |                               |
   |-- GET /api/payments/verify/<ref>/ -->                           |
   |<-- { status: "success", paid_at: ... } --                       |
```

## Security Notes

- Transaction references are generated with `secrets.token_hex(16)` — not `random` or `uuid4`, which are not cryptographically secure for this purpose
- Webhook signature verification uses HMAC SHA512 with `hmac.compare_digest` to prevent timing-based attacks
- The webhook endpoint skips CSRF — it uses signature verification as the trust mechanism instead
- The `PAYSTACK_SECRET_KEY` is loaded from `.env` and never hardcoded
