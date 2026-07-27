const CONFIGURED_API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN?.trim();

function getDefaultApiOrigin(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  if (
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '';
  }

  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return `${protocol}//${window.location.hostname}:3001`;
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const apiOrigin = CONFIGURED_API_ORIGIN || getDefaultApiOrigin();

  if (!apiOrigin) {
    return normalizedPath;
  }

  return `${apiOrigin.replace(/\/$/, '')}${normalizedPath}`;
}

export function isLeadSubmissionConfigured(): boolean {
  if (CONFIGURED_API_ORIGIN) {
    return true;
  }

  if (typeof window === 'undefined') {
    return true;
  }

  const { hostname } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isVercelPreview = hostname.endsWith('.vercel.app');

  return isLocalHost || !isVercelPreview;
}
