# BookingHosts

Booking tracker for Airbnb, Resort & Apartment hosts.

## Overview

BookingHosts is a web application designed for property hosts (Airbnb, resorts, apartments) to manage and track their rental business in one place. The app provides:

- **Dashboard** — At-a-glance summary of bookings, revenue, and occupancy metrics with visual charts.
- **Bookings Management** — Create, view, and manage guest bookings across all your properties.
- **Calendar View** — Visual calendar to see upcoming check-ins, check-outs, and availability at a glance.
- **Properties** — Manage multiple rental properties with their details and pricing.
- **Revenue Tracking** — Monitor income across properties with charts and breakdowns.
- **Expense Tracking** — Log and categorize expenses to understand profitability.
- **Pricing Management** — Set and adjust pricing strategies for your properties.
- **Settings** — Configure account preferences and app settings.
- **Guide** — In-app help and onboarding for new users.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Build Tool:** Vite
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Backend/Auth:** Firebase
- **Routing:** React Router v7
- **Charts:** Recharts
- **Calendar:** FullCalendar
- **Icons:** Lucide React

## Prerequisites

- Node.js (v18+)
- npm or pnpm
- Firebase project configured (see `.env.example` for required variables)

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env` and fill in your Firebase credentials.

   ```bash
   cp .env.example .env
   ```

3. **Run development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Preview production build:**

   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── app/          # App-level configuration and providers
├── components/   # Reusable UI components
├── context/      # React context providers
├── pages/        # Route pages
├── services/     # Firebase and API services
├── shared/       # Shared utilities and constants
├── styles/       # Global styles
├── types/        # TypeScript type definitions
└── utils/        # Helper functions
```

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start development server     |
| `npm run build` | Type-check and build for prod|
| `npm run preview` | Preview production build   |
| `npm run lint`  | Run TypeScript type checking |
