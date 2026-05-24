/**
 * Firestore helper functions
 */

import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { User, Pitch, Investment, Payment } from '../../types';

/**
 * Get user by ID
 */
export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? (userDoc.data() as User) : null;
};

/**
 * Listen to user document changes
 */
export const onUserChange = (userId: string, callback: (user: User | null) => void): Unsubscribe => {
  return onSnapshot(doc(db, 'users', userId), (doc) => {
    callback(doc.exists() ? (doc.data() as User) : null);
  });
};

/**
 * Get all pitches (with pagination)
 */
export const getPitches = async (limitCount = 20, startAfter?: any): Promise<Pitch[]> => {
  const pitchesQuery = query(
    collection(db, 'pitches'),
    where('status', '==', 'live'),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(pitchesQuery);
  return snapshot.docs.map((doc) => doc.data() as Pitch);
};

/**
 * Listen to live pitches
 */
export const onPitchesChange = (callback: (pitches: Pitch[]) => void): Unsubscribe => {
  const pitchesQuery = query(
    collection(db, 'pitches'),
    where('status', '==', 'live'),
    orderBy('publishedAt', 'desc'),
    limit(20)
  );

  return onSnapshot(pitchesQuery, (snapshot) => {
    const pitches = snapshot.docs.map((doc) => doc.data() as Pitch);
    callback(pitches);
  });
};

/**
 * Get pitch by ID
 */
export const getPitch = async (pitchId: string): Promise<Pitch | null> => {
  const pitchDoc = await getDoc(doc(db, 'pitches', pitchId));
  return pitchDoc.exists() ? (pitchDoc.data() as Pitch) : null;
};

/**
 * Listen to pitch changes
 */
export const onPitchChange = (pitchId: string, callback: (pitch: Pitch | null) => void): Unsubscribe => {
  return onSnapshot(doc(db, 'pitches', pitchId), (doc) => {
    callback(doc.exists() ? (doc.data() as Pitch) : null);
  });
};

/**
 * Get inventor's pitches
 */
export const getInventorPitches = async (inventorId: string): Promise<Pitch[]> => {
  const pitchesQuery = query(collection(db, 'pitches'), where('inventorId', '==', inventorId));
  const snapshot = await getDocs(pitchesQuery);
  return snapshot.docs.map((doc) => doc.data() as Pitch);
};

/**
 * Get investor's investments
 */
export const getInvestorInvestments = async (investorId: string): Promise<Investment[]> => {
  const investmentsQuery = query(
    collection(db, 'investments'),
    where('investorId', '==', investorId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(investmentsQuery);
  return snapshot.docs.map((doc) => doc.data() as Investment);
};

/**
 * Listen to investor's investments
 */
export const onInvestorInvestmentsChange = (
  investorId: string,
  callback: (investments: Investment[]) => void
): Unsubscribe => {
  const investmentsQuery = query(
    collection(db, 'investments'),
    where('investorId', '==', investorId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(investmentsQuery, (snapshot) => {
    const investments = snapshot.docs.map((doc) => doc.data() as Investment);
    callback(investments);
  });
};

/**
 * Get watchlist items for investor
 */
export const getWatchlist = async (userId: string): Promise<string[]> => {
  const snapshot = await getDocs(collection(db, 'watchlist', userId, 'items'));
  return snapshot.docs.map((doc) => doc.id);
};

/**
 * Listen to watchlist changes
 */
export const onWatchlistChange = (userId: string, callback: (pitchIds: string[]) => void): Unsubscribe => {
  return onSnapshot(collection(db, 'watchlist', userId, 'items'), (snapshot) => {
    const pitchIds = snapshot.docs.map((doc) => doc.id);
    callback(pitchIds);
  });
};
