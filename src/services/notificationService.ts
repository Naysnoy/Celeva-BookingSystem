import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '@/shared';
import { Notification, NotificationType } from '@/types';
import { generateNotificationId } from '@/utils';

function getNotificationsRef(userId: string) {
  return collection(db, COLLECTIONS.bookingHosts, userId, COLLECTIONS.notifications);
}

export async function createNotification(
  userId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    relatedBookingId?: string | null;
    relatedPropertyId?: string | null;
  }
): Promise<string> {
  const id = generateNotificationId(data.type);
  const docRef = doc(getNotificationsRef(userId), id);

  await setDoc(docRef, {
    id,
    userId,
    type: data.type,
    title: data.title,
    message: data.message,
    read: false,
    relatedBookingId: data.relatedBookingId || null,
    relatedPropertyId: data.relatedPropertyId || null,
    createdAt: serverTimestamp(),
  });

  return id;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const ref = getNotificationsRef(userId);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Notification);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const ref = getNotificationsRef(userId);
  const q = query(ref, where('read', '==', false));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const docRef = doc(getNotificationsRef(userId), notificationId);
  await updateDoc(docRef, { read: true });
}

export async function markAllRead(userId: string): Promise<void> {
  const ref = getNotificationsRef(userId);
  const q = query(ref, where('read', '==', false));
  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(updates);
}
