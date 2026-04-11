import type { LeadStatus } from './types';

type LeadBulkActionsProps = {
  canWrite: boolean;
  canBulkWrite: boolean;
  selectedCount: number;
  bulkStatusDraft: LeadStatus;
  isBulkUpdating: boolean;
  onToggleSelectAll: () => void;
  onBulkStatusDraftChange: (status: LeadStatus) => void;
  onBulkUpdate: () => void;
};

export function LeadBulkActions({
  canWrite,
  canBulkWrite,
  selectedCount,
  bulkStatusDraft,
  isBulkUpdating,
  onToggleSelectAll,
  onBulkStatusDraftChange,
  onBulkUpdate,
}: LeadBulkActionsProps) {
  return (
    <section className="border-t border-[#e5e0d8] pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggleSelectAll}
          disabled={!canBulkWrite}
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          현재 페이지 전체 선택/해제
        </button>

        <span className="text-sm text-[#5a5a5a]">선택 {selectedCount}건</span>

        <select
          value={bulkStatusDraft}
          onChange={(event) =>
            onBulkStatusDraftChange(event.target.value as LeadStatus)
          }
          disabled={!canBulkWrite}
          className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring disabled:opacity-50"
        >
          <option value="new">신규</option>
          <option value="in_progress">진행중</option>
          <option value="completed">완료</option>
        </select>

        <button
          type="button"
          onClick={onBulkUpdate}
          disabled={!selectedCount || isBulkUpdating || !canBulkWrite}
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
  );
}
