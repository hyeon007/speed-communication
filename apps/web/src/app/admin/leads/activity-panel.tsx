import {
  formatKoreanDateTime,
  formatStatus,
  type ActivityStatusFilter,
  type LeadActivityItem,
} from './types';

type ActivityPanelProps = {
  activity: LeadActivityItem[];
  activityLoading: boolean;
  isActivityCsvDownloading: boolean;
  activityLimitDraft: 20 | 50 | 100;
  activityChangedByDraft: string;
  activityPreviousStatusDraft: ActivityStatusFilter;
  activityNextStatusDraft: ActivityStatusFilter;
  activityStartDateDraft: string;
  activityEndDateDraft: string;
  activityMeta: {
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  onActivityLimitChange: (value: 20 | 50 | 100) => void;
  onActivityChangedByChange: (value: string) => void;
  onActivityPreviousStatusChange: (value: ActivityStatusFilter) => void;
  onActivityNextStatusChange: (value: ActivityStatusFilter) => void;
  onActivityStartDateChange: (value: string) => void;
  onActivityEndDateChange: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onDownloadCsv: () => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
};

export function ActivityPanel({
  activity,
  activityLoading,
  isActivityCsvDownloading,
  activityLimitDraft,
  activityChangedByDraft,
  activityPreviousStatusDraft,
  activityNextStatusDraft,
  activityStartDateDraft,
  activityEndDateDraft,
  activityMeta,
  onActivityLimitChange,
  onActivityChangedByChange,
  onActivityPreviousStatusChange,
  onActivityNextStatusChange,
  onActivityStartDateChange,
  onActivityEndDateChange,
  onApplyFilters,
  onResetFilters,
  onDownloadCsv,
  onRefresh,
  onPageChange,
}: ActivityPanelProps) {
  return (
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
            onClick={onDownloadCsv}
            disabled={isActivityCsvDownloading}
            className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isActivityCsvDownloading ? 'CSV 생성 중...' : '활동 CSV 다운로드'}
          </button>
          <button
            type="button"
            onClick={onRefresh}
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
          onChange={(event) =>
            onActivityLimitChange(Number(event.target.value) as 20 | 50 | 100)
          }
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        >
          <option value={20}>최근 20건</option>
          <option value={50}>최근 50건</option>
          <option value={100}>최근 100건</option>
        </select>

        <input
          value={activityChangedByDraft}
          onChange={(event) => onActivityChangedByChange(event.target.value)}
          placeholder="변경자(admin 등)"
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        />

        <select
          value={activityPreviousStatusDraft}
          onChange={(event) =>
            onActivityPreviousStatusChange(
              event.target.value as ActivityStatusFilter,
            )
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
            onActivityNextStatusChange(event.target.value as ActivityStatusFilter)
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
          onChange={(event) => onActivityStartDateChange(event.target.value)}
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        />

        <input
          type="date"
          value={activityEndDateDraft}
          onChange={(event) => onActivityEndDateChange(event.target.value)}
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        />

        <div className="flex gap-2 lg:col-span-2">
          <button
            type="button"
            onClick={onApplyFilters}
            className="flex-1 rounded-xl bg-[#c17f59] px-4 py-2 text-sm text-[#faf9f7] transition hover:bg-[#9a6347]"
          >
            활동 필터 적용
          </button>
          <button
            type="button"
            onClick={onResetFilters}
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
                <span className="font-semibold text-[#1a1a1a]">
                  {item.leadName}
                </span>{' '}
                ({item.leadPhone}) · {formatStatus(item.previousStatus)} →{' '}
                {formatStatus(item.nextStatus)}
              </p>
              <p className="mt-1 text-[#8a8a8a]">
                문의 #{item.leadId} · 변경자: {item.changedBy} ·{' '}
                {formatKoreanDateTime(item.changedAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-[#8a8a8a]">
          {activityLoading
            ? '활동 내역을 불러오는 중입니다.'
            : '표시할 최근 활동이 없습니다.'}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5a5a5a]">
        <p>
          활동 {activityMeta.count}건 · 페이지 {activityMeta.page}/
          {activityMeta.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activityMeta.page <= 1 || activityLoading}
            onClick={() => onPageChange(activityMeta.page - 1)}
            className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-1.5 text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            이전
          </button>
          <button
            type="button"
            disabled={
              activityMeta.page >= activityMeta.totalPages || activityLoading
            }
            onClick={() => onPageChange(activityMeta.page + 1)}
            className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-1.5 text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </section>
  );
}
