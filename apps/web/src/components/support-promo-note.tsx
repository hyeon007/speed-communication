type SupportPromoNoteProps = {
  variant: 'banner' | 'card';
  className?: string;
};

export function SupportPromoNote({ variant, className = '' }: SupportPromoNoteProps) {
  if (variant === 'banner') {
    return (
      <div className={`mt-4 border border-[#e5e0d8] bg-[#f7f4ef] px-4 py-3 ${className}`.trim()}>
        <p className="text-xs leading-6 text-[#5a5a5a]">
          <span className="font-medium text-[#1a1a1a]">당일 정책 맞춤 상담</span>
          <span className="ml-2 text-[#8a8a8a]">
            기기와 가입 조건을 확인한 뒤 현재 기준으로 안내드립니다.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-4 border-t border-[#e5e0d8] pt-4 ${className}`.trim()}>
      <p className="text-xs leading-6 text-[#5a5a5a]">
        <span className="text-[#c17f59]">상담 안내</span>
        <span className="ml-2">기기와 가입 조건을 확인한 뒤 맞춤 안내드립니다.</span>
      </p>
      <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a]">
        *가격·지원금·개통 조건은 기기, 요금제, 통신사, 가입 유형과 시점에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}
