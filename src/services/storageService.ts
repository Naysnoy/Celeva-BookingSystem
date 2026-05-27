import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { UPLOAD_LIMITS } from '@/shared';

export function validateFile(file: File, allowedTypes: readonly string[] = UPLOAD_LIMITS.allowedImageTypes): void {
  if (file.size > UPLOAD_LIMITS.maxFileSize) {
    throw new Error(`File size must be less than ${UPLOAD_LIMITS.maxFileSize / 1024 / 1024}MB`);
  }
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not supported`);
  }
}

export async function uploadPropertyPhoto(
  userId: string,
  propertyId: string,
  file: File,
  index: number
): Promise<string> {
  validateFile(file);
  const path = `${userId}/properties/${propertyId}/photo_${index}.${getExtension(file)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadGuestId(
  userId: string,
  bookingId: string,
  file: File,
  side: 'front' | 'back'
): Promise<string> {
  validateFile(file, UPLOAD_LIMITS.allowedDocTypes);
  const path = `${userId}/bookings/${bookingId}/id_${side}.${getExtension(file)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadReceipt(
  userId: string,
  expenseId: string,
  file: File
): Promise<string> {
  validateFile(file, UPLOAD_LIMITS.allowedDocTypes);
  const path = `${userId}/expenses/${expenseId}/receipt.${getExtension(file)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadBillPhoto(
  userId: string,
  propertyId: string,
  utilityType: string,
  yearMonth: string,
  file: File
): Promise<string> {
  validateFile(file, UPLOAD_LIMITS.allowedDocTypes);
  const path = `${userId}/bills/${propertyId}/${utilityType}_${yearMonth}.${getExtension(file)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteFile(filePath: string): Promise<void> {
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
}

function getExtension(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() || 'jpg';
}
