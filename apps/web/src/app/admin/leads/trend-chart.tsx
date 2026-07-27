import type { LeadTrendResponse } from './types';

type TrendChartProps = {
  trend: LeadTrendResponse;
  trendDays: 7 | 30;
  trendPolylinePoints: string;
  onTrendDaysChange: (days: 7 | 30) => void;
};

export function TrendChart({
  trend,
  trendDays,
  trendPolylinePoints,
  onTrendDaysChange,
}: TrendChartProps) {
  return (
    <section className="border-t border-[#e5e0d8] pt-8 animate-fade-in-up-fast">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#1a1a1a]">상담 신청 접수 추세</p>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            {trend.startDate || '-'} ~ {trend.endDate || '-'}
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-[#e5e0d8] bg-[#faf9f7] p-1">
          <button
            type="button"
            onClick={() => onTrendDaysChange(7)}
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
            onClick={() => onTrendDaysChange(30)}
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
  );
}
