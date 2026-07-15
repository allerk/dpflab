export type ContactSubmissionNotificationEnv = {
  ADMIN_EMAIL?: {
    send(message: {
      from: string;
      to?: undefined;
      subject: string;
      text: string;
    }): Promise<unknown>;
  };
  APP_ENV?: 'develop' | 'prod';
  NOTIFICATION_FROM_EMAIL?: string;
};

type NotificationInput = {
  id: number;
  origin: string;
  env?: ContactSubmissionNotificationEnv;
};

export async function sendContactSubmissionNotification({ id, origin, env }: NotificationInput): Promise<void> {
  if (!env?.ADMIN_EMAIL || !env.NOTIFICATION_FROM_EMAIL) {
    console.warn('[notifications] event=contact_submission_email_unavailable', { id });
    return;
  }

  const subject = `${env.APP_ENV === 'develop' ? 'TEST: ' : ''}Новая заявка #${id}`;
  const text = `Поступила новая заявка.\n${new URL(`/admin/submissions/${id}`, origin).href}`;

  try {
    await env.ADMIN_EMAIL.send({
      from: env.NOTIFICATION_FROM_EMAIL,
      to: undefined,
      subject,
      text
    });
  } catch (error) {
    console.error('[notifications] event=contact_submission_email_failed', { id, error });
  }
}
