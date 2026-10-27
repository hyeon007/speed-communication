'use client';

import Link from 'next/link';
import { useConsultModal } from '@/components/consult-modal-provider';
import { ConsultCtaButton } from '@/components/consult-cta-button';
import { HeroShowcase } from '@/components/hero-showcase';
import { MotionHoverCard, MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';
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
              상담 신청 접수
            </button>
          </nav>
        </header>

        <HeroShowcase />

        <MotionStagger className="mt-24 grid gap-8 md:mt-32 md:grid-cols-3 md:gap-12" delayChildren={0.15}>
          {[
            { title: '기기 추천', desc: '사용 패턴에 맞춘 모델·용량·색상 추천' },
            { title: '요금 최적화', desc: '사용 패턴에 맞춘 요금제 비교·제안' },
            { title: '빠른 연결', desc: '접수 확인 후 24시간 내 후속 연락 진행' },
          ].map((item) => (
            <MotionItem key={item.title}>
              <MotionHoverCard className="group border-t border-[#e5e0d8] pt-8 transition-shadow duration-500 hover:shadow-[0_12px_28px_rgba(26,26,26,0.05)]">
                <h2 className="font-serif text-2xl font-normal text-[#1a1a1a]">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#5a5a5a]">{item.desc}</p>
              </MotionHoverCard>
            </MotionItem>
          ))}
        </MotionStagger>

        <MotionSection className="mt-24 border-t border-[#e5e0d8] pt-16 md:mt-32 md:pt-24" delay={0.1}>
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.3em] uppercase text-[#c17f59]">상담 신청 접수</p>
            <h3 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-4xl">
              지금 바로 상담 신청을 접수해보세요
            </h3>
            <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">
              온라인 결제 없이 간단히 접수하면, 내부 확인 후 조건 비교부터 개통 방향까지 순차적으로 안내해드립니다.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ConsultCtaButton
                className="text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-8 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#9a6347]"
              >
                상담 신청 접수하기
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
      </main>
    </>
  );
}
