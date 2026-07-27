import {
  formatConsultationType,
  formatKoreanDateTime,
  formatPreferredCarrier,
  formatStatus,
  type Lead,
  type LeadStatus,
  type LeadStatusAudit,
} from './types';

type LeadListSectionProps = {
  leads: Lead[];
  selectedIds: number[];
  canWrite: boolean;
  canBulkWrite: boolean;
  savingStatusId: number | null;
  savingMemoId: number | null;
  loadingAuditLeadId: number | null;
  auditsByLeadId: Record<number, LeadStatusAudit[]>;
  auditErrorByLeadId: Record<number, string>;
  memoDrafts: Record<number, string>;
  meta: {
    page: number;
    totalPages: number;
  };
  pageItems: Array<number | '...'>;
  onToggleLeadSelection: (leadId: number) => void;
  onUpdateStatus: (leadId: number, status: LeadStatus) => void;
  onFetchStatusAudits: (leadId: number) => void;
  onMemoDraftChange: (leadId: number, value: string) => void;
  onUpdateMemo: (leadId: number) => void;
  onPageChange: (page: number) => void;
};

export function LeadListSection({
  leads,
  selectedIds,
  canWrite,
  canBulkWrite,
  savingStatusId,
  savingMemoId,
  loadingAuditLeadId,
  auditsByLeadId,
  auditErrorByLeadId,
  memoDrafts,
  meta,
  pageItems,
  onToggleLeadSelection,
  onUpdateStatus,
  onFetchStatusAudits,
  onMemoDraftChange,
  onUpdateMemo,
  onPageChange,
}: LeadListSectionProps) {
  return (
    <>
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
                  onChange={() => onToggleLeadSelection(lead.id)}
                  disabled={!canBulkWrite}
                  className="size-4 rounded border-[#e5e0d8] bg-[#faf9f7]"
                />
                선택
              </label>
              <p className="text-lg font-serif font-normal text-[#1a1a1a]">
                {lead.name}
              </p>
              <p className="mt-1 text-sm text-[#5a5a5a]">{lead.phone}</p>
              <p className="mt-1 text-sm text-[#8a8a8a]">
                접수: {formatKoreanDateTime(lead.createdAt)}
              </p>
            </div>
            <span className="rounded-full border border-[#c17f59] bg-[#faf9f7] px-3 py-1 text-xs text-[#c17f59]">
              {formatStatus(lead.status)}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-[#5a5a5a] md:grid-cols-2">
            <p>관심 기기: {lead.interestDevice}</p>
            <p>연락 가능 시간: {lead.contactTime}</p>
            <p>가입 유형: {formatConsultationType(lead.consultationType)}</p>
            <p>희망 통신사: {formatPreferredCarrier(lead.preferredCarrier)}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="text-sm text-[#5a5a5a]">상태 변경</label>
            <select
              value={lead.status}
              onChange={(event) =>
                onUpdateStatus(lead.id, event.target.value as LeadStatus)
              }
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
                onClick={() => onFetchStatusAudits(lead.id)}
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
              <p className="mt-2 text-xs text-rose-700">
                {auditErrorByLeadId[lead.id]}
              </p>
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
                        {formatStatus(audit.previousStatus)} →{' '}
                        {formatStatus(audit.nextStatus)}
                      </p>
                      <p className="mt-1 text-[#8a8a8a]">
                        변경자: {audit.changedBy} ·{' '}
                        {formatKoreanDateTime(audit.changedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-[#8a8a8a]">
                  기록된 후속 처리 이력이 없습니다.
                </p>
              )
            ) : (
              <p className="mt-2 text-xs text-[#8a8a8a]">
                아직 이력을 불러오지 않았습니다.
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm text-[#5a5a5a]">상세 메모</label>
            <textarea
              value={memoDrafts[lead.id] ?? ''}
              onChange={(event) => onMemoDraftChange(lead.id, event.target.value)}
              rows={3}
              disabled={!canWrite}
              className="w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              placeholder="후속 연락 메모를 입력하세요"
            />
            <button
              type="button"
              onClick={() => onUpdateMemo(lead.id)}
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
          접수된 상담 신청이 없습니다.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e0d8] pt-8">
        <p className="text-sm text-[#5a5a5a]">
          페이지 {meta.page} / {meta.totalPages}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(meta.page - 1)}
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
                onClick={() => onPageChange(item)}
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
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </div>
      </div>
    </>
  );
}
