import { MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <MotionSection>
        <header>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-[#c17f59]">TERMS OF SERVICE</p>
          <h1 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">이용약관</h1>
          <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">시행일: 2026-04-01</p>
        </header>
      </MotionSection>

      <MotionStagger className="mt-24 border-t border-[#e5e0d8] pt-8 text-sm leading-7 text-[#5a5a5a]" delayChildren={0.08}>
        <MotionItem>
          <p>
            본 사이트는 휴대폰 상담 안내를 위한 정보 제공 플랫폼이며, 온라인 결제 및 개통 확정 기능은 제공하지
            않습니다.
          </p>
        </MotionItem>
        <MotionItem className="mt-5">
          <p>
            사용자는 상담 신청 시 정확한 정보를 입력해야 하며, 허위 정보 입력으로 발생하는 문제에 대한 책임은
            사용자에게 있습니다.
          </p>
        </MotionItem>
        <MotionItem className="mt-5">
          <p>
            회사는 서비스 안정성을 위해 약관을 변경할 수 있으며, 주요 변경 사항은 사이트 내 공지를 통해 안내합니다.
          </p>
        </MotionItem>
      </MotionStagger>
    </main>
  );
}
