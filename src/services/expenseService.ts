import {
  collection,
  doc,
  setDoc,
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
import { Expense, ExpenseCategory } from '@/types';
import { generateExpenseId } from '@/utils';

function getExpensesRef(userId: string) {
  return collection(db, COLLECTIONS.bookingHosts, userId, COLLECTIONS.expenses);
}

export async function createExpense(
  userId: string,
  data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = generateExpenseId(data.category, data.date.toDate());
  const docRef = doc(getExpensesRef(userId), id);

  await setDoc(docRef, {
    ...data,
    id,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return id;
}

export async function getExpenses(
  userId: string,
  filters?: {
    propertyId?: string;
    category?: ExpenseCategory;
  }
): Promise<Expense[]> {
  const ref = getExpensesRef(userId);
  const constraints = [orderBy('date', 'desc')];

  if (filters?.propertyId) {
    constraints.unshift(where('propertyId', '==', filters.propertyId));
  }
  if (filters?.category) {
    constraints.unshift(where('category', '==', filters.category));
  }

  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Expense);
}

export async function updateExpense(
  userId: string,
  expenseId: string,
  data: Partial<Expense>
): Promise<void> {
  const docRef = doc(getExpensesRef(userId), expenseId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  const docRef = doc(getExpensesRef(userId), expenseId);
  await deleteDoc(docRef);
}
