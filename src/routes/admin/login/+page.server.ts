import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { signSession } from '$lib/server/admin/session.js';
import { isWhitelisted } from '$lib/server/admin/whitelist.js';

export const load: PageServerLoad = ({ locals }) => {
  if (locals.admin) {
    redirect(302, '/admin');
  }
  return {};
};

function constantTimeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const email = ((data.get('email') as string) ?? '').trim().toLowerCase();
    const password = (data.get('password') as string) ?? '';

    const adminPassword = env.ADMIN_PASSWORD;
    const sessionSecret = env.ADMIN_SESSION_SECRET;

    if (!adminPassword || !sessionSecret) {
      console.error('[admin] ADMIN_PASSWORD or ADMIN_SESSION_SECRET not set');
      return fail(503, { error: true });
    }

    // Always run both checks; never reveal which check failed (avoids enumeration)
    const pwOk = constantTimeEqual(password, adminPassword);
    const listed = isWhitelisted(email);

    if (!pwOk || !listed) {
      console.warn(
        `[admin] ${new Date().toISOString()} failed sign-in for ${email || '(empty)'} path=${url.pathname}`
      );
      return fail(400, { error: true });
    }

    const token = signSession({ email, iat: Math.floor(Date.now() / 1000) }, sessionSecret);
    cookies.set('admin_session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    console.info(`[admin] ${new Date().toISOString()} sign-in: ${email}`);

    const returnTo = url.searchParams.get('return');
    const safeReturn =
      returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : '/admin';
    redirect(303, safeReturn);
  }
};
