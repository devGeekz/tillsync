# TillSync — Implementation Plan

## Collaborator Split

The project is split into two independent services that communicate via HTTP. Each collaborator owns one service and never edits the other's directory without asking first.

| | Collaborator A | Collaborator B |
|---|---|---|
| **Focus** | Backend (Express API) | Frontend (Next.js) |
| **Directory** | `backend/` | `frontend/` |
| **Stack** | Express, Prisma, Neon, Redis, BullMQ | Next.js, Tailwind, SWR, TypeScript |
| **Port** | 4000 | 3000 |
| **Owns** | All API logic, database, webhooks, SMS | All UI, pages, components, styling |

### Why This Split Works

```
┌─────────────────┐         ┌──────────────────┐
│   Collaborator B │         │   Collaborator A  │
│   Frontend       │  HTTP   │   Backend         │
│   (Next.js)      │────────▶│   (Express)       │
│                  │         │                   │
│   Owns:          │         │   Owns:           │
│   - Pages        │         │   - Routes        │
│   - Components   │         │   - Middleware     │
│   - Styling      │         │   - Services      │
│   - SWR hooks    │         │   - Prisma schema │
│                  │         │   - Database      │
└─────────────────┘         └──────────────────┘
```

**The rule:** Collaborator A never touches `frontend/`. Collaborator B never touches `backend/`. They communicate via the API contract.

---

## Coordination Points (Do First)

Before splitting work, both collaborators must do these three things together (same day, same time if possible).

### 1. API Contract (`api-contract.md`)

This is the agreement between frontend and backend. Create this file together before writing any code.

**How to create it:**
1. Sit together (or video call)
2. List every feature the dashboard needs
3. For each feature, define:
   - What URL does the frontend call?
   - What data does it send?
   - What data does it expect back?
4. Write it all in `api-contract.md`
5. Both sign off on it

**Example entry:**
```markdown
### Create Till
- **Endpoint:** POST /api/v1/tills
- **Auth:** Bearer token required
- **Request Body:**
  ```json
  {
    "tillNumber": "12345",
    "name": "Main Counter"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "id": "uuid",
    "tillNumber": "12345",
    "name": "Main Counter",
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00Z"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "error": "Till number already exists"
  }
  ```
```

**Why this matters:**
- Collaborator B knows exactly what data to expect
- Collaborator A knows exactly what to return
- No guessing, no "it doesn't work" back-and-forth

---

### 2. Git Branching Strategy

Both collaborators must follow this exact workflow:

**Step 1: Clone the repo**
```bash
git clone https://github.com/devGeekz/tillsync.git
cd tillsync
```

**Step 2: Create the `dev` branch (one time only)**
```bash
git checkout -b dev
git push -u origin dev
```

**Step 3: Create feature branches (every new task)**
```bash
# Collaborator A
git checkout dev
git checkout -b backend/auth

# Collaborator B
git checkout dev
git checkout -b frontend/login
```

**Step 4: Work on your branch**
```bash
# Make changes, commit often
git add .
git commit -m "feat: add JWT auth middleware"
```

**Step 5: Push and merge to `dev`**
```bash
git push -u origin backend/auth
# Then merge via GitHub PR (or locally):
git checkout dev
git merge backend/auth
git push origin dev
```

**Step 6: Delete your feature branch**
```bash
git branch -d backend/auth
git push origin --delete backend/auth
```

**Branch naming convention:**
- Backend: `backend/auth`, `backend/webhook`, `backend/tills`
- Frontend: `frontend/login`, `frontend/dashboard`, `frontend/tills`

**The golden rule:** Always pull from `dev` before starting a new branch:
```bash
git checkout dev
git pull origin dev
git checkout -b backend/new-feature
```

---

### 3. Environment Variables

Both collaborators must agree on variable names. Never rename a variable without telling the other person.

**Collaborator A creates `backend/.env`:**
```env
PORT=4000
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/tillsync?sslmode=require
REDIS_URL=redis://localhost:6379
JWT_SECRET=my-secret-key-agreed-both
MOMO_API_KEY=xxx
MOMO_API_SECRET=xxx
MOMO_SUBSCRIPTION_KEY=xxx
MOMO_ENVIRONMENT=sandbox
ARKESEL_API_KEY=xxx
ARKESEL_SENDER=TillSync
WHATSAPP_API_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
APP_URL=http://localhost:4000
WEBHOOK_SECRET=xxx
```

**Collaborator B creates `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=TillSync
```

**Shared secrets (must match):**
- `JWT_SECRET` — both use the same value
- `WEBHOOK_SECRET` — backend validates, but frontend might display it

---

## Communication Rules

### Daily Standup (5 minutes)
Every day, both collaborators share:
1. What I did yesterday
2. What I'm doing today
3. Any blockers

Can be done via WhatsApp, Slack, or in-person.

### When You Need to Change Something the Other Person Uses

**Scenario 1: You need to change an API endpoint**
1. Tell Collaborator B before making the change
2. Update `api-contract.md`
3. Wait for confirmation
4. Make the change

**Scenario 2: You need to change a shared variable**
1. Tell the other person
2. Both update their `.env` files
3. Test that it still works

**Scenario 3: You're stuck on something**
1. Tell the other person immediately
2. Don't wait until end of day
3. The other person might have the answer

---

## How to Test Your Work

### Collaborator A (Backend)
```bash
cd backend
npm run dev
# Test with curl or Postman
curl http://localhost:4000/api/v1/auth/me
```

### Collaborator B (Frontend)
```bash
cd frontend
npm run dev
# Open http://localhost:3000
# Check browser console for errors
```

### Integration Test (Both)
1. Collaborator A: `npm run dev` in `backend/`
2. Collaborator B: `npm run dev` in `frontend/`
3. Open http://localhost:3000
4. Try to login
5. If it works, the integration is correct

---

## Phase 1: Foundation (Days 1-3)

### Collaborator A — Backend Foundation

| Day | Task | Files |
|-----|------|-------|
| 1 | Initialize project, install deps | `backend/package.json` |
| 1 | Set up Express server | `backend/src/index.js` |
| 1 | Set up Prisma schema | `backend/prisma/schema.prisma` |
| 1 | Set up Neon connection | `backend/src/config/database.js` |
| 1 | Set up Redis client | `backend/src/config/redis.js` |
| 2 | Auth middleware (JWT) | `backend/src/middleware/auth.js` |
| 2 | Tenant context middleware | `backend/src/middleware/tenant.js` |
| 2 | RBAC middleware | `backend/src/middleware/rbac.js` |
| 2 | Auth routes (login/register) | `backend/src/routes/auth.js` |
| 3 | Rate limiter middleware | `backend/src/middleware/rateLimiter.js` |
| 3 | Error handling utils | `backend/src/utils/errors.js` |
| 3 | Validators (zod) | `backend/src/utils/validators.js` |
| 3 | Run `npx prisma migrate dev` | Database ready |

### Collaborator B — Frontend Foundation

| Day | Task | Files |
|-----|------|-------|
| 1 | Initialize Next.js app | `frontend/` (create-next-app) |
| 1 | Set up Tailwind config | `frontend/tailwind.config.ts` |
| 1 | Create folder structure | `frontend/app/`, `frontend/components/` |
| 2 | API client (axios) | `frontend/lib/api.ts` |
| 2 | Auth types | `frontend/lib/types.ts` |
| 2 | Auth helpers (token storage) | `frontend/lib/auth.ts` |
| 2 | Auth middleware (redirect) | `frontend/middleware.ts` |
| 3 | Login page | `frontend/app/login/page.tsx` |
| 3 | Register page | `frontend/app/register/page.tsx` |
| 3 | Root layout | `frontend/app/layout.tsx` |

### Day 3: Integration Check
Both verify:
- Backend runs on port 4000
- Frontend runs on port 3000
- Frontend can hit `GET /api/v1/auth/me` (even if 401)
- CORS works

---

## Phase 2: MoMo Webhook + Notifications (Days 5-8)

### Collaborator A — Backend Only

| Day | Task | Files |
|-----|------|-------|
| 5 | MoMo webhook endpoint | `backend/src/routes/webhook.js` |
| 5 | Webhook signature validation | `backend/src/services/momoService.js` |
| 5 | Idempotency check | `backend/src/services/momoService.js` |
| 6 | BullMQ queue setup | `backend/src/services/queueService.js` |
| 6 | Arkesel SMS service | `backend/src/services/smsService.js` |
| 6 | WhatsApp service | `backend/src/services/whatsappService.js` |
| 7 | Webhook logging | `backend/src/middleware/audit.js` |
| 7 | Till routes (CRUD) | `backend/src/routes/tills.js` |
| 8 | Attendant routes | `backend/src/routes/attendants.js` |
| 8 | Merchant routes | `backend/src/routes/merchants.js` |

### Collaborator B — Frontend (No Backend Changes)

| Day | Task | Files |
|-----|------|-------|
| 5 | Dashboard layout + sidebar | `frontend/app/dashboard/layout.tsx` |
| 5 | Sidebar component | `frontend/components/layout/Sidebar.tsx` |
| 5 | Header component | `frontend/components/layout/Header.tsx` |
| 6 | Dashboard overview page | `frontend/app/dashboard/page.tsx` |
| 6 | Stats card component | `frontend/components/ui/Card.tsx` |
| 7 | Till management page | `frontend/app/dashboard/tills/page.tsx` |
| 7 | Till card component | `frontend/components/tills/TillCard.tsx` |
| 7 | Till form component | `frontend/components/tills/TillForm.tsx` |
| 8 | Attendant management page | `frontend/app/dashboard/attendants/page.tsx` |
| 8 | Attendant table component | `frontend/components/attendants/AttendantTable.tsx` |

---

## Phase 3: Dashboard + State Management (Days 8-12)

### Collaborator A — Backend API

| Day | Task | Files |
|-----|------|-------|
| 9 | Dashboard stats endpoint | `backend/src/routes/dashboard.js` |
| 9 | Notification history endpoint | `backend/src/routes/dashboard.js` |
| 10 | Billing routes | `backend/src/routes/billing.js` |
| 10 | Subscription middleware | `backend/src/middleware/subscription.js` |
| 11 | Referral routes | `backend/src/routes/referrals.js` |
| 11 | Referral service | `backend/src/services/referralService.js` |
| 12 | API testing (Postman) | Collection exported |

### Collaborator B — Frontend Dashboard

| Day | Task | Files |
|-----|------|-------|
| 9 | SWR hooks | `frontend/hooks/useTills.ts`, `useNotifications.ts` |
| 9 | Notification history page | `frontend/app/dashboard/notifications/page.tsx` |
| 10 | Notification table component | `frontend/components/notifications/NotificationTable.tsx` |
| 10 | Settings page | `frontend/app/dashboard/settings/page.tsx` |
| 11 | Billing page | `frontend/app/dashboard/billing/page.tsx` |
| 11 | Subscription status component | `frontend/components/billing/SubscriptionCard.tsx` |
| 12 | Referral page | `frontend/app/dashboard/referrals/page.tsx` |

---

## Phase 4: Billing + Referrals (Days 12-15)

### Collaborator A — Billing Backend

| Day | Task | Files |
|-----|------|-------|
| 13 | MoMo collection integration | `backend/src/services/billingService.js` |
| 13 | Usage tracking (SMS count) | `backend/src/services/billingService.js` |
| 14 | Subscription enforcement | `backend/src/middleware/subscription.js` |
| 14 | Referral commission logic | `backend/src/services/referralService.js` |
| 15 | MoMo disbursement for payouts | `backend/src/services/billingService.js` |

### Collaborator B — Billing Frontend

| Day | Task | Files |
|-----|------|-------|
| 13 | Billing integration UI | `frontend/app/dashboard/billing/page.tsx` |
| 13 | Plan selection component | `frontend/components/billing/PlanCard.tsx` |
| 14 | Usage display component | `frontend/components/billing/UsageBar.tsx` |
| 14 | Referral stats component | `frontend/components/referrals/ReferralStats.tsx` |
| 15 | Referral code display | `frontend/components/referrals/ReferralCode.tsx` |

---

## Phase 5: Monitoring + Security (Days 15-18)

### Collaborator A — Backend Security

| Day | Task | Files |
|-----|------|-------|
| 16 | Sentry integration | `backend/src/index.js` |
| 16 | Winston logger | `backend/src/utils/logger.js` |
| 16 | Audit trail middleware | `backend/src/middleware/audit.js` |
| 17 | Helmet.js | `backend/src/index.js` |
| 17 | CORS hardening | `backend/src/index.js` |
| 17 | Input validation (all routes) | `backend/src/utils/validators.js` |
| 18 | Webhook retry logic | `backend/src/services/queueService.js` |
| 18 | Tenant isolation tests | `backend/tests/tenant-isolation.test.js` |

### Collaborator B — Frontend Polish

| Day | Task | Files |
|-----|------|-------|
| 16 | Error boundary | `frontend/components/ui/ErrorBoundary.tsx` |
| 16 | Loading states | `frontend/components/ui/Skeleton.tsx` |
| 17 | Mobile responsive pass | All page components |
| 17 | Form validation (client) | All form components |
| 18 | Toast notifications | `frontend/components/ui/Toast.tsx` |
| 18 | 404 page | `frontend/app/not-found.tsx` |

---

## Phase 6: Deploy + Demo (Days 18-21)

### Both Collaborators — Together

| Day | Task | Owner |
|-----|------|-------|
| 19 | Deploy backend to Railway | A |
| 19 | Deploy frontend to Vercel | B |
| 19 | Connect Neon database | A |
| 19 | Set up Redis on Railway | A |
| 20 | Configure environment variables | Both |
| 20 | Test full flow end-to-end | Both |
| 20 | MoMo sandbox testing | A |
| 21 | Demo script creation | Both |
| 21 | README documentation | Both |
| 21 | Final commit to main | Both |

---

## Conflict Avoidance Rules

### File Ownership

| Collaborator A (Backend) | Collaborator B (Frontend) |
|--------------------------|---------------------------|
| `backend/**` | `frontend/**` |
| `.gitignore` (backend parts) | `.gitignore` (frontend parts) |
| `roadmapmodified.md` | `implementationplan.md` |
| `README.md` | `api-contract.md` |

### Shared Files (Coordinate Before Editing)
- Root `.gitignore`
- Root `README.md`
- Any file in root directory

### Git Rules
1. **Never work on the same file at the same time**
2. **Pull before starting new work**
3. **Use feature branches**
4. **Write descriptive commit messages**
5. **Tag the other collaborator in PR comments**

### Communication
- **Daily sync**: Quick 5-min standup (what I did, what I'm doing, blockers)
- **Blockers**: If blocked, tell the other person immediately
- **API changes**: If changing the API contract, tell the other person before pushing

---

## Step-by-Step Setup (Day 1)

### Collaborator A — Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/devGeekz/tillsync.git
cd tillsync

# 2. Create backend directory and initialize
mkdir backend
cd backend
npm init -y

# 3. Install dependencies
npm install express @prisma/client redis connect-redis express-session
npm install jsonwebtoken bcryptjs zod helmet cors
npm install express-rate-limit bullmq
npm install --save-dev prisma nodemon

# 4. Initialize Prisma
npx prisma init

# 5. Create .env file (copy from roadmapmodified.md)
# 6. Set up Neon database and update DATABASE_URL in .env

# 7. Run migration
npx prisma migrate dev --name init

# 8. Start server
npm run dev
```

### Collaborator B — Frontend Setup

```bash
# 1. Clone the repo (same repo, different person)
git clone https://github.com/devGeekz/tillsync.git
cd tillsync

# 2. Create frontend with Next.js
npx create-next-app@latest frontend --typescript --tailwind --app --eslint
cd frontend

# 3. Install additional deps
npm install axios swr

# 4. Create .env.local (copy from roadmapmodified.md)
# 5. Start dev server
npm run dev
```

---

## Parallel Work Timeline

```
Day  1-3:   A (Backend)  ←──────────────────→  B (Frontend)
            Both set up foundations independently

Day  5-8:   A (Webhook + Routes)  ←──────────→  B (Dashboard Layout)
            A builds API, B builds UI shell

Day  8-12:  A (Stats + Billing API)  ←────────→  B (Dashboard Pages)
            A provides endpoints, B consumes them

Day 12-15:  A (Billing Logic)  ←──────────────→  B (Billing UI)
            Both work on billing feature

Day 15-18:  A (Security)  ←───────────────────→  B (Polish)
            A hardens backend, B polishes frontend

Day 18-21:  Both deploy together
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API contract drift | Document in `api-contract.md`, update before coding |
| Merge conflicts | Daily pulls, feature branches, clear file ownership |
| One person blocked | Other person can continue on their domain |
| Deployment issues | Both present during deploy phase |
| MoMo sandbox issues | A handles backend, B continues frontend work |

---

## Deliverables Checklist

### Backend (Collaborator A)
- [ ] Express server running
- [ ] Prisma schema migrated to Neon
- [ ] JWT auth working
- [ ] MoMo webhook receiving
- [ ] Arkesel SMS sending
- [ ] BullMQ queue processing
- [ ] All CRUD routes functional
- [ ] Rate limiting active
- [ ] Sentry integrated
- [ ] Tests passing

### Frontend (Collaborator B)
- [ ] Next.js app running
- [ ] Tailwind styled
- [ ] Login/Register pages
- [ ] Dashboard layout
- [ ] Till management page
- [ ] Attendant management page
- [ ] Notification history page
- [ ] Settings page
- [ ] Billing page
- [ ] Mobile responsive

### Both
- [ ] `api-contract.md` agreed upon
- [ ] Git branching strategy followed
- [ ] Environment variables configured
- [ ] End-to-end flow working
- [ ] Demo ready
- [ ] README complete
