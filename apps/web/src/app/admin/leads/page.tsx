'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MotionSection } from '@/components/motion-presets';
import { adminFetch, clearAdminSession, clearAdminToken } from '@/lib/admin-auth';
import { ActivityPanel } from './activity-panel';
import { FilterPresetsPanel } from './filter-presets-panel';
import { LeadBulkActions } from './lead-bulk-actions';
import { LeadListSection } from './lead-list-section';
import { LeadSearchForm } from './lead-search-form';
import { StatsOverview } from './stats-overview';
import { TrendChart } from './trend-chart';
import {
  FILTER_PRESETS_STORAGE_KEY,
  buildPageItems,
  formatDownloadDate,
  type ActivityQueryState,
  type ActivityStatusFilter,
  type AdminProfileResponse,
  type AdminRole,
  type FilterPreset,
  type Lead,
  type LeadActivityItem,
  type LeadActivityResponse,
  type LeadStatsResponse,
  type LeadStatus,
  type LeadStatusAudit,
  type LeadStatusAuditsResponse,
  type LeadTrendResponse,
  type LeadsResponse,
  initialQuery,
  type QueryState,
  type SortBy,
  type SortDirection,
  type StatusFilter,
} from './types';

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
  const handleUnauthorized = useCallback(() => {
    void clearAdminSession();
    router.replace('/admin/login');
  }, [router]);

  const fetchLeads = useCallback(
    async (currentQuery: QueryState) => {
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

      const response = await adminFetch(
        `/api/v1/admin/leads?${params.toString()}`,
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const payload = (await response.json()) as LeadsResponse | { message?: string };

      if (!response.ok) {
        setErrorMessage(
          'message' in payload && payload.message
            ? payload.message
            : '접수 목록을 불러오지 못했습니다.',
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
    [handleUnauthorized],
  );

  const fetchAdminProfile = useCallback(
    async () => {
      const response = await adminFetch('/api/v1/admin/auth/me');

      if (response.status === 401) {
        handleUnauthorized();
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
        handleUnauthorized();
        return;
      }

      setAdminRole(profile.role);
      setAdminUsername(profile.username);
    },
    [handleUnauthorized],
  );

  const fetchLeadStats = useCallback(
    async () => {
      const response = await adminFetch('/api/v1/admin/leads/stats');

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const payload = (await response.json()) as LeadStatsResponse | { message?: string };

      if (!response.ok) {
        setErrorMessage(
          'message' in payload && payload.message
            ? payload.message
            : '접수 통계를 불러오지 못했습니다.',
        );
        return;
      }

      setStats(payload as LeadStatsResponse);
    },
    [handleUnauthorized],
  );

  const fetchLeadTrend = useCallback(
    async (days: 7 | 30) => {
      const response = await adminFetch(
        `/api/v1/admin/leads/stats/trend?days=${days}`,
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const payload = (await response.json()) as LeadTrendResponse | { message?: string };

      if (!response.ok) {
        setErrorMessage(
          'message' in payload && payload.message
            ? payload.message
            : '접수 추세 통계를 불러오지 못했습니다.',
        );
        return;
      }

      setTrend(payload as LeadTrendResponse);
    },
    [handleUnauthorized],
  );

  const fetchLeadActivity = useCallback(
    async () => {
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

        const response = await adminFetch(
          `/api/v1/admin/leads/activity?${params.toString()}`,
        );

        if (response.status === 401) {
          handleUnauthorized();
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
    [activityQuery, handleUnauthorized],
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
    void fetchLeadActivity();
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

      const response = await adminFetch(
        `/api/v1/admin/leads/activity.csv?${params.toString()}`,
      );

      if (response.status === 401) {
        handleUnauthorized();
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
      anchor.download = `lead-activity-${formatDownloadDate()}.csv`;
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
    clearAdminToken();

    Promise.all([
      fetchAdminProfile(),
      fetchLeadStats(),
      fetchLeadTrend(trendDays),
      fetchLeadActivity(),
      fetchLeads(query),
    ])
      .catch(() => {
        setErrorMessage('네트워크 오류로 접수 목록을 불러오지 못했습니다.');
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
    trendDays,
  ]);

  async function updateStatus(leadId: number, status: LeadStatus) {
    if (!canWrite) {
      setErrorMessage('읽기 전용 계정은 상태를 변경할 수 없습니다.');
      return;
    }

    setSavingStatusId(leadId);
    setErrorMessage(null);

    try {
      const response = await adminFetch(`/api/v1/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setErrorMessage(payload.message ?? '상태 변경에 실패했습니다.');
        return;
      }

      await Promise.all([
        fetchLeads(query),
        fetchLeadStats(),
        fetchLeadTrend(trendDays),
        fetchLeadActivity(),
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

    setSavingMemoId(leadId);
    setErrorMessage(null);

    try {
      const response = await adminFetch(`/api/v1/admin/leads/${leadId}/memo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memo: memoDrafts[leadId] ?? '',
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
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

    setIsBulkUpdating(true);
    setErrorMessage(null);

    try {
      const response = await adminFetch('/api/v1/admin/leads/bulk-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedIds,
          status: bulkStatusDraft,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const payload = (await response.json()) as { message?: string; notFoundIds?: number[] };

      if (!response.ok) {
        setErrorMessage(payload.message ?? '일괄 상태 변경에 실패했습니다.');
        return;
      }

      if ((payload.notFoundIds?.length ?? 0) > 0) {
        setErrorMessage(
          `일부 접수 건은 찾지 못했습니다: ${payload.notFoundIds?.join(', ') ?? ''}`,
        );
      }

      await Promise.all([
        fetchLeads(query),
        fetchLeadStats(),
        fetchLeadTrend(trendDays),
        fetchLeadActivity(),
      ]);
    } catch {
      setErrorMessage('네트워크 오류로 일괄 상태 변경에 실패했습니다.');
    } finally {
      setIsBulkUpdating(false);
    }
  }

  async function downloadCsv() {
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

      const response = await adminFetch(
        `/api/v1/admin/leads/export.csv?${params.toString()}`,
      );

      if (response.status === 401) {
        handleUnauthorized();
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
      anchor.download = `leads-${formatDownloadDate()}.csv`;
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
    setLoadingAuditLeadId(leadId);
    setAuditErrorByLeadId((prev) => {
      const next = { ...prev };
      delete next[leadId];
      return next;
    });

    try {
      const response = await adminFetch(
        `/api/v1/admin/leads/${leadId}/status-audits?limit=10`,
      );

      if (response.status === 401) {
        handleUnauthorized();
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
    void clearAdminSession().finally(() => {
      router.push('/admin/login');
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1a1a]">관리자 접수 목록</h1>
          <p className="mt-2 text-sm text-[#5a5a5a]">총 {meta.count}건의 상담 신청이 접수되어 있습니다.</p>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            최근 24시간 신규 접수 {meta.recentNewCount}건
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
          <Link
            href="/admin/devices"
            className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-5 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
          >
            기기 관리
          </Link>
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
        <p className="mt-24 text-sm text-[#5a5a5a] animate-fade-in-up-fast">접수 목록을 불러오는 중...</p>
      ) : (
        <MotionSection className="mt-24 space-y-8" delay={0.02}>
          <StatsOverview stats={stats} />

          <TrendChart
            trend={trend}
            trendDays={trendDays}
            trendPolylinePoints={trendPolylinePoints}
            onTrendDaysChange={setTrendDays}
          />

          <FilterPresetsPanel
            presetNameDraft={presetNameDraft}
            presets={presets}
            onPresetNameChange={setPresetNameDraft}
            onSavePreset={saveCurrentPreset}
            onApplyPreset={applyPreset}
            onDeletePreset={deletePreset}
          />

          <ActivityPanel
            activity={activity}
            activityLoading={activityLoading}
            isActivityCsvDownloading={isActivityCsvDownloading}
            activityLimitDraft={activityLimitDraft}
            activityChangedByDraft={activityChangedByDraft}
            activityPreviousStatusDraft={activityPreviousStatusDraft}
            activityNextStatusDraft={activityNextStatusDraft}
            activityStartDateDraft={activityStartDateDraft}
            activityEndDateDraft={activityEndDateDraft}
            activityMeta={activityMeta}
            onActivityLimitChange={setActivityLimitDraft}
            onActivityChangedByChange={setActivityChangedByDraft}
            onActivityPreviousStatusChange={setActivityPreviousStatusDraft}
            onActivityNextStatusChange={setActivityNextStatusDraft}
            onActivityStartDateChange={setActivityStartDateDraft}
            onActivityEndDateChange={setActivityEndDateDraft}
            onApplyFilters={handleActivityFilterApply}
            onResetFilters={handleActivityFilterReset}
            onDownloadCsv={downloadActivityCsv}
            onRefresh={refreshLeadActivity}
            onPageChange={handleActivityPageChange}
          />

          <LeadSearchForm
            query={query}
            searchDraft={searchDraft}
            statusDraft={statusDraft}
            startDateDraft={startDateDraft}
            endDateDraft={endDateDraft}
            sortByDraft={sortByDraft}
            sortDirectionDraft={sortDirectionDraft}
            onSubmit={handleSearchSubmit}
            onSearchDraftChange={setSearchDraft}
            onStatusDraftChange={setStatusDraft}
            onStartDateDraftChange={setStartDateDraft}
            onEndDateDraftChange={setEndDateDraft}
            onSortByDraftChange={setSortByDraft}
            onSortDirectionDraftChange={setSortDirectionDraft}
            onPageSizeChange={handlePageSizeChange}
            onReset={handleFilterReset}
          />

          <LeadBulkActions
            canWrite={canWrite}
            canBulkWrite={canBulkWrite}
            selectedCount={selectedIds.length}
            bulkStatusDraft={bulkStatusDraft}
            isBulkUpdating={isBulkUpdating}
            onToggleSelectAll={toggleSelectAllOnPage}
            onBulkStatusDraftChange={setBulkStatusDraft}
            onBulkUpdate={bulkUpdateStatus}
          />

          <LeadListSection
            leads={leads}
            selectedIds={selectedIds}
            canWrite={canWrite}
            canBulkWrite={canBulkWrite}
            savingStatusId={savingStatusId}
            savingMemoId={savingMemoId}
            loadingAuditLeadId={loadingAuditLeadId}
            auditsByLeadId={auditsByLeadId}
            auditErrorByLeadId={auditErrorByLeadId}
            memoDrafts={memoDrafts}
            meta={meta}
            pageItems={pageItems}
            onToggleLeadSelection={toggleLeadSelection}
            onUpdateStatus={updateStatus}
            onFetchStatusAudits={fetchStatusAudits}
            onMemoDraftChange={(leadId, value) =>
              setMemoDrafts((prev) => ({
                ...prev,
                [leadId]: value,
              }))
            }
            onUpdateMemo={updateMemo}
            onPageChange={handlePageChange}
          />
        </MotionSection>
      )}
    </main>
  );
}
