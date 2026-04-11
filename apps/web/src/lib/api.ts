const CONFIGURED_API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN?.trim();

function getDefaultApiOrigin(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
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
