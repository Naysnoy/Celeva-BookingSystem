import { Timestamp } from 'firebase/firestore';

export type PlanType = 'free' | 'starter' | 'pro';
export type PropertyType = 'airbnb' | 'resort' | 'apartment' | 'condo' | 'house';

export interface HostUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  currency: string;
  plan: PlanType;
  pendingPlan: PlanType | null;
  allowedTypes: PropertyType[];
  amountPaid: number;
  paidAt: Timestamp | null;
  paymongoPaymentId: string | null;
  paymentLinkId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
