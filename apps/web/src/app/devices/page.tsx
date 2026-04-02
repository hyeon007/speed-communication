import Image from 'next/image';
import Link from 'next/link';
import { SupportPromoNote } from '@/components/support-promo-note';
import { appleDevices, galaxyDevices, type Device } from '@/lib/device-catalog';

const visibleGalaxyDevices = galaxyDevices.filter((device) => Boolean(device.imageUrl));

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
      <div className={`mt-8 grid gap-8 md:grid-cols-2 md:gap-12 ${listClassName ?? ''}`.trim()}>
        {items.map((device, index) => (
          <article
            key={device.name}
            className="group border-t border-[#e5e0d8] pt-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${0.25 + index * 0.08}s` }}
          >
            {device.imageUrl ? (
              <div className="relative aspect-[16/10] overflow-hidden border border-[#e5e0d8] bg-[#f5f3f0]">
                <Image
                  src={device.imageUrl}
                  alt={device.name}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  unoptimized={shouldBypassImageOptimizer(device.imageUrl)}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center border border-[#e5e0d8] bg-[#f5f3f0] px-6 text-center">
                <p className="text-xs leading-6 text-[#8a8a8a]">
                  공식 이미지는 미디어 페이지에서 확인 가능합니다.
                </p>
              </div>
            )}
            <p className="mt-5 text-xs tracking-[0.15em] uppercase text-[#c17f59]">{device.highlight}</p>
            <h3 className="mt-2 font-serif text-2xl font-normal text-[#1a1a1a]">{device.name}</h3>
            <p className="mt-4 text-sm leading-7 text-[#5a5a5a]">
              지원 혜택은 조건별로 달라지며, 최대 50만원 상당 혜택 가능 여부를 상담 시점 기준으로 안내드립니다.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/consult"
                className="inline-flex text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-6 py-3 transition-all duration-500 hover:bg-[#9a6347]"
              >
                이 기기 상담하기
              </Link>
              <a
                href={device.sourcePage}
                target="_blank"
                rel="noreferrer"
                className="gallery-link text-xs tracking-[0.12em] uppercase text-[#5a5a5a]"
              >
                공식 페이지 보기
              </a>
            </div>
          </article>
        ))}
      </div>
      <SupportPromoNote variant="card" className="mt-8" />
    </section>
  );
}

export default function DevicesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <header className="max-w-3xl">
        <p className="text-xs font-light tracking-[0.3em] uppercase text-[#c17f59]">DEVICE LINEUP</p>
        <h1 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">기기 라인업</h1>
        <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">
          애플은 iPhone 17~14 전체 라인업을, 갤럭시는 공식 이미지 검증 모델을 기준으로 노출합니다.
        </p>
        <SupportPromoNote variant="banner" className="max-w-3xl" />
      </header>

      <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-16">
        <DeviceSection
          title="Apple (iPhone 17~14 전체 라인업)"
          items={appleDevices}
          sectionClassName="mt-0"
          listClassName="md:grid-cols-1"
        />
        <DeviceSection
          title="Samsung Galaxy (공식 이미지 검증 모델)"
          items={visibleGalaxyDevices}
          sectionClassName="mt-0"
          listClassName="md:grid-cols-1"
        />
      </div>
    </main>
  );
}
