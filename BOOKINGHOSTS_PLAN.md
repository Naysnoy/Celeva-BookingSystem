# BookingHosts — Complete Plan, Architecture & Implementation Guide

## What is BookingHosts?

A **host-only SaaS dashboard (PWA)** for Airbnb hosts, apartment landlords, and resort owners to manage bookings, revenue, expenses, property guides, and schedules — all in one versatile platform. One-time payment model. The app adapts based on which property types each host manages.

**Domain:** `https://booking.celevainvites.com`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + TypeScript + Vite (PWA) |
| Package Manager | npm |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand + TanStack Query |
| Routing | React Router v6 |
| Calendar | FullCalendar (monthly grid) + Planby (timeline/Gantt) |
| Charts | Recharts |
| Backend | Firebase Cloud Functions (Node.js + TS) |
| Database | Firestore |
| Storage | Firebase Storage |
| Auth | Firebase Auth (email/password + Google) |
| Payments | Manual (GCash/Bank Transfer via Facebook — admin activates in Firestore) |
| Email | SendGrid via Cloud Functions |
| Deploy | Netlify (frontend) + Firebase (backend) |
| Domain | `booking.celevainvites.com` → Netlify |

---

## Pricing Model (One-Time Payment)

| Plan | Price | Properties | Types | Bookings | Photos/IDs/Bills | Guide Links |
|------|-------|-----------|-------|----------|------------------|-------------|
| **Free** | ₱0 forever | 1 property | Any 1 type | 3 total (lifetime) | ❌ | ✅ (1 link) |
| **Starter** | ₱999 one-time | Unlimited | 1 chosen type | Unlimited | ✅ | ✅ |
| **Pro** | ₱1,999 one-time | Unlimited | All types | Unlimited | ✅ | ✅ |
| **Starter → Pro Upgrade** | ₱1,000 one-time | Unlocks remaining types | | | | |

### Payment Flow (Manual via Facebook + Celeva Admin)

- Free → tries to add 2nd property or 4th booking → upgrade prompt
- User clicks "Get Starter" or "Get Pro" → `pendingPlan` saved in Firestore → redirected to Facebook Messenger (m.me/celevainvitation)
- User sends payment via GCash or bank transfer + their registered email
- Admin verifies payment on Facebook → goes to **Celeva Admin Page** → finds user → activates plan
- Celeva Admin updates Firestore: `plan`, `allowedTypes`, `amountPaid`, clears `pendingPlan`
- BookingHosts `AuthContext` (`onSnapshot`) picks up the change in real-time → features unlock instantly
- Starter → tries to add different type → "Upgrade to Pro for ₱1,000" → same manual flow
- Pro → everything unlocked forever

### Admin Activation (Celeva Admin Page)

- Plan activation is handled on the **separate Celeva Admin Page** (not Firebase Console)
- Admin searches for user by email → sees `pendingPlan` → verifies payment → clicks activate
- Celeva Admin writes to Firestore (`celeva` database) → `BookingHosts/{userId}`:
  - `plan` → `"starter"` or `"pro"`
  - `allowedTypes` → `["airbnb"]` (starter) or `["airbnb", "resort", "apartment"]` (pro)
  - `amountPaid` → `999` / `1999` / previous + `1000`
  - `paidAt` → current timestamp
  - `pendingPlan` → `null`
- No webhook or Cloud Function needed — direct Firestore write from admin

### Lock Behavior

- **Free users are NEVER locked out of existing data** — they just can't add beyond limits
- Can always VIEW existing bookings, calendar, revenue
- Upgrade prompt shown when hitting limits

---

## Firestore Structure

### Collections

| Collection | Document ID | Scope |
|---|---|---|
| `BookingHosts` | `{userId}` — Firebase Auth UID | Private (owner only) |
| `BookingHosts/{userId}/properties` | `{propertyId}` — formatted | Private |
| `BookingHosts/{userId}/bookings` | `{bookingId}` — formatted | Private |
| `BookingHosts/{userId}/expenses` | `{expenseId}` — formatted | Private |
| `BookingHosts/{userId}/notifications` | `{notificationId}` — formatted | Private |
| `BookingCheckInLinks` | `{shareToken}` — formatted | Public (anyone can read) |

### ID Format Standard

| Collection | Format | Example |
|---|---|---|
| userId | Firebase Auth UID (immutable) | `uXk9R2mNpQr7wZ3yF1dL` |
| propertyId | `prop_{type}_{shortName}_{YYYYMMDD}_{4hex}` | `prop_airbnb_sunset-villa_20260523_a3k7` |
| bookingId | `book_{guestLast}_{YYYYMMDD}_{4hex}` | `book_santos_20260601_f8m2` |
| expenseId | `exp_{category}_{YYYYMMDD}_{4hex}` | `exp_maintenance_20260520_r4n7` |
| notificationId | `notif_{type}_{YYYYMMDD}_{4hex}` | `notif_checkin_20260531_p9w3` |
| shareToken | `guide_{shortName}_{6hex}` | `guide_sunset-villa_x7k2m9` |

### Document Schemas

#### `BookingHosts/{userId}` (Main Document)

```
{
  id: string,                    // PK (Firebase Auth UID)
  email: string,
  displayName: string,
  photoURL: string,
  currency: string,              // "PHP"
  plan: string,                  // "free" | "starter" | "pro"
  allowedTypes: string[],        // ["airbnb"] or ["airbnb", "resort", "apartment"]
  amountPaid: number,            // 0 | 999 | 1999
  paidAt: Timestamp | null,
  pendingPlan: string | null,        // "starter" | "pro" | null (set when user requests upgrade)
  paymentLinkId: string | null,       // reserved for future automated payments
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `BookingHosts/{userId}/properties/{propertyId}`

```
{
  id: string,                    // PK
  userId: string,                // FK → parent
  name: string,
  address: string,
  type: string,                  // "airbnb" | "resort" | "apartment" | "condo" | "house"
  bedrooms: number,
  bathrooms: number,
  photos: string[],              // Firebase Storage URLs [PAID ONLY]
  defaultRate: number,
  currency: string,
  notes: string,
  guide: {                       // embedded guide object (fields depend on type)
    // COMMON (all types)
    locationMap: string,         // Google Maps link
    address: string,
    contactName: string,
    contactNumber: string,
    houseRules: string,
    extraNotes: string,

    // AIRBNB fields
    wifiName: string | null,
    wifiPassword: string | null,
    checkInTime: string | null,
    checkOutTime: string | null,
    keyInstructions: string | null,
    parkingInfo: string | null,
    snacks: string | null,
    paymentNotes: string | null,

    // RESORT fields
    karaokeRules: string | null,
    extraCharges: [{item: string, price: number}] | null,
    poolRules: string | null,
    amenities: [{name: string, price: number, per: string}] | null,
    capacityLimit: number | null,

    // APARTMENT fields
    monthlyRent: number | null,
    rentDueDate: number | null,  // day of month (1-31)
    paymentMethod: string | null,
    leaseStart: Timestamp | null,
    leaseEnd: Timestamp | null,
    utilities: [{type: string, amount: number, dueDate: number, billPhoto: string | null}] | null,
    maintenanceContact: string | null,
    buildingRules: string | null
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `BookingHosts/{userId}/bookings/{bookingId}`

```
{
  id: string,                    // PK
  userId: string,                // FK → parent
  propertyId: string,            // FK → property
  propertyType: string,          // denormalized from property
  propertyName: string,          // denormalized for display
  guestName: string,
  guestEmail: string,
  guestPhone: string,
  guestIdFront: string | null,   // Storage URL [PAID ONLY]
  guestIdBack: string | null,    // Storage URL [PAID ONLY]
  checkIn: Timestamp,
  checkOut: Timestamp,
  nights: number,
  status: string,                // "confirmed" | "pending" | "cancelled" | "completed"
  source: string,                // "manual" | "airbnb" | "booking.com" | "other"
  revenue: number,
  platformFee: number,
  cleaningFee: number,
  otherExpenses: number,
  netProfit: number,             // auto-calc: revenue - platformFee - cleaningFee - otherExpenses
  notes: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `BookingHosts/{userId}/expenses/{expenseId}`

```
{
  id: string,                    // PK
  userId: string,                // FK → parent
  propertyId: string | null,     // FK → property (null if general expense)
  propertyName: string | null,   // denormalized
  category: string,              // "maintenance" | "utilities" | "supplies" | "cleaning" | "other"
  amount: number,
  date: Timestamp,
  description: string,
  receiptUrl: string | null,     // Storage URL [PAID ONLY]
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `BookingHosts/{userId}/notifications/{notificationId}`

```
{
  id: string,                    // PK
  userId: string,                // FK → parent
  type: string,                  // "checkIn" | "checkOut" | "newBooking" | "payment" | "rentDue"
  title: string,
  message: string,
  read: boolean,
  relatedBookingId: string | null,   // FK → booking
  relatedPropertyId: string | null,  // FK → property
  createdAt: Timestamp
}
```

#### `BookingCheckInLinks/{shareToken}` (PUBLIC)

```
{
  id: string,                    // PK (also the URL token)
  userId: string,                // FK → BookingHosts
  propertyId: string,            // FK → property
  propertyType: string,
  propertyName: string,
  photos: string[],              // denormalized from property
  guide: { ... },                // denormalized from property
  isActive: boolean,             // host can deactivate
  createdAt: Timestamp,
  updatedAt: Timestamp,
  expiresAt: Timestamp | null
}
```

### Sample Data

#### `BookingHosts/uXk9R2mNpQr7wZ3yF1dL`

| Field | Value |
|-------|-------|
| email | "juan.delacruz@gmail.com" |
| displayName | "Juan Dela Cruz" |
| plan | "pro" |
| allowedTypes | ["airbnb", "resort", "apartment"] |
| amountPaid | 1999 |

#### `BookingHosts/uXk9R2mNpQr7wZ3yF1dL/properties/prop_airbnb_sunset-villa_20260523_a3k7`

| Field | Value |
|-------|-------|
| name | "Sunset Villa" |
| address | "123 Beach Road, Mactan, Cebu" |
| type | "airbnb" |
| bedrooms | 2 |
| defaultRate | 3500 |

#### `BookingHosts/uXk9R2mNpQr7wZ3yF1dL/bookings/book_santos_20260601_f8m2`

| Field | Value |
|-------|-------|
| propertyId | "prop_airbnb_sunset-villa_20260523_a3k7" |
| propertyType | "airbnb" |
| propertyName | "Sunset Villa" |
| guestName | "Maria Santos" |
| checkIn | June 1, 2026 |
| checkOut | June 3, 2026 |
| nights | 2 |
| status | "confirmed" |
| source | "airbnb" |
| revenue | 7000 |
| platformFee | 210 |
| cleaningFee | 500 |
| netProfit | 6290 |

#### `BookingCheckInLinks/guide_sunset-villa_x7k2m9`

Guest accesses via: `https://booking.celevainvites.com/guide/guide_sunset-villa_x7k2m9`

---

## Security Architecture

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Private — only owner can read/write
    match /BookingHosts/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Public — anyone can read (guests), only authenticated users can write
    match /BookingCheckInLinks/{token} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Path Convention

```
storage/
├── {userId}/
│   ├── properties/{propertyId}/photo_1.jpg
│   ├── bookings/{bookingId}/id_front.jpg, id_back.jpg
│   ├── expenses/{expenseId}/receipt.jpg
│   └── bills/{propertyId}/electric_202606.jpg
```

### Security Layers

| Layer | Protection |
|---|---|
| Authentication | Firebase Auth (email/password + Google OAuth) |
| Authorization (Firestore) | User can only read/write own `BookingHosts/{uid}/**` |
| Authorization (Storage) | User can only upload/read own `{uid}/**` path |
| Public data | Only `BookingCheckInLinks` readable without auth |
| Guest link security | 6 hex chars = 16.7M combinations, unguessable, deactivatable |
| Input validation | Cloud Functions validate data server-side |
| File uploads | Validate type (jpg/png/webp/pdf) + size (max 5MB) |
| Environment secrets | Firebase config in `.env` (client-side, non-secret) |
| HTTPS | Enforced by Netlify + Firebase (automatic SSL) |

---

## Feature Matrix

| Feature | Free | Starter (₱999) | Pro (₱1,999) |
|---------|------|-----------------|--------------|
| Properties | 1 | Unlimited (1 type) | Unlimited (all types) |
| Bookings | 3 total | Unlimited | Unlimited |
| Property types | Any 1 | 1 chosen type | All types |
| Calendar — Monthly grid | ✅ | ✅ | ✅ |
| Calendar — Timeline/Gantt | ❌ | ✅ | ✅ |
| Revenue — Basic totals | ✅ | ✅ | ✅ |
| Revenue — Advanced analytics (charts, forecasts) | ❌ | ✅ | ✅ |
| Property photos | ❌ | ✅ | ✅ |
| Guest ID upload | ❌ | ✅ | ✅ |
| Receipt/bill photos | ❌ | ✅ | ✅ |
| Property guide (adapts by type) | ✅ (1 property) | ✅ | ✅ |
| Shareable guide link for guest/tenant | ✅ (1 link) | ✅ | ✅ |
| CSV/iCal import | ❌ | ✅ | ✅ |
| Email notifications | ❌ | ✅ | ✅ |
| In-app notifications | ✅ | ✅ | ✅ |
| Expense tracking | ✅ | ✅ | ✅ |
| Conflict detection (no double-booking) | ✅ | ✅ | ✅ |
| Dark mode | ✅ | ✅ | ✅ |
| PWA (installable) | ✅ | ✅ | ✅ |

---

## Versatile Guide System

The guide form and shared link page **adapt based on property type**. One component, conditional rendering.

### Airbnb — Self Check-in Guide

- 📍 Location (Google Maps embed)
- ⏰ Check-in/out times
- 🔑 Key/lockbox instructions
- 📶 WiFi name + password (tap to copy)
- 🅿️ Parking info
- 🍪 Snacks available
- 💰 Payment notes
- 🏠 House rules
- 📞 Contact number (tap to call)
- 📸 Property photos

### Resort — Resort Guidelines

- 📍 Location (Google Maps)
- ⏰ Check-in/out times
- 🎤 Karaoke rules + hours
- 💺 Extra charges (chair ₱50, corkage ₱500, towel ₱30, mattress ₱200)
- 🏊 Pool rules
- 🎯 Amenities + prices (kayak ₱200/hr, videoke ₱500/session, BBQ free)
- 👥 Capacity limit
- 🏠 House rules
- 📞 Contact number
- 📸 Property photos

### Apartment — Tenant Info (permanent link)

- 📍 Location (Google Maps)
- 💰 Monthly rent + due date
- 💳 Payment method (GCash/bank details)
- 📊 Utility bills + amounts + due dates + bill photos (host updates monthly)
- 📋 Lease dates (start/end)
- 🔧 Maintenance contact
- 🏢 Building rules
- 📞 Landlord contact

---

## Photos/Files Stored (Firebase Storage)

| File | Uploaded by | Visible to Host | Shared with Guest/Tenant |
|------|-------------|----------------|-------------------------|
| Property photos | Host | ✅ | ✅ (via shared guide link) |
| Guest ID (front/back) | Host | ✅ | ❌ Never |
| Expense receipts | Host | ✅ | ❌ Never |
| Apartment bills (electric/water) | Host | ✅ | ✅ (tenant sees on shared link) |

---

## Relational Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     BookingHosts/{userId}                         │
│                                                                   │
│  ┌──────────────┐       ┌──────────────────┐                    │
│  │  properties/  │◄──────│    bookings/      │                    │
│  │ {propertyId}  │  FK   │ propertyId (FK)   │                    │
│  │ photos→Storage│       │ guestId→Storage   │                    │
│  │ guide (embed) │       └────────┬─────────┘                    │
│  └──────┬───────┘                │                                │
│         │       ┌────────────────┘                                │
│  ┌──────▼───────▼──┐     ┌──────────────────┐                   │
│  │   expenses/      │     │  notifications/   │                   │
│  │ propertyId (FK)  │     │ relatedBookingId  │                   │
│  │ receipt→Storage  │     │ relatedPropertyId │                   │
│  └─────────────────┘     └──────────────────┘                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ userId + propertyId
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│            BookingCheckInLinks/{shareToken}                       │
│  userId (FK), propertyId (FK), guide (denormalized)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
C:\...\BookingSystem\
├── public/
│   ├── assets/images/
│   ├── manifest.json          (PWA manifest)
│   ├── sw.js                  (Service worker)
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── providers.tsx
│   ├── pages/
│   │   ├── auth/              (LoginPage, RegisterPage, ForgotPasswordPage)
│   │   ├── dashboard/         (DashboardPage)
│   │   ├── properties/        (PropertiesPage, PropertyDetailPage, AddPropertyPage)
│   │   ├── bookings/          (BookingsPage, BookingDetailPage, AddBookingPage)
│   │   ├── calendar/          (CalendarPage)
│   │   ├── revenue/           (RevenuePage)
│   │   ├── expenses/          (ExpensesPage, AddExpensePage)
│   │   ├── settings/          (SettingsPage)
│   │   ├── pricing/           (PricingPage — public)
│   │   └── guide/             (GuestGuidePage — public, no auth needed)
│   ├── components/
│   │   ├── ui/                (Button, Modal, Input, Card, Badge, Select, etc.)
│   │   ├── layout/            (Sidebar, Navbar, MainLayout, AuthLayout)
│   │   ├── bookings/          (BookingCard, BookingForm, BookingStatusBadge)
│   │   ├── properties/        (PropertyCard, PropertyForm, PropertyGuideForm)
│   │   ├── calendar/          (MonthlyCalendar, TimelineView)
│   │   ├── revenue/           (RevenueChart, RevenueSummaryCards, OccupancyTrend)
│   │   ├── notifications/     (NotificationBell, NotificationList)
│   │   ├── guide/             (AirbnbGuide, ResortGuide, ApartmentGuide)
│   │   └── paywall/           (UpgradePrompt, PricingCard)
│   ├── shared/
│   │   ├── constants.ts       (property types, statuses, categories, plan limits, pricing)
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBookings.ts
│   │   ├── useProperties.ts
│   │   ├── useExpenses.ts
│   │   ├── useRevenue.ts
│   │   ├── useNotifications.ts
│   │   └── useSubscription.ts
│   ├── services/
│   │   ├── firebase.ts        (Firebase init)
│   │   ├── authService.ts     (login, register, logout, Google, reset)
│   │   ├── bookingService.ts  (CRUD + conflict detection)
│   │   ├── propertyService.ts (CRUD)
│   │   ├── expenseService.ts  (CRUD)
│   │   ├── storageService.ts  (upload photos/IDs/receipts/bills)
│   │   ├── guideService.ts    (create/get/deactivate check-in links)
│   │   ├── notificationService.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── property.ts        (includes AirbnbGuide, ResortGuide, ApartmentGuide)
│   │   ├── booking.ts
│   │   ├── expense.ts
│   │   ├── notification.ts
│   │   ├── guide.ts           (CheckInLink)
│   │   └── index.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   ├── calculations.ts    (netProfit, occupancyRate, formatCurrency)
│   │   ├── idGenerator.ts     (generatePropertyId, generateBookingId, etc.)
│   │   ├── csvParser.ts
│   │   ├── icalParser.ts
│   │   └── index.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── styles/
│   │   └── globals.css        (Tailwind v4 @theme)
│   ├── main.tsx
│   └── vite-env.d.ts
├── firebase/                   (existing Firebase config)
│   └── functions/src/
│       ├── index.ts
│       ├── notifications.ts
│       ├── importSync.ts
│       ├── scheduled.ts
│       └── scheduled.ts
├── .env / .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Implementation Phases

### Phase 1 — Foundation ✅ COMPLETED

1. ✅ Scaffold Vite + React + TS project
2. ✅ Install all deps (react-router, firebase, tanstack-query, zustand, tailwind, dayjs, recharts, fullcalendar, lucide-react)
3. ✅ Configure Tailwind v4 (`@theme`), tsconfig (path aliases `@/*`), vite config
4. ✅ Create full folder structure
5. ✅ `.env` + `.env.example` with Firebase keys
6. ✅ Initialize Firebase in `services/firebase.ts`
7. ✅ PWA setup (manifest.json, favicon)
8. ✅ All TypeScript types (user, property, booking, expense, notification, guide)
9. ✅ Shared constants (plan limits, pricing, collection names, status options)
10. ✅ Utility functions (dateUtils, calculations, idGenerator)
11. ✅ All Firebase services (auth, property, booking, expense, storage, guide)
12. ✅ AuthContext with real-time Firestore listener
13. ✅ Full routing (protected + public routes)
14. ✅ Layout components (MainLayout with sidebar + navbar, AuthLayout)
15. ✅ Auth pages (Login, Register, Forgot Password)
16. ✅ Placeholder pages for all routes
17. ✅ Public pricing page (Free / Starter / Pro comparison)
18. ✅ Public guest guide page (renders per property type)

### Phase 2 — Auth & Plan System ✅ COMPLETED

19. ✅ `useSubscription` hook — checks plan, enforces limits per plan, returns upgrade reasons
20. ✅ `UpgradePrompt` component — shown when user hits plan limits (with manual Facebook upgrade flow)
21. ✅ Plan enforcement in PropertiesPage, BookingsPage, AddPropertyPage, AddBookingPage

### Phase 3 — Payment (Manual via Facebook) ✅ COMPLETED

22. ✅ Settings page shows current plan + upgrade cards with pricing
23. ✅ "Get Starter" / "Get Pro" buttons → save `pendingPlan` in Firestore → open Facebook Messenger
24. ✅ Pending state shown in UI while awaiting admin approval
25. ✅ Admin activates plan via Firebase Console (Firestore → celeva DB → BookingHosts → user doc)

### Phase 4 — Properties (Full CRUD) ✅ COMPLETED

26. ✅ Property form — fields adapt by type (Airbnb/Resort/Apartment/Condo/House)
27. ✅ PropertyGuideForm — dynamically renders guide fields based on `property.type` (inline in AddPropertyPage)
28. ✅ Photo upload [PAID] → Firebase Storage
29. ✅ Property list with cards + filter by type + photo preview
30. ✅ Property delete + Share Guide button (creates `BookingCheckInLinks/{token}`, copies link)
31. ✅ Plan enforcement: Free → max 1 property; Starter → only allowed type; Pro → any

### Phase 5 — Bookings (Full CRUD) ✅ COMPLETED

32. ✅ Booking form (property selector, guest info, dates, pricing, guest ID upload [PAID])
33. ✅ Auto-calculate: nights, netProfit = revenue - platformFee - cleaningFee - otherExpenses
34. ✅ Conflict detection (bookingService checks overlapping dates before save)
35. ✅ Bookings list with filters (type tabs, status dropdown, search by guest/property name)
36. ✅ Status badges color-coded (confirmed=green, pending=yellow, cancelled=red, completed=blue)
37. ✅ Plan enforcement: Free → max 3 bookings total

### Phase 6 — Calendar ✅ COMPLETED

38. ✅ Monthly grid (FullCalendar) — color-coded by status, filter by property [ALL PLANS]
39. ✅ Click booking → detail modal with full booking info
40. ⬜ Timeline/Gantt (Planby) — deferred (requires Planby package, future enhancement)

### Phase 7 — Revenue & Expenses ✅ COMPLETED

41. ✅ Expense form (modal) + receipt photo upload [PAID]
42. ✅ Expenses list with category + property filters, total summary card
43. ✅ Revenue basic [FREE]: summary cards (total revenue, net profit, expenses, avg/night)
44. ✅ Revenue advanced [PAID]: Recharts bar chart (6-month trend), per-property breakdown
45. ⬜ Revenue forecasts — deferred (future enhancement)

### Phase 8 — Import [PAID ONLY] ⬜ DEFERRED

46. ⬜ CSV upload — deferred (requires column mapping UI, future enhancement)
47. ⬜ Duplicate detection — deferred (tied to CSV import)

### Phase 9 — Notifications ✅ COMPLETED

49. ✅ In-app notification bell with unread count (polling every 30s)
50. ✅ Notification dropdown with mark-read + mark-all-read
51. ✅ `notificationService.ts` — full CRUD for notifications subcollection
52. ⬜ Cloud Function triggers — deferred (requires Firebase Functions deploy)
53. ⬜ Email notifications — deferred (requires SendGrid setup)

### Phase 10 — Dashboard & Polish ✅ COMPLETED

54. ✅ Dashboard: monthly revenue, active bookings, properties, occupancy rate
55. ✅ Dashboard: today's check-ins/outs, upcoming 7 days with calendar link
56. ✅ Dark mode toggle (Sun/Moon in navbar, persists via CSS class on `<html>`)
57. ✅ Dark mode theme variables in globals.css
58. ✅ Loading spinners on all data-fetching pages
59. ✅ Empty states on all list pages
60. ✅ Responsive sidebar (hamburger menu on mobile)

### Phase 11 — Deploy

60. Firestore security rules
61. Storage security rules
62. Firestore indexes for compound queries
63. Connect `booking.celevainvites.com` → Netlify (CNAME record)
64. Deploy frontend to Netlify (Git auto-deploy)
65. Deploy Cloud Functions: `firebase deploy --only functions`
66. Set env vars in Netlify + Firebase

---

## Data Flows

### Sign Up

```
User registers → Firebase Auth creates UID
→ App writes BookingHosts/{uid} with plan:"free", allowedTypes:[]
→ Redirect to Dashboard
```

### Add Booking (Free User)

```
User fills form → App checks: total bookings < 3?
→ YES → checks for date conflicts → writes to Firestore → appears on calendar + list
→ NO  → shows UpgradePrompt "Upgrade to continue adding bookings"
```

### Upgrade to Pro (Manual)

```
User clicks "Get Pro" → pendingPlan:"pro" saved in Firestore → redirected to m.me/celevainvitation
→ User sends GCash/bank payment + registered email on Facebook
→ Admin verifies payment → updates Firestore: plan:"pro", allowedTypes:["airbnb","resort","apartment"], amountPaid:1999, pendingPlan:null
→ AuthContext listener picks up change in real-time → all features unlocked forever
```

### Share Guide with Guest

```
Host clicks "Share" on property → generates unique token
→ Writes to BookingCheckInLinks/{token} with denormalized guide + photos
→ Copies URL: https://booking.celevainvites.com/guide/{token}
→ Sends to guest via SMS/chat
→ Guest opens link → sees type-specific guide (no login needed)
```

### Conflict Detection (Time-Aware)

```
User adds booking for Property X, June 1-5
→ App queries existing bookings for Property X with status confirmed/pending
→ Uses time-aware overlap: combines date + check-in/out time (HH:mm)
→ Resort/Airbnb: morning (8:00-12:00) + afternoon (13:00-18:00) = NO conflict
→ Same-day same-time = CONFLICT → blocks save
→ If no times set, falls back to full-day overlap (date-only)
```

---

## Firestore Indexes

```
// Bookings — filter by property type + status
Collection: BookingHosts/{userId}/bookings
Index: propertyType ASC, status ASC, checkIn DESC

// Bookings — filter by date range
Collection: BookingHosts/{userId}/bookings
Index: checkIn ASC, checkOut ASC

// Bookings — conflict detection
Collection: BookingHosts/{userId}/bookings
Index: propertyId ASC, status ASC

// Expenses — filter by property + date
Collection: BookingHosts/{userId}/expenses
Index: propertyId ASC, date DESC

// Notifications — unread first, newest first
Collection: BookingHosts/{userId}/notifications
Index: read ASC, createdAt DESC
```

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Collection name | `BookingHosts` + `BookingCheckInLinks` |
| Doc ID | Firebase Auth UID (main), formatted readable IDs (subcollections) |
| Property type separation | One `bookings` subcollection, filter by `propertyType` field |
| Payment model | One-time: ₱999 (1 type) / ₱1,999 (all types) / ₱1,000 (upgrade) |
| Payment gateway | Manual (GCash/Bank Transfer via Facebook Messenger) |
| Platform | PWA (web-first, installable on phones) |
| Backend | Firebase Cloud Functions (serverless, free tier) |
| Guide system | One form + one page, adapts by property type |
| Photos stored | Property photos, guest IDs, receipts, apartment bills |
| Guest access | Public shareable link (no login) |
| Host dashboard | Private (login required) |
| Lock behavior | Never locked out of existing data — just can't add beyond limits |
| Code approach | Versatile — conditional rendering by type, no duplicate code |
| Deploy | Netlify (free) + Firebase (free) |
| Running cost | ~₱0 |

---

## Verification Checklist

1. Register → `BookingHosts/{uid}` created, `plan: "free"`
2. Free: add 1 property ✅, add 2nd property ❌ (upgrade prompt)
3. Free: add 3 bookings ✅, add 4th ❌ (upgrade prompt)
4. Free: upload photo ❌ (upgrade prompt)
5. Starter checkout (₱999) → pick type → plan updated → unlimited for that type
6. Starter: add property of different type ❌ → "Upgrade to Pro ₱1,000"
7. Pro upgrade (₱1,000) → all types unlocked
8. Property guide form adapts by type (Airbnb/Resort/Apartment fields)
9. Share guide → guest opens link without login → sees correct guide
10. Apartment: host updates bills → tenant sees updated info on same link
11. Guest ID uploaded → visible only to host
12. Bookings: conflict detection blocks double-booking
13. Calendar: grid works for all, timeline for paid only
14. Revenue: basic for free, charts for paid
15. Import: CSV/iCal works for paid
16. Notifications: in-app for all, email for paid
17. Mobile responsive, installable as PWA
18. Security: can't access other user's data
19. Domain resolves, pricing page indexed by Google

---

## Running Costs

| Service | Cost |
|---------|------|
| Firestore | Free (50K reads, 20K writes/day) |
| Firebase Auth | Free (unlimited users) |
| Firebase Storage | Free (5GB), then $0.026/GB/month |
| Cloud Functions | Free (2M invocations/month) |
| Netlify | Free (100GB bandwidth/month) |
| Payment processing | ₱0 (manual — no gateway fees) |
| **Total** | **₱0/month** (until massive scale) |

---

## Future Add-ons (Build when users request)

| Add-on | Price | Feature |
|--------|-------|---------|
| 👥 Team Access | ₱499 one-time | Add staff/co-hosts who can view/edit |
| 📧 Guest Auto-emails | ₱299 one-time | Auto-send check-in details to guests |
| 🏷️ Custom Branding | ₱399 one-time | White-label reports/receipts |
| 📅 iCal Sync | ₱299 one-time | Import bookings from Airbnb/Booking.com iCal feeds |

---

## Suggestions / Future Enhancements

> Ideas for future development. Once implemented + priced, move to **Future Add-ons** above.

| # | Enhancement | Description | Complexity |
|---|-------------|-------------|------------|
| 1 | Timeline/Gantt View | Planby-based timeline with all properties on Y-axis, bookings as bars. Visual scheduling for multi-property hosts. | Medium |
| 2 | Revenue Forecasts | Predict next month's revenue based on confirmed upcoming bookings + historical averages. | Medium |
| 3 | CSV Bulk Import | Upload CSV → column mapping UI → preview → bulk-write bookings/expenses to Firestore. | Medium |
| 4 | Cloud Function Notifications | Auto-create notifications on booking create, check-in reminder (1 day before), rent due reminder (apartments). | Medium |
| 5 | Email Notifications (SendGrid) | Send email alerts for check-in reminders, new bookings, rent due — paid users only. | Medium |
| 6 | Guest Auto-SMS | Auto-send guide link to guest phone via SMS API (Semaphore/Twilio) on booking confirmation. | Low |
| 7 | Multi-language Support | i18n for Tagalog, Cebuano, English — expands market reach. | High |
| 8 | Expense Recurring | Auto-create monthly recurring expenses (e.g. WiFi bill, condo dues) without manual re-entry. | Low |
| 9 | Booking Edit / Reschedule | Edit existing bookings (change dates, guest, pricing) with re-validation of conflicts. | Low |
| 10 | Property Archive | Soft-delete/archive properties instead of hard delete — preserves historical data. | Low |
| 11 | Dashboard Widgets (Customizable) | Let hosts drag/reorder dashboard cards — personalized view. | High |
| 12 | Occupancy Heatmap | Calendar heatmap showing occupancy density per month — quick visual of busy/slow periods. | Medium |
| 13 | Guest Reviews/Ratings | Host rates guests privately (cleanliness, communication) for future reference. | Low |
| 14 | Payment Tracking per Booking | Mark partial payments, outstanding balances, payment history per booking. | Medium |
| 15 | Report Export (PDF/Excel) | Download monthly revenue reports, tax summaries as PDF or Excel. | Medium |
| 16 | Offline Mode (PWA) | Queue writes when offline, sync when back online — important for areas with spotty internet. | High |
