export function buildApiUrl(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export function isLeadSubmissionConfigured(): boolean {
  return true;
}
