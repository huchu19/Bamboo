/**
 * Firebase Auth helper functions for mobile
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

// Import types from shared package - in production use npm package
// For now, use inline types
export type UserRole = 'inventor' | 'investor';

export interface InventorProfile {
  companyName?: string;
  website?: string;
  linkedIn?: string;
  bio: string;
  isVerified: boolean;
  verifiedAt?: number;
  totalPitches: number;
  totalFundsRaised: number;
}

export interface InvestorProfile {
  accreditedStatus: 'pending' | 'verified' | 'unverified';
  investmentTotal: number;
  portfolioCount: number;
  preferredCategories: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
  inventorProfile?: InventorProfile;
  investorProfile?: InvestorProfile;
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
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });

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

  await setDoc(doc(db, 'users', user.uid), userDoc);
  return user;
};

/**
 * Sign in existing user
 */
export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

/**
 * Sign out current user
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Get current auth user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback);
};
