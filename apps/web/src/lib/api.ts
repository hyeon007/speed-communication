const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN?.trim() ?? 'http://127.0.0.1:3001';

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_ORIGIN) {
    return normalizedPath;
  }

  return `${API_ORIGIN.replace(/\/$/, '')}${normalizedPath}`;
}
