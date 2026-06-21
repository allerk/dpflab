import { describe, it, expect } from 'vitest';
import { getAccessEmail } from '../../src/lib/server/admin/access';

const req = (headers: Record<string, string> = {}) =>
  new Request('http://localhost/admin', { headers });

describe('getAccessEmail', () => {
  it('returns the dev bypass identity when no Access JWT is present', async () => {
    const email = await getAccessEmail(req(), { DEV_ADMIN_EMAIL: 'dev@example.com' });
    expect(email).toBe('dev@example.com');
  });

  it('returns null when no JWT and no dev bypass configured', async () => {
    expect(await getAccessEmail(req(), {})).toBeNull();
    expect(await getAccessEmail(req(), undefined)).toBeNull();
  });

  it('returns null when a JWT is present but Access env is not configured', async () => {
    // A token forces verification; without team domain + AUD we cannot trust it.
    const email = await getAccessEmail(req({ 'Cf-Access-Jwt-Assertion': 'x.y.z' }), {
      DEV_ADMIN_EMAIL: 'dev@example.com'
    });
    expect(email).toBeNull();
  });

  it('returns null when JWT verification fails', async () => {
    const email = await getAccessEmail(req({ 'Cf-Access-Jwt-Assertion': 'not-a-valid-token' }), {
      CF_ACCESS_TEAM_DOMAIN: 'example',
      CF_ACCESS_AUD: 'aud-tag'
    });
    expect(email).toBeNull();
  });
});
