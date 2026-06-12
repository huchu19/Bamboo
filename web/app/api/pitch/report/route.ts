/**
 * POST /api/pitch/report
 *
 * Authenticated investors (or inventors) flag a pitch for admin review.
 * Body: { pitchId: string, reason: string }
 *
 * The pitch status flips to 'reported' so it appears in the admin moderation
 * queue. If the pitch is already reported we just append the reason and bump
 * the counter — no duplicate status set.
 *
 * A user can only report each pitch once (enforced by the
 * pitchReports/{pitchId}_{uid} doc — if it already exists we 409).
 */

import { NextRequest } from 'next/server';
import { getAdminDb, verifyBearerToken } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

const ALLOWED_REASONS = [
  'Misleading information',
  'Fraudulent pitch',
  'Inappropriate content',
  'Spam',
  'Other',
] as const;

export async function POST(request: NextRequest) {
  const uid = await verifyBearerToken(request.headers.get('authorization'));
  if (!uid) return Response.json({ error: 'Authentication required.' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { pitchId, reason } = body ?? {};
  if (!pitchId || typeof pitchId !== 'string') {
    return Response.json({ error: 'pitchId is required.' }, { status: 400 });
  }
  if (!reason || typeof reason !== 'string' || reason.length > 200) {
    return Response.json({ error: 'A reason is required (max 200 characters).' }, { status: 400 });
  }

  const db = getAdminDb();
  const reportId = `${pitchId}_${uid}`;
  const reportRef = db.collection('pitchReports').doc(reportId);
  const pitchRef = db.collection('pitches').doc(pitchId);

  const [reportSnap, pitchSnap] = await Promise.all([reportRef.get(), pitchRef.get()]);

  if (!pitchSnap.exists) return Response.json({ error: 'Pitch not found.' }, { status: 404 });
  const pitch = pitchSnap.data()!;

  // Don't let a founder report their own pitch.
  if (pitch.inventorId === uid) {
    return Response.json({ error: "You can't report your own pitch." }, { status: 403 });
  }

  if (reportSnap.exists) {
    return Response.json({ error: 'You have already reported this pitch.' }, { status: 409 });
  }

  const now = Date.now();

  await db.runTransaction(async (tx) => {
    tx.set(reportRef, { pitchId, reportedBy: uid, reason, createdAt: now });
    tx.update(pitchRef, {
      status: 'reported',
      reportCount: (pitch.reportCount ?? 0) + 1,
      reportReasons: [...(pitch.reportReasons ?? []), reason],
      reportedAt: now,
      updatedAt: now,
    });
  });

  return Response.json({ ok: true });
}
