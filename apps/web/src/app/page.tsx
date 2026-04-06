'use client';

import Link from 'next/link';
import { useConsultModal } from '@/components/consult-modal-provider';
import { ConsultCtaButton } from '@/components/consult-cta-button';
import { HeroShowcase } from '@/components/hero-showcase';
import { MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';
import { contactPhoneHref, siteConfig } from '@/lib/site-config';

export default function Home() {
  const { openConsultModal } = useConsultModal();

  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
        <header className="mb-16 flex items-center justify-between md:mb-24">
          <p className="text-xs font-light tracking-[0.3em] uppercase text-[#5a5a5a]">{siteConfig.name}</p>
          <nav className="flex flex-wrap items-center justify-end gap-6">
            <Link
              href="/devices"
              className="gallery-link text-xs tracking-[0.15em] uppercase text-[#5a5a5a] transition-colors duration-500 hover:text-[#1a1a1a]"
            >
              기기 라인업
            </Link>
            <Link
              href="/plans"
              className="gallery-link text-xs tracking-[0.15em] uppercase text-[#5a5a5a] transition-colors duration-500 hover:text-[#1a1a1a]"
            >
              요금제
            </Link>
            <Link
              href="/compare"
              className="gallery-link text-xs tracking-[0.15em] uppercase text-[#5a5a5a] transition-colors duration-500 hover:text-[#1a1a1a]"
            >
              비교
            </Link>
            <button
              type="button"
              onClick={() => openConsultModal()}
              className="text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-6 py-3 transition-all duration-500 hover:bg-[#9a6347]"
            >
              무료 상담 신청
            </button>
          </nav>
        </header>

      <HeroShowcase />

      <MotionStagger className="mt-24 grid gap-8 md:mt-32 md:grid-cols-3 md:gap-12" delayChildren={0.15}>
        {[
          { title: '기기 추천', desc: '사용 패턴에 맞춘 모델·용량·색상 추천' },
          { title: '요금 최적화', desc: '통신 패턴 기반 가장 유리한 요금제 제안' },
          { title: '빠른 연결', desc: '신청 후 24시간 내 상담 연락 보장' },
        ].map((item) => (
          <MotionItem key={item.title} className="group border-t border-[#e5e0d8] pt-8">
            <h2 className="font-serif text-2xl font-normal text-[#1a1a1a]">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-[#5a5a5a]">{item.desc}</p>
          </MotionItem>
        ))}
      </MotionStagger>

      <MotionSection className="mt-24 border-t border-[#e5e0d8] pt-16 md:mt-32 md:pt-24" delay={0.1}>
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c17f59]">전문가 상담</p>
          <h3 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-4xl">
            지금 바로 전문가 상담을 받아보세요
          </h3>
          <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">
            PG 결제 없이 간단히 신청하면, 조건 비교부터 개통 전략까지 직접 안내해드립니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ConsultCtaButton
              className="text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-8 py-4 transition-all duration-500 hover:bg-[#9a6347]"
            >
              상담 신청하기
            </ConsultCtaButton>
            <a
              href={contactPhoneHref}
              className="gallery-link text-xs tracking-[0.15em] uppercase text-[#5a5a5a] px-8 py-4 transition-colors duration-500 hover:text-[#1a1a1a]"
            >
              전화 문의 {siteConfig.contactPhone}
            </a>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="mt-24 border-t border-[#e5e0d8] pt-16 md:mt-32 md:pt-24" delay={0.1}>
        <div className="mb-12 md:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c17f59]">고객 후기</p>
          <h3 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-4xl">
            실제 고객들의 이야기
          </h3>
        </div>

        <MotionStagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-2" delayChildren={0.15}>
          {[
            {
              quote: "복잡한 요금제 비교를 한 번에 해결해주셨어요. 제 사용 패턴에 딱 맞는 요금제로 변경해서 매달 3만원이나 절약했네요.",
              author: "김민수",
              role: "직장인",
            },
            {
              quote: "신규 개통이라 처음엔 걱정했는데, 상담사분이 자세히 설명해주셔서 안심하고 진행할 수 있었습니다. 진행도 빠르고 만족해요.",
              author: "이서연",
              role: "대학생",
            },
            {
              quote: "기기 선택부터 요금제까지 A to Z로 도와주셔서 시간을 많이 아꼈어요. 전문가 상담이 이렇게 중요한 줄 몰랐습니다.",
              author: "박준혁",
              role: "사업자",
            },
            {
              quote: "기존 통신사에서 변경하는 게 복잡할 줄 알았는데, 상담 한 번으로 깔끔하게 처리됐어요. 정말 편했습니다.",
              author: "정유진",
              role: "프리랜서",
            },
          ].map((review) => (
            <MotionItem
              key={review.author}
              className="group relative border border-[#e5e0d8] p-8 transition-all duration-500 hover:border-[#c17f59] hover:shadow-lg"
            >
               <div className="absolute top-6 left-6 text-6xl font-serif text-[#e5e0d8] leading-none">“</div>
              <blockquote className="relative pt-8">
                <p className="text-sm leading-7 text-[#3a3a3a] mb-6">
                  {review.quote}
                </p>
                <footer className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#e5e0d8] flex items-center justify-center">
                    <span className="text-xs font-medium text-[#5a5a5a]">
                      {review.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <cite className="not-italic text-sm font-medium text-[#1a1a1a]">
                      {review.author}
                    </cite>
                    <p className="text-xs text-[#8a8a8a]">{review.role}</p>
                  </div>
                </footer>
              </blockquote>
            </MotionItem>
          ))}
        </MotionStagger>
      </MotionSection>
    </main>
  </>
  );
}
