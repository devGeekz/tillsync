# TillSync — API Contract

> Both collaborators must read this file before writing any code.
> Backend implements these endpoints. Frontend consumes them.
> If you need to change something here, tell the other person first.

---

## Base URL

```
Development: http://localhost:4000
Production:  https://api.tillsync.app
```

---

## Authentication

### Auth Header
Every protected endpoint accepts either:
```
Authorization: Bearer <jwt_token>
```
or a session cookie:
```
Cookie: token=<jwt_token>
```
The browser path uses the cookie — the frontend calls its own `/api/auth/*` route
handlers, which exchange credentials for an **httpOnly** cookie, so the token is
never readable by JavaScript. Non-browser clients (scripts, smoke tests) use Bearer.

### CORS
Allowed origins are read from `APP_URL` (comma-separated). Credentials allowed.
There is no wildcard — unknown origins simply receive no `Access-Control-Allow-Origin`.

### Rate limiting
`POST /auth/login` and `POST /auth/register` allow **10 attempts per 15 minutes** per
IP + phone number. Further attempts return:
```
429 { "error": "Too many attempts. Try again later." }
```
with a `Retry-After` header.

### How to Get a Token
1. Register a new merchant account
2. Login with phone + password
3. Response includes `token`
4. Frontend route handler stores it in an httpOnly cookie (never in localStorage)
5. Browsers send the cookie automatically; API clients send `Authorization: Bearer`

---

## Response Format

### Success
```json
{
  "data": { ... }
}
```

### Success (List)
```json
{
  "data": [ ... ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

### Error
```json
{
  "error": "Human-readable error message"
}
```

### Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "phone", "message": "Invalid phone number" }
  ]
}
```

---

## Roles & Access

`owner` and `manager` are treated the same. `attendant` is restricted:

| | owner / manager | attendant |
|---|---|---|
| Tills: list / view | all tills in the shop | **only the tills they're assigned to** |
| Tills: create / edit / delete / assign attendants | yes | `403` |
| Attendants: list | all attendants | **only themselves** |
| Attendants: create / edit / delete | yes | `403` |
| Notifications: list / create | all | **only their assigned tills'** / `403` create |
| Dashboard stats | includes `totalAttendants` | scoped, `totalAttendants` omitted |
| Billing, referrals | yes | `403` |
| Profile update | yes | `403` |

**Errors:**
- `403` — `{"error": "Not allowed for attendants"}`

---

## Endpoints

### 1. Auth

#### POST /api/v1/auth/register
Register a new merchant account.

**Request:**
```json
{
  "name": "Kwame's Shop",
  "phone": "+233244123456",
  "email": "kwame@example.com",
  "password": "securepass123",
  "momoNumber": "+233201234567"
}
```

**Notes:**
- `momoNumber` (optional) — the mobile-money number this merchant receives payments on.
  Payments sent to it trigger TillSync notifications. Must be unique.

**Response (201):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Kwame's Shop",
    "phone": "+233244123456",
    "email": "kwame@example.com",
    "role": "owner",
    "createdAt": "2026-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` — Phone number already registered
- `400` — Missing required fields

---

#### POST /api/v1/auth/login
Login with phone + password.

**Request:**
```json
{
  "phone": "+233244123456",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Kwame's Shop",
    "phone": "+233244123456",
    "role": "owner"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401` — Invalid phone or password
- `400` — Missing required fields

---

#### POST /api/v1/auth/logout
Logout (invalidate token).

**Request:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### GET /api/v1/auth/me
Get current logged-in user.

**Request:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Kwame's Shop",
    "phone": "+233244123456",
    "email": "kwame@example.com",
    "momoNumber": "+233201234567",
    "role": "owner",
    "tenantId": "tenant-uuid-here"
  }
}
```

**Errors:**
- `401` — Not authenticated
- `404` — User not found

---

#### POST /api/v1/auth/change-password
Change the current user's password.

**Request:**
```json
{
  "currentPassword": "securepass123",
  "newPassword": "newsecurepass456"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Errors:**
- `401` — Current password is incorrect / not authenticated
- `400` — New password shorter than 8 characters

---

#### PUT /api/v1/auth/profile
Update the current merchant's profile. Business name and MoMo number are saved on the tenant, the rest on the user.

**Request:**
```json
{
  "name": "Kwame's Shop",
  "phone": "+233244123456",
  "email": "kwame@example.com",
  "momoNumber": "+233201234567"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Kwame's Shop",
    "phone": "+233244123456",
    "momoNumber": "+233201234567",
    "email": "kwame@example.com",
    "role": "owner",
    "tenantId": "tenant-uuid"
  }
}
```

**Errors:**
- `400` — Phone / MoMo number already registered, invalid fields
- `401` — Not authenticated

---

### 2. Merchants (Admin Only)

#### GET /api/v1/merchants
List all merchants (admin only).

**Request:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "tenant-uuid",
      "name": "Kwame's Shop",
      "phone": "+233244123456",
      "email": "kwame@example.com",
      "subscriptionStatus": "active",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

---

#### GET /api/v1/merchants/:id
Get a specific merchant.

**Response (200):**
```json
{
  "data": {
    "id": "tenant-uuid",
    "name": "Kwame's Shop",
    "phone": "+233244123456",
    "email": "kwame@example.com",
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-02-15T10:30:00Z",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `404` — Merchant not found
- `403` — Not authorized

---

#### PUT /api/v1/merchants/:id
Update a merchant.

**Request:**
```json
{
  "name": "Kwame's New Shop Name",
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "tenant-uuid",
    "name": "Kwame's New Shop Name",
    "phone": "+233244123456",
    "email": "newemail@example.com"
  }
}
```

**Errors:**
- `404` — Merchant not found
- `403` — Not authorized

---

#### DELETE /api/v1/merchants/:id
Delete a merchant (admin only).

**Response (200):**
```json
{
  "message": "Merchant deleted successfully"
}
```

**Errors:**
- `404` — Merchant not found
- `403` — Not authorized

---

### 3. Tills

#### GET /api/v1/tills
List all tills for current merchant.

**Request:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "till-uuid",
      "tillNumber": "12345",
      "name": "Main Counter",
      "isActive": true,
      "attendantCount": 2,
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 3
}
```

---

#### POST /api/v1/tills
Create a new till.

**Request:**
```json
{
  "tillNumber": "12345",
  "name": "Main Counter"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "till-uuid",
    "tillNumber": "12345",
    "name": "Main Counter",
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400` — Till number already exists for this merchant
- `400` — Missing till number

---

#### GET /api/v1/tills/:id
Get a specific till.

**Response (200):**
```json
{
  "data": {
    "id": "till-uuid",
    "tillNumber": "12345",
    "name": "Main Counter",
    "isActive": true,
    "attendants": [
      {
        "id": "attendant-uuid",
        "name": "Kofi",
        "phone": "+233244789012"
      }
    ],
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `404` — Till not found

---

#### PUT /api/v1/tills/:id
Update a till.

**Request:**
```json
{
  "name": "Updated Counter Name",
  "isActive": false
}
```

**Response (200):**
```json
{
  "data": {
    "id": "till-uuid",
    "tillNumber": "12345",
    "name": "Updated Counter Name",
    "isActive": false
  }
}
```

**Errors:**
- `404` — Till not found

---

#### DELETE /api/v1/tills/:id
Delete a till.

**Response (200):**
```json
{
  "message": "Till deleted successfully"
}
```

**Errors:**
- `404` — Till not found

---

### 4. Attendants

#### GET /api/v1/tills/:id/attendants
List all attendants for a specific till.

**Response (200):**
```json
{
  "data": [
    {
      "id": "attendant-uuid",
      "name": "Kofi",
      "phone": "+233244789012",
      "assignedAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

**Errors:**
- `404` — Till not found

---

#### POST /api/v1/tills/:id/attendants
Assign an attendant to a till.

**Request:**
```json
{
  "attendantId": "attendant-uuid"
}
```

**Response (201):**
```json
{
  "message": "Attendant assigned successfully"
}
```

**Errors:**
- `404` — Till or attendant not found
- `400` — Attendant already assigned to this till

---

#### DELETE /api/v1/tills/:id/attendants/:attendantId
Remove an attendant from a till.

**Response (200):**
```json
{
  "message": "Attendant removed successfully"
}
```

**Errors:**
- `404` — Till or attendant not found

---

#### GET /api/v1/attendants
List all attendants for the current merchant.

**Request:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "attendant-uuid",
      "name": "Kofi",
      "phone": "+233244789012",
      "tills": [{ "id": "till-uuid", "tillNumber": "12345" }]
    }
  ],
  "total": 5
}
```

---

#### POST /api/v1/attendants
Create a new attendant.

**Request:**
```json
{
  "name": "Kofi",
  "phone": "+233244789012",
  "password": "attendantpass123"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "attendant-uuid",
    "name": "Kofi",
    "phone": "+233244789012",
    "role": "attendant"
  }
}
```

**Errors:**
- `400` — Phone number already exists

---

#### PUT /api/v1/attendants/:id
Update an attendant's name or phone.

**Request:**
```json
{
  "name": "Kofi Mensah",
  "phone": "+233244789012"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "attendant-uuid",
    "name": "Kofi Mensah",
    "phone": "+233244789012",
    "role": "attendant"
  }
}
```

**Errors:**
- `404` — Attendant not found
- `400` — Phone number already exists / invalid phone

---

#### DELETE /api/v1/attendants/:id
Delete an attendant. Till assignments are removed automatically.

**Response (200):**
```json
{
  "message": "Attendant deleted successfully"
}
```

**Errors:**
- `404` — Attendant not found

---

#### POST /api/v1/notifications
Create a notification record. Used by the MoMo webhook, by tests, and for manual entries. Sending the SMS happens automatically (queued) — this endpoint only records.

**Request:**
```json
{
  "tillId": "till-uuid",
  "amount": 150.00,
  "currency": "GHS",
  "senderName": "John Doe",
  "senderPhone": "+233244123456",
  "channel": "sms"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "notification-uuid",
    "tillNumber": "12345",
    "amount": 150.00,
    "currency": "GHS",
    "senderName": "John Doe",
    "senderPhone": "+233244123456",
    "channel": "sms",
    "status": "pending",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `404` — Till not found
- `400` — Missing amount / tillId

---

### 5. Webhooks

#### POST /api/v1/webhook/momo
MoMo payment callback. This endpoint is called by MTN MoMo, not by the frontend.

**Request (from MoMo):**
```json
{
  "momoNumber": "+233201234567",
  "tillNumber": "12345",
  "amount": "150.00",
  "currency": "GHS",
  "externalId": "ORDER-123",
  "payer": {
    "partyIdType": "MSISDN",
    "partyId": "233244123456"
  },
  "status": "SUCCESSFUL",
  "referenceId": "momo-ref-uuid"
}
```

**Signature:**
```
X-TillSync-Signature: <HMAC-SHA256 of raw body using MOMO_WEBHOOK_SECRET>
```

**Notes:**
- `momoNumber` identifies the merchant (matches their registered number), `tillNumber` the till
- `externalId` / `referenceId` — resending the same callback is a no-op (deduped), returns `status: "duplicate"`
- Only `SUCCESSFUL` payments create notifications; other statuses are logged and ignored
- This endpoint does NOT require JWT auth
- It validates the signature instead, then SMSes the till's attendants

---

### 6. Dashboard

#### GET /api/v1/dashboard/stats
Get dashboard statistics for current merchant.

**Request:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "totalTills": 3,
    "activeTills": 3,
    "totalAttendants": 5,
    "notificationsToday": 12,
    "notificationsThisWeek": 85,
    "notificationsThisMonth": 342
  }
}
```

---

### 7. Notifications

#### GET /api/v1/notifications
Get notification history (paginated).

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional: pending, sent, delivered, failed)
- `tillId` (optional: filter by till)
- `startDate` (optional: ISO date)
- `endDate` (optional: ISO date)

**Request:**
```
Authorization: Bearer <token>
GET /api/v1/notifications?page=1&limit=10&status=sent
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "notification-uuid",
      "tillNumber": "12345",
      "amount": 150.00,
      "currency": "GHS",
      "senderName": "John Doe",
      "senderPhone": "+233244123456",
      "channel": "sms",
      "status": "delivered",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 342,
  "page": 1,
  "limit": 10
}
```

---

### 8. Billing

#### GET /api/v1/billing/subscription
Get current subscription status.

**Request:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "plan": "basic",
    "status": "active",
    "price": 15.00,
    "currency": "GHS",
    "tillsAllowed": 3,
    "tillsUsed": 2,
    "smsUsed": 150,
    "smsAllowed": -1,
    "expiresAt": "2026-02-15T10:30:00Z"
  }
}
```

---

#### POST /api/v1/billing/subscribe
Subscribe to a plan.

**Request:**
```json
{
  "plan": "basic",
  "paymentMethod": "momo",
  "phone": "+233244123456"
}
```

**Response (200):**
```json
{
  "data": {
    "subscriptionId": "sub-uuid",
    "plan": "basic",
    "status": "pending",
    "message": "Payment initiated. Check your phone for MoMo prompt."
  }
}
```

**Errors:**
- `400` — Invalid plan
- `402` — Payment failed
- `501` — Returned while online payment is not enabled (current state)

---

#### GET /api/v1/billing/invoices
Get invoice history.

**Response (200):**
```json
{
  "data": [
    {
      "id": "invoice-uuid",
      "plan": "basic",
      "amount": 15.00,
      "currency": "GHS",
      "status": "paid",
      "paidAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### 9. Referrals

#### GET /api/v1/referrals/code
Get referral code for current merchant. Created on first call, then reused.

**Request:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "code": "KWAME2026",
    "link": "https://tillsync.app/register?ref=KWAME2026"
  }
}
```

**Notes:**
- Passing that `ref` code when registering a merchant attributes them to the referrer

---

#### GET /api/v1/referrals/stats
Get referral statistics.

**Response (200):**
```json
{
  "data": {
    "totalReferrals": 5,
    "successfulReferrals": 3,
    "pendingReferrals": 2,
    "totalCommission": 15.00,
    "currency": "GHS",
    "referrals": [
      {
        "name": "Ama's Store",
        "joinedAt": "2026-01-10T10:30:00Z",
        "status": "successful",
        "commission": 5.00
      }
    ]
  }
}
```

**Notes:**
- `referrals` — one entry per merchant this one referred, newest first
- `commission` is always `0` until payouts are implemented

---

## TypeScript Types (Frontend)

```typescript
// frontend/lib/types.ts

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'owner' | 'manager' | 'attendant';
  tenantId: string;
}

export interface Till {
  id: string;
  tillNumber: string;
  name: string;
  isActive: boolean;
  attendantCount?: number;
  attendants?: Attendant[];
  createdAt: string;
}

export interface Attendant {
  id: string;
  name: string;
  phone: string;
  assignedAt?: string;
}

export interface Notification {
  id: string;
  tillNumber: string;
  amount: number;
  currency: string;
  senderName?: string;
  senderPhone?: string;
  channel: 'sms' | 'whatsapp';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
}

export interface DashboardStats {
  totalTills: number;
  activeTills: number;
  totalAttendants: number;
  notificationsToday: number;
  notificationsThisWeek: number;
  notificationsThisMonth: number;
}

export interface Subscription {
  plan: 'trial' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'pending' | 'expired';
  price: number;
  currency: string;
  tillsAllowed: number;
  tillsUsed: number;
  smsUsed: number;
  smsAllowed: number;
  expiresAt: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
```

---

## Notes for Collaborators

### Collaborator A (Backend)
- Return exactly these response shapes
- Use these exact field names
- Include all required fields
- Don't add extra fields without updating this doc

### Collaborator B (Frontend)
- Don't assume extra fields exist
- Handle all error responses
- Use the TypeScript types above
- If you need a new field, request it here first
