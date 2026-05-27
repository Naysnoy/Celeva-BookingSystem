import { Timestamp } from 'firebase/firestore';

export type ExpenseCategory = 'maintenance' | 'utilities' | 'supplies' | 'cleaning' | 'other';

export interface Expense {
  id: string;
  userId: string;
  propertyId: string | null;
  propertyName: string | null;
  category: ExpenseCategory;
  amount: number;
  date: Timestamp;
  description: string;
  receiptUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
