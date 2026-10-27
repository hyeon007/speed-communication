// Consultation lead validation and notification email composition.
// Kept free of imports so it can be unit-tested with plain `node --test`.

export type ConsultationType = 'number_transfer' | 'device_change' | 'new_subscription' | 'undecided';
export type PreferredCarrier = 'SKT' | 'KT' | 'LGU+' | 'MVNO' | 'undecided';

export type Lead = {
  name: string;
  phone: string;
  interestDevice: string;
  consultationType?: ConsultationType;
  preferredCarrier?: PreferredCarrier;
  contactTime: string;
};

export type LeadValidationResult =
  | { ok: true; lead: Lead }
  | { ok: false; message: string }
  | { ok: false; spam: true };

const CONSULTATION_TYPES: Record<ConsultationType, string> = {
  number_transfer: '번호이동',
  device_change: '기기변경',
  new_subscription: '신규가입',
  undecided: '미정',
};

const CARRIERS: Record<PreferredCarrier, string> = {
  SKT: 'SKT',
  KT: 'KT',
  'LGU+': 'LG U+',
  MVNO: '알뜰폰',
  undecided: '미정',
};

const PHONE_PATTERN = /^01[0-9]-?\d{3,4}-?\d{4}$/;

// Name of the hidden form field that humans never fill in.
export const HONEYPOT_FIELD = 'website';

function readText(body: Record<string, unknown>, key: string, min: number, max: number): string | null {
  const value = body[key];
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max ? trimmed : null;
}

function readOption<T extends string>(body: Record<string, unknown>, key: string, options: Record<T, string>): T | undefined | null {
  const value = body[key];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return typeof value === 'string' && value in options ? (value as T) : null;
}

export function validateLead(input: unknown): LeadValidationResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, message: '요청 형식이 올바르지 않습니다.' };
  }
  const body = input as Record<string, unknown>;

  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return { ok: false, spam: true };
  }

  const name = readText(body, 'name', 2, 40);
  if (!name) {
    return { ok: false, message: '이름을 2~40자로 입력해주세요.' };
  }

  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!PHONE_PATTERN.test(phone)) {
    return { ok: false, message: '휴대폰 번호 형식이 올바르지 않습니다.' };
  }

  const interestDevice = readText(body, 'interestDevice', 2, 80);
  if (!interestDevice) {
    return { ok: false, message: '관심 기기를 2~80자로 입력해주세요.' };
  }

  const consultationType = readOption(body, 'consultationType', CONSULTATION_TYPES);
  if (consultationType === null) {
    return { ok: false, message: '상담 유형이 올바르지 않습니다.' };
  }

  const preferredCarrier = readOption(body, 'preferredCarrier', CARRIERS);
  if (preferredCarrier === null) {
    return { ok: false, message: '희망 통신사가 올바르지 않습니다.' };
  }

  const contactTime = readText(body, 'contactTime', 2, 40);
  if (!contactTime) {
    return { ok: false, message: '연락 가능 시간을 2~40자로 입력해주세요.' };
  }

  return {
    ok: true,
    lead: { name, phone, interestDevice, consultationType, preferredCarrier, contactTime },
  };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatSeoulTime(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

export function buildLeadEmail(lead: Lead, siteName: string, receivedAt: Date) {
  const rows: Array<[string, string]> = [
    ['이름', lead.name],
    ['연락처', lead.phone],
    ['관심 기기', lead.interestDevice],
    ['상담 유형', CONSULTATION_TYPES[lead.consultationType ?? 'undecided']],
    ['희망 통신사', CARRIERS[lead.preferredCarrier ?? 'undecided']],
    ['연락 가능 시간', lead.contactTime],
    ['접수 시각', formatSeoulTime(receivedAt)],
  ];

  return {
    subject: `[${siteName}] 새 상담 신청 - ${lead.name} (${lead.interestDevice})`,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: [
      `<h2>새 상담 신청이 접수되었습니다</h2>`,
      `<table cellpadding="6" style="border-collapse:collapse">`,
      ...rows.map(
        ([label, value]) =>
          `<tr><th align="left" style="border-bottom:1px solid #eee">${escapeHtml(label)}</th><td style="border-bottom:1px solid #eee">${escapeHtml(value)}</td></tr>`,
      ),
      `</table>`,
    ].join(''),
  };
}
