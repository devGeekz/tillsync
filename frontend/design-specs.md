# TillSync — Page Design Specs

> Use this document to design each page on Google Stitch.
> Each page lists the exact elements, layout, and data needed.

---

## 1. Landing Page (`/`)

**Purpose:** Marketing page to convert visitors.

**Elements:**
- Hero section with headline + subheadline + CTA button
- Features section (3 cards: Real-time SMS, Secure, No POS needed)
- How it works section (3 steps: Register Till → Customer Pays → Attendant Notified)
- Pricing section (3 plan cards: Trial, Basic, Pro)
- Footer with links

**Design notes:**
- Mobile-first, clean, modern
- Colors: Green (#22C55E) primary, dark gray text
- CTA: "Get Started Free"

---

## 2. Login Page (`/login`)

**Purpose:** Merchant/attendant login.

**Elements:**
- Centered card on dark background
- Logo at top
- Phone number input (with country code +233)
- Password input with show/hide toggle
- "Login" button (full width, green)
- "Don't have an account? Register" link
- "Forgot password?" link

**Form fields:**
```
Phone: +233 [________] (required, format: +233XXXXXXXXX)
Password: [________] (required, min 8 chars)
```

**Error states:**
- Invalid phone format
- Wrong password
- Network error

---

## 3. Register Page (`/register`)

**Purpose:** New merchant registration.

**Elements:**
- Centered card on dark background
- Logo at top
- Business name input
- Phone number input
- Email input (optional)
- Password input
- Confirm password input
- "Register" button (full width, green)
- "Already have an account? Login" link

**Form fields:**
```
Business Name: [________] (required)
Phone: +233 [________] (required)
Email: [________] (optional)
Password: [________] (required, min 8 chars)
Confirm Password: [________] (must match)
```

**Error states:**
- Phone already registered
- Passwords don't match
- Missing required fields

---

## 4. Dashboard Layout (`/dashboard/*`)

**Purpose:** Shared layout for all dashboard pages.

**Elements:**
- Sidebar (left, 250px wide, collapsible on mobile)
  - Logo at top
  - Navigation links:
    - Dashboard (home icon)
    - Tills (credit card icon)
    - Attendants (users icon)
    - Notifications (bell icon)
    - Billing (dollar icon)
    - Referrals (gift icon)
    - Settings (gear icon)
  - Logout button at bottom
- Header (top, fixed)
  - Page title (dynamic)
  - Notification bell with badge count
  - User avatar + name dropdown
- Main content area (scrollable)

**Mobile:**
- Sidebar becomes hamburger menu
- Header stays fixed
- Content full width

---

## 5. Dashboard Overview (`/dashboard`)

**Purpose:** At-a-glance stats for the merchant.

**Elements:**
- Stats cards row (4 cards):
  - Total Tills (number, icon)
  - Active Attendants (number, icon)
  - Notifications Today (number, icon)
  - SMS Sent This Month (number, icon)
- Recent Notifications table (last 5)
  - Columns: Till, Amount, Sender, Status, Time
- Quick Actions section:
  - "Add New Till" button
  - "Add Attendant" button

**Layout:**
```
┌──────────┬──────────┬──────────┬──────────┐
│  Tills   │ Attendants│  Today   │  SMS     │
│    3     │    5     │    12    │   342    │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────┐
│ Recent Notifications                        │
│ ┌─────┬──────┬────────┬────────┬──────────┐ │
│ │ Till │ Amount│ Sender │ Status │  Time    │ │
│ ├─────┼──────┼────────┼────────┼──────────┤ │
│ │12345│ GH¢150│ John   │ ✅ Sent│ 2m ago  │ │
│ └─────┴──────┴────────┴────────┴──────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ + Add New Till   │  │ + Add Attendant │
└─────────────────┘  └─────────────────┘
```

---

## 6. Till Management (`/dashboard/tills`)

**Purpose:** Manage merchant tills.

**Elements:**
- Page header: "My Tills" + "Add Till" button
- Till cards grid (3 columns on desktop, 1 on mobile)
  - Each card shows:
    - Till number (large text)
    - Till name
    - Status badge (Active/Inactive)
    - Number of attendants assigned
    - Edit button
    - Delete button (with confirmation)
- Empty state: "No tills yet. Add your first till."

**Add Till Modal:**
- Till number input (required, numeric)
- Till name input (required)
- "Save" and "Cancel" buttons

**Card layout:**
```
┌─────────────────────┐
│ Till #12345         │
│ Main Counter        │
│ Status: ● Active    │
│ Attendants: 2       │
│                     │
│ [Edit]  [Delete]    │
└─────────────────────┘
```

---

## 7. Attendant Management (`/dashboard/attendants`)

**Purpose:** Manage attendants and assign to tills.

**Elements:**
- Page header: "My Attendants" + "Add Attendant" button
- Attendant table:
  - Columns: Name, Phone, Assigned Tills, Status, Actions
  - Actions: Edit, Delete, Assign to Till
- Empty state: "No attendants yet. Add your first attendant."

**Add Attendant Modal:**
- Name input (required)
- Phone number input (required, +233 format)
- Password input (required)
- "Save" and "Cancel" buttons

**Assign to Till Modal:**
- Dropdown to select till
- "Assign" and "Cancel" buttons

**Table layout:**
```
┌──────────┬───────────────┬──────────┬────────┬──────────┐
│  Name    │    Phone      │   Tills  │ Status │ Actions  │
├──────────┼───────────────┼──────────┼────────┼──────────┤
│  Kofi    │ +233244123456 │ 12345    │ Active │ [Edit]   │
│  Ama     │ +233244789012 │ 12345,   │ Active │ [Delete] │
│          │               │ 67890    │        │ [Assign] │
└──────────┴───────────────┴──────────┴────────┴──────────┘
```

---

## 8. Notification History (`/dashboard/notifications`)

**Purpose:** View all payment confirmations sent.

**Elements:**
- Page header: "Notifications"
- Filter bar:
  - Date range picker (start/end)
  - Status dropdown (All, Sent, Delivered, Failed)
  - Till dropdown (All, 12345, 67890)
- Notifications table:
  - Columns: Time, Till, Amount, Sender, Channel, Status
  - Pagination at bottom
- Export CSV button
- Empty state: "No notifications yet."

**Table layout:**
```
┌─────────────┬───────┬──────────┬──────────────┬─────────┬──────────┐
│    Time     │  Till │  Amount  │    Sender    │ Channel │  Status  │
├─────────────┼───────┼──────────┼──────────────┼─────────┼──────────┤
│ 2m ago      │ 12345 │ GH¢150   │ John Doe     │ SMS     │ ✅ Sent  │
│ 15m ago     │ 67890 │ GH¢50    │ Ama Asante   │ SMS     │ ✅ Deliv │
│ 1h ago      │ 12345 │ GH¢200   │ Kofi Mensah  │ SMS     │ ❌ Failed│
└─────────────┴───────┴──────────┴──────────────┴─────────┴──────────┘

Pagination: < 1 2 3 ... 10 >
```

---

## 9. Billing Page (`/dashboard/billing`)

**Purpose:** Manage subscription and view invoices.

**Elements:**
- Current plan card:
  - Plan name (Trial/Basic/Pro/Enterprise)
  - Status (Active/Pending/Expired)
  - Expiry date
  - Tills used / allowed
  - SMS used / allowed
  - "Upgrade Plan" button
- Plan selection cards (3 cards):
  - Trial: Free, 1 till, 100 SMS
  - Basic: GHS 15/mo, 3 tills, Unlimited SMS
  - Pro: GHS 30/mo, 10 tills, Unlimited SMS
- Invoice history table:
  - Columns: Date, Plan, Amount, Status
  - Pagination

**Current plan card:**
```
┌─────────────────────────────────────────────┐
│ Current Plan: Basic                         │
│ Status: ● Active                            │
│ Expires: Feb 15, 2026                       │
│                                             │
│ Tills: ████████░░ 2/3                       │
│ SMS:   ██████████ 150/Unlimited            │
│                                             │
│ [Upgrade Plan]                              │
└─────────────────────────────────────────────┘
```

**Plan cards:**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Trial     │  │   Basic     │  │    Pro      │
│   Free      │  │  GHS 15/mo  │  │  GHS 30/mo  │
│             │  │             │  │             │
│ 1 Till      │  │ 3 Tills     │  │ 10 Tills    │
│ 100 SMS     │  │ Unlimited   │  │ Unlimited   │
│             │  │             │  │             │
│ [Current]   │  │ [Select]    │  │ [Select]    │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 10. Referrals Page (`/dashboard/referrals`)

**Purpose:** View referral code and stats.

**Elements:**
- Referral code card:
  - Code display (large, copyable)
  - Referral link (copyable)
  - "Copy Code" button
  - "Copy Link" button
- Stats cards row:
  - Total Referrals (number)
  - Successful (number)
  - Pending (number)
  - Commission Earned (GHS amount)
- Referred merchants table:
  - Columns: Merchant Name, Date Referred, Status, Commission

**Referral code card:**
```
┌─────────────────────────────────────────────┐
│ Your Referral Code                          │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │           KWAME2026                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Link: https://tillsync.app/register?ref=... │
│                                             │
│ [Copy Code]  [Copy Link]                    │
└─────────────────────────────────────────────┘
```

**Stats cards:**
```
┌──────────┬──────────┬──────────┬──────────┐
│  Total   │ Success  │ Pending  │Commission│
│    5     │    3     │    2     │  GHS 15  │
└──────────┴──────────┴──────────┴──────────┘
```

---

## 11. Settings Page (`/dashboard/settings`)

**Purpose:** Merchant profile and account settings.

**Elements:**
- Profile section:
  - Business name input
  - Email input
  - Phone number (read-only, with change request)
  - "Save Changes" button
- Password section:
  - Current password input
  - New password input
  - Confirm new password input
  - "Update Password" button
- Danger zone:
  - "Delete Account" button (with confirmation modal)

**Profile section:**
```
┌─────────────────────────────────────────────┐
│ Profile                                     │
│                                             │
│ Business Name: [Kwame's Shop          ]     │
│ Email:         [kwame@example.com     ]     │
│ Phone:         [+233244123456] (read-only)  │
│                                             │
│ [Save Changes]                              │
└─────────────────────────────────────────────┘
```

**Password section:**
```
┌─────────────────────────────────────────────┐
│ Change Password                             │
│                                             │
│ Current Password: [________]                │
│ New Password:     [________]                │
│ Confirm Password: [________]                │
│                                             │
│ [Update Password]                           │
└─────────────────────────────────────────────┘
```

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Green | #22C55E | Buttons, links, success |
| Dark Gray | #1F2937 | Text, sidebar bg |
| Light Gray | #F3F4F6 | Backgrounds, borders |
| White | #FFFFFF | Cards, inputs |
| Red | #EF4444 | Errors, delete, danger |
| Yellow | #F59E0B | Warnings, pending |
| Blue | #3B82F6 | Info, links |

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 32px | Bold |
| H2 | Inter | 24px | Semibold |
| H3 | Inter | 20px | Semibold |
| Body | Inter | 16px | Regular |
| Small | Inter | 14px | Regular |
| Button | Inter | 16px | Medium |

## Spacing

| Element | Padding | Margin |
|---------|---------|--------|
| Card | 24px | 16px |
| Button | 12px 24px | 8px |
| Input | 12px | 8px |
| Table row | 16px | 0 |
| Page section | 32px | 24px |
