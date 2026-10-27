import { buildLeadEmail, validateLead } from '@/lib/lead';
import { siteConfig } from '@/lib/site-config';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
// Resend's shared sender works without a verified domain, but only delivers to the account owner's address.
const DEFAULT_FROM = 'onboarding@resend.dev';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const result = validateLead(body);
  if (!result.ok) {
    if ('spam' in result) {
      // Look successful to bots so they don't adapt.
      return Response.json({ status: 'received', message: '상담 신청이 접수되었습니다.' }, { status: 201 });
    }
    return Response.json({ message: result.message }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL_TO;
  if (!apiKey || !to) {
    console.error('Lead email is not configured: RESEND_API_KEY and LEAD_NOTIFY_EMAIL_TO are required.');
    return Response.json(
      { message: `상담 접수 시스템을 점검 중입니다. ${siteConfig.contactPhone}로 전화 주시면 바로 안내드립니다.` },
      { status: 503 },
    );
  }

  const email = buildLeadEmail(result.lead, siteConfig.name, new Date());
  const from = process.env.LEAD_NOTIFY_EMAIL_FROM || DEFAULT_FROM;

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${siteConfig.name} <${from}>`,
      to: to.split(',').map((address) => address.trim()),
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    console.error('Resend rejected the lead email.', response.status, await response.text());
    return Response.json(
      { message: `상담 신청 전송에 실패했습니다. ${siteConfig.contactPhone}로 전화 주시면 바로 안내드립니다.` },
      { status: 502 },
    );
  }

  return Response.json({ status: 'received', message: '상담 신청이 접수되었습니다.' }, { status: 201 });
}
