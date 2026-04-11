import type { FormEvent } from 'react';
import type {
  QueryState,
  SortBy,
  SortDirection,
  StatusFilter,
} from './types';

type LeadSearchFormProps = {
  query: QueryState;
  searchDraft: string;
  statusDraft: StatusFilter;
  startDateDraft: string;
  endDateDraft: string;
  sortByDraft: SortBy;
  sortDirectionDraft: SortDirection;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSearchDraftChange: (value: string) => void;
  onStatusDraftChange: (value: StatusFilter) => void;
  onStartDateDraftChange: (value: string) => void;
  onEndDateDraftChange: (value: string) => void;
  onSortByDraftChange: (value: SortBy) => void;
  onSortDirectionDraftChange: (value: SortDirection) => void;
  onPageSizeChange: (value: number) => void;
  onReset: () => void;
};

export function LeadSearchForm({
  query,
  searchDraft,
  statusDraft,
  startDateDraft,
  endDateDraft,
  sortByDraft,
  sortDirectionDraft,
  onSubmit,
  onSearchDraftChange,
  onStatusDraftChange,
  onStartDateDraftChange,
  onEndDateDraftChange,
  onSortByDraftChange,
  onSortDirectionDraftChange,
  onPageSizeChange,
  onReset,
}: LeadSearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="border-t border-[#e5e0d8] pt-8">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="이름/연락처/기기/시간/메모 검색"
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        />

        <select
          value={statusDraft}
          onChange={(event) =>
            onStatusDraftChange(event.target.value as StatusFilter)
          }
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
          onChange={(event) => onStartDateDraftChange(event.target.value)}
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        />

        <input
          type="date"
          value={endDateDraft}
          onChange={(event) => onEndDateDraftChange(event.target.value)}
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        />

        <select
          value={sortByDraft}
          onChange={(event) => onSortByDraftChange(event.target.value as SortBy)}
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        >
          <option value="createdAt">접수일 정렬</option>
          <option value="name">이름 정렬</option>
          <option value="status">상태 정렬</option>
        </select>

        <select
          value={sortDirectionDraft}
          onChange={(event) =>
            onSortDirectionDraftChange(event.target.value as SortDirection)
          }
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-3 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
        >
          <option value="desc">내림차순</option>
          <option value="asc">오름차순</option>
        </select>

        <select
          value={query.pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
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
            onClick={onReset}
            className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
          >
            초기화
          </button>
        </div>
      </div>
    </form>
  );
}
