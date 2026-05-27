import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '@/shared';
import { Booking, BookingStatus } from '@/types';
import { PropertyType } from '@/types';
import { generateBookingId } from '@/utils';
import { isDateTimeOverlapping } from '@/utils';

function getBookingsRef(userId: string) {
  return collection(db, COLLECTIONS.bookingHosts, userId, COLLECTIONS.bookings);
}

export async function createBooking(
  userId: string,
  data: Omit<Booking, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Check for conflicts (time-aware)
  const hasConflict = await checkBookingConflict(
    userId,
    data.propertyId,
    data.checkIn.toDate(),
    data.checkOut.toDate(),
    data.checkInTime ?? null,
    data.checkOutTime ?? null,
  );

  if (hasConflict) {
    throw new Error('This property already has a booking for the selected dates.');
  }

  const id = generateBookingId(data.guestName, data.checkIn.toDate());
  const docRef = doc(getBookingsRef(userId), id);

  await setDoc(docRef, {
    ...data,
    id,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return id;
}

export async function getBooking(userId: string, bookingId: string): Promise<Booking | null> {
  const docRef = doc(getBookingsRef(userId), bookingId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as Booking) : null;
}

export async function getBookings(
  userId: string,
  filters?: {
    propertyId?: string;
    propertyType?: PropertyType;
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Booking[]> {
  const ref = getBookingsRef(userId);
  const constraints = [orderBy('checkIn', 'desc')];

  if (filters?.propertyId) {
    constraints.unshift(where('propertyId', '==', filters.propertyId));
  }
  if (filters?.status) {
    constraints.unshift(where('status', '==', filters.status));
  }

  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);
  let bookings = snapshot.docs.map((doc) => doc.data() as Booking);

  // Client-side filtering (avoids needing composite indexes)
  if (filters?.propertyType) {
    bookings = bookings.filter((b) => b.propertyType === filters.propertyType);
  }
  if (filters?.startDate) {
    const start = Timestamp.fromDate(filters.startDate);
    bookings = bookings.filter((b) => b.checkIn >= start);
  }
  if (filters?.endDate) {
    const end = Timestamp.fromDate(filters.endDate);
    bookings = bookings.filter((b) => b.checkIn <= end);
  }

  return bookings;
}

export async function updateBooking(
  userId: string,
  bookingId: string,
  data: Partial<Booking>
): Promise<void> {
  const docRef = doc(getBookingsRef(userId), bookingId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Full booking edit — re-runs conflict detection while excluding
 * the booking being edited, then persists all changed fields.
 */
export async function editBooking(
  userId: string,
  bookingId: string,
  data: Omit<Booking, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const hasConflict = await checkBookingConflict(
    userId,
    data.propertyId,
    data.checkIn.toDate(),
    data.checkOut.toDate(),
    data.checkInTime ?? null,
    data.checkOutTime ?? null,
    bookingId,
  );

  if (hasConflict) {
    throw new Error('This property already has a booking for the selected dates.');
  }

  const docRef = doc(getBookingsRef(userId), bookingId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBooking(userId: string, bookingId: string): Promise<void> {
  const docRef = doc(getBookingsRef(userId), bookingId);
  await deleteDoc(docRef);
}

export async function getBookingCount(userId: string): Promise<number> {
  const ref = getBookingsRef(userId);
  const snapshot = await getDocs(ref);
  return snapshot.size;
}

async function checkBookingConflict(
  userId: string,
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  checkInTime: string | null,
  checkOutTime: string | null,
  excludeBookingId?: string
): Promise<boolean> {
  const ref = getBookingsRef(userId);
  const q = query(
    ref,
    where('propertyId', '==', propertyId),
    where('status', 'in', ['confirmed', 'pending'])
  );

  const snapshot = await getDocs(q);
  const bookings = snapshot.docs.map((doc) => doc.data() as Booking);

  return bookings.some((booking) => {
    if (excludeBookingId && booking.id === excludeBookingId) return false;
    return isDateTimeOverlapping(
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime,
      booking.checkIn.toDate(),
      booking.checkOut.toDate(),
      booking.checkInTime ?? null,
      booking.checkOutTime ?? null,
    );
  });
}
