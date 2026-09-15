# TillSync — Startup Roadmap

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│  Express API  │────▶│  PostgreSQL  │
│  (Frontend) │     │  (Backend)   │     │  (Primary)   │
│  Vercel     │     │  Railway     │     └─────────────┘
└─────────────┘     └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Redis   │ │  Queue   │ │  MoMo    │
        │ (Sessions│ │ (BullMQ) │ │ (Webhook)│
        │  +Cache) │ │          │ │          │
        └──────────┘ └──────────┘ └──────────┘
```

## Tech Stack

| Layer | Choice | Cost | Purpose |
|-------|--------|------|---------|
| Frontend | Next.js 14+ (App Router) | Free (Vercel) | Dashboard UI |
| Styling | Tailwind CSS | Free | Rapid UI development |
| Data Fetching | SWR | Free | Client-side caching + polling |
| Backend | Node.js 22+ LTS + Express | Free (Railway) | API server |
| Database | PostgreSQL (prod) / SQLite (dev) | Free tier | Persistent storage |
| Cache/Sessions | Redis | Free tier (Railway) | Sessions + caching |
| Queue | BullMQ + Redis | Free | Async SMS delivery |
| Auth | JWT + express-session | Free | Authentication |
| SMS | Arkesel REST | GHS 0.035/SMS | Notifications |
| WhatsApp | WhatsApp Business API | Free (1000 msgs/mo) | Backup channel |
| Payments | MTN MoMo Collection API | Free (sandbox) | Webhooks |
| Monitoring | Sentry (free tier) | Free | Error tracking |

### Deployment

| Service | Platform | Cost |
|---------|----------|------|
| Frontend (Next.js) | Vercel | Free (hobby tier) |
| Backend (Express) | Railway | Free tier ($5 credit/mo) |
| Database (PostgreSQL) | Railway | Free tier |
| Cache (Redis) | Railway | Free tier |

### Cost Breakdown (Monthly)

| Item | 10 Merchants | 100 Merchants | 1000 Merchants |
|------|-------------|---------------|----------------|
| Vercel | Free | Free | $20 |
| Railway | Free | $20 | $100 |
| PostgreSQL | Free | $15 | $50 |
| Redis | Free | $10 | $30 |
| Arkesel SMS | GHS 35 | GHS 350 | GHS 3,500 |
| WhatsApp | Free | $5 | $50 |
| **Total** | **< GHS 50** | **< GHS 500** | **< GHS 5,000** |

---

## Database Schema (PostgreSQL)

```sql
-- Multi-tenant: every table has tenant_id
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  subscription_status TEXT DEFAULT 'trial',
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'manager', 'attendant')),
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

CREATE TABLE tills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  till_number TEXT NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, till_number)
);

CREATE TABLE till_attendants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  till_id UUID REFERENCES tills(id),
  attendant_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(till_id, attendant_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  till_id UUID REFERENCES tills(id),
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'GHS',
  sender_name TEXT,
  sender_phone TEXT,
  channel TEXT CHECK (channel IN ('sms', 'whatsapp')),
  status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  external_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_tenant_id UUID REFERENCES tenants(id),
  referred_tenant_id UUID REFERENCES tenants(id),
  status TEXT DEFAULT 'pending',
  commission_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Project Structure

```
tillsync/
├── frontend/                    # Next.js app (Vercel)
│   ├── app/
│   │   ├── layout.tsx           # Root layout (Tailwind)
│   │   ├── page.tsx             # Landing page
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── register/
│   │   │   └── page.tsx         # Register page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx       # Dashboard layout (sidebar)
│   │   │   ├── page.tsx         # Overview stats
│   │   │   ├── tills/
│   │   │   │   └── page.tsx     # Till management
│   │   │   ├── attendants/
│   │   │   │   └── page.tsx     # Attendant management
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx     # Notification history
│   │   │   └── settings/
│   │   │       └── page.tsx     # Merchant settings
│   │   └── not-found.tsx        # 404 page
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── tills/
│   │   │   ├── TillCard.tsx
│   │   │   └── TillForm.tsx
│   │   ├── attendants/
│   │   │   ├── AttendantTable.tsx
│   │   │   └── AttendantForm.tsx
│   │   └── notifications/
│   │       └── NotificationTable.tsx
│   ├── lib/
│   │   ├── api.ts               # Axios instance for Express API
│   │   ├── auth.ts              # Auth helpers (token management)
│   │   └── types.ts             # TypeScript interfaces
│   ├── hooks/
│   │   ├── useAuth.ts           # Auth state hook
│   │   ├── useTills.ts          # SWR hook for tills
│   │   └── useNotifications.ts  # SWR hook for notifications
│   ├── middleware.ts             # Next.js middleware (auth guard)
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Express API (Railway)
│   ├── src/
│   │   ├── index.js             # Server entry
│   │   ├── config/
│   │   │   ├── database.js      # PostgreSQL pool
│   │   │   ├── redis.js         # Redis client
│   │   │   └── env.js           # Environment validation
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification
│   │   │   ├── tenant.js        # Tenant context extraction
│   │   │   ├── rbac.js          # Role enforcement
│   │   │   ├── rateLimiter.js   # Per-tenant limiting
│   │   │   └── audit.js         # Audit logging
│   │   ├── routes/
│   │   │   ├── auth.js          # Login/register
│   │   │   ├── merchants.js     # Merchant CRUD
│   │   │   ├── tills.js         # Till management
│   │   │   ├── attendants.js    # Attendant management
│   │   │   ├── webhook.js       # MoMo callback
│   │   │   └── dashboard.js     # Stats/analytics
│   │   ├── services/
│   │   │   ├── smsService.js    # Arkesel integration
│   │   │   ├── whatsappService.js # WhatsApp Business API
│   │   │   ├── momoService.js   # MoMo API helpers
│   │   │   ├── queueService.js  # BullMQ job processing
│   │   │   └── billingService.js # Subscription management
│   │   └── utils/
│   │       ├── errors.js        # Custom error classes
│   │       └── validators.js    # Input validation (zod)
│   ├── db/
│   │   ├── migrations/          # Version-controlled schema
│   │   └── seeds/               # Test data
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── webhook.test.js
│   │   └── tenant-isolation.test.js
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── .env.example                 # Root env template
├── .gitignore
├── roadmapmodified.md
├── roadmap.md
└── tillsyncbase.md
```

---

## Phase 1a: Backend Foundation + Auth (Days 1-3)

**Goal:** Multi-tenant Express server with authentication.

### Deliverables
1. Express server with middleware pipeline
2. PostgreSQL connection (pg library)
3. Redis connection for sessions
4. JWT authentication (login/register)
5. Role-based access middleware (owner/manager/attendant)
6. Tenant context middleware (extracts tenant_id from JWT)
7. Rate limiting per tenant (express-rate-limit + Redis)

### Dependencies
```
cd backend
npm init -y
npm install express pg redis connect-redis express-session
npm install jsonwebtoken bcryptjs zod helmet cors
npm install express-rate-limit bullmq
npm install --save-dev nodemon
```

---

## Phase 1b: Frontend Foundation (Days 3-5)

**Goal:** Next.js app with Tailwind, routing, and API client.

### Deliverables
1. Next.js app with App Router + TypeScript
2. Tailwind CSS configured
3. Folder structure created
4. API client (`lib/api.ts`) pointing to Express backend
5. Auth middleware (redirect to login if not authenticated)
6. Login/Register pages
7. Dashboard layout with sidebar

### Dependencies
```
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --eslint
npm install axios swr
```

---

## Phase 2: MoMo Webhook + Notifications (Days 5-8)

**Goal:** Receive payments, send confirmations.

### Deliverables
1. `POST /api/v1/webhook/momo` endpoint
2. Webhook signature validation
3. Idempotency check (prevent duplicate processing)
4. Store payment in `notifications` table
5. Queue SMS job in BullMQ (async, retryable)
6. Arkesel SMS service (with retry logic)
7. WhatsApp Business API integration (backup channel)
8. Webhook logging for debugging

### Flow
```
MoMo → POST /webhook/momo → Validate signature → Check idempotency
  → Store in notifications → Queue SMS job → BullMQ processes
  → Arkesel sends SMS → Update status to 'sent'
```

---

## Phase 3: Dashboard Pages (Days 8-12)

**Goal:** Full merchant dashboard with Next.js.

### Deliverables
1. **Dashboard Overview** (`/dashboard`)
   - Stats cards (total tills, active attendants, notifications today)
   - Recent notifications table
   - Quick actions (add till, add attendant)

2. **Till Management** (`/dashboard/tills`)
   - List all tills with status
   - Create new till form
   - Edit/delete till
   - View attendants assigned to each till

3. **Attendant Management** (`/dashboard/attendants`)
   - List all attendants
   - Create new attendant form
   - Assign/unassign attendants to tills

4. **Notification History** (`/dashboard/notifications`)
   - Filterable table (by date, status, till)
   - Export to CSV

5. **Settings** (`/dashboard/settings`)
   - Merchant profile
   - Subscription status
   - API keys management

### Data Fetching Pattern
```typescript
// hooks/useTills.ts
import useSWR from 'swr';
import { api } from '@/lib/api';

export function useTills() {
  const { data, error, isLoading } = useSWR('/api/v1/tills', api.get);
  return { tills: data, isLoading, error };
}
```

---

## Phase 4: Billing + Referrals (Days 12-15)

**Goal:** Subscription system and agent referrals.

### Deliverables
1. Subscription plans:
   - Trial: 14 days, 1 till, 100 SMS
   - Basic: GHS 15/mo, 3 tills, unlimited SMS
   - Pro: GHS 30/mo, 10 tills, priority support
2. MoMo-based payment collection (auto-debit)
3. Subscription status middleware
4. Referral system:
   - Unique referral codes
   - Commission tracking (GHS 5 per referred merchant)
   - Payout via MoMo disbursement API
5. Usage tracking (SMS count per tenant)

---

## Phase 5: Monitoring + Security (Days 15-18)

**Goal:** Production-ready monitoring and security.

### Deliverables
1. Sentry integration (error tracking)
2. Structured logging (winston)
3. Audit trail for all mutations
4. Rate limiting:
   - 100 req/min per tenant (API)
   - 10 webhook/min per till
5. Input validation (zod schemas)
6. SQL injection prevention (parameterized queries)
7. CORS configuration
8. Helmet.js security headers
9. Webhook retry queue (3 attempts, exponential backoff)

---

## Phase 6: Deploy + Demo (Days 18-21)

**Goal:** Live production deployment.

### Deliverables
1. **Vercel (Frontend)**
   - Connect GitHub repo
   - Set environment variables (NEXT_PUBLIC_API_URL)
   - Auto-deploy on push

2. **Railway (Backend)**
   - Connect GitHub repo
   - Set environment variables
   - Add PostgreSQL + Redis services
   - Auto-deploy on push

3. **MoMo sandbox → production switch**
4. **Demo script for investors/judges**
5. **README with setup instructions**
6. **Postman collection for API testing**

---

## Future Phases (Post-Launch)

| Phase | Feature | Revenue Impact |
|-------|---------|----------------|
| 7 | Multi-location support | Enterprise tier |
| 8 | Inventory sync | Upsell to merchants |
| 9 | Accounting integration (Xero, QuickBooks) | Enterprise tier |
| 10 | Mobile app (React Native) | New channel |
| 11 | Agent onboarding portal | Scale distribution |
| 12 | API for third-party integrations | Platform play |

---

## Key Metrics to Track

| Metric | Target | Why |
|--------|--------|-----|
| SMS delivery time | < 3 seconds | Core value prop |
| Webhook processing time | < 1 second | Reliability |
| Dashboard load time | < 2 seconds | UX |
| Uptime | 99.9% | Trust |
| Active merchants | 100 by month 3 | Growth |
| Churn rate | < 5%/month | Retention |

---

## Subscription Plans

| Plan | Price | Tills | SMS | Features |
|------|-------|-------|-----|----------|
| Trial | Free | 1 | 100/mo | Basic notifications |
| Basic | GHS 15/mo | 3 | Unlimited | SMS + Dashboard |
| Pro | GHS 30/mo | 10 | Unlimited | Priority support |
| Enterprise | Custom | Custom | Custom | Multi-location + API |

---

## API Endpoints

### Auth
```
POST   /api/v1/auth/register       — Register merchant
POST   /api/v1/auth/login          — Login
POST   /api/v1/auth/logout         — Logout
GET    /api/v1/auth/me             — Current user
```

### Merchants
```
GET    /api/v1/merchants           — List merchants (admin)
GET    /api/v1/merchants/:id       — Get merchant
PUT    /api/v1/merchants/:id       — Update merchant
DELETE /api/v1/merchants/:id       — Delete merchant
```

### Tills
```
GET    /api/v1/tills               — List tills
POST   /api/v1/tills               — Create till
GET    /api/v1/tills/:id           — Get till
PUT    /api/v1/tills/:id           — Update till
DELETE /api/v1/tills/:id           — Delete till
```

### Attendants
```
GET    /api/v1/tills/:id/attendants           — List attendants for till
POST   /api/v1/tills/:id/attendants           — Assign attendant
DELETE /api/v1/tills/:id/attendants/:attendantId — Remove attendant
```

### Webhooks
```
POST   /api/v1/webhook/momo        — MoMo payment callback
```

### Dashboard
```
GET    /api/v1/dashboard/stats     — Overview stats
GET    /api/v1/notifications       — Notification history
```

### Billing
```
GET    /api/v1/billing/subscription — Current plan
POST   /api/v1/billing/subscribe   — Subscribe to plan
GET    /api/v1/billing/invoices    — Invoice history
```

### Referrals
```
GET    /api/v1/referrals/code      — Get referral code
GET    /api/v1/referrals/stats     — Referral statistics
```

---

## Environment Variables

### Backend (.env)
```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/tillsync

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# MoMo API
MOMO_API_KEY=your-momo-api-key
MOMO_API_SECRET=your-momo-api-secret
MOMO_SUBSCRIPTION_KEY=your-subscription-key
MOMO_ENVIRONMENT=sandbox

# Arkesel SMS
ARKESEL_API_KEY=your-arkesel-api-key
ARKESEL_SENDER=TillSync

# WhatsApp Business
WHATSAPP_API_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id

# Sentry
SENTRY_DSN=your-sentry-dsn

# App
APP_URL=http://localhost:4000
WEBHOOK_SECRET=your-webhook-secret
```

### Frontend (.env.local)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4000

# App
NEXT_PUBLIC_APP_NAME=TillSync
```
