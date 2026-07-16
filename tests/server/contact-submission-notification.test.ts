import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  scheduleContactSubmissionNotification,
  sendContactSubmissionNotification
} from '../../src/lib/server/notifications/contact-submission';

describe('sendContactSubmissionNotification', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a production notification with the submission link and no personal data', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email-1' }), { status: 200 }));

    await sendContactSubmissionNotification({
      id: 123,
      origin: 'https://dpflab.ee',
      env: {
        APP_ENV: 'prod',
        NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee',
        NOTIFICATION_RECIPIENT_EMAIL: 'info@dpflab.ee',
        RESEND_API_KEY: 're_test'
      },
      fetchFn
    });

    expect(fetchFn).toHaveBeenCalledWith('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer re_test', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'info@dpflab.ee',
        to: ['info@dpflab.ee'],
        subject: 'Новая заявка #123',
        text: 'Поступила новая заявка.\nhttps://dpflab.ee/admin/submissions/123'
      })
    });
  });

  it('prefixes the subject in develop', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email-1' }), { status: 200 }));

    await sendContactSubmissionNotification({
      id: 7,
      origin: 'https://dpflab-develop.workers.dev',
      env: {
        APP_ENV: 'develop',
        NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee',
        NOTIFICATION_RECIPIENT_EMAIL: 'alexandr.lerko@gmail.com',
        RESEND_API_KEY: 're_test'
      },
      fetchFn
    });

    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toMatchObject({ subject: 'TEST: Новая заявка #7' });
  });

  it('does not throw when email is unavailable or delivery fails', async () => {
    const error = new Error('delivery failed');
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warningLog = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(sendContactSubmissionNotification({ id: 3, origin: 'https://dpflab.ee', env: {} })).resolves.toBeUndefined();
    await expect(sendContactSubmissionNotification({
      id: 3,
      origin: 'https://dpflab.ee',
      env: {
        NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee',
        NOTIFICATION_RECIPIENT_EMAIL: 'info@dpflab.ee',
        RESEND_API_KEY: 're_test'
      },
      fetchFn: vi.fn().mockRejectedValue(error)
    })).resolves.toBeUndefined();

    expect(warningLog).toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalledWith(
      '[notifications] event=contact_submission_email_failed',
      { id: 3, error: 'delivery failed' }
    );
  });

  it('logs structured Resend error details when delivery is rejected', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await sendContactSubmissionNotification({
      id: 5,
      origin: 'https://dpflab.ee',
      env: {
        NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee',
        NOTIFICATION_RECIPIENT_EMAIL: 'info@dpflab.ee',
        RESEND_API_KEY: 're_test'
      },
      fetchFn: vi.fn().mockResolvedValue(new Response(JSON.stringify({
        name: 'validation_error',
        message: 'Invalid API key'
      }), { status: 401 }))
    });

    expect(errorLog).toHaveBeenCalledWith(
      '[notifications] event=contact_submission_email_failed',
      {
        id: 5,
        status: 401,
        error: { name: 'validation_error', message: 'Invalid API key' }
      }
    );
  });

  it('uses waitUntil when the Worker execution context is available', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email-1' }), { status: 200 }));
    const waitUntil = vi.fn();

    await scheduleContactSubmissionNotification({
      id: 4,
      origin: 'https://dpflab.ee',
      env: {
        NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee',
        NOTIFICATION_RECIPIENT_EMAIL: 'info@dpflab.ee',
        RESEND_API_KEY: 're_test'
      },
      fetchFn,
      context: { waitUntil }
    });

    expect(waitUntil).toHaveBeenCalledTimes(1);
    await waitUntil.mock.calls[0][0];
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
