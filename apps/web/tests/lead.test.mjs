import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLeadEmail, validateLead } from '../src/lib/lead.ts';

const validLead = {
  name: '홍길동',
  phone: '010-1234-5678',
  interestDevice: 'Galaxy S26',
  consultationType: 'number_transfer',
  preferredCarrier: 'MVNO',
  contactTime: '오후 7시',
  website: '',
};

test('accepts a complete lead and trims values', () => {
  const result = validateLead({ ...validLead, name: '  홍길동 ' });
  assert.equal(result.ok, true);
  assert.equal(result.lead.name, '홍길동');
  assert.equal(result.lead.preferredCarrier, 'MVNO');
});

test('optional selects may be empty', () => {
  const result = validateLead({ ...validLead, consultationType: '', preferredCarrier: undefined });
  assert.equal(result.ok, true);
  assert.equal(result.lead.consultationType, undefined);
});

test('rejects malformed phone numbers', () => {
  for (const phone of ['02-123-4567', '0101234', 'abc', '']) {
    const result = validateLead({ ...validLead, phone });
    assert.equal(result.ok, false, phone);
    assert.match(result.message, /휴대폰/);
  }
});

test('rejects out-of-range text and unknown options', () => {
  assert.equal(validateLead({ ...validLead, name: '김' }).ok, false);
  assert.equal(validateLead({ ...validLead, interestDevice: 'x'.repeat(81) }).ok, false);
  assert.equal(validateLead({ ...validLead, preferredCarrier: 'SoftBank' }).ok, false);
  assert.equal(validateLead({ ...validLead, consultationType: 'refund' }).ok, false);
  assert.equal(validateLead({ ...validLead, contactTime: 5 }).ok, false);
});

test('rejects non-object bodies', () => {
  for (const body of [null, 'text', [validLead], 42]) {
    assert.equal(validateLead(body).ok, false);
  }
});

test('flags honeypot submissions as spam', () => {
  const result = validateLead({ ...validLead, website: 'http://spam.example' });
  assert.deepEqual(result, { ok: false, spam: true });
});

test('email contains every field in Korean labels and escapes HTML', () => {
  const result = validateLead({ ...validLead, name: '<b>홍</b>길동' });
  const email = buildLeadEmail(result.lead, '스피드 통신', new Date('2026-10-27T10:00:00Z'));

  assert.equal(email.subject, '[스피드 통신] 새 상담 신청 - <b>홍</b>길동 (Galaxy S26)');
  for (const expected of ['연락처: 010-1234-5678', '상담 유형: 번호이동', '희망 통신사: 알뜰폰', '연락 가능 시간: 오후 7시']) {
    assert.ok(email.text.includes(expected), expected);
  }
  assert.ok(email.text.includes('접수 시각: 2026. 10. 27. 19:00'), email.text);
  assert.ok(email.html.includes('&lt;b&gt;홍&lt;/b&gt;길동'));
  assert.ok(!email.html.includes('<b>홍'));
});

test('missing selections read as 미정 in the email', () => {
  const result = validateLead({ ...validLead, consultationType: '', preferredCarrier: '' });
  const email = buildLeadEmail(result.lead, '스피드 통신', new Date());
  assert.ok(email.text.includes('상담 유형: 미정'));
  assert.ok(email.text.includes('희망 통신사: 미정'));
});
