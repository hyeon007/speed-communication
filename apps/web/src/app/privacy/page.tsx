import { MotionItem, MotionSection, MotionStagger } from '@/components/motion-presets';

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <MotionSection>
        <header>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-[#c17f59]">PRIVACY POLICY</p>
          <h1 className="mt-6 font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-5xl">개인정보 처리방침</h1>
          <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">시행일: 2026-10-27</p>
        </header>
      </MotionSection>

      <MotionStagger className="mt-24 border-t border-[#e5e0d8] pt-8 text-sm leading-7 text-[#5a5a5a]" delayChildren={0.08}>
        <MotionItem>
          <p>
            본 서비스는 상담 신청 처리 및 고객 문의 대응을 위해 이름, 연락처, 관심 기기, 상담 유형, 희망 통신사,
            연락 가능 시간을 수집합니다.
          </p>
        </MotionItem>
        <MotionItem className="mt-5">
          <p>
            상담 신청 내용은 접수 즉시 이메일로 운영자에게 전달됩니다. 이를 위해 이메일 발송을 Resend, Inc.(미국)에
            위탁하며, 신청 정보는 발송 시점에 해당 업체의 서버를 거쳐 국외로 이전됩니다. 메일 누락에 대비해 신청
            내용 사본을 웹사이트 운영(호스팅) 업체인 Cloudflare, Inc.(미국)의 저장소에 30일간 보관하며, 30일이
            지나면 자동으로 삭제됩니다.
          </p>
        </MotionItem>
        <MotionItem className="mt-5">
          <p>
            수집된 정보는 상담 목적 외로 사용하지 않으며, 관련 법령 및 내부 보관 정책에 따라 안전하게 관리합니다.
          </p>
        </MotionItem>
        <MotionItem className="mt-5">
          <p>
            이용자는 언제든지 개인정보 열람, 정정, 삭제를 요청할 수 있으며 요청 시 지체 없이 처리합니다.
          </p>
        </MotionItem>
      </MotionStagger>
    </main>
  );
}
