import { ConsultCtaButton } from '@/components/consult-cta-button';
import { MotionHoverCard, MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';
import { SupportPromoNote } from '@/components/support-promo-note';

// Usage profiles, not products: actual plans and prices differ by carrier and change often,
// so the page points customers to a consultation instead of listing fixed fees.
const plans = [
  {
    name: '알뜰하게',
    summary: '데이터를 적게 쓰고 통신비를 줄이고 싶은 분',
    features: ['알뜰폰(MVNO) 요금제 비교', '소용량 데이터 요금제', '자급제·기존 기기 유지 상담'],
  },
  {
    name: '넉넉하게',
    summary: '영상·SNS를 자주 보는 분',
    features: ['중·대용량 데이터 요금제', '기기 변경과 함께 조건 비교', '선택약정·결합 할인 확인'],
  },
  {
    name: '무제한으로',
    summary: '데이터 걱정 없이 쓰고 싶은 분',
    features: ['무제한 요금제', '가족결합 시 절감 폭 확인', '테더링·로밍 사용 패턴 반영'],
  },
];

export default function PlansPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <MotionSection className="max-w-3xl">
        <p className="text-xs font-light tracking-[0.3em] uppercase text-[#c17f59]">PLAN SELECTOR</p>
        <h1 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">요금제 제안</h1>
        <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">
          통신사(SKT·KT·LG U+·알뜰폰)별 요금제는 수시로 바뀝니다. 사용량, 가족결합 여부, 약정 조건을 듣고 당일
          기준으로 맞는 요금제를 비교해 안내드립니다.
        </p>
        <SupportPromoNote variant="banner" className="max-w-3xl" />
      </MotionSection>

      <MotionStagger className="mt-24 grid gap-8 md:grid-cols-3 md:gap-12" delayChildren={0.16}>
        {plans.map((plan) => (
          <MotionItem key={plan.name}>
            <MotionHoverCard className="group border-t border-[#e5e0d8] pt-8 transition-shadow duration-500 hover:shadow-[0_12px_28px_rgba(26,26,26,0.05)]">
              <h2 className="font-serif text-2xl font-normal text-[#1a1a1a]">{plan.name}</h2>
              <p className="mt-4 text-sm leading-7 text-[#c17f59]">{plan.summary}</p>
              <ul className="mt-6 space-y-2 text-sm leading-7 text-[#5a5a5a]">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </MotionHoverCard>
          </MotionItem>
        ))}
      </MotionStagger>

      <MotionSection className="mt-24" delay={0.1}>
        <ConsultCtaButton
          className="inline-flex text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-8 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#9a6347]"
        >
          내게 맞는 요금제 상담받기
        </ConsultCtaButton>
        <SupportPromoNote variant="card" className="max-w-3xl" />
      </MotionSection>
    </main>
  );
}
