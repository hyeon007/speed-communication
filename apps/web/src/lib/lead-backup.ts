// Keeps a short-lived copy of every consultation lead in Cloudflare KV so a request is
// not lost when the notification email fails or lands in spam.
// Uses type-only imports so it can be unit-tested with plain `node --test`.

import type { Lead } from './lead.ts';

export const LEAD_BACKUP_TTL_DAYS = 30;

export type EmailStatus = 'sent' | 'failed' | 'not_configured';

export type LeadKv = {
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
};

export function leadBackupKey(receivedAt: Date, id: string): string {
  // ISO timestamps sort chronologically, so the KV dashboard lists leads in order.
  return `lead:${receivedAt.toISOString()}:${id}`;
}

export async function saveLeadBackup(
  kv: LeadKv,
  lead: Lead,
  receivedAt: Date,
  emailStatus: EmailStatus,
  id: string = crypto.randomUUID(),
): Promise<string> {
  const key = leadBackupKey(receivedAt, id);
  await kv.put(key, JSON.stringify({ ...lead, receivedAt: receivedAt.toISOString(), emailStatus }), {
    expirationTtl: LEAD_BACKUP_TTL_DAYS * 24 * 60 * 60,
  });
  return key;
}
