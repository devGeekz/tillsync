# TillSync — Project Roadmap

## Overview
Real-time, read-only MoMo payment confirmations for shop attendants in Ghana.

## What Got Cut (ponytail ladder)

| Old | New | Why |
|-----|-----|-----|
| `better-sqlite3` | `node:sqlite` (stdlib) | Built into Node 22+, zero deps |
| `services/smsService.js` | Inline in server.js | It's one `fetch()` call |
| `services/momoService.js` | Inline in server.js | It's the webhook handler |
| `routes/webhook.js` | Inline in server.js | One route, one file |
| `routes/dashboard.js` | Inline in server.js | Four routes, one file |
| `database/db.js` + `schema.sql` | Inline `CREATE TABLE` in server.js | Runs once on startup |
| 15-day timeline | 3-day timeline | Whole thing is <500 lines |

## Tech Stack

| Layer | Choice | Cost |
|-------|--------|------|
| Runtime | Node.js 22+ (for `node:sqlite`) | Free |
| Framework | Express | Free |
| Database | `node:sqlite` (stdlib) | Free |
| SMS | Arkesel REST API (native `fetch`) | GHS 0.035/SMS |
| Payments | MTN MoMo Collection API | Free (sandbox) |
| Hosting | Railway (free tier) | Free ($5 credit/mo) |
| Frontend | Plain HTML in `public/` | Free |

**MVP cost: ~GHS 0.035 per SMS sent. Nothing else.**

---

## Directory Structure (Final)

```
tillsync/
├── server.js          # Everything: routes, DB, SMS, webhook
├── package.json
├── .env               # ARKESEL_API_KEY, MOMO_*
├── .gitignore
├── public/
│   └── dashboard.html # Single page: map tills → attendants
├── tillsyncbase.md    # Original spec
└── roadmap.md         # This file
```

One file. One dependency (express). One HTML page.

---

## Phase 1: Server + DB (Day 1)

`server.js` with:
- `node:sqlite` creating `merchants`, `attendants`, `notifications` tables on startup
- Express listening on `process.env.PORT || 3000`

```
npm init -y
npm install express dotenv
```

`.gitignore`: `node_modules/`, `.env`, `*.db`

---

## Phase 2: Webhook + SMS (Day 2)

`server.js` gains:
- `POST /momo-callback` — parses MoMo payload, stores in DB, looks up attendant by till_id, sends SMS via Arkesel `fetch()`
- SMS format: `Confirmed: GH¢{amount} received from {sender}. Till {till_id}.`
- Arkesel call is literally:
  ```js
  fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: { 'api-key': process.env.ARKESEL_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: 'TillSync', message: msg, recipients: [phone] })
  })
  ```

---

## Phase 3: Dashboard + Deploy (Day 3)

`server.js` gains:
- `GET /dashboard` — serves `public/dashboard.html`
- `POST /merchants` — register till
- `POST /attendants` — map attendant to till
- `DELETE /attendants/:id` — remove

`public/dashboard.html`: single page with forms for the above.

Deploy: push to GitHub → connect Railway → set env vars → done.

---

## Milestones

| Day | What works |
|-----|------------|
| 1 | `npm start` → server runs, DB tables exist |
| 2 | POST to `/momo-callback` → SMS arrives on phone |
| 3 | Dashboard live, full demo flow working |

---

## Future (only when needed)

| Feature | When |
|---------|------|
| WhatsApp backup channel | When SMS latency hurts |
| Subscription billing | When first paying customer |
| Multi-merchant scaling | When one merchant isn't enough |
| Production MoMo creds | When sandbox stops working |
