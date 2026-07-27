export type LeadStatus = 'new' | 'in_progress' | 'completed';
export type ConsultationType =
  | 'number_transfer'
  | 'device_change'
  | 'new_subscription'
  | 'undecided';
export type PreferredCarrier = 'SKT' | 'KT' | 'LGU+' | 'undecided';
export type AdminRole = 'editor' | 'operator' | 'viewer';
export type SortBy = 'createdAt' | 'name' | 'status';
export type SortDirection = 'asc' | 'desc';
export type StatusFilter = LeadStatus | 'all';
export type ActivityStatusFilter = LeadStatus | 'all';

export type Lead = {
  id: number;
  name: string;
  phone: string;
  interestDevice: string;
  consultationType: ConsultationType | null;
  preferredCarrier: PreferredCarrier | null;
  contactTime: string;
  memo: string | null;
  status: LeadStatus;
  createdAt: string;
};

export type LeadStatusAudit = {
  id: number;
  leadId: number;
  previousStatus: LeadStatus;
  nextStatus: LeadStatus;
  changedBy: string;
  changedAt: string;
};

export type LeadStatusAuditsResponse = {
  count: number;
  data: LeadStatusAudit[];
};

export type LeadsResponse = {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  recentNewCount: number;
  data: Lead[];
};

export type LeadStatsResponse = {
  total: number;
  newCount: number;
  inProgressCount: number;
  completedCount: number;
  todayCount: number;
  last7DaysCount: number;
};

export type LeadTrendResponse = {
  days: number;
  startDate: string;
  endDate: string;
  daily: Array<{ date: string; count: number }>;
  newCount: number;
  inProgressCount: number;
  completedCount: number;
};

export type LeadActivityItem = {
  auditId: number;
  leadId: number;
  leadName: string;
  leadPhone: string;
  previousStatus: LeadStatus;
  nextStatus: LeadStatus;
  changedBy: string;
  changedAt: string;
};

export type LeadActivityResponse = {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: LeadActivityItem[];
};

export type QueryState = {
  search: string;
  status: StatusFilter;
  startDate: string;
  endDate: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
};

export type FilterPreset = {
  id: string;
  name: string;
  query: Omit<QueryState, 'page'>;
};

export type ActivityQueryState = {
  limit: 20 | 50 | 100;
  page: number;
  changedBy: string;
  previousStatus: ActivityStatusFilter;
  nextStatus: ActivityStatusFilter;
  startDate: string;
  endDate: string;
};

export type AdminProfileResponse = {
  username: string | null;
  role: AdminRole | null;
};

export const initialQuery: QueryState = {
  search: '',
  status: 'all',
  startDate: '',
  endDate: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
};

export const FILTER_PRESETS_STORAGE_KEY = 'sp_admin_lead_filter_presets';

export function formatStatus(status: LeadStatus): string {
  if (status === 'new') {
    return '신규';
  }

  if (status === 'in_progress') {
    return '진행중';
  }

  return '완료';
}

export function formatConsultationType(type: ConsultationType | null): string {
  if (type === 'number_transfer') return '번호이동';
  if (type === 'device_change') return '기기변경';
  if (type === 'new_subscription') return '신규가입';
  if (type === 'undecided') return '상담 후 결정';
  return '미선택';
}

export function formatPreferredCarrier(carrier: PreferredCarrier | null): string {
  if (carrier === 'LGU+') return 'LG U+';
  if (carrier === 'undecided') return '상담 후 결정';
  return carrier ?? '미선택';
}

export function formatKoreanDateTime(input: string): string {
  return new Date(input).toLocaleString('ko-KR');
}

export function formatDownloadDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Failed to format download date.');
  }

  return `${year}-${month}-${day}`;
}

export function buildPageItems(
  current: number,
  total: number,
): Array<number | '...'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: Array<number | '...'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) {
    items.push('...');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < total - 1) {
    items.push('...');
  }

  items.push(total);
  return items;
}
