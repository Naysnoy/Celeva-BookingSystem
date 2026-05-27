import dayjs from 'dayjs';
import { PropertyType } from '@/types';

/**
 * Generates a readable property ID
 * Format: prop_{type}_{shortName}_{YYYYMMDD}_{4hex}
 * Example: prop_airbnb_sunset-villa_20260523_a3k7
 */
export function generatePropertyId(type: PropertyType, name: string): string {
  const shortName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 20);
  const date = dayjs().format('YYYYMMDD');
  const hex = generateHex(4);
  return `prop_${type}_${shortName}_${date}_${hex}`;
}

/**
 * Generates a readable booking ID
 * Format: book_{guestLast}_{YYYYMMDD}_{4hex}
 * Example: book_santos_20260601_f8m2
 */
export function generateBookingId(guestName: string, checkIn: Date): string {
  const lastName = (guestName.split(' ').pop() || 'guest')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const date = dayjs(checkIn).format('YYYYMMDD');
  const hex = generateHex(4);
  return `book_${lastName}_${date}_${hex}`;
}

/**
 * Generates a readable expense ID
 * Format: exp_{category}_{YYYYMMDD}_{4hex}
 * Example: exp_maintenance_20260520_r4n7
 */
export function generateExpenseId(category: string, date: Date): string {
  const d = dayjs(date).format('YYYYMMDD');
  const hex = generateHex(4);
  return `exp_${category}_${d}_${hex}`;
}

/**
 * Generates a readable notification ID
 * Format: notif_{type}_{YYYYMMDD}_{4hex}
 * Example: notif_checkin_20260531_p9w3
 */
export function generateNotificationId(type: string): string {
  const date = dayjs().format('YYYYMMDD');
  const hex = generateHex(4);
  return `notif_${type}_${date}_${hex}`;
}

/**
 * Generates a share token for check-in links
 * Format: guide_{shortName}_{6hex}
 * Example: guide_sunset-villa_x7k2m9
 */
export function generateShareToken(propertyName: string): string {
  const shortName = propertyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 15);
  const hex = generateHex(6);
  return `guide_${shortName}_${hex}`;
}

/**
 * Generates random hex string of specified length
 */
function generateHex(length: number): string {
  const array = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}
