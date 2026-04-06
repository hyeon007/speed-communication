'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MotionSection } from '@/components/motion-presets';
import { buildApiUrl } from '@/lib/api';
import { clearAdminToken, getAdminToken } from '@/lib/admin-auth';

type LeadStatus = 'new' | 'in_progress' | 'completed';
type AdminRole = 'editor' | 'operator' | 'viewer';
type SortBy = 'createdAt' | 'name' | 'status';
type SortDirection = 'asc' | 'desc';
type StatusFilter = LeadStatus | 'all';
type ActivityStatusFilter = LeadStatus | 'all';

type Lead = {
  id: number;
  name: string;
  phone: string;
  interestDevice: string;
  contactTime: string;
  memo: string | null;
  status: LeadStatus;
  createdAt: string;
};

type LeadStatusAudit = {
  id: number;
  leadId: number;
  previousStatus: LeadStatus;
  nextStatus: LeadStatus;
  changedBy: string;
  changedAt: string;
};

type LeadStatusAuditsResponse = {
  count: number;
  data: LeadStatusAudit[];
};

type LeadsResponse = {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  recentNewCount: number;
  data: Lead[];
};

type LeadStatsResponse = {
  total: number;
  newCount: number;
  inProgressCount: number;
  completedCount: number;
  todayCount: number;
  last7DaysCount: number;
};

type LeadTrendResponse = {
  days: number;
  startDate: string;
  endDate: string;
  daily: Array<{ date: string; count: number }>;
  newCount: number;
  inProgressCount: number;
  completedCount: number;
};

type LeadActivityItem = {
  auditId: number;
  leadId: number;
  leadName: string;
  leadPhone: string;
  previousStatus: LeadStatus;
  nextStatus: LeadStatus;
  changedBy: string;
  changedAt: string;
};

type LeadActivityResponse = {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: LeadActivityItem[];
};

type FilterPreset = {
  id: string;
  name: string;
  query: Omit<QueryState, 'page'>;
};

type ActivityQueryState = {
  limit: 20 | 50 | 100;
  page: number;
  changedBy: string;
  previousStatus: ActivityStatusFilter;
  nextStatus: ActivityStatusFilter;
  startDate: string;
  endDate: string;
};

type AdminProfileResponse = {
  username: string | null;
  role: AdminRole | null;
};

type QueryState = {
  search: string;
  status: StatusFilter;
  startDate: string;
  endDate: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
};

const initialQuery: QueryState = {
  search: '',
  status: 'all',
  startDate: '',
  endDate: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
};

const FILTER_PRESETS_STORAGE_KEY = 'sp_admin_lead_filter_presets';

function formatStatus(status: LeadStatus): string {
  if (status === 'new') {
    return '신규';
  }

  if (status === 'in_progress') {
    return '진행중';
  }

  return '완료';
}

function buildPageItems(current: number, total: number): Array<number | '...'> {
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

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingStatusId, setSavingStatusId] = useState<number | null>(null);
  const [savingMemoId, setSavingMemoId] = useState<number | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isCsvDownloading, setIsCsvDownloading] = useState(false);
  const [bulkStatusDraft, setBulkStatusDraft] = useState<LeadStatus>('in_progress');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [stats, setStats] = useState<LeadStatsResponse>({
    total: 0,
    newCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    todayCount: 0,
    last7DaysCount: 0,
  });
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [trend, setTrend] = useState<LeadTrendResponse>({
    days: 7,
    startDate: '',
    endDate: '',
    daily: [],
    newCount: 0,
    inProgressCount: 0,
    completedCount: 0,
  });
  const [auditsByLeadId, setAuditsByLeadId] = useState<Record<number, LeadStatusAudit[]>>({});
  const [activity, setActivity] = useState<LeadActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [isActivityCsvDownloading, setIsActivityCsvDownloading] = useState(false);
  const [activityLimitDraft, setActivityLimitDraft] = useState<20 | 50 | 100>(20);
  const [activityChangedByDraft, setActivityChangedByDraft] = useState('');
  const [activityPreviousStatusDraft, setActivityPreviousStatusDraft] =
    useState<ActivityStatusFilter>('all');
  const [activityNextStatusDraft, setActivityNextStatusDraft] =
    useState<ActivityStatusFilter>('all');
  const [activityStartDateDraft, setActivityStartDateDraft] = useState('');
  const [activityEndDateDraft, setActivityEndDateDraft] = useState('');
  const [activityQuery, setActivityQuery] = useState<ActivityQueryState>({
    limit: 20,
    page: 1,
    changedBy: '',
    previousStatus: 'all',
    nextStatus: 'all',
    startDate: '',
    endDate: '',
  });
  const [activityMeta, setActivityMeta] = useState({
    count: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });
  const [loadingAuditLeadId, setLoadingAuditLeadId] = useState<number | null>(null);
  const [auditErrorByLeadId, setAuditErrorByLeadId] = useState<Record<number, string>>({});
  const [meta, setMeta] = useState({
    count: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    recentNewCount: 0,
  });
  const [query, setQuery] = useState<QueryState>(initialQuery);
  const [searchDraft, setSearchDraft] = useState(initialQuery.search);
  const [statusDraft, setStatusDraft] = useState<StatusFilter>(initialQuery.status);
  const [startDateDraft, setStartDateDraft] = useState(initialQuery.startDate);
  const [endDateDraft, setEndDateDraft] = useState(initialQuery.endDate);
  const [sortByDraft, setSortByDraft] = useState<SortBy>(initialQuery.sortBy);
  const [sortDirectionDraft, setSortDirectionDraft] = useState<SortDirection>(
    initialQuery.sortDirection,
  );
  const [presetNameDraft, setPresetNameDraft] = useState('');
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [memoDrafts, setMemoDrafts] = useState<Record<number, string>>({});

  const pageItems = useMemo(() => buildPageItems(meta.page, meta.totalPages), [meta]);
  const trendMaxCount = useMemo(
    () => Math.max(1, ...trend.daily.map((point) => point.count)),
    [trend.daily],
  );
  const trendPolylinePoints = useMemo(() => {
    if (!trend.daily.length) {
      return '';
    }

    if (trend.daily.length === 1) {
      const y = 100 - (trend.daily[0].count / trendMaxCount) * 100;
      return `0,${y.toFixed(2)} 100,${y.toFixed(2)}`;
    }

    return trend.daily
      .map((point, index) => {
        const x = (index / (trend.daily.length - 1)) * 100;
        const y = 100 - (point.count / trendMaxCount) * 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [trend.daily, trendMaxCount]);
  const canWrite = adminRole === 'editor' || adminRole === 'operator';
  const canBulkWrite = adminRole === 'editor';

  const fetchLeads = useCallback(
    async (token: string, currentQuery: QueryState) => {
      const params = new URLSearchParams();
      params.set('page', String(currentQuery.page));
      params.set('pageSize', String(currentQuery.pageSize));
      params.set('sortBy', currentQuery.sortBy);
      params.set('sortDirection', currentQuery.sortDirection);

      if (currentQuery.search) {
        params.set('search', currentQuery.search);
      }

      if (currentQuery.status !== 'all') {
        params.set('status', currentQuery.status);
      }

      if (currentQuery.startDate) {
        params.set('startDate', currentQuery.startDate);
      }

      if (currentQuery.endDate) {
        params.set('endDate', currentQuery.endDate);
      }

      const response = await fetch(buildApiUrl(`/api/v1/admin/leads?${params.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      const payload = (await response.json()) as LeadsResponse | { message?: string };

      if (!response.ok) {
        setErrorMessage(
          'message' in payload && payload.message
            ? payload.message
            : '문의 목록을 불러오지 못했습니다.',
        );
        return;
      }

      const typed = payload as LeadsResponse;
      setLeads(typed.data);
      setMeta({
        count: typed.count,
        page: typed.page,
        pageSize: typed.pageSize,
        totalPages: typed.totalPages,
        recentNewCount: typed.recentNewCount,
      });

      setSelectedIds([]);
      setAuditsByLeadId({});
      setAuditErrorByLeadId({});

      setMemoDrafts(() => {
        const next: Record<number, string> = {};
        typed.data.forEach((lead) => {
          next[lead.id] = lead.memo ?? '';
        });

        return next;
      });
    },
    [router],
  );

  const fetchAdminProfile = useCallback(
    async (token: string) => {
      const response = await fetch(buildApiUrl('/api/v1/admin/auth/me'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      const payload = (await response.json()) as
        | AdminProfileResponse
        | { message?: string };

      if (!response.ok) {
        setErrorMessage(
          'message' in payload && payload.message
            ? payload.message
            : '관리자 권한 정보를 불러오지 못했습니다.',
        );
        return;
      }

      const profile = payload as AdminProfileResponse;

      if (
        profile.role !== 'editor' &&
        profile.role !== 'operator' &&
        profile.role !== 'viewer'
      ) {
        setErrorMessage('관리자 권한 정보가 올바르지 않습니다. 다시 로그인해주세요.');
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      setAdminRole(profile.role);
      setAdminUsername(profile.username);
    },
    [router],
  );

  const fetchLeadStats = useCallback(
    async (token: string) => {
      const response = await fetch(buildApiUrl('/api/v1/admin/leads/stats'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      const payload = (await response.json()) as LeadStatsResponse | { message?: string };

      if (!response.ok) {
        setErrorMessage(
          'message' in payload && payload.message
            ? payload.message
            : '문의 통계를 불러오지 못했습니다.',
        );
        return;
      }

      setStats(payload as LeadStatsResponse);
    },
    [router],
  );

  const fetchLeadTrend = useCallback(
    async (token: string, days: 7 | 30) => {
      const response = await fetch(buildApiUrl(`/api/v1/admin/leads/stats/trend?days=${days}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      const payload = (await response.json()) as LeadTrendResponse | { message?: string };

      if (!response.ok) {
        setErrorMessage(
          'message' in payload && payload.message
            ? payload.message
            : '문의 추세 통계를 불러오지 못했습니다.',
        );
        return;
      }

      setTrend(payload as LeadTrendResponse);
    },
    [router],
  );

  const fetchLeadActivity = useCallback(
    async (token: string) => {
      setActivityLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('limit', String(activityQuery.limit));
        params.set('page', String(activityQuery.page));

        if (activityQuery.changedBy.trim()) {
          params.set('changedBy', activityQuery.changedBy.trim());
        }

        if (activityQuery.previousStatus !== 'all') {
          params.set('previousStatus', activityQuery.previousStatus);
        }

        if (activityQuery.nextStatus !== 'all') {
          params.set('nextStatus', activityQuery.nextStatus);
        }

        if (activityQuery.startDate) {
          params.set('startDate', activityQuery.startDate);
        }

        if (activityQuery.endDate) {
          params.set('endDate', activityQuery.endDate);
        }

        const response = await fetch(buildApiUrl(`/api/v1/admin/leads/activity?${params.toString()}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          clearAdminToken();
          router.replace('/admin/login');
          return;
        }

        const payload = (await response.json()) as
          | LeadActivityResponse
          | { message?: string };

        if (!response.ok) {
          setErrorMessage(
            'message' in payload && payload.message
              ? payload.message
              : '최근 활동 데이터를 불러오지 못했습니다.',
          );
          return;
        }

        const typed = payload as LeadActivityResponse;
        setActivity(typed.data);
        setActivityMeta({
          count: typed.count,
          page: typed.page,
          pageSize: typed.pageSize,
          totalPages: typed.totalPages,
        });
      } finally {
        setActivityLoading(false);
      }
    },
    [activityQuery, router],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_PRESETS_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as FilterPreset[];
      if (Array.isArray(parsed)) {
        setPresets(parsed);
      }
    } catch {
      localStorage.removeItem(FILTER_PRESETS_STORAGE_KEY);
    }
  }, []);

  function persistPresets(next: FilterPreset[]) {
    setPresets(next);
    localStorage.setItem(FILTER_PRESETS_STORAGE_KEY, JSON.stringify(next));
  }

  function saveCurrentPreset() {
    setErrorMessage(null);
    const name = presetNameDraft.trim();
    if (!name) {
      setErrorMessage('프리셋 이름을 입력해주세요.');
      return;
    }

    const preset: FilterPreset = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      query: {
        search: searchDraft.trim(),
        status: statusDraft,
        startDate: startDateDraft,
        endDate: endDateDraft,
        sortBy: sortByDraft,
        sortDirection: sortDirectionDraft,
        pageSize: query.pageSize,
      },
    };

    const next = [preset, ...presets].slice(0, 10);
    persistPresets(next);
    setPresetNameDraft('');
  }

  function applyPreset(preset: FilterPreset) {
    setErrorMessage(null);
    setSearchDraft(preset.query.search);
    setStatusDraft(preset.query.status);
    setStartDateDraft(preset.query.startDate);
    setEndDateDraft(preset.query.endDate);
    setSortByDraft(preset.query.sortBy);
    setSortDirectionDraft(preset.query.sortDirection);

    setQuery((prev) => ({
      ...prev,
      search: preset.query.search,
      status: preset.query.status,
      startDate: preset.query.startDate,
      endDate: preset.query.endDate,
      sortBy: preset.query.sortBy,
      sortDirection: preset.query.sortDirection,
      pageSize: preset.query.pageSize,
      page: 1,
    }));
  }

  function deletePreset(presetId: string) {
    persistPresets(presets.filter((preset) => preset.id !== presetId));
  }

  function refreshLeadActivity() {
    setErrorMessage(null);
    const token = getAdminToken();
    if (!token) {
      clearAdminToken();
      router.replace('/admin/login');
      return;
    }

    void fetchLeadActivity(token);
  }

  function handleActivityFilterApply() {
    setActivityQuery({
      limit: activityLimitDraft,
      page: 1,
      changedBy: activityChangedByDraft,
      previousStatus: activityPreviousStatusDraft,
      nextStatus: activityNextStatusDraft,
      startDate: activityStartDateDraft,
      endDate: activityEndDateDraft,
    });
  }

  function handleActivityFilterReset() {
    setActivityLimitDraft(20);
    setActivityChangedByDraft('');
    setActivityPreviousStatusDraft('all');
    setActivityNextStatusDraft('all');
    setActivityStartDateDraft('');
    setActivityEndDateDraft('');
    setActivityQuery({
      limit: 20,
      page: 1,
      changedBy: '',
      previousStatus: 'all',
      nextStatus: 'all',
      startDate: '',
      endDate: '',
    });
  }

  function handleActivityPageChange(nextPage: number) {
    setActivityQuery((prev) => ({
      ...prev,
      page: nextPage,
    }));
  }

  async function downloadActivityCsv() {
    const token = getAdminToken();

    if (!token) {
      clearAdminToken();
      router.replace('/admin/login');
      return;
    }

    setIsActivityCsvDownloading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', String(activityQuery.limit));
      params.set('page', String(activityQuery.page));

      if (activityQuery.changedBy.trim()) {
        params.set('changedBy', activityQuery.changedBy.trim());
      }

      if (activityQuery.previousStatus !== 'all') {
        params.set('previousStatus', activityQuery.previousStatus);
      }

      if (activityQuery.nextStatus !== 'all') {
        params.set('nextStatus', activityQuery.nextStatus);
      }

      if (activityQuery.startDate) {
        params.set('startDate', activityQuery.startDate);
      }

      if (activityQuery.endDate) {
        params.set('endDate', activityQuery.endDate);
      }

      const response = await fetch(
        buildApiUrl(`/api/v1/admin/leads/activity.csv?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setErrorMessage(payload.message ?? '활동 CSV 다운로드에 실패했습니다.');
        return;
      }

      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `lead-activity-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setErrorMessage('네트워크 오류로 활동 CSV 다운로드에 실패했습니다.');
    } finally {
      setIsActivityCsvDownloading(false);
    }
  }

  useEffect(() => {
    const token = getAdminToken();

    if (!token) {
      router.replace('/admin/login');
      return;
    }

    Promise.all([
      fetchAdminProfile(token),
      fetchLeadStats(token),
      fetchLeadTrend(token, trendDays),
      fetchLeadActivity(token),
      fetchLeads(token, query),
    ])
      .catch(() => {
        setErrorMessage('네트워크 오류로 문의 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    fetchAdminProfile,
    fetchLeadStats,
    fetchLeadTrend,
    fetchLeadActivity,
    fetchLeads,
    query,
    router,
    trendDays,
  ]);

  async function updateStatus(leadId: number, status: LeadStatus) {
    if (!canWrite) {
      setErrorMessage('읽기 전용 계정은 상태를 변경할 수 없습니다.');
      return;
    }

    const token = getAdminToken();

    if (!token) {
      clearAdminToken();
      router.replace('/admin/login');
      return;
    }

    setSavingStatusId(leadId);
    setErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl(`/api/v1/admin/leads/${leadId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setErrorMessage(payload.message ?? '상태 변경에 실패했습니다.');
        return;
      }

      await Promise.all([
        fetchLeads(token, query),
        fetchLeadStats(token),
        fetchLeadTrend(token, trendDays),
        fetchLeadActivity(token),
      ]);
    } catch {
      setErrorMessage('네트워크 오류로 상태 변경에 실패했습니다.');
    } finally {
      setSavingStatusId(null);
    }
  }

  async function updateMemo(leadId: number) {
    if (!canWrite) {
      setErrorMessage('읽기 전용 계정은 메모를 수정할 수 없습니다.');
      return;
    }

    const token = getAdminToken();

    if (!token) {
      clearAdminToken();
      router.replace('/admin/login');
      return;
    }

    setSavingMemoId(leadId);
    setErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl(`/api/v1/admin/leads/${leadId}/memo`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memo: memoDrafts[leadId] ?? '',
        }),
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      const payload = (await response.json()) as Lead | { message?: string };

      if (!response.ok) {
        setErrorMessage(
          'message' in payload && payload.message
            ? payload.message
            : '메모 저장에 실패했습니다.',
        );
        return;
      }

      const updated = payload as Lead;
      setLeads((prev) => prev.map((lead) => (lead.id === updated.id ? updated : lead)));
      setMemoDrafts((prev) => ({
        ...prev,
        [leadId]: updated.memo ?? '',
      }));
    } catch {
      setErrorMessage('네트워크 오류로 메모 저장에 실패했습니다.');
    } finally {
      setSavingMemoId(null);
    }
  }

  async function bulkUpdateStatus() {
    if (!canBulkWrite) {
      setErrorMessage('일괄 상태 변경은 편집 가능(editor) 계정에서만 수행할 수 있습니다.');
      return;
    }

    if (!selectedIds.length) {
      return;
    }

    const token = getAdminToken();

    if (!token) {
      clearAdminToken();
      router.replace('/admin/login');
      return;
    }

    setIsBulkUpdating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl('/api/v1/admin/leads/bulk-status'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: selectedIds,
          status: bulkStatusDraft,
        }),
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      const payload = (await response.json()) as { message?: string; notFoundIds?: number[] };

      if (!response.ok) {
        setErrorMessage(payload.message ?? '일괄 상태 변경에 실패했습니다.');
        return;
      }

      if ((payload.notFoundIds?.length ?? 0) > 0) {
        setErrorMessage(
          `일부 문의는 찾지 못했습니다: ${payload.notFoundIds?.join(', ') ?? ''}`,
        );
      }

      await Promise.all([
        fetchLeads(token, query),
        fetchLeadStats(token),
        fetchLeadTrend(token, trendDays),
        fetchLeadActivity(token),
      ]);
    } catch {
      setErrorMessage('네트워크 오류로 일괄 상태 변경에 실패했습니다.');
    } finally {
      setIsBulkUpdating(false);
    }
  }

  async function downloadCsv() {
    const token = getAdminToken();

    if (!token) {
      clearAdminToken();
      router.replace('/admin/login');
      return;
    }

    setIsCsvDownloading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set('sortBy', query.sortBy);
      params.set('sortDirection', query.sortDirection);

      if (query.search) {
        params.set('search', query.search);
      }

      if (query.status !== 'all') {
        params.set('status', query.status);
      }

      if (query.startDate) {
        params.set('startDate', query.startDate);
      }

      if (query.endDate) {
        params.set('endDate', query.endDate);
      }

      const response = await fetch(buildApiUrl(`/api/v1/admin/leads/export.csv?${params.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setErrorMessage(payload.message ?? 'CSV 다운로드에 실패했습니다.');
        return;
      }

      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setErrorMessage('네트워크 오류로 CSV 다운로드에 실패했습니다.');
    } finally {
      setIsCsvDownloading(false);
    }
  }

  async function fetchStatusAudits(leadId: number) {
    const token = getAdminToken();

    if (!token) {
      clearAdminToken();
      router.replace('/admin/login');
      return;
    }

    setLoadingAuditLeadId(leadId);
    setAuditErrorByLeadId((prev) => {
      const next = { ...prev };
      delete next[leadId];
      return next;
    });

    try {
      const response = await fetch(buildApiUrl(`/api/v1/admin/leads/${leadId}/status-audits?limit=10`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace('/admin/login');
        return;
      }

      const payload = (await response.json()) as LeadStatusAuditsResponse | { message?: string };

      if (!response.ok) {
        const message =
          'message' in payload && payload.message
            ? payload.message
            : '상태 변경 이력을 불러오지 못했습니다.';

        setAuditErrorByLeadId((prev) => ({
          ...prev,
          [leadId]: message,
        }));
        return;
      }

      const typed = payload as LeadStatusAuditsResponse;
      setAuditsByLeadId((prev) => ({
        ...prev,
        [leadId]: typed.data,
      }));
    } catch {
      setAuditErrorByLeadId((prev) => ({
        ...prev,
        [leadId]: '네트워크 오류로 상태 변경 이력을 불러오지 못했습니다.',
      }));
    } finally {
      setLoadingAuditLeadId(null);
    }
  }

  function toggleLeadSelection(leadId: number) {
    if (!canBulkWrite) {
      return;
    }

    setSelectedIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId],
    );
  }

  function toggleSelectAllOnPage() {
    if (!canBulkWrite) {
      return;
    }

    const pageIds = leads.map((lead) => lead.id);

    if (!pageIds.length) {
      return;
    }

    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    setSelectedIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !pageIds.includes(id));
      }

      const merged = new Set([...prev, ...pageIds]);
      return Array.from(merged);
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery((prev) => ({
      ...prev,
      search: searchDraft.trim(),
      status: statusDraft,
      startDate: startDateDraft,
      endDate: endDateDraft,
      sortBy: sortByDraft,
      sortDirection: sortDirectionDraft,
      page: 1,
    }));
  }

  function handleFilterReset() {
    setSearchDraft('');
    setStatusDraft('all');
    setStartDateDraft('');
    setEndDateDraft('');
    setSortByDraft('createdAt');
    setSortDirectionDraft('desc');
    setQuery((prev) => ({
      ...prev,
      ...initialQuery,
      pageSize: prev.pageSize,
    }));
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > meta.totalPages) {
      return;
    }

    setQuery((prev) => ({ ...prev, page: nextPage }));
  }

  function handlePageSizeChange(nextPageSize: number) {
    setQuery((prev) => ({
      ...prev,
      pageSize: nextPageSize,
      page: 1,
    }));
  }

  function handleLogout() {
    clearAdminToken();
    router.push('/admin/login');
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1a1a]">관리자 문의 목록</h1>
          <p className="mt-2 text-sm text-[#5a5a5a]">총 {meta.count}건의 문의가 있습니다.</p>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            최근 24시간 신규 문의 {meta.recentNewCount}건
          </p>
          {adminRole ? (
            <p className="mt-1 text-xs text-[#8a8a8a]">
              로그인: {adminUsername ?? '-'} · 권한:{' '}
              {adminRole === 'editor'
                ? '편집 가능(전체)'
                : adminRole === 'operator'
                  ? '운영자(개별 수정만 가능)'
                  : '읽기 전용'}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadCsv}
            disabled={isCsvDownloading}
            className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-5 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCsvDownloading ? 'CSV 생성 중...' : 'CSV 다운로드'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-5 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
          >
            로그아웃
          </button>
        </div>
      </header>

      {errorMessage ? (
        <p className="mt-6 rounded-xl border border-rose-400/40 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-24 text-sm text-[#5a5a5a] animate-fade-in-up-fast">문의 목록을 불러오는 중...</p>
      ) : (
        <MotionSection className="mt-24 space-y-8" delay={0.02}>
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 animate-fade-in-up-fast">
            <article className="border-t border-[#e5e0d8] pt-6">
              <p className="text-xs tracking-[0.15em] uppercase text-[#8a8a8a]">전체 문의</p>
              <p className="mt-2 text-2xl font-light text-[#1a1a1a]">{stats.total}</p>
            </article>
            <article className="border-t border-[#c17f59] pt-6">
              <p className="text-xs tracking-[0.15em] uppercase text-[#c17f59]">신규</p>
              <p className="mt-2 text-2xl font-light text-[#c17f59]">{stats.newCount}</p>
            </article>
            <article className="border-t border-[#d4a088] pt-6">
              <p className="text-xs tracking-[0.15em] uppercase text-[#d4a088]">진행중</p>
              <p className="mt-2 text-2xl font-light text-[#d4a088]">{stats.inProgressCount}</p>
            </article>
            <article className="border-t border-[#5a5a5a] pt-6">
              <p className="text-xs tracking-[0.15em] uppercase text-[#5a5a5a]">완료</p>
              <p className="mt-2 text-2xl font-light text-[#5a5a5a]">{stats.completedCount}</p>
            </article>
            <article className="border-t border-[#e5e0d8] pt-6">
              <p className="text-xs tracking-[0.15em] uppercase text-[#8a8a8a]">오늘 접수</p>
              <p className="mt-2 text-2xl font-light text-[#1a1a1a]">{stats.todayCount}</p>
            </article>
            <article className="border-t border-[#e5e0d8] pt-6">
              <p className="text-xs tracking-[0.15em] uppercase text-[#8a8a8a]">최근 7일 접수</p>
              <p className="mt-2 text-2xl font-light text-[#1a1a1a]">{stats.last7DaysCount}</p>
            </article>
          </section>

          <section className="border-t border-[#e5e0d8] pt-8 animate-fade-in-up-fast">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#1a1a1a]">문의 접수 추세</p>
                <p className="mt-1 text-xs text-[#8a8a8a]">
                  {trend.startDate || '-'} ~ {trend.endDate || '-'}
                </p>
              </div>
              <div className="inline-flex rounded-xl border border-[#e5e0d8] bg-[#faf9f7] p-1">
                <button
                  type="button"
                  onClick={() => setTrendDays(7)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    trendDays === 7
                      ? 'bg-[#c17f59] text-[#faf9f7]'
                      : 'text-[#5a5a5a] hover:bg-[#f5f3f0]'
                  }`}
                >
                  최근 7일
                </button>
                <button
                  type="button"
                  onClick={() => setTrendDays(30)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    trendDays === 30
                      ? 'bg-[#c17f59] text-[#faf9f7]'
                      : 'text-[#5a5a5a] hover:bg-[#f5f3f0]'
                  }`}
                >
                  최근 30일
                </button>
              </div>
            </div>

            {trend.daily.length ? (
              <div className="mt-4">
                <div className="h-44 rounded-xl border border-[#e5e0d8] bg-[#faf9f7] p-3">
                  <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e0d8" strokeWidth="0.6" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#e5e0d8" strokeWidth="0.6" />
                    <polyline
                      points={trendPolylinePoints}
                      fill="none"
                      stroke="#c17f59"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-[#5a5a5a] sm:grid-cols-3">
                  <p>신규: {trend.newCount}</p>
                  <p>진행중: {trend.inProgressCount}</p>
                  <p>완료: {trend.completedCount}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#8a8a8a]">표시할 추세 데이터가 없습니다.</p>
            )}
          </section>

          <section className="border-t border-[#e5e0d8] pt-8 animate-fade-in-up-fast">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#1a1a1a]">필터 프리셋</p>
                <p className="mt-1 text-xs text-[#8a8a8a]">
                  현재 검색/필터/정렬 조건을 저장해 빠르게 재사용할 수 있습니다.
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <input
                  value={presetNameDraft}
                  onChange={(event) => setPresetNameDraft(event.target.value)}
                  placeholder="예: 신규 문의만"
                  className="w-full min-w-52 rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring sm:w-56"
                />
                <button
                  type="button"
                  onClick={saveCurrentPreset}
                  className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
                >
                  현재 조건 저장
                </button>
              </div>
            </div>

            {presets.length ? (
              <ul className="mt-4 space-y-2">
                {presets.map((preset) => (
                  <li
                    key={preset.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm text-[#1a1a1a]">{preset.name}</p>
                      <p className="mt-1 text-xs text-[#8a8a8a]">
                        검색:{' '}
                        {preset.query.search ? preset.query.search : '없음'} · 상태:{' '}
                        {preset.query.status === 'all'
                          ? '전체'
                          : formatStatus(preset.query.status)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-1.5 text-xs text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
                      >
                        적용
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePreset(preset.id)}
                        className="rounded-lg border border-rose-300/40 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 transition hover:bg-rose-100"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-[#8a8a8a]">저장된 프리셋이 없습니다.</p>
            )}
          </section>

          <section className="border-t border-[#e5e0d8] pt-8 animate-fade-in-up-fast">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#1a1a1a]">최근 활동</p>
                <p className="mt-1 text-xs text-[#8a8a8a]">
                  상태 변경 이력을 조건별로 조회하고 CSV로 내려받을 수 있습니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadActivityCsv}
                  disabled={isActivityCsvDownloading}
                  className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isActivityCsvDownloading ? 'CSV 생성 중...' : '활동 CSV 다운로드'}
                </button>
                <button
                  type="button"
                  onClick={refreshLeadActivity}
                  disabled={activityLoading}
                  className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {activityLoading ? '불러오는 중...' : '최근 활동 새로고침'}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              <select
                value={activityLimitDraft}
                onChange={(event) => setActivityLimitDraft(Number(event.target.value) as 20 | 50 | 100)}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              >
                <option value={20}>최근 20건</option>
                <option value={50}>최근 50건</option>
                <option value={100}>최근 100건</option>
              </select>

              <input
                value={activityChangedByDraft}
                onChange={(event) => setActivityChangedByDraft(event.target.value)}
                placeholder="변경자(admin 등)"
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              />

              <select
                value={activityPreviousStatusDraft}
                onChange={(event) =>
                  setActivityPreviousStatusDraft(event.target.value as ActivityStatusFilter)
                }
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              >
                <option value="all">이전 상태(전체)</option>
                <option value="new">신규</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
              </select>

              <select
                value={activityNextStatusDraft}
                onChange={(event) =>
                  setActivityNextStatusDraft(event.target.value as ActivityStatusFilter)
                }
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              >
                <option value="all">변경 후 상태(전체)</option>
                <option value="new">신규</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
              </select>

              <input
                type="date"
                value={activityStartDateDraft}
                onChange={(event) => setActivityStartDateDraft(event.target.value)}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              />

              <input
                type="date"
                value={activityEndDateDraft}
                onChange={(event) => setActivityEndDateDraft(event.target.value)}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              />

              <div className="flex gap-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={handleActivityFilterApply}
                  className="flex-1 rounded-xl bg-[#c17f59] px-4 py-2 text-sm text-[#faf9f7] transition hover:bg-[#9a6347]"
                >
                  활동 필터 적용
                </button>
                <button
                  type="button"
                  onClick={handleActivityFilterReset}
                  className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
                >
                  활동 필터 초기화
                </button>
              </div>
            </div>

            {activity.length ? (
              <ul className="mt-4 space-y-2">
                {activity.map((item) => (
                  <li
                    key={item.auditId}
                    className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-xs text-[#5a5a5a]"
                  >
                    <p>
                      <span className="font-semibold text-[#1a1a1a]">{item.leadName}</span> ({item.leadPhone}) ·{' '}
                      {formatStatus(item.previousStatus)} → {formatStatus(item.nextStatus)}
                    </p>
                    <p className="mt-1 text-[#8a8a8a]">
                      문의 #{item.leadId} · 변경자: {item.changedBy} ·{' '}
                      {new Date(item.changedAt).toLocaleString('ko-KR')}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-[#8a8a8a]">
                {activityLoading ? '활동 내역을 불러오는 중입니다.' : '표시할 최근 활동이 없습니다.'}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5a5a5a]">
              <p>
                활동 {activityMeta.count}건 · 페이지 {activityMeta.page}/{activityMeta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activityMeta.page <= 1 || activityLoading}
                  onClick={() => handleActivityPageChange(activityMeta.page - 1)}
                  className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-1.5 text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled={activityMeta.page >= activityMeta.totalPages || activityLoading}
                  onClick={() => handleActivityPageChange(activityMeta.page + 1)}
                  className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-1.5 text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          </section>

          <form
            onSubmit={handleSearchSubmit}
            className="border-t border-[#e5e0d8] pt-8"
          >
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="이름/연락처/기기/시간/메모 검색"
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              />

              <select
                value={statusDraft}
                onChange={(event) => setStatusDraft(event.target.value as StatusFilter)}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              >
                <option value="all">전체 상태</option>
                <option value="new">신규</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
              </select>

              <input
                type="date"
                value={startDateDraft}
                onChange={(event) => setStartDateDraft(event.target.value)}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              />

              <input
                type="date"
                value={endDateDraft}
                onChange={(event) => setEndDateDraft(event.target.value)}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              />

              <select
                value={sortByDraft}
                onChange={(event) => setSortByDraft(event.target.value as SortBy)}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              >
                <option value="createdAt">접수일 정렬</option>
                <option value="name">이름 정렬</option>
                <option value="status">상태 정렬</option>
              </select>

              <select
                value={sortDirectionDraft}
                onChange={(event) => setSortDirectionDraft(event.target.value as SortDirection)}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>

              <select
                value={query.pageSize}
                onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              >
                <option value={5}>5개씩</option>
                <option value={10}>10개씩</option>
                <option value={20}>20개씩</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#c17f59] px-4 py-3 text-sm text-[#faf9f7] transition hover:bg-[#9a6347]"
                >
                  적용
                </button>
                <button
                  type="button"
                  onClick={handleFilterReset}
                  className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
                >
                  초기화
                </button>
              </div>
            </div>
          </form>

          <section className="border-t border-[#e5e0d8] pt-8">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAllOnPage}
                disabled={!canBulkWrite}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                현재 페이지 전체 선택/해제
              </button>

              <span className="text-sm text-[#5a5a5a]">선택 {selectedIds.length}건</span>

              <select
                value={bulkStatusDraft}
                onChange={(event) => setBulkStatusDraft(event.target.value as LeadStatus)}
                disabled={!canBulkWrite}
                className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring disabled:opacity-50"
              >
                <option value="new">신규</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
              </select>

              <button
                type="button"
                onClick={bulkUpdateStatus}
                disabled={!selectedIds.length || isBulkUpdating || !canBulkWrite}
                className="rounded-xl bg-[#c17f59] px-4 py-2 text-sm text-[#faf9f7] transition hover:bg-[#9a6347] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBulkUpdating ? '일괄 처리 중...' : '선택 문의 상태 일괄 변경'}
              </button>
            </div>
            <p className="mt-2 text-xs text-[#8a8a8a]">
              {canBulkWrite
                ? '선택은 현재 조회 결과를 다시 불러올 때(필터/정렬/페이지 이동/새로고침) 자동 초기화됩니다.'
                : canWrite
                  ? '운영자 계정은 개별 수정만 가능하며 일괄 변경은 제한됩니다.'
                  : '읽기 전용 계정은 조회/다운로드만 가능합니다.'}
            </p>
          </section>

          {leads.map((lead, index) => (
            <article
              key={lead.id}
              className="border-t border-[#e5e0d8] pt-8 opacity-0 animate-fade-in-up-fast"
              style={{ animationDelay: `${Math.min(index * 0.03, 0.36)}s` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <label className="mb-2 inline-flex items-center gap-2 text-xs text-[#8a8a8a]">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(lead.id)}
                      onChange={() => toggleLeadSelection(lead.id)}
                      disabled={!canBulkWrite}
                      className="size-4 rounded border-[#e5e0d8] bg-[#faf9f7]"
                    />
                    선택
                  </label>
                  <p className="text-lg font-serif font-normal text-[#1a1a1a]">{lead.name}</p>
                  <p className="mt-1 text-sm text-[#5a5a5a]">{lead.phone}</p>
                  <p className="mt-1 text-sm text-[#8a8a8a]">
                    접수: {new Date(lead.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
                <span className="rounded-full border border-[#c17f59] bg-[#faf9f7] px-3 py-1 text-xs text-[#c17f59]">
                  {formatStatus(lead.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[#5a5a5a] md:grid-cols-2">
                <p>관심 기기: {lead.interestDevice}</p>
                <p>연락 가능 시간: {lead.contactTime}</p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <label className="text-sm text-[#5a5a5a]">상태 변경</label>
                <select
                  value={lead.status}
                  onChange={(event) => updateStatus(lead.id, event.target.value as LeadStatus)}
                  className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
                  disabled={savingStatusId === lead.id || !canWrite}
                >
                  <option value="new">신규</option>
                  <option value="in_progress">진행중</option>
                  <option value="completed">완료</option>
                </select>
              </div>

              <div className="mt-4 rounded-xl border border-[#e5e0d8] bg-[#faf9f7] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[#5a5a5a]">상태 변경 이력</p>
                  <button
                    type="button"
                    onClick={() => fetchStatusAudits(lead.id)}
                    disabled={loadingAuditLeadId === lead.id}
                    className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-1.5 text-xs text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingAuditLeadId === lead.id
                      ? '불러오는 중...'
                      : auditsByLeadId[lead.id]
                        ? '새로고침'
                        : '이력 불러오기'}
                  </button>
                </div>

                {auditErrorByLeadId[lead.id] ? (
                  <p className="mt-2 text-xs text-rose-700">{auditErrorByLeadId[lead.id]}</p>
                ) : null}

                {auditsByLeadId[lead.id] ? (
                  auditsByLeadId[lead.id].length ? (
                    <ul className="mt-3 space-y-2">
                      {auditsByLeadId[lead.id].map((audit) => (
                        <li
                          key={audit.id}
                          className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-xs text-[#5a5a5a]"
                        >
                          <p>
                            {formatStatus(audit.previousStatus)} → {formatStatus(audit.nextStatus)}
                          </p>
                          <p className="mt-1 text-[#8a8a8a]">
                            변경자: {audit.changedBy} · {new Date(audit.changedAt).toLocaleString('ko-KR')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[#8a8a8a]">기록된 상태 변경 이력이 없습니다.</p>
                  )
                ) : (
                  <p className="mt-2 text-xs text-[#8a8a8a]">아직 이력을 불러오지 않았습니다.</p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm text-[#5a5a5a]">상세 메모</label>
                <textarea
                  value={memoDrafts[lead.id] ?? ''}
                  onChange={(event) =>
                    setMemoDrafts((prev) => ({
                      ...prev,
                      [lead.id]: event.target.value,
                    }))
                  }
                  rows={3}
                  disabled={!canWrite}
                  className="w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
                  placeholder="상담 메모를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => updateMemo(lead.id)}
                  disabled={savingMemoId === lead.id || !canWrite}
                  className="rounded-xl bg-[#c17f59] px-4 py-2 text-sm text-[#faf9f7] transition hover:bg-[#9a6347] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingMemoId === lead.id ? '저장 중...' : '메모 저장'}
                </button>
              </div>
            </article>
          ))}

          {!leads.length ? (
            <p className="border-t border-[#e5e0d8] pt-8 text-sm text-[#8a8a8a]">
              등록된 문의가 없습니다.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e0d8] pt-8">
            <p className="text-sm text-[#5a5a5a]">
              페이지 {meta.page} / {meta.totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>

              {pageItems.map((item, index) =>
                item === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-sm text-[#8a8a8a]">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePageChange(item)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      item === meta.page
                        ? 'border-[#c17f59] bg-[#c17f59] text-[#faf9f7]'
                        : 'border-[#e5e0d8] bg-[#faf9f7] text-[#5a5a5a] hover:bg-[#f5f3f0]'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </div>
          </div>
        </MotionSection>
      )}
    </main>
  );
}
