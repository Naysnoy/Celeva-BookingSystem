import { PropertyType } from '@/types';

// Plan limits
export const PLAN_LIMITS = {
  free: {
    maxProperties: 1,
    maxBookings: 3, // total lifetime
  },
  starter: {
    maxProperties: Infinity,
    maxBookings: Infinity,
  },
  pro: {
    maxProperties: Infinity,
    maxBookings: Infinity,
  },
} as const;

// Pricing
export const PRICING = {
  starter: 999,
  pro: 1999,
  upgrade: 1000, // starter → pro
  currency: 'PHP',
} as const;

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  airbnb: 'Airbnb',
  resort: 'Resort',
  apartment: 'Apartment',
  condo: 'Condo',
  house: 'House',
};

// Booking status options
export const BOOKING_STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-500' },
] as const;

// Booking source options
export const BOOKING_SOURCE_OPTIONS = [
  { value: 'manual', label: 'Manual Entry' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'booking.com', label: 'Booking.com' },
  { value: 'other', label: 'Other' },
] as const;

// Expense categories
export const EXPENSE_CATEGORY_OPTIONS = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' },
] as const;

// File upload limits
export const UPLOAD_LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedDocTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
} as const;

// App config
export const APP_CONFIG = {
  appName: 'BookingHosts',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  currency: 'PHP',
} as const;

// Firestore collection names
export const COLLECTIONS = {
  bookingHosts: 'BookingHosts',
  bookingCheckInLinks: 'BookingCheckInLinks',
  properties: 'properties',
  bookings: 'bookings',
  expenses: 'expenses',
  notifications: 'notifications',
} as const;
