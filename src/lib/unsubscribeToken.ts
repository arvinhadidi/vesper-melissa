import { createHmac, timingSafeEqual } from 'crypto';

// One-click unsubscribe tokens: `${uid}.${hmac}` where hmac is HMAC-SHA256 of
// the uid, keyed on EMAIL_UNSUBSCRIBE_SECRET, hex-encoded. Stateless (no DB
// lookup needed to verify), and it never expires — that's fine here, an
// unsubscribe link that goes stale is a worse outcome than one that never does.

function getSecret(): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error('EMAIL_UNSUBSCRIBE_SECRET is not set');
  return secret;
}

function sign(uid: string): string {
  return createHmac('sha256', getSecret()).update(uid).digest('hex');
}

export function buildUnsubscribeToken(uid: string): string {
  return `${uid}.${sign(uid)}`;
}

export function buildUnsubscribeUrl(uid: string, baseUrl = 'https://vesper.cards'): string {
  const token = buildUnsubscribeToken(uid);
  return `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function verifyUnsubscribeToken(token: string | null): { valid: boolean; uid: string | null } {
  if (!token) return { valid: false, uid: null };

  const separatorIndex = token.lastIndexOf('.');
  if (separatorIndex <= 0) return { valid: false, uid: null };

  const uid = token.slice(0, separatorIndex);
  const providedHmac = token.slice(separatorIndex + 1);
  const expectedHmac = sign(uid);

  const providedBuf = Buffer.from(providedHmac, 'hex');
  const expectedBuf = Buffer.from(expectedHmac, 'hex');

  // timingSafeEqual throws if buffer lengths differ, so guard that first —
  // a malformed/tampered token must fail closed, not throw a 500.
  if (providedBuf.length !== expectedBuf.length) return { valid: false, uid: null };
  if (!timingSafeEqual(providedBuf, expectedBuf)) return { valid: false, uid: null };

  return { valid: true, uid };
}
