import { Timestamp } from 'firebase/firestore';
import { PropertyType } from './user';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type BookingSource = 'manual' | 'airbnb' | 'booking.com' | 'other';

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  propertyType: PropertyType;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestIdFront: string | null;
  guestIdBack: string | null;
  checkIn: Timestamp;
  checkOut: Timestamp;
  checkInTime: string | null;   // "HH:mm" (e.g. "14:00") — used for same-day conflict detection
  checkOutTime: string | null;  // "HH:mm" (e.g. "12:00")
  nights: number;
  status: BookingStatus;
  source: BookingSource;
  revenue: number;
  platformFee: number;
  cleaningFee: number;
  otherExpenses: number;
  netProfit: number;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
