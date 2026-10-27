import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConsultCtaButton } from '@/components/consult-cta-button';
import { MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';
import { SupportPromoNote } from '@/components/support-promo-note';
import { allDevices, findDevice } from '@/lib/device-catalog';

function DetailList({ title, items, fallback }: { title: string; items?: string[]; fallback: string }) {
  return (
    <section className="border-t border-[#e5e0d8] pt-6">
      <h2 className="text-xs tracking-[0.18em] uppercase text-[#c17f59]">{title}</h2>
      {items?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full border border-[#e5e0d8] px-3 py-1.5 text-sm text-[#5a5a5a]">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-[#5a5a5a]">{fallback}</p>
      )}
    </section>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return allDevices.map((device) => ({ slug: device.slug }));
}

export default async function DeviceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const device = findDevice(slug);

  if (!device) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <Link href="/devices" className="text-xs tracking-[0.15em] uppercase text-[#c17f59]">← DEVICE LINEUP</Link>
      <MotionStagger className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]" delayChildren={0.08}>
        <MotionItem>
          <div className="relative aspect-[4/3] overflow-hidden border border-[#e5e0d8] bg-[#f5f3f0]">
            {device.imageUrl ? (
              <Image src={device.imageUrl} alt={device.name} fill sizes="(min-width: 1024px) 52vw, 90vw" className="object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center px-6 text-center text-sm text-[#8a8a8a]">이미지 준비 중</div>
            )}
          </div>
        </MotionItem>
        <MotionItem>
          <MotionSection delay={0.04}>
            <p className="text-xs tracking-[0.18em] uppercase text-[#c17f59]">DEVICE INFORMATION</p>
            <h1 className="mt-5 font-serif text-4xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">{device.name}</h1>
            <p className="mt-5 text-sm leading-7 text-[#c17f59]">{device.highlight}</p>
            <p className="mt-6 text-sm leading-8 text-[#5a5a5a]">
              {device.description ?? '기기 옵션과 개통 가능 여부를 확인한 뒤, 고객님의 가입 조건에 맞춰 상담 안내드립니다.'}
            </p>
            <div className="mt-8">
              <ConsultCtaButton interestDevice={device.name} className="inline-flex bg-[#c17f59] px-7 py-4 text-xs tracking-[0.15em] uppercase text-[#faf9f7] transition hover:bg-[#9a6347]">
                이 기기 당일 조건 문의하기
              </ConsultCtaButton>
            </div>
            <p className="mt-4 text-xs leading-6 text-[#8a8a8a]">출고가·지원금·월 납부금은 가입 유형과 통신사를 확인한 뒤 당일 정책 기준으로 안내드립니다.</p>
          </MotionSection>
        </MotionItem>
      </MotionStagger>

      <div className="mt-16 grid gap-10 md:grid-cols-3">
        <DetailList title="COLOR" items={device.colors} fallback="판매 가능한 색상은 재고와 개통 조건을 확인한 뒤 안내드립니다." />
        <DetailList title="STORAGE" items={device.storageOptions} fallback="선택 가능한 용량은 상담 시 최신 재고 기준으로 확인해 드립니다." />
        <DetailList title="HIGHLIGHTS" items={device.highlights} fallback="핵심 사용 목적과 필요한 옵션을 남겨주시면 알맞게 안내드립니다." />
      </div>

      {device.sourcePage !== '#' ? (
        <a href={device.sourcePage} target="_blank" rel="noreferrer" className="mt-12 text-xs tracking-[0.15em] uppercase text-[#5a5a5a] underline decoration-[#c17f59] underline-offset-4">
          제조사 공식 정보 보기
        </a>
      ) : null}
      <SupportPromoNote variant="card" className="mt-8" />
    </main>
  );
}
