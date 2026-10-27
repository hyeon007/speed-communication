import { ConsultCtaButton } from '@/components/consult-cta-button';
import { MotionSection } from '@/components/motion-presets';

const comparisonRows = [
  { key: '카메라', iphone: 'Pro급 카메라 + 영상 안정화', galaxy: 'Ultra급 카메라 + 고배율 줌' },
  { key: '디스플레이', iphone: '고주사율 OLED 디스플레이', galaxy: '대화면 고주사율 AMOLED' },
  { key: '배터리', iphone: '전력 효율 중심의 하루 사용', galaxy: '대용량 배터리 + 고속충전' },
  { key: '추천 사용자', iphone: '영상/콘텐츠 제작 중심', galaxy: '멀티태스킹/생산성 중심' },
];

export default function ComparePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <MotionSection className="max-w-3xl">
        <p className="text-xs font-light tracking-[0.3em] uppercase text-[#c17f59]">COMPARE MODELS</p>
        <h1 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">기기 비교</h1>
        <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">
          주요 스펙과 실제 사용 포인트를 기준으로 추천 방향을 빠르게 확인할 수 있습니다.
        </p>
      </MotionSection>

      <MotionSection className="mt-24 overflow-x-auto border-t border-[#e5e0d8]" delay={0.05}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e5e0d8] text-xs tracking-[0.15em] uppercase text-[#c17f59]">
              <th className="px-4 py-4 font-medium">항목</th>
              <th className="px-4 py-4 font-medium">iPhone 18 Pro</th>
              <th className="px-4 py-4 font-medium">Galaxy S26 Ultra</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, index) => (
              <tr
                key={row.key}
                className="animate-fade-in-up-fast border-b border-[#e5e0d8] text-sm text-[#5a5a5a] opacity-0 last:border-b-0"
                style={{ animationDelay: `${0.18 + index * 0.08}s` }}
              >
                <th className="px-4 py-4 font-medium text-[#1a1a1a]">{row.key}</th>
                <td className="px-4 py-4">{row.iphone}</td>
                <td className="px-4 py-4">{row.galaxy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </MotionSection>

      <MotionSection className="mt-24" delay={0.1}>
        <ConsultCtaButton
          className="gallery-link inline-flex px-8 py-4 text-xs tracking-[0.15em] uppercase text-[#5a5a5a] transition-all duration-500 hover:-translate-y-0.5 hover:text-[#1a1a1a]"
        >
          비교 결과로 상담 신청 접수하기
        </ConsultCtaButton>
        <p className="mt-4 text-[11px] leading-5 text-[#8a8a8a]">
          *가격·지원금·개통 조건은 기기와 가입 유형을 확인한 뒤 당일 정책 기준으로 안내드립니다.
        </p>
      </MotionSection>
    </main>
  );
}
