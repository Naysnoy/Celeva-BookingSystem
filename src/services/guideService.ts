import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '@/shared';
import { CheckInLink } from '@/types';
import { Property } from '@/types';
import { generateShareToken } from '@/utils';

function getCheckInLinksRef() {
  return collection(db, COLLECTIONS.bookingCheckInLinks);
}

export async function createCheckInLink(
  userId: string,
  property: Property
): Promise<string> {
  const token = generateShareToken(property.name);
  const docRef = doc(getCheckInLinksRef(), token);

  await setDoc(docRef, {
    id: token,
    userId,
    propertyId: property.id,
    propertyType: property.type,
    propertyName: property.name,
    photos: property.photos,
    guide: property.guide,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: null,
  });

  return token;
}

export async function getCheckInLink(token: string): Promise<CheckInLink | null> {
  const docRef = doc(getCheckInLinksRef(), token);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as CheckInLink;
  if (!data.isActive) return null;

  return data;
}

export async function getCheckInLinksByProperty(
  userId: string,
  propertyId: string
): Promise<CheckInLink[]> {
  const ref = getCheckInLinksRef();
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => doc.data() as CheckInLink)
    .filter((link) => link.userId === userId && link.propertyId === propertyId);
}

export async function deactivateCheckInLink(token: string): Promise<void> {
  const docRef = doc(getCheckInLinksRef(), token);
  const { updateDoc } = await import('firebase/firestore');
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}
