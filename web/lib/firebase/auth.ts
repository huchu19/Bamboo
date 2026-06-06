/**
 * Firebase Auth helper functions
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import type { User, UserRole } from '../../types';

function requireAuth() {
  if (!auth) throw new Error('Firebase auth is not configured. Set NEXT_PUBLIC_FIREBASE_* in web/.env.local');
  return auth;
}
function requireDb() {
  if (!db) throw new Error('Firebase Firestore is not configured. Set NEXT_PUBLIC_FIREBASE_* in web/.env.local');
  return db;
}

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<FirebaseUser> => {
  // Create auth user
  const { user } = await createUserWithEmailAndPassword(requireAuth(), email, password);

  // Update profile
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  const userDoc: User = {
    uid: user.uid,
    email: user.email || '',
    displayName,
    role,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (role === 'inventor') {
    userDoc.inventorProfile = {
      bio: '',
      isVerified: false,
      totalPitches: 0,
      totalFundsRaised: 0,
    };
  } else {
    userDoc.investorProfile = {
      accreditedStatus: 'unverified',
      investmentTotal: 0,
      portfolioCount: 0,
      preferredCategories: [],
    };
  }

  await setDoc(doc(requireDb(), 'users', user.uid), userDoc);

  return user;
};

/**
 * Sign in existing user
 */
export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  const { user } = await signInWithEmailAndPassword(requireAuth(), email, password);
  return user;
};

/**
 * Sign out current user
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(requireAuth());
};

/**
 * Get current auth user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth?.currentUser ?? null;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return auth.onAuthStateChanged(callback);
};
