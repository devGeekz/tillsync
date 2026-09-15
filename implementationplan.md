# TillSync — Implementation Plan

## Collaborator Split

| | Collaborator A | Collaborator B |
|---|---|---|
| **Focus** | Backend (Express API) | Frontend (Next.js) |
| **Directory** | `backend/` | `frontend/` |
| **Stack** | Express, Prisma, Neon, Redis, BullMQ | Next.js, Tailwind, SWR, TypeScript |
| **Port** | 4000 | 3000 |

---

## Coordination Points (Do First)

Before splitting work, both collaborators must agree on:

### 1. API Contract (`api-contract.md`)
Create this file together before starting. Define:
- All endpoint URLs
- Request body shapes
- Response body shapes
- Error response formats
- Auth header format

### 2. Git Branching Strategy
```
main (production)
├── dev (integration branch)
│   ├── backend/* (Collaborator A branches)
│   └── frontend/* (Collaborator B branches)
```

**Rules:**
- Never push directly to `main`
- Create feature branches: `backend/auth`, `frontend/dashboard`
- Merge to `dev` first, then `dev` → `main`
- Pull from `dev` before starting new work

### 3. Environment Variables
Both agree on variable names (no renaming without telling the other):

**Backend (.env):**
```
PORT=4000
DATABASE_URL=neon_connection_string
REDIS_URL=redis://localhost:6379
JWT_SECRET=shared_secret
MOMO_API_KEY=xxx
ARKESEL_API_KEY=xxx
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

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
