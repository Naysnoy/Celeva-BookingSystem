export function calculateNetProfit(
  revenue: number,
  platformFee: number,
  cleaningFee: number,
  otherExpenses: number
): number {
  return revenue - platformFee - cleaningFee - otherExpenses;
}

export function calculateOccupancyRate(
  bookedNights: number,
  totalNights: number
): number {
  if (totalNights === 0) return 0;
  return Math.round((bookedNights / totalNights) * 100);
}

export function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PH').format(num);
}
