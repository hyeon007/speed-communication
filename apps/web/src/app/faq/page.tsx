import { MotionHoverCard, MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';

const faqs = [
  {
    q: '상담 신청 후 언제 연락 오나요?',
    a: '기본적으로 접수 후 24시간 이내 연락드리며, 희망 시간대를 우선 반영합니다.',
  },
  {
    q: '온라인 결제도 가능한가요?',
    a: '현재는 결제 기능 없이 상담 후 안내 방식으로 진행합니다.',
  },
  {
    q: '기기 변경과 번호이동 모두 가능한가요?',
    a: '네, 기기 변경/번호이동/신규 가입 모두 상담 가능합니다.',
  },
  {
    q: '가족 결합 할인도 같이 봐주나요?',
    a: '가능합니다. 현재 회선과 결합 가능 여부를 확인해 절감 폭이 큰 시나리오를 제안합니다.',
  },
  {
    q: '"최대 50만원 지원"은 누구나 동일하게 받을 수 있나요?',
    a: '아니요. 기기/요금제/약정기간/번호이동 여부/가입 시점 등 조건에 따라 달라지며, 상담 과정에서 적용 가능 혜택을 안내드립니다.',
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <MotionSection>
        <header>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-[#c17f59]">FREQUENTLY ASKED QUESTIONS</p>
          <h1 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">자주 묻는 질문</h1>
        </header>
      </MotionSection>

      <MotionStagger className="mt-24 space-y-8" delayChildren={0.1}>
        {faqs.map((item) => (
          <MotionItem key={item.q}>
            <MotionHoverCard className="group border-t border-[#e5e0d8] pt-8 transition-shadow duration-500 hover:shadow-[0_10px_24px_rgba(26,26,26,0.05)]">
              <h2 className="font-serif text-xl font-normal text-[#1a1a1a]">Q. {item.q}</h2>
              <p className="mt-4 text-sm leading-7 text-[#5a5a5a]">A. {item.a}</p>
            </MotionHoverCard>
          </MotionItem>
        ))}
      </MotionStagger>
    </main>
  );
}
