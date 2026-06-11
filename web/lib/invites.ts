/**
 * Invite-code helpers shared by the invite API routes and the register form.
 *
 * Data model (all writes server-side via the Admin SDK; clients never touch
 * these collections directly):
 *   invites/{CODE}            { code, maxUses, usedCount, usedBy[], note, createdAt }
 *   inviteRedemptions/{uid}   { code, redeemedAt }
 *
 * Codes are minted with scripts/generate-invites.mjs. The client-side gate is
 * toggled with NEXT_PUBLIC_INVITE_REQUIRED=true (see register page).
 */

export function normalizeInviteCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9-]{4,32}$/.test(code) ? code : null;
}

export function isInviteRequired(): boolean {
  return process.env.NEXT_PUBLIC_INVITE_REQUIRED === 'true';
}
