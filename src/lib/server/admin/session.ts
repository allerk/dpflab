import crypto from 'node:crypto';

export interface AdminSession {
  email: string;
  iat: number;
}

function hmac(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function signSession(session: AdminSession, secret: string): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${hmac(payload, secret)}`;
}

export function verifySession(token: string, secret: string): AdminSession | null {
  const sep = token.lastIndexOf('.');
  if (sep < 0) return null;
  const payload = token.slice(0, sep);
  const sig = token.slice(sep + 1);
  const expected = hmac(payload, secret);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as AdminSession;
  } catch {
    return null;
  }
}
