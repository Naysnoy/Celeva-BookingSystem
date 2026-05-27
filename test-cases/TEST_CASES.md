# BookingHosts — Test Cases & Sample Data

## Test User

| Field | Value |
|-------|-------|
| Email | sample@gmail.com |
| Password | qweqwe123 |
| Display Name | Sample Host |
| Plan | pro |
| Allowed Types | ["airbnb", "resort", "apartment"] |

---

## Sample Properties

### Property 1 — Airbnb

| Field | Value |
|-------|-------|
| ID | prop_airbnb_sunset-villa_20260101_a1b2 |
| Name | Sunset Villa |
| Address | 123 Beach Road, Mactan, Cebu |
| Type | airbnb |
| Bedrooms | 2 |
| Bathrooms | 1 |
| Default Rate | ₱3,500/night |
| Guide | WiFi: SunsetVilla5G / Pass: beach2026, Check-in: 2:00 PM, Check-out: 12:00 PM, Key in lockbox (code: 1234) |

### Property 2 — Resort

| Field | Value |
|-------|-------|
| ID | prop_resort_paradise-resort_20260115_c3d4 |
| Name | Paradise Beach Resort |
| Address | 456 Seaside Drive, Moalboal, Cebu |
| Type | resort |
| Bedrooms | 5 |
| Bathrooms | 3 |
| Default Rate | ₱8,000/day |
| Guide | Karaoke: 6AM-10PM only, Pool hours: 6AM-10PM, Capacity: 30 pax, Extra chairs ₱50 each |

### Property 3 — Apartment

| Field | Value |
|-------|-------|
| ID | prop_apartment_cebu-condo_20260201_e5f6 |
| Name | Cebu IT Park Condo Unit 12B |
| Address | Unit 12B, Avida Towers, IT Park, Cebu City |
| Type | apartment |
| Bedrooms | 1 |
| Bathrooms | 1 |
| Default Rate | ₱15,000/month |
| Guide | Rent due: 5th of month, Payment: GCash 09171234567, Maintenance: 0917-555-1234 |

---

## Bookings — Airbnb (Sunset Villa) — 10 Bookings

| # | Guest Name | Check-in | Check-out | Time In | Time Out | Nights | Status | Source | Revenue | Platform Fee | Cleaning | Net Profit |
|---|-----------|----------|-----------|---------|----------|--------|--------|--------|---------|--------------|----------|------------|
| 1 | Maria Santos | Jun 1, 2026 | Jun 3, 2026 | 14:00 | 12:00 | 2 | confirmed | airbnb | ₱7,000 | ₱210 | ₱500 | ₱6,290 |
| 2 | John Rivera | Jun 5, 2026 | Jun 8, 2026 | 14:00 | 12:00 | 3 | confirmed | airbnb | ₱10,500 | ₱315 | ₱500 | ₱9,685 |
| 3 | Angela Cruz | Jun 10, 2026 | Jun 12, 2026 | 15:00 | 11:00 | 2 | completed | booking.com | ₱7,000 | ₱700 | ₱500 | ₱5,800 |
| 4 | Robert Tan | Jun 15, 2026 | Jun 20, 2026 | 14:00 | 12:00 | 5 | confirmed | airbnb | ₱17,500 | ₱525 | ₱500 | ₱16,475 |
| 5 | Lisa Garcia | Jun 22, 2026 | Jun 24, 2026 | 14:00 | 12:00 | 2 | pending | manual | ₱7,000 | ₱0 | ₱500 | ₱6,500 |
| 6 | Mark Reyes | Jun 26, 2026 | Jun 30, 2026 | 14:00 | 12:00 | 4 | confirmed | airbnb | ₱14,000 | ₱420 | ₱500 | ₱13,080 |
| 7 | Sarah Lee | Jul 2, 2026 | Jul 5, 2026 | 14:00 | 12:00 | 3 | confirmed | other | ₱10,500 | ₱0 | ₱500 | ₱10,000 |
| 8 | Kevin Lim | Jul 7, 2026 | Jul 9, 2026 | 14:00 | 12:00 | 2 | cancelled | airbnb | ₱7,000 | ₱210 | ₱500 | ₱6,290 |
| 9 | Diana Flores | Jul 12, 2026 | Jul 16, 2026 | 14:00 | 12:00 | 4 | pending | airbnb | ₱14,000 | ₱420 | ₱500 | ₱13,080 |
| 10 | Paolo Mendoza | Jul 18, 2026 | Jul 22, 2026 | 15:00 | 11:00 | 4 | confirmed | booking.com | ₱14,000 | ₱1,400 | ₱500 | ₱12,100 |

---

## Bookings — Resort (Paradise Beach Resort) — 10 Bookings

| # | Guest Name | Check-in | Check-out | Time In | Time Out | Nights | Status | Source | Revenue | Platform Fee | Cleaning | Net Profit |
|---|-----------|----------|-----------|---------|----------|--------|--------|--------|---------|--------------|----------|------------|
| 1 | Dela Cruz Family | Jun 1, 2026 | Jun 1, 2026 | 08:00 | 17:00 | 0 (day use) | confirmed | manual | ₱8,000 | ₱0 | ₱1,000 | ₱7,000 |
| 2 | Bautista Group | Jun 1, 2026 | Jun 2, 2026 | 20:00 | 12:00 | 1 (overnight) | confirmed | manual | ₱12,000 | ₱0 | ₱1,000 | ₱11,000 |
| 3 | Villanueva Reunion | Jun 5, 2026 | Jun 7, 2026 | 14:00 | 12:00 | 2 | completed | manual | ₱16,000 | ₱0 | ₱1,500 | ₱14,500 |
| 4 | Santos Birthday | Jun 8, 2026 | Jun 8, 2026 | 06:00 | 12:00 | 0 (morning) | confirmed | manual | ₱5,000 | ₱0 | ₱800 | ₱4,200 |
| 5 | Ramos Team Build | Jun 8, 2026 | Jun 8, 2026 | 13:00 | 18:00 | 0 (afternoon) | confirmed | manual | ₱6,000 | ₱0 | ₱800 | ₱5,200 |
| 6 | Garcia Wedding | Jun 14, 2026 | Jun 15, 2026 | 10:00 | 14:00 | 1 | confirmed | manual | ₱25,000 | ₱0 | ₱3,000 | ₱22,000 |
| 7 | Lopez Outing | Jun 20, 2026 | Jun 20, 2026 | 08:00 | 17:00 | 0 (day use) | pending | manual | ₱8,000 | ₱0 | ₱1,000 | ₱7,000 |
| 8 | Aquino Corp Event | Jun 25, 2026 | Jun 27, 2026 | 14:00 | 12:00 | 2 | confirmed | other | ₱20,000 | ₱0 | ₱2,000 | ₱18,000 |
| 9 | Torres Family | Jul 4, 2026 | Jul 4, 2026 | 07:00 | 18:00 | 0 (day use) | cancelled | manual | ₱8,000 | ₱0 | ₱1,000 | ₱7,000 |
| 10 | Fernandez Grad | Jul 10, 2026 | Jul 11, 2026 | 16:00 | 14:00 | 1 | pending | manual | ₱15,000 | ₱0 | ₱1,500 | ₱13,500 |

---

## Bookings — Apartment (Cebu IT Park Condo) — 10 Bookings

| # | Guest Name | Check-in | Check-out | Time In | Time Out | Nights | Status | Source | Revenue | Platform Fee | Cleaning | Net Profit |
|---|-----------|----------|-----------|---------|----------|--------|--------|--------|---------|--------------|----------|------------|
| 1 | Anna Gonzales | Jan 1, 2026 | Jan 31, 2026 | — | — | 30 | completed | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 2 | Anna Gonzales | Feb 1, 2026 | Feb 28, 2026 | — | — | 27 | completed | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 3 | Anna Gonzales | Mar 1, 2026 | Mar 31, 2026 | — | — | 30 | completed | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 4 | Anna Gonzales | Apr 1, 2026 | Apr 30, 2026 | — | — | 29 | completed | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 5 | Anna Gonzales | May 1, 2026 | May 31, 2026 | — | — | 30 | completed | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 6 | Anna Gonzales | Jun 1, 2026 | Jun 30, 2026 | — | — | 29 | confirmed | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 7 | Anna Gonzales | Jul 1, 2026 | Jul 31, 2026 | — | — | 30 | pending | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 8 | Anna Gonzales | Aug 1, 2026 | Aug 31, 2026 | — | — | 30 | pending | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 9 | Anna Gonzales | Sep 1, 2026 | Sep 30, 2026 | — | — | 29 | pending | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |
| 10 | Anna Gonzales | Oct 1, 2026 | Oct 31, 2026 | — | — | 30 | pending | manual | ₱15,000 | ₱0 | ₱0 | ₱15,000 |

---

## Sample Expenses

| # | Property | Category | Amount | Date | Description |
|---|----------|----------|--------|------|-------------|
| 1 | Sunset Villa | cleaning | ₱500 | Jun 3, 2026 | Post-checkout deep clean (Maria Santos) |
| 2 | Sunset Villa | maintenance | ₱2,500 | Jun 4, 2026 | Fix leaking bathroom faucet |
| 3 | Sunset Villa | supplies | ₱800 | Jun 1, 2026 | Toiletries restock + coffee pods |
| 4 | Paradise Resort | cleaning | ₱1,500 | Jun 1, 2026 | Post-event cleaning (Dela Cruz) |
| 5 | Paradise Resort | maintenance | ₱5,000 | Jun 10, 2026 | Pool filter replacement |
| 6 | Paradise Resort | utilities | ₱3,200 | Jun 15, 2026 | Electric bill June |
| 7 | Cebu Condo | utilities | ₱1,800 | Jun 5, 2026 | Electric bill (tenant reimbursement) |
| 8 | Cebu Condo | utilities | ₱450 | Jun 5, 2026 | Water bill |
| 9 | General | other | ₱1,200 | Jun 12, 2026 | Accounting software subscription |
| 10 | Sunset Villa | cleaning | ₱500 | Jun 8, 2026 | Post-checkout clean (John Rivera) |

---

## Test Scenarios

### 1. Authentication

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1.1 | Register new account | Register with sample@gmail.com / qweqwe123 | Account created, redirected to dashboard, plan = "free" |
| 1.2 | Login with email | Login with sample@gmail.com / qweqwe123 | Authenticated, dashboard loads |
| 1.3 | Login with Google | Click Google sign-in | OAuth flow completes, dashboard loads |
| 1.4 | Forgot password | Enter sample@gmail.com, submit | Reset email sent, success toast |
| 1.5 | Logout | Click logout in sidebar | Redirected to login page |
| 1.6 | Auth persistence | Login → close tab → reopen | Still authenticated (Firebase persistence) |

### 2. Plan Enforcement (Free User)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 2.1 | Add 1st property (free) | Create property form → submit | ✅ Property created |
| 2.2 | Add 2nd property (free) | Navigate to Add Property | ❌ UpgradePrompt shown, form blocked |
| 2.3 | Add 1st-3rd booking (free) | Create bookings | ✅ All 3 created |
| 2.4 | Add 4th booking (free) | Navigate to Add Booking | ❌ UpgradePrompt shown |
| 2.5 | Upload photo (free) | Try to upload property photo | ❌ Upload input hidden/disabled |
| 2.6 | View existing data (free at limit) | Navigate to bookings list, calendar, revenue | ✅ Can view all — never locked out |

### 3. Plan Upgrade Flow

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 3.1 | Request Starter | Click "Get Starter" on upgrade prompt | pendingPlan = "starter" saved, redirected to Messenger |
| 3.2 | Pending state shown | Return to app after requesting | Shows "Upgrade pending" badge |
| 3.3 | Admin activates plan | (Admin sets plan:"pro" in Firestore) | Real-time update, features unlock instantly |
| 3.4 | Starter user adds wrong type | Starter (airbnb only) tries to add resort | ❌ "Upgrade to Pro" prompt shown |

### 4. Properties CRUD

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 4.1 | Create Airbnb property | Fill form with Airbnb type, WiFi/key fields | Property created with guide fields |
| 4.2 | Create Resort property | Fill form with Resort type, karaoke/pool/charges | Property created with resort-specific guide |
| 4.3 | Create Apartment | Fill form with Apartment type, rent/utilities | Property created with apartment guide |
| 4.4 | Photo upload (paid) | Select image file on property form | Image uploaded to Storage, URL saved |
| 4.5 | Delete property | Click Delete → confirm dialog | Property removed from list |
| 4.6 | Share guide link | Click "Share Guide" on property card | Token created, URL copied to clipboard |
| 4.7 | Guest opens guide link | Visit /guide/{token} (no login) | Guide page renders with correct type layout |
| 4.8 | Type filter | Click type tabs (All / Airbnb / Resort) | List filters correctly |

### 5. Bookings CRUD

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 5.1 | Create booking | Fill form, select property, dates, pricing | Booking created, appears in list + calendar |
| 5.2 | Auto-calculate nights | Set check-in Jun 1, check-out Jun 4 | Shows "3 nights" |
| 5.3 | Auto-calculate net profit | Revenue ₱10,000, fee ₱300, cleaning ₱500 | Net profit = ₱9,200 |
| 5.4 | Guest ID upload (paid) | Upload front + back ID images | Files in Storage, URLs on booking |
| 5.5 | Status filter | Select "Confirmed" from dropdown | Only confirmed bookings shown |
| 5.6 | Type tab filter | Click "Resort" tab | Only resort bookings shown |
| 5.7 | Search by guest name | Type "Santos" in search | Matching bookings shown |

### 6. Conflict Detection (Time-Aware)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 6.1 | Airbnb overlap (same dates) | Book Sunset Villa Jun 1-3 (existing) → try Jun 2-4 | ❌ Conflict blocked |
| 6.2 | Airbnb no overlap | Book Sunset Villa Jun 1-3 (existing) → try Jun 3-5 (12:00 out, 14:00 in) | ✅ Allowed (check-out before check-in) |
| 6.3 | Resort same day, different times | Book Paradise Jun 8 08:00-12:00 → try Jun 8 13:00-18:00 | ✅ Allowed (no time overlap) |
| 6.4 | Resort same day, overlapping times | Book Paradise Jun 8 08:00-14:00 → try Jun 8 13:00-18:00 | ❌ Conflict (13:00-14:00 overlaps) |
| 6.5 | Resort no times set (fallback) | Book Paradise Jun 8 (no time) → try Jun 8 (no time) | ❌ Conflict (full-day assumed) |
| 6.6 | Cancelled booking ignored | Cancelled booking Jun 5-8 → try Jun 6-7 | ✅ Allowed (cancelled doesn't block) |
| 6.7 | Apartment monthly | Book Condo Jan 1-31 → try Jan 15-Feb 15 | ❌ Conflict |

### 7. Calendar

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 7.1 | View monthly calendar | Navigate to Calendar page | FullCalendar grid with bookings as colored events |
| 7.2 | Color by status | Check event colors | Green=confirmed, Yellow=pending, Red=cancelled, Blue=completed |
| 7.3 | Filter by property | Select "Sunset Villa" from dropdown | Only that property's bookings shown |
| 7.4 | Click booking event | Click on a booking bar | Detail modal opens with full info |
| 7.5 | Navigate months | Click prev/next arrows | Calendar navigates, shows correct bookings |

### 8. Revenue & Expenses

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 8.1 | Revenue summary cards | View Revenue page | Total revenue, net profit, expenses, avg/night shown |
| 8.2 | Revenue chart (paid) | View as paid user | 6-month bar chart displayed |
| 8.3 | Revenue per-property | Scroll to breakdown table | Revenue/expenses per property listed |
| 8.4 | Add expense | Open modal, fill form, submit | Expense created, total updates |
| 8.5 | Filter expenses by category | Select "Maintenance" | Only maintenance expenses shown |
| 8.6 | Filter expenses by property | Select "Sunset Villa" | Only that property's expenses |
| 8.7 | Receipt upload (paid) | Upload receipt image | File in Storage, URL saved |

### 9. Notifications

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 9.1 | Notification bell count | Create notifications in Firestore | Bell shows unread count badge |
| 9.2 | Open notification dropdown | Click bell icon | Dropdown shows notification list |
| 9.3 | Mark single as read | Click notification item | Item marked read, count decrements |
| 9.4 | Mark all as read | Click "Mark all read" | All items read, badge disappears |

### 10. Dashboard

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 10.1 | Monthly stats | View dashboard | Shows revenue, active bookings, properties count, occupancy % |
| 10.2 | Today's check-ins | Have booking with today as check-in | Appears in "Today's Check-ins" section |
| 10.3 | Today's check-outs | Have booking with today as check-out | Appears in "Today's Check-outs" section |
| 10.4 | Upcoming 7 days | Have bookings in next 7 days | Listed in "Upcoming" section |

### 11. Dark Mode

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 11.1 | Toggle dark mode | Click Moon icon in navbar | Theme switches to dark, icon becomes Sun |
| 11.2 | Toggle back | Click Sun icon | Theme switches to light |
| 11.3 | All pages render | Navigate all pages in dark mode | No broken colors, text remains readable |

### 12. Responsive / PWA

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 12.1 | Mobile sidebar | Resize to mobile width | Hamburger menu appears, sidebar is off-canvas |
| 12.2 | Mobile forms | Fill booking form on mobile | Fields stack vertically, usable |
| 12.3 | PWA install | Open in Chrome mobile → "Add to Home Screen" | App installs, opens fullscreen |

### 13. Guest Guide (Public)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 13.1 | Airbnb guide | Visit /guide/{airbnb-token} | Shows WiFi, key instructions, check-in times, photos |
| 13.2 | Resort guide | Visit /guide/{resort-token} | Shows karaoke rules, pool rules, extra charges, capacity |
| 13.3 | Apartment guide | Visit /guide/{apartment-token} | Shows rent info, utilities, payment method, lease dates |
| 13.4 | Invalid token | Visit /guide/invalid-token | Shows "Guide not found" message |
| 13.5 | Deactivated link | Visit deactivated guide link | Shows "This guide is no longer active" |

---

## Firestore Seed Data (JSON)

Use this to manually seed the test user in Firestore (`celeva` database → `BookingHosts/{userId}`):

```json
{
  "id": "{FIREBASE_AUTH_UID}",
  "email": "sample@gmail.com",
  "displayName": "Sample Host",
  "photoURL": "",
  "currency": "PHP",
  "plan": "pro",
  "allowedTypes": ["airbnb", "resort", "apartment"],
  "amountPaid": 1999,
  "paidAt": "2026-01-01T00:00:00Z",
  "pendingPlan": null,
  "paymentLinkId": null,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

### Notes

- After registering sample@gmail.com, get the Firebase Auth UID from the Firebase Console
- Manually set `plan: "pro"` in Firestore to unlock all features for testing
- Or test as free first (register → auto-creates as free) then upgrade via admin
- Resort bookings with `nights: 0` are day-use bookings (same check-in/check-out date)
- Apartment bookings represent monthly rent records (1 booking = 1 month)
