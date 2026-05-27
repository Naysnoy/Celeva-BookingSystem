import dayjs from 'dayjs';

export function formatDate(date: Date | string, format = 'MMM D, YYYY'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: Date | string): string {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  return dayjs(checkOut).diff(dayjs(checkIn), 'day');
}

export function isDateOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return dayjs(startA).isBefore(dayjs(endB)) && dayjs(endA).isAfter(dayjs(startB));
}

/**
 * Time-aware overlap check. Combines date + time (HH:mm) into full datetimes.
 * If times are null, falls back to pure date overlap.
 */
export function isDateTimeOverlapping(
  startA: Date,
  endA: Date,
  timeInA: string | null,
  timeOutA: string | null,
  startB: Date,
  endB: Date,
  timeInB: string | null,
  timeOutB: string | null,
): boolean {
  const a0 = applyTime(startA, timeInA, '00:00');
  const a1 = applyTime(endA, timeOutA, '23:59');
  const b0 = applyTime(startB, timeInB, '00:00');
  const b1 = applyTime(endB, timeOutB, '23:59');
  return a0.isBefore(b1) && a1.isAfter(b0);
}

function applyTime(date: Date, time: string | null, fallback: string) {
  const t = time || fallback;
  const [h, m] = t.split(':').map(Number);
  return dayjs(date).hour(h).minute(m).second(0);
}

export function getDaysUntil(date: Date): number {
  return dayjs(date).diff(dayjs(), 'day');
}

export function isToday(date: Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function isTomorrow(date: Date): boolean {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
}

export function getMonthRange(year: number, month: number) {
  const start = dayjs().year(year).month(month).startOf('month').toDate();
  const end = dayjs().year(year).month(month).endOf('month').toDate();
  return { start, end };
}
