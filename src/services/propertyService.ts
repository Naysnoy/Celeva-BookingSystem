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
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '@/shared';
import { Property, PropertyType } from '@/types';
import { generatePropertyId } from '@/utils';

function getPropertiesRef(userId: string) {
  return collection(db, COLLECTIONS.bookingHosts, userId, COLLECTIONS.properties);
}

export async function createProperty(
  userId: string,
  data: Omit<Property, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  options?: { lockTypeForStarter?: boolean }
): Promise<string> {
  const id = generatePropertyId(data.type, data.name);
  const docRef = doc(getPropertiesRef(userId), id);

  await setDoc(docRef, {
    ...data,
    id,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Lock property type for Starter plan on first property
  if (options?.lockTypeForStarter) {
    const hostRef = doc(db, COLLECTIONS.bookingHosts, userId);
    await updateDoc(hostRef, {
      allowedTypes: [data.type],
      updatedAt: serverTimestamp(),
    });
  }

  return id;
}

export async function getProperty(userId: string, propertyId: string): Promise<Property | null> {
  const docRef = doc(getPropertiesRef(userId), propertyId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as Property) : null;
}

export async function getProperties(userId: string, type?: PropertyType): Promise<Property[]> {
  const ref = getPropertiesRef(userId);
  const q = type
    ? query(ref, where('type', '==', type), orderBy('createdAt', 'desc'))
    : query(ref, orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Property);
}

export async function updateProperty(
  userId: string,
  propertyId: string,
  data: Partial<Property>
): Promise<void> {
  const docRef = doc(getPropertiesRef(userId), propertyId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProperty(userId: string, propertyId: string): Promise<void> {
  const docRef = doc(getPropertiesRef(userId), propertyId);
  await deleteDoc(docRef);
}
