# Phase 2 — 프론트엔드 MVP (Week 2~3)

## 기술 스택
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger
- Framer Motion (마이크로 인터랙션)

## 우선 구현 순서
1. 공통 레이아웃 (Header/Footer/Container)
2. 홈 Hero 섹션 (프리미엄 비주얼 + 메인 CTA)
3. 제품 카드 섹션
4. 상담 폼 페이지(`/consult`)
5. 반응형 및 접근성 보완

## 애니메이션 원칙
- `transform`, `opacity` 중심
- 스크롤 스토리텔링은 과하지 않게
- `prefers-reduced-motion` 대응

## 완료 기준 (Definition of Done)
- [x] 홈/상담 페이지 완성
- [x] 주요 애니메이션 적용
- [x] 모바일 반응형 완료
- [x] Lighthouse 핵심 지표 확인 (`npm run lighthouse:check`)
