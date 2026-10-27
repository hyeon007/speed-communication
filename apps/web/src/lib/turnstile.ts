// Server-side verification of Cloudflare Turnstile tokens.
// Kept free of imports so it can be unit-tested with plain `node --test`.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type FetchLike = (input: string, init: { method: string; body: FormData }) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

export async function verifyTurnstileToken(
  token: unknown,
  secret: string,
  remoteIp: string | null,
  fetchImpl: FetchLike = fetch,
): Promise<boolean> {
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return false;
  }

  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (remoteIp) {
    body.append('remoteip', remoteIp);
  }

  try {
    const response = await fetchImpl(SITEVERIFY_URL, { method: 'POST', body });
    if (!response.ok) {
      return false;
    }
    const result = (await response.json()) as { success?: unknown };
    return result.success === true;
  } catch {
    return false;
  }
}
