import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from '@/shared';
import { PlanType } from '@/types';

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await createHostDocument(user);
  return user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function loginWithGoogle(): Promise<User> {
  const { user } = await signInWithPopup(auth, googleProvider);
  await createHostDocument(user);
  return user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

async function createHostDocument(user: User): Promise<void> {
  const docRef = doc(db, COLLECTIONS.bookingHosts, user.uid);
  await setDoc(
    docRef,
    {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      currency: 'PHP',
      plan: 'free',
      pendingPlan: null,
      allowedTypes: [],
      amountPaid: 0,
      paidAt: null,
      paymongoPaymentId: null,
      paymentLinkId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** User requests a plan upgrade — sets pendingPlan for admin to approve. */
export async function requestPlanUpgrade(userId: string, plan: PlanType): Promise<void> {
  const docRef = doc(db, COLLECTIONS.bookingHosts, userId);
  await updateDoc(docRef, {
    pendingPlan: plan,
    updatedAt: serverTimestamp(),
  });
}
