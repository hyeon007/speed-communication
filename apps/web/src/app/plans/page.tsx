import { ConsultCtaButton } from '@/components/consult-cta-button';
import { MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';
import { SupportPromoNote } from '@/components/support-promo-note';

const plans = [
  {
    name: 'Smart Basic',
    monthlyFee: '55,000원대',
    features: ['데이터 20GB', '음성/문자 기본', '가성비 중심'],
  },
  {
    name: 'Smart Plus',
    monthlyFee: '75,000원대',
    features: ['데이터 100GB', '영상·게임 최적화', '추가 할인 조합 추천'],
  },
  {
    name: 'Smart Infinity',
    monthlyFee: '95,000원대',
    features: ['데이터 무제한', '프리미엄 혜택', '가족결합 시 추가 절감'],
  },
];

export default function PlansPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <MotionSection className="max-w-3xl">
        <p className="text-xs font-light tracking-[0.3em] uppercase text-[#c17f59]">PLAN SELECTOR</p>
        <h1 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">요금제 제안</h1>
        <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">
          사용량, 가족결합 여부, 약정 조건을 반영해 가장 유리한 요금제를 추천합니다.
        </p>
        <SupportPromoNote variant="banner" className="max-w-3xl" />
      </MotionSection>

      <MotionStagger className="mt-24 grid gap-8 md:grid-cols-3 md:gap-12" delayChildren={0.16}>
        {plans.map((plan) => (
          <MotionItem
            key={plan.name}
            className="group border-t border-[#e5e0d8] pt-8"
          >
            <h2 className="font-serif text-2xl font-normal text-[#1a1a1a]">{plan.name}</h2>
            <p className="mt-4 text-2xl font-light text-[#c17f59]">예시 월 {plan.monthlyFee}</p>
            <ul className="mt-6 space-y-2 text-sm leading-7 text-[#5a5a5a]">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </MotionItem>
        ))}
      </MotionStagger>

      <MotionSection className="mt-24" delay={0.1}>
        <ConsultCtaButton
          className="inline-flex text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-8 py-4 transition-all duration-500 hover:bg-[#9a6347]"
        >
          내게 맞는 요금제 상담받기
        </ConsultCtaButton>
        <SupportPromoNote variant="card" className="max-w-3xl" />
      </MotionSection>
    </main>
  );
}
