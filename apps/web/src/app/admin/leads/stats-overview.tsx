import type { LeadStatsResponse } from './types';

type StatsOverviewProps = {
  stats: LeadStatsResponse;
};

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
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
  );
}
