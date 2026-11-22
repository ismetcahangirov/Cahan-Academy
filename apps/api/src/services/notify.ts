import { sendMail } from './email.service.js';
import { env } from '../config/env.js';
import { adminNotificationTemplate, userThankYouTemplate } from '../templates/notification.template.js';
import { singleLine } from '../utils/sanitize.js';

type Kind = 'lead' | 'contact' | 'newsletter';

/**
 * Send the admin notification (and optionally the visitor's thank-you mail) in parallel.
 * Email failures are logged by sendMail and never fail the request: the record is already saved.
 * Both mails are awaited because a Vercel function may be frozen right after the response.
 */
export const notify = async (
  kind: Kind,
  adminSubject: string,
  data: Record<string, unknown>,
  thankYou?: { to: string; subject: string; name: string }
) => {
  const jobs: Promise<boolean>[] = [
    sendMail(env.NOTIFICATION_EMAIL, singleLine(adminSubject).slice(0, 200), adminNotificationTemplate(kind, data)),
  ];
  if (thankYou) {
    jobs.push(sendMail(thankYou.to, thankYou.subject, userThankYouTemplate(thankYou.name)));
  }
  await Promise.allSettled(jobs);
};
