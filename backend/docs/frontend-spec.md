# DevPay — Frontend Spec

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (Vite) |
| State Management | Zustand |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Notifications | react-hot-toast |

---

## Project Setup

```bash
npm create vite@latest devpay-frontend -- --template react
cd devpay-frontend
npm install
npm install react-router-dom axios zustand recharts lucide-react react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Folder Structure

```
src/
├── api/              # Axios instance + per-resource API functions
├── components/       # Shared UI components (Button, Badge, Modal, etc.)
├── layouts/          # AppLayout (sidebar + topbar), AuthLayout
├── pages/            # One folder per route
│   ├── auth/         # Login, Register
│   ├── dashboard/    # Dashboard
│   ├── clients/      # ClientList, ClientDetail
│   ├── invoices/     # InvoiceList, InvoiceDetail, InvoiceCreate
│   └── payments/     # PaymentInitialize
├── stores/           # Zustand stores
├── hooks/            # Custom hooks
└── main.jsx
```

---

## Design Language (from Figma)

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `primary` | `#3B3FD8` (indigo-blue) | Buttons, active nav, chart bars, badges |
| `primary-light` | `#E8E9FB` | Chart bar backgrounds, pill bg |
| `surface` | `#FFFFFF` | Cards, sidebar, main panels |
| `background` | `#F5F6FA` | Page background |
| `text-primary` | `#1A1A2E` | Headings, table primary text |
| `text-secondary` | `#6B7280` | Subtext, labels, descriptions |
| `border` | `#E5E7EB` | Card borders, table dividers |
| `success` | `#22C55E` | PAID badge |
| `danger` | `#EF4444` | UNPAID / overdue badge |
| `warning` | `#F59E0B` | DRAFT badge |

### Typography

- Font: **Inter** (Google Fonts)
- Headings: `font-semibold` or `font-bold`
- Body: `font-normal`, `text-sm` for table rows and labels
- Subtext: `text-xs text-secondary`

### Spacing & Radius

- Card border radius: `rounded-2xl`
- Button border radius: `rounded-lg`
- Badge border radius: `rounded-full`
- Card padding: `p-6`
- Table row padding: `py-4 px-6`

### Component Patterns

**Card**
```
bg-white rounded-2xl border border-gray-100 shadow-sm p-6
```

**Primary Button**
```
bg-[#3B3FD8] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700
```

**Outline Button**
```
border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50
```

**Status Badge**
```
PAID    → bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-medium
UNPAID  → bg-red-100 text-red-600 rounded-full px-3 py-1 text-xs font-medium
DRAFT   → bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs font-medium
SENT    → bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-medium
OVERDUE → bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-medium
```

---

## Axios Setup (`src/api/axios.js`)

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // attempt token refresh
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', data.access)
          error.config.headers.Authorization = `Bearer ${data.access}`
          return api(error.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## Zustand Stores (`src/stores/`)

### `authStore.js`
```js
// State: user, access_token, refresh_token
// Actions: login, register, logout, loadUser
```

### `clientStore.js`
```js
// State: clients[], loading, error
// Actions: fetchClients, createClient, updateClient, deleteClient
```

### `invoiceStore.js`
```js
// State: invoices[], currentInvoice, loading, error
// Actions: fetchInvoices, fetchInvoice, createInvoice, updateInvoice, deleteInvoice
```

### `paymentStore.js`
```js
// State: payment, loading, error
// Actions: initializePayment, verifyPayment
```

---

## Routes

```jsx
/               → redirect to /dashboard if logged in, else /login
/login          → LoginPage
/register       → RegisterPage
/dashboard      → DashboardPage  (protected)
/clients        → ClientListPage  (protected)
/clients/:id    → ClientDetailPage  (protected)
/invoices       → InvoiceListPage  (protected)
/invoices/new   → InvoiceCreatePage  (protected)
/invoices/:id   → InvoiceDetailPage  (protected)
```

All routes under `AppLayout` (sidebar + topbar) are wrapped in a `<ProtectedRoute>` component that checks for a valid access token and redirects to `/login` if missing.

---

## Pages & UI

### Auth Pages (`/login`, `/register`)

**Layout:** Centered card on a light gray background.

**Login fields:** Email, Password → `POST /auth/login/`
**Register fields:** Full Name, Email, Password → `POST /auth/register/`

On success: store `access_token` + `refresh_token` in `localStorage`, redirect to `/dashboard`.

---

### App Layout

Matches the Figma exactly:

**Sidebar (left, fixed)**
- Logo + brand name at top
- Nav links: Dashboard, Invoice, Activity, Contracts
- Active link: `text-[#3B3FD8]` with bottom border indicator (matches top nav tab style in Figma)
- User avatar + workspace name at top right

**Topbar**
- Page title
- Workspace selector (display only)
- User avatar

---

### Dashboard (`/dashboard`)

**Top section — Invoice Income card**

- Title: "Invoice Income" + subtitle "Listed below are all conclusion from invoice income"
- Tab filter: All / Single / Recurring (UI only, no backend filter)
- Date filter dropdown: "Last Week" (UI only)
- Bar chart (`Recharts` `BarChart`) — two series per day:
  - Dark bar: paid amount (pull from `invoices` filtered by `status=paid`)
  - Light bar: total issued
  - X-axis: last 7 days (Mon–Today)

**Right panel — Overview**
- "Total Paid" → count of invoices with `status=paid`
- "Total Issued" → total count of invoices
- Horizontal stacked bar: paid vs issued ratio (Recharts)
- "View Detail →" link → `/invoices`

**Bottom section — Billing & Invoices table**

Columns: Invoice ID, Invoice Name (client name), Start Date (created_at), End Date (due_date), Invoice Amount, Status badge

Data: last 5–10 invoices from `GET /api/invoices/`

No "Download PDF" on this table — that's on the detail panel.

**Right detail panel** (shown when a table row is clicked):
- Invoice number (`#id` short form)
- Start date / End date
- Client name + address (display `client.name`, `client.email`)
- Item Details: Bill Name (invoice title), Type ("One-Time"), Amount
- Note: invoice description
- "Copy Payment Link" button (see Payment section below)

---

### Clients (`/clients`)

**List view**
- Table columns: Name, Email, Phone, Created At, Actions
- "Add Client" button → opens a modal
- Actions: Edit (modal), Delete (confirm dialog)

**Create/Edit modal fields:**
- Name (required)
- Email (required)
- Phone (optional)

API calls:
- List: `GET /api/clients/`
- Create: `POST /api/clients/`
- Update: `PUT /api/clients/:id/`
- Delete: `DELETE /api/clients/:id/`

---

### Invoices (`/invoices`)

**List view** — matches the "Billing & Invoices" table from Figma:

Columns: Invoice ID, Invoice Name, Start Date, End Date, Invoice Amount, Status badge

- "Export Invoice" button (UI only — no backend export endpoint exists)
- Clicking a row opens the right detail panel (same as Dashboard detail panel)

**Create Invoice (`/invoices/new`)**

Form fields:
- Title (required)
- Client (dropdown from `GET /api/clients/`) (required)
- Amount in Naira (required)
- Due Date (required)
- Description (optional)
- Status (default: Draft)

API: `POST /api/invoices/`

On success: redirect to `/invoices`

---

### Invoice Detail Panel

Rendered as a right-side drawer/panel when a row is clicked (not a separate page).

Displays:
- Invoice ID (shortened UUID prefix e.g. `#12955`)
- Start date (created_at) / End date (due_date)
- Client name + email
- Bill Name (title)
- Type: "One-Time" (static)
- Amount
- Description (as Note)

**Payment Link section:**
- If invoice status is not `paid`:
  - "Generate Payment Link" button → `POST /api/payments/initialize/` with `{ invoice_id }`
  - On success: display the `authorization_url` in a read-only input with a "Copy" button
  - User copies this and sends to their client manually
- If invoice status is `paid`:
  - Show a green "PAID" badge with `paid_at` date
  - No payment link button

**No "Download PDF" button** — that endpoint does not exist in the backend.

---

### Payment Flow (frontend side)

```
1. User clicks "Generate Payment Link" on an invoice
2. POST /api/payments/initialize/ → { authorization_url, reference }
3. Display authorization_url in a copyable input field
4. User copies and sends the link to their client out-of-band
5. After client pays, Paystack webhook updates backend automatically
6. User can manually refresh invoice status or click "Verify Payment"
   → GET /api/payments/verify/:reference/
   → Invoice status updates to "paid" if successful
```

---

## Environment Variables (`.env`)

```
VITE_API_URL=http://localhost:8000/api
```

---

## What NOT to Build (no backend support)

| Feature | Reason |
|---|---|
| PDF download | No endpoint |
| Email sending | No endpoint |
| Recurring invoices | No model field |
| Activity feed | No endpoint |
| Contracts tab | No endpoint |
| Date range filtering on charts | No filter params on API |
| "Single / Recurring" invoice type | No model field |
