export type ContactSubmissionNotificationEnv = {
  APP_ENV?: 'develop' | 'prod';
  NOTIFICATION_FROM_EMAIL?: string;
  NOTIFICATION_RECIPIENT_EMAIL?: string;
  RESEND_API_KEY?: string;
};

type NotificationInput = {
  id: number;
  origin: string;
  env?: ContactSubmissionNotificationEnv;
  fetchFn?: typeof fetch;
};

type NotificationContext = {
  waitUntil(promise: Promise<unknown>): void;
};

export async function sendContactSubmissionNotification({ id, origin, env, fetchFn = fetch }: NotificationInput): Promise<void> {
  if (!env?.RESEND_API_KEY || !env.NOTIFICATION_FROM_EMAIL || !env.NOTIFICATION_RECIPIENT_EMAIL) {
    console.warn('[notifications] event=contact_submission_email_unavailable', { id });
    return;
  }

  const subject = `${env.APP_ENV === 'develop' ? 'TEST: ' : ''}Новая заявка #${id}`;
  const text = `Поступила новая заявка.\n${new URL(`/admin/submissions/${id}`, origin).href}`;

  try {
    const response = await fetchFn('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.NOTIFICATION_FROM_EMAIL,
        to: [env.NOTIFICATION_RECIPIENT_EMAIL],
        subject,
        text
      })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { name?: unknown; message?: unknown };

      console.error('[notifications] event=contact_submission_email_failed', {
        id,
        status: response.status,
        error: {
          name: typeof body.name === 'string' ? body.name : 'unknown_error',
          message: typeof body.message === 'string' ? body.message : `Resend responded with ${response.status}`
        }
      });
      return;
    }
  } catch (error) {
    console.error('[notifications] event=contact_submission_email_failed', {
      id,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function scheduleContactSubmissionNotification(
  input: NotificationInput & { context?: NotificationContext }
): Promise<void> {
  const notification = sendContactSubmissionNotification(input);

  if (input.context) {
    input.context.waitUntil(notification);
    return;
  }

  await notification;
}
