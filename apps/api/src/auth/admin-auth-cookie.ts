import type { CookieOptions, Request } from 'express';

export const ADMIN_AUTH_COOKIE_NAME = 'sp_admin_access_token';

export function getAdminAuthCookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export function readAdminAuthCookie(request: Request): string | null {
  const rawCookieHeader = request.headers.cookie;

  if (!rawCookieHeader) {
    return null;
  }

  for (const part of rawCookieHeader.split(';')) {
    const [name, ...valueParts] = part.split('=');

    if (name?.trim() !== ADMIN_AUTH_COOKIE_NAME) {
      continue;
    }

    const rawValue = valueParts.join('=').trim();

    if (!rawValue) {
      return null;
    }

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
}
