import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Cloudflare Access integration.
 *
 * In production, `/admin/*` is protected by a Cloudflare Access policy at the
 * edge — only allowed identities ever reach the Worker, and each request carries
 * a signed `Cf-Access-Jwt-Assertion` header. We still verify that JWT here
 * (defense in depth) so a request that bypasses Access — e.g. hitting the Worker
 * directly — is rejected.
 *
 * In local dev there is no Access edge, so when no JWT is present we fall back to
 * `DEV_ADMIN_EMAIL` (set in `.dev.vars`, never in production).
 */
export interface AccessEnv {
  CF_ACCESS_TEAM_DOMAIN?: string; // team name, e.g. "dpflab" -> dpflab.cloudflareaccess.com
  CF_ACCESS_AUD?: string; // Application Audience (AUD) tag of the Access app
  DEV_ADMIN_EMAIL?: string; // local-dev bypass identity
}

// JWKS endpoints are cached per team domain (jose caches the keys internally).
const jwksByTeam = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwksFor(teamDomain: string) {
  let jwks = jwksByTeam.get(teamDomain);
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/certs`)
    );
    jwksByTeam.set(teamDomain, jwks);
  }
  return jwks;
}

/**
 * Resolves the authenticated admin email for a request, or null if the request
 * is not an authenticated Access request (and no dev bypass applies).
 */
export async function getAccessEmail(
  request: Request,
  env: AccessEnv | undefined
): Promise<string | null> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');

  if (!token) {
    // No Access JWT — only allowed via explicit local-dev bypass.
    return env?.DEV_ADMIN_EMAIL ?? null;
  }

  const teamDomain = env?.CF_ACCESS_TEAM_DOMAIN;
  const aud = env?.CF_ACCESS_AUD;
  if (!teamDomain || !aud) return null;

  try {
    const { payload } = await jwtVerify(token, jwksFor(teamDomain), {
      issuer: `https://${teamDomain}.cloudflareaccess.com`,
      audience: aud
    });
    const email = payload.email;
    return typeof email === 'string' ? email : null;
  } catch {
    return null;
  }
}
