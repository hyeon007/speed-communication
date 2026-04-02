type SupportPromoNoteProps = {
  variant: 'banner' | 'card';
  className?: string;
};

export function SupportPromoNote({ variant, className = '' }: SupportPromoNoteProps) {
  if (variant === 'banner') {
    return (
      <div className={`mt-4 border border-[#e5e0d8] bg-[#f7f4ef] px-4 py-3 ${className}`.trim()}>
        <p className="text-xs leading-6 text-[#5a5a5a]">
          <span className="font-medium text-[#1a1a1a]">최대 50만원 지원 가능</span>
          <span className="ml-2 text-[#8a8a8a]">
            조건 충족 시 적용되며, 상세 기준은 1:1 상담에서 안내됩니다.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-4 border-t border-[#e5e0d8] pt-4 ${className}`.trim()}>
      <p className="text-xs leading-6 text-[#5a5a5a]">
        <span className="text-[#c17f59]">혜택 안내</span>
        <span className="ml-2">최대 50만원 상당 지원 혜택 적용 가능*</span>
      </p>
      <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a]">
        *기기/요금제/통신사/약정기간/번호이동 여부/가입 시점 등 조건에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}
