import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  scheduleContactSubmissionNotification,
  sendContactSubmissionNotification
} from '../../src/lib/server/notifications/contact-submission';

describe('sendContactSubmissionNotification', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a production notification with the submission link and no recipient in code', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'email-1' });

    await sendContactSubmissionNotification({
      id: 123,
      origin: 'https://dpflab.ee',
      env: { ADMIN_EMAIL: { send }, APP_ENV: 'prod', NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee' }
    });

    expect(send).toHaveBeenCalledWith({
      from: 'info@dpflab.ee',
      to: undefined,
      subject: 'Новая заявка #123',
      text: 'Поступила новая заявка.\nhttps://dpflab.ee/admin/submissions/123'
    });
  });

  it('prefixes the subject in develop', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'email-1' });

    await sendContactSubmissionNotification({
      id: 7,
      origin: 'https://dpflab-develop.workers.dev',
      env: { ADMIN_EMAIL: { send }, APP_ENV: 'develop', NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee' }
    });

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ subject: 'TEST: Новая заявка #7' }));
  });

  it('does not throw when email is unavailable or delivery fails', async () => {
    const error = new Error('delivery failed');
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warningLog = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(sendContactSubmissionNotification({ id: 3, origin: 'https://dpflab.ee', env: {} })).resolves.toBeUndefined();
    await expect(sendContactSubmissionNotification({
      id: 3,
      origin: 'https://dpflab.ee',
      env: { ADMIN_EMAIL: { send: vi.fn().mockRejectedValue(error) }, NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee' }
    })).resolves.toBeUndefined();

    expect(warningLog).toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalledWith(
      '[notifications] event=contact_submission_email_failed',
      { id: 3, error }
    );
  });

  it('uses waitUntil when the Worker execution context is available', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'email-1' });
    const waitUntil = vi.fn();

    await scheduleContactSubmissionNotification({
      id: 4,
      origin: 'https://dpflab.ee',
      env: { ADMIN_EMAIL: { send }, NOTIFICATION_FROM_EMAIL: 'info@dpflab.ee' },
      context: { waitUntil }
    });

    expect(waitUntil).toHaveBeenCalledTimes(1);
    await waitUntil.mock.calls[0][0];
    expect(send).toHaveBeenCalledTimes(1);
  });
});
