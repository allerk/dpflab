import { describe, it, expect } from 'vitest';
import { signSession, verifySession, type AdminSession } from '../../src/lib/server/admin/session';

const SECRET = 'test-secret-key-long-enough';

const payload: AdminSession = { email: 'alice@example.com', iat: 1700000000 };

describe('signSession / verifySession', () => {
  it('round-trips a valid session', () => {
    const token = signSession(payload, SECRET);
    const result = verifySession(token, SECRET);
    expect(result).toEqual(payload);
  });

  it('returns null for a tampered payload', () => {
    const token = signSession(payload, SECRET);
    const parts = token.split('.');
    parts[0] = Buffer.from(JSON.stringify({ email: 'evil@example.com', iat: 0 })).toString('base64url');
    const tampered = parts.join('.');
    expect(verifySession(tampered, SECRET)).toBeNull();
  });

  it('returns null for a tampered signature', () => {
    const token = signSession(payload, SECRET);
    const tampered = token.slice(0, -4) + 'XXXX';
    expect(verifySession(tampered, SECRET)).toBeNull();
  });

  it('returns null when signed with a different secret', () => {
    const token = signSession(payload, SECRET);
    expect(verifySession(token, 'wrong-secret')).toBeNull();
  });

  it('returns null for a token with no separator', () => {
    expect(verifySession('invaliddatanoseparator', SECRET)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(verifySession('', SECRET)).toBeNull();
  });

  it('returns null for malformed base64 payload', () => {
    const fake = 'not-valid-base64url.signature';
    expect(verifySession(fake, SECRET)).toBeNull();
  });
});
