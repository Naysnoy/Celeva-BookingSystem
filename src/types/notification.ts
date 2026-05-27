import { Timestamp } from 'firebase/firestore';

export type NotificationType = 'checkIn' | 'checkOut' | 'newBooking' | 'payment' | 'rentDue';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedBookingId: string | null;
  relatedPropertyId: string | null;
  createdAt: Timestamp;
}
