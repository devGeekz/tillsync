# TillSync — Startup Roadmap

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend   │────▶│  Express API  │────▶│  PostgreSQL  │
│  (Dashboard) │     │  (REST v1)   │     │  (Primary)   │
└─────────────┘     └──────┬───────┘     └─────────────┘
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
| Runtime | Node.js 22+ LTS | Free | Server |
| Framework | Express | Free | HTTP |
| Database | PostgreSQL (prod) / SQLite (dev) | Free tier | Persistent storage |
| Cache/Sessions | Redis | Free tier (Railway) | Sessions + caching |
| Queue | BullMQ + Redis | Free | Async SMS delivery |
| Auth | JWT + express-session | Free | Authentication |
| SMS | Arkesel REST | GHS 0.035/SMS | Notifications |
| WhatsApp | WhatsApp Business API | Free (1000 msgs/mo) | Backup channel |
| Payments | MTN MoMo Collection API | Free (sandbox) | Webhooks |
| Frontend | HTML + Alpine.js | Free | Dashboard UI |
| Hosting | Railway | Free tier | Deployment |
| Monitoring | Sentry (free tier) | Free | Error tracking |

### Cost Breakdown (Monthly)

| Item | 10 Merchants | 100 Merchants | 1000 Merchants |
|------|-------------|---------------|----------------|
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
├── src/
│   ├── index.js              # Server entry
│   ├── config/
│   │   ├── database.js       # PostgreSQL pool
│   │   ├── redis.js          # Redis client
│   │   └── env.js            # Environment validation
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── tenant.js         # Tenant context extraction
│   │   ├── rbac.js           # Role enforcement
│   │   ├── rateLimiter.js    # Per-tenant limiting
│   │   └── audit.js          # Audit logging
│   ├── routes/
│   │   ├── auth.js           # Login/register
│   │   ├── merchants.js      # Merchant CRUD
│   │   ├── tills.js          # Till management
│   │   ├── attendants.js     # Attendant management
│   │   ├── webhook.js        # MoMo callback
│   │   └── dashboard.js      # Stats/analytics
│   ├── services/
│   │   ├── smsService.js     # Arkesel integration
│   │   ├── whatsappService.js # WhatsApp Business API
│   │   ├── momoService.js    # MoMo API helpers
│   │   ├── queueService.js   # BullMQ job processing
│   │   └── billingService.js # Subscription management
│   └── utils/
│       ├── errors.js         # Custom error classes
│       └── validators.js     # Input validation (zod)
├── public/
│   ├── index.html            # Landing page
│   ├── login.html            # Login
│   ├── dashboard.html        # Main dashboard
│   ├── settings.html         # Merchant settings
│   └── js/
│       └── app.js            # Alpine.js reactivity
├── db/
│   ├── migrations/           # Version-controlled schema
│   └── seeds/                # Test data
├── tests/
│   ├── auth.test.js
│   ├── webhook.test.js
│   └── tenant-isolation.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Phase 1: Foundation + Auth (Week 1)

**Goal:** Multi-tenant server with authentication.

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
npm install express pg redis connect-redis express-session
npm install jsonwebtoken bcryptjs zod helmet cors
npm install express-rate-limit bullmq
npm install --save-dev nodemon
```

---

## Phase 2: MoMo Webhook + Notifications (Week 2)

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

## Phase 3: Dashboard + State Management (Week 3)

**Goal:** Full merchant dashboard with session management.

### Deliverables
1. Redis-backed sessions (express-session + connect-redis)
2. Session-based auth (cookie) + API auth (JWT)
3. Dashboard routes:
   - `GET /dashboard` — stats overview
   - `GET /merchants` — list merchants
   - `POST /merchants` — create merchant
   - `GET /tills` — list tills
   - `POST /tills` — create till
   - `POST /tills/:id/attendants` — assign attendant
   - `GET /notifications` — notification history
   - `GET /settings` — merchant settings
4. Dashboard HTML (Alpine.js for reactivity)
5. Mobile-responsive design
6. Real-time notification count (polling or WebSocket)

---

## Phase 4: Billing + Referrals (Week 4)

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

## Phase 5: Monitoring + Security (Week 5)

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

## Phase 6: Deploy + Demo (Week 6)

**Goal:** Live production deployment.

### Deliverables
1. Railway deployment (auto-deploy from GitHub)
2. Environment variables configured
3. Database migrations run
4. MoMo sandbox → production switch
5. Demo script for investors/judges
6. README with setup instructions
7. Postman collection for API testing

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

```env
# Server
PORT=3000
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
APP_URL=http://localhost:3000
WEBHOOK_SECRET=your-webhook-secret
```
