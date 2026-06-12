/**
 * Temporary diagnostic endpoint — DELETE after debugging.
 * GET /api/debug → reports env var presence and Admin SDK init status.
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const report: Record<string, unknown> = {};

  // 1. Env var presence (never log values)
  report.FIREBASE_SERVICE_ACCOUNT_KEY_set =
    !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  report.FIREBASE_SERVICE_ACCOUNT_KEY_length =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length ?? 0;
  report.NEXT_PUBLIC_INVITE_REQUIRED =
    process.env.NEXT_PUBLIC_INVITE_REQUIRED;
  report.NEXT_PUBLIC_DEV_BYPASS_AUTH =
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH;
  report.NODE_ENV = process.env.NODE_ENV;

  // 2. Try parsing the service account JSON
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      report.sa_parse = 'ok';
      report.sa_project_id = parsed.project_id;
      report.sa_client_email = parsed.client_email;
      report.sa_has_private_key = !!parsed.private_key;
    } catch (e: any) {
      report.sa_parse = 'FAILED';
      report.sa_parse_error = e.message;
    }
  } else {
    report.sa_parse = 'skipped — env var not set';
  }

  // 3. Try initialising the Admin SDK
  try {
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();
    report.admin_init = 'ok';
    // Try a lightweight Firestore read
    try {
      await db.collection('invites').limit(1).get();
      report.firestore_read = 'ok';
    } catch (e: any) {
      report.firestore_read = 'FAILED';
      report.firestore_read_error = e.message;
    }
  } catch (e: any) {
    report.admin_init = 'FAILED';
    report.admin_init_error = e.message;
  }

  return Response.json(report);
}
