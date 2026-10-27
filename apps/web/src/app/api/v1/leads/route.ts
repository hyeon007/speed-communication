import { getCloudflareContext } from '@opennextjs/cloudflare';
import { buildLeadEmail, validateLead, type Lead } from '@/lib/lead';
import { saveLeadBackup, type EmailStatus, type LeadKv } from '@/lib/lead-backup';
import { siteConfig } from '@/lib/site-config';
import { verifyTurnstileToken } from '@/lib/turnstile';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
// Resend's shared sender works without a verified domain, but only delivers to the account owner's address.
const DEFAULT_FROM = 'onboarding@resend.dev';

const RECEIVED = { status: 'received', message: '상담 신청이 접수되었습니다.' };

function fallbackMessage(reason: string) {
  return siteConfig.contactPhone
    ? `${reason} ${siteConfig.contactPhone}로 전화 주시면 바로 안내드립니다.`
    : `${reason} 잠시 후 다시 시도해주세요.`;
}

async function sendLeadEmail(lead: Lead, receivedAt: Date): Promise<EmailStatus> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL_TO;
  if (!apiKey || !to) {
    console.error('Lead email is not configured: RESEND_API_KEY and LEAD_NOTIFY_EMAIL_TO are required.');
    return 'not_configured';
  }

  const email = buildLeadEmail(lead, siteConfig.name, receivedAt);
  const from = process.env.LEAD_NOTIFY_EMAIL_FROM || DEFAULT_FROM;

  try {
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
      return 'failed';
    }
    return 'sent';
  } catch (error) {
    console.error('Resend request failed.', error);
    return 'failed';
  }
}

function getLeadKv(): LeadKv | null {
  try {
    const { env } = getCloudflareContext();
    return (env as unknown as { LEADS?: LeadKv }).LEADS ?? null;
  } catch {
    // Not running on Cloudflare (e.g. plain `next dev` without bindings).
    return null;
  }
}

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
      return Response.json(RECEIVED, { status: 201 });
    }
    return Response.json({ message: result.message }, { status: 400 });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = (body as { turnstileToken?: unknown }).turnstileToken;
    const passed = await verifyTurnstileToken(token, turnstileSecret, request.headers.get('cf-connecting-ip'));
    if (!passed) {
      return Response.json({ message: '자동 입력 방지 확인에 실패했습니다. 확인을 다시 진행해주세요.' }, { status: 403 });
    }
  } else {
    console.warn('TURNSTILE_SECRET_KEY is not set; accepting lead without bot verification.');
  }

  const receivedAt = new Date();
  const emailStatus = await sendLeadEmail(result.lead, receivedAt);

  // Back up every lead, including emailed ones, in case the email lands in spam.
  const kv = getLeadKv();
  if (kv) {
    try {
      await saveLeadBackup(kv, result.lead, receivedAt, emailStatus);
    } catch (error) {
      console.error('Failed to back up lead to KV.', error);
    }
  } else {
    console.warn('LEADS KV binding is missing; lead was not backed up.');
  }

  if (emailStatus === 'sent') {
    return Response.json(RECEIVED, { status: 201 });
  }
  // Without the email the owner won't notice the request promptly, so ask the customer to call.
  return Response.json(
    { message: fallbackMessage(emailStatus === 'not_configured' ? '상담 접수 시스템을 점검 중입니다.' : '상담 신청 전송에 실패했습니다.') },
    { status: emailStatus === 'not_configured' ? 503 : 502 },
  );
}
