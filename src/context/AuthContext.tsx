import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { HostUser } from '@/types';
import { COLLECTIONS } from '@/shared';

interface AuthContextType {
  user: User | null;
  hostUser: HostUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  hostUser: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hostUser, setHostUser] = useState<HostUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setHostUser(null);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, COLLECTIONS.bookingHosts, user.uid);
    const unsubDoc = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        setHostUser(snapshot.data() as HostUser);
      } else {
        // Auto-create host document for authenticated users missing one
        await setDoc(docRef, {
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
        });
      }
      setLoading(false);
    });

    return () => unsubDoc();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, hostUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
