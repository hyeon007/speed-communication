import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifyTurnstileToken } from '../src/lib/turnstile.ts';
import { LEAD_BACKUP_TTL_DAYS, leadBackupKey, saveLeadBackup } from '../src/lib/lead-backup.ts';

function fakeSiteverify(result, { ok = true } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: Object.fromEntries(init.body.entries()) });
    return { ok, json: async () => result };
  };
  return { calls, fetchImpl };
}

test('accepts a token Cloudflare confirms and forwards secret, token and IP', async () => {
  const { calls, fetchImpl } = fakeSiteverify({ success: true });
  assert.equal(await verifyTurnstileToken('tok', 'sec', '1.2.3.4', fetchImpl), true);
  assert.equal(calls[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.deepEqual(calls[0].body, { secret: 'sec', response: 'tok', remoteip: '1.2.3.4' });
});

test('rejects tokens Cloudflare declines or cannot check', async () => {
  assert.equal(await verifyTurnstileToken('tok', 'sec', null, fakeSiteverify({ success: false }).fetchImpl), false);
  assert.equal(await verifyTurnstileToken('tok', 'sec', null, fakeSiteverify({}, { ok: false }).fetchImpl), false);
  const throwing = async () => {
    throw new Error('network');
  };
  assert.equal(await verifyTurnstileToken('tok', 'sec', null, throwing), false);
});

test('rejects missing or malformed tokens without calling Cloudflare', async () => {
  const { calls, fetchImpl } = fakeSiteverify({ success: true });
  for (const token of [undefined, null, '', 42, 'x'.repeat(2049)]) {
    assert.equal(await verifyTurnstileToken(token, 'sec', null, fetchImpl), false);
  }
  assert.equal(calls.length, 0);
});

test('backs up a lead with its email status and a 30-day expiry', async () => {
  const puts = [];
  const kv = { put: async (key, value, options) => puts.push({ key, value: JSON.parse(value), options }) };
  const lead = { name: '홍길동', phone: '010-1234-5678', interestDevice: 'Galaxy S26', contactTime: '오후 7시' };
  const receivedAt = new Date('2026-10-27T10:00:00Z');

  const key = await saveLeadBackup(kv, lead, receivedAt, 'failed', 'abc');

  assert.equal(key, 'lead:2026-10-27T10:00:00.000Z:abc');
  assert.deepEqual(puts, [
    {
      key,
      value: { ...lead, receivedAt: '2026-10-27T10:00:00.000Z', emailStatus: 'failed' },
      options: { expirationTtl: LEAD_BACKUP_TTL_DAYS * 86400 },
    },
  ]);
  assert.equal(LEAD_BACKUP_TTL_DAYS, 30);
});

test('backup keys sort chronologically', () => {
  const earlier = leadBackupKey(new Date('2026-01-02T00:00:00Z'), 'z');
  const later = leadBackupKey(new Date('2026-10-27T00:00:00Z'), 'a');
  assert.ok(earlier < later);
});
