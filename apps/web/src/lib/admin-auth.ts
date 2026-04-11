import { buildApiUrl } from './api';

const ADMIN_TOKEN_KEY = 'sp_admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function adminFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const legacyToken = getAdminToken();

  if (legacyToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${legacyToken}`);
  }

  return fetch(buildApiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  });
}

export async function hasAdminSession(): Promise<boolean> {
  try {
    const response = await adminFetch('/api/v1/admin/auth/me');

    if (response.status === 401) {
      clearAdminToken();
      return false;
    }

    return response.ok;
  } catch {
    return false;
  }
}

export async function clearAdminSession(): Promise<void> {
  clearAdminToken();

  try {
    await adminFetch('/api/v1/admin/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Ignore logout transport failures and still clear the local fallback token.
  }
}
