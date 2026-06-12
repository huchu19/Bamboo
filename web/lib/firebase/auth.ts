/**
 * Firebase Auth helper functions
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  // Create user document in Firestore. Registration is gated behind the
  // Terms/Privacy checkbox in the UI, so record acceptance at signup time.
  const now = Date.now();
  const userDoc: User = {
    uid: user.uid,
    email: user.email || '',
    displayName,
    role,
    termsAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
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

  // Fire off the verification email. Don't block registration on it — a failed
  // send is recoverable from the verify-email screen via "resend".
  try {
    await sendEmailVerification(user);
  } catch (err) {
    console.error('Failed to send verification email:', err);
  }

  return user;
};

/** Re-send the verification email to the currently signed-in user. */
export const resendVerificationEmail = async (): Promise<void> => {
  const user = requireAuth().currentUser;
  if (!user) throw new Error('No signed-in user to verify.');
  await sendEmailVerification(user);
};

/**
 * Sign in (or sign up) with Google. Google accounts are inherently
 * email-verified. On first sign-in we create the Firestore user doc with the
 * given role; returning users keep their existing doc/role.
 */
export const signInWithGoogle = async (role: UserRole): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(requireAuth(), provider);

  const ref = doc(requireDb(), 'users', user.uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    const now = Date.now();
    const userDoc: User = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Member',
      role,
      termsAcceptedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    if (role === 'inventor') {
      userDoc.inventorProfile = { bio: '', isVerified: false, totalPitches: 0, totalFundsRaised: 0 };
    } else {
      userDoc.investorProfile = {
        accreditedStatus: 'unverified',
        investmentTotal: 0,
        portfolioCount: 0,
        preferredCategories: [],
      };
    }
    await setDoc(ref, userDoc);
  }

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
