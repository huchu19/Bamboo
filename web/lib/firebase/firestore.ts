/**
 * Firestore helper functions
 */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db as _db } from './config';
import type { User, Pitch, Investment, Payment } from '../../types';
import type { CreateInvestmentInput } from '../../types';

// Helpers in this file only run after AuthContext has loaded a signed-in user,
// which requires Firebase to be configured. Assert non-null at the boundary.
const db = _db!;

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? (userDoc.data() as User) : null;
};

export const onUserChange = (userId: string, callback: (user: User | null) => void): Unsubscribe => {
  return onSnapshot(doc(db, 'users', userId), (snap) => {
    callback(snap.exists() ? (snap.data() as User) : null);
  });
};

/** Mark onboarding complete on the user doc so it follows them across devices. */
export const markOnboarded = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), { hasOnboarded: true, updatedAt: Date.now() });
};

// ─── Pitches ──────────────────────────────────────────────────────────────────

export const getPitches = async (limitCount = 20): Promise<Pitch[]> => {
  const q = query(
    collection(db, 'pitches'),
    where('status', '==', 'live'),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pitch));
};

export const onPitchesChange = (callback: (pitches: Pitch[]) => void): Unsubscribe => {
  const q = query(
    collection(db, 'pitches'),
    where('status', '==', 'live'),
    orderBy('publishedAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pitch)));
  });
};

export const getPitch = async (pitchId: string): Promise<Pitch | null> => {
  const pitchDoc = await getDoc(doc(db, 'pitches', pitchId));
  return pitchDoc.exists() ? ({ id: pitchDoc.id, ...pitchDoc.data() } as Pitch) : null;
};

export const onPitchChange = (pitchId: string, callback: (pitch: Pitch | null) => void): Unsubscribe => {
  return onSnapshot(doc(db, 'pitches', pitchId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Pitch) : null);
  });
};

export const getInventorPitches = async (inventorId: string): Promise<Pitch[]> => {
  const q = query(
    collection(db, 'pitches'),
    where('inventorId', '==', inventorId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pitch));
};

export const onInventorPitchesChange = (
  inventorId: string,
  callback: (pitches: Pitch[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'pitches'),
    where('inventorId', '==', inventorId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pitch)));
  });
};

export const createPitch = async (pitchId: string, pitchData: Omit<Pitch, 'id'>): Promise<void> => {
  await setDoc(doc(db, 'pitches', pitchId), { ...pitchData, id: pitchId });
};

export const updatePitch = async (pitchId: string, updates: Partial<Pitch>): Promise<void> => {
  await updateDoc(doc(db, 'pitches', pitchId), { ...updates, updatedAt: Date.now() });
};

// ─── Investments ──────────────────────────────────────────────────────────────

export const getInvestorInvestments = async (investorId: string): Promise<Investment[]> => {
  const q = query(
    collection(db, 'investments'),
    where('investorId', '==', investorId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Investment));
};

export const onInvestorInvestmentsChange = (
  investorId: string,
  callback: (investments: Investment[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'investments'),
    where('investorId', '==', investorId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Investment)));
  });
};

export const createInvestment = async (data: CreateInvestmentInput): Promise<string> => {
  const investmentId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  await runTransaction(db, async (tx) => {
    const pitchRef = doc(db, 'pitches', data.pitchId);
    const pitchSnap = await tx.get(pitchRef);
    if (!pitchSnap.exists()) throw new Error('Pitch not found');

    const pitch = pitchSnap.data() as Pitch;
    const equityPortion = (data.amount / pitch.fundingGoal) * pitch.equityOffered;

    const investment: Investment = {
      id: investmentId,
      investorId: data.investorId,
      pitchId: data.pitchId,
      inventorId: pitch.inventorId,
      amount: data.amount,
      equityPortion,
      status: 'completed',
      anonymous: Boolean(data.anonymous),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: Date.now(),
    };

    tx.set(doc(db, 'investments', investmentId), investment);
    tx.update(pitchRef, {
      amountRaised: (pitch.amountRaised || 0) + data.amount,
      investorCount: (pitch.investorCount || 0) + 1,
      updatedAt: Date.now(),
    });
  });

  return investmentId;
};

// ─── Watchlist ────────────────────────────────────────────────────────────────

export const getWatchlist = async (userId: string): Promise<string[]> => {
  const snapshot = await getDocs(collection(db, 'watchlist', userId, 'items'));
  return snapshot.docs.map((d) => d.id);
};

export const onWatchlistChange = (userId: string, callback: (pitchIds: string[]) => void): Unsubscribe => {
  return onSnapshot(collection(db, 'watchlist', userId, 'items'), (snapshot) => {
    callback(snapshot.docs.map((d) => d.id));
  });
};

export const addToWatchlist = async (userId: string, pitchId: string): Promise<void> => {
  await setDoc(doc(db, 'watchlist', userId, 'items', pitchId), {
    pitchId,
    addedAt: Date.now(),
  });
};

export const removeFromWatchlist = async (userId: string, pitchId: string): Promise<void> => {
  await deleteDoc(doc(db, 'watchlist', userId, 'items', pitchId));
};

export const isInWatchlist = async (userId: string, pitchId: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'watchlist', userId, 'items', pitchId));
  return snap.exists();
};

export const getWatchlistPitches = async (userId: string): Promise<Pitch[]> => {
  const pitchIds = await getWatchlist(userId);
  if (pitchIds.length === 0) return [];
  const pitches = await Promise.all(pitchIds.map((id) => getPitch(id)));
  return pitches.filter((p): p is Pitch => p !== null);
};
