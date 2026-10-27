# 스피드 통신 휴대폰 상담 사이트

애플·삼성 기기를 소개하고 상담 신청을 받는 휴대폰 판매 홍보 사이트입니다.
온라인 결제 없이, 고객이 상담을 신청하면 운영자 메일로 바로 알림이 갑니다.

## 구조

- `apps/web` — Next.js 사이트 전체 (Cloudflare Workers 무료 플랜에 배포)
  - 기기 목록: `src/lib/device-catalog.ts` (DB 없이 코드에서 관리)
  - 상담 접수: `POST /api/v1/leads` → 입력 검사 → Turnstile 봇 확인 → Resend로 운영자 메일 발송
  - 백업: 모든 신청을 Cloudflare KV(`LEADS`)에 30일간 보관 후 자동 삭제 (메일 누락·스팸함 대비)
  - 스팸 방지: Cloudflare Turnstile + 봇만 채우는 숨김 `website` 필드
- `.github/workflows/ci.yml` — lint, 테스트, 빌드
- `.github/workflows/device-check.yml` — 매주 월요일 신규 기기 확인 (아래 참고)

## 로컬 실행

```bash
cd apps/web
npm install
npm run dev        # http://localhost:3000
npm test           # 상담 접수·기기 확인 로직 테스트
npm run preview    # Cloudflare 런타임으로 실행 (.dev.vars 필요, .dev.vars.example 참고)
```

## 배포 (Cloudflare Workers)

배포 절차와 환경변수는 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)를 참고하세요.

## 기기 목록 관리

- 추가·삭제: `apps/web/src/lib/device-catalog.ts`의 `appleDevices` / `galaxyDevices` 배열을 수정합니다.
  `main`에 반영되면 자동 배포됩니다.
- 이미지: `apps/web/public/images/devices/`에 넣고 `imageUrl`에 경로를 적습니다. 없으면 "이미지 준비 중"으로 표시됩니다.
- 공식 링크가 없는 모델은 `sourcePage: '#'`로 두면 링크가 숨겨집니다.

### 신규 기기 자동 확인 (반자동)

매주 월요일 오전 9시(KST)에 GitHub Actions가 애플 뉴스룸, 삼성 글로벌·한국 뉴스룸 RSS를 확인합니다.
기기 목록에 없는 iPhone·Galaxy 모델이 보이면 `[기기 후보] 모델명` 이슈를 만듭니다.

- 판매할 모델 → 기기 목록에 추가
- 판매하지 않을 모델 → 이슈를 닫기 (같은 모델은 다시 알리지 않음)

Actions 탭의 **New device check → Run workflow**로 즉시 실행할 수도 있습니다.
통신사 전용 보급형(퀀텀·점프·버디 등)은 뉴스룸에 잘 나오지 않으므로 직접 추가해야 할 수 있습니다.
