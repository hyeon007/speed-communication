'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ConsultCtaButton } from '@/components/consult-cta-button';
import { MotionHoverCard, MotionImageReveal, MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';
import { SupportPromoNote } from '@/components/support-promo-note';
import { fetchPublishedDevices } from '@/lib/device-api';
import { fallbackDevices, type Device } from '@/lib/device-catalog';

function shouldBypassImageOptimizer(imageUrl: string) {
  return imageUrl.includes('img.us.news.samsung.com');
}

type DeviceSectionProps = {
  title: string;
  items: Device[];
  sectionClassName?: string;
  listClassName?: string;
};

function DeviceSection({ title, items, sectionClassName, listClassName }: DeviceSectionProps) {
  return (
    <section className={`mt-16 ${sectionClassName ?? ''}`.trim()}>
      <h2 className="font-serif text-2xl font-normal text-[#1a1a1a] md:text-3xl">{title}</h2>
      <MotionStagger
        className={`mt-8 grid gap-8 md:grid-cols-2 md:gap-12 ${listClassName ?? ''}`.trim()}
        delayChildren={0.12}
      >
        {items.map((device) => (
          <MotionItem key={device.slug}>
            <MotionHoverCard className="group border-t border-[#e5e0d8] pt-8">
              {device.imageUrl ? (
                <MotionImageReveal className="relative aspect-[16/10] overflow-hidden border border-[#e5e0d8] bg-[#f5f3f0]">
                  <Image
                    src={device.imageUrl}
                    alt={device.name}
                    fill
                    sizes="(min-width: 768px) 45vw, 90vw"
                    unoptimized={shouldBypassImageOptimizer(device.imageUrl)}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </MotionImageReveal>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center border border-[#e5e0d8] bg-[#f5f3f0] px-6 text-center">
                  <p className="text-xs leading-6 text-[#8a8a8a]">이미지 준비 중</p>
                </div>
              )}
              <p className="mt-5 text-xs tracking-[0.15em] uppercase text-[#c17f59]">{device.highlight}</p>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#1a1a1a]">{device.name}</h3>
              <p className="mt-4 text-sm leading-7 text-[#5a5a5a]">
                {device.description ?? '색상과 용량, 개통 가능 여부를 확인한 뒤 고객님의 가입 조건에 맞춰 상담 안내드립니다.'}
              </p>
              {device.colors?.length || device.storageOptions?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {[...(device.colors ?? []), ...(device.storageOptions ?? [])].map((option) => (
                    <span key={option} className="rounded-full border border-[#e5e0d8] px-3 py-1 text-[11px] text-[#5a5a5a]">
                      {option}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <ConsultCtaButton
                  interestDevice={device.name}
                  className="inline-flex bg-[#c17f59] px-6 py-3 text-xs tracking-[0.15em] uppercase text-[#faf9f7] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#9a6347]"
                >
                  당일 조건 상담하기
                </ConsultCtaButton>
                <Link href={`/devices/${device.slug}`} className="gallery-link text-xs tracking-[0.12em] uppercase text-[#5a5a5a]">
                  기기 정보 보기
                </Link>
              </div>
            </MotionHoverCard>
          </MotionItem>
        ))}
      </MotionStagger>
      <SupportPromoNote variant="card" className="mt-8" />
    </section>
  );
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(fallbackDevices);

  useEffect(() => {
    let active = true;

    void fetchPublishedDevices()
      .then((items) => {
        if (active && items.length > 0) {
          setDevices(items);
        }
      })
      .catch(() => {
        // Keep the verified fallback catalog visible if the API is temporarily unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  const appleDevices = devices.filter((device) => device.name.toLowerCase().startsWith('iphone'));
  const galaxyDevices = devices.filter((device) => device.name.toLowerCase().startsWith('galaxy'));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <MotionSection className="max-w-3xl">
        <p className="text-xs font-light tracking-[0.3em] uppercase text-[#c17f59]">DEVICE LINEUP</p>
        <h1 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">기기 라인업</h1>
        <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">
          기기 정보는 확인된 내용으로 안내하고, 출고가·지원금·개통 조건은 고객님의 가입 상황을 확인한 뒤 당일 정책 기준으로 상담해 드립니다.
        </p>
        <SupportPromoNote variant="banner" className="max-w-3xl" />
      </MotionSection>

      <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-16">
        <DeviceSection title="Apple iPhone" items={appleDevices} sectionClassName="mt-0" listClassName="md:grid-cols-1" />
        <DeviceSection title="Samsung Galaxy" items={galaxyDevices} sectionClassName="mt-0" listClassName="md:grid-cols-1" />
      </div>
    </main>
  );
}
