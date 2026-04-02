# 모바일셀렉트 Mobile Promotion Project

애플 스타일의 고급 UI/UX 기반 **휴대폰 판매 홍보 사이트**를 단계별로 구축하는 프로젝트입니다.

## 목표
- 온라인 결제(PG) 없이 문의/전화 신청으로 전환
- 스크롤 중심의 프리미엄 애니메이션 UI
- 직접 운영 가능한 백엔드 + 관리자 문의 처리 흐름

## 단계별 실행
1. Phase 1: 기획/설계 (`docs/phases/phase-1-planning.md`)
2. Phase 2: 프론트엔드 구축 (`docs/phases/phase-2-frontend.md`)
3. Phase 3: 백엔드/문의 시스템 (`docs/phases/phase-3-backend.md`)
4. Phase 4: 배포/운영 (`docs/phases/phase-4-deploy.md`)

## 현재 상태
- [x] 프로젝트 뼈대 디렉토리 생성
- [x] Phase 1~4 상세 실행 문서 생성
- [x] Phase 2 웹앱 초기 스캐폴딩
- [x] Phase 3 백엔드 초기 스캐폴딩
- [x] Phase 4 인프라/CI 파일 작성
- [x] 상담 신청 API + 관리자 JWT 인증
- [x] 관리자 웹 UI(로그인/문의 목록)
- [x] 관리자 문의 고도화(v3): 검색/필터/정렬/페이지네이션/메모/일괄 상태 변경/CSV 내보내기/최근 신규 배지/상태 변경 이력 패널
- [x] 관리자 권한 분리(v4): 편집 가능(editor) / 읽기 전용(viewer)
- [x] 관리자 통계(v5): 요약 카드(전체/신규/진행중/완료/오늘/최근7일) + 통계 API
- [x] 관리자 추세(v6): 기간 선택(7/30일) + 일별 접수 라인 차트
- [x] 관리자 활동 피드(v7): 최근 상태 변경 내역 API + UI 패널
- [x] 관리자 필터 프리셋(v8): 검색/필터/정렬 조건 저장/적용/삭제
- [x] 관리자 권한 세분화(v9): 운영자(operator) 추가 (개별 수정 가능, 일괄 변경 제한)
- [x] 관리자 활동 피드 페이지네이션(v10): 활동 API `page+limit` 응답 메타(count/page/pageSize/totalPages)
- [x] 관리자 API 요청 감사 로깅(v11): 요청자/엔드포인트/결과코드/응답시간 로깅
- [x] 이메일 알림 재시도(v12): 실패 시 설정 기반 재시도(횟수/지연)

## 빠른 실행

```bash
# Web
cd apps/web && npm install && cp .env.example .env.local && npm run dev -- --port 3000

# API
cd apps/api && npm install && cp .env.example .env && PORT=3001 npm run start:dev
```

상세 실행/검증 절차는 `docs/next-steps.md`를 참고하세요.

## API 문서 (Swagger)

- API 서버 실행 후 Swagger UI: `http://127.0.0.1:3001/api/docs`
- Bearer 인증이 필요한 관리자 API는 우측 상단 `Authorize`에서 JWT를 입력해 테스트할 수 있습니다.

```bash
# API 실행
cd apps/api && npm install && cp .env.example .env && PORT=3001 npm run start:dev

# Swagger 열기
open http://127.0.0.1:3001/api/docs
```

## PostgreSQL 전환

- 기본은 `LEAD_STORAGE=memory` (빠른 개발)
- PostgreSQL 사용 시 `apps/api/.env`에서 `LEAD_STORAGE=prisma` + `DATABASE_URL` 설정
- 운영 DB 반영은 `npm run prisma:migrate:deploy` 권장
- 운영 템플릿: `apps/api/.env.production.example` (`LEAD_STORAGE=prisma` 기본값)
- 운영 검증: `npm run prisma:migrate:status`
- 운영 유사 리허설 자동화: `cd apps/api && npm run prisma:rehearse:prod-like`
- 운영 안전장치: `NODE_ENV=production`에서 `LEAD_STORAGE!=prisma` 또는 기본 `JWT_SECRET`이면 API가 부팅되지 않음

## 프론트 성능 점검

- Lighthouse 자동 점검: `cd apps/web && npm run lighthouse:check`
- 리포트: `apps/web/.lighthouse/lighthouse-report.json`

## 운영 롤백

- 롤백 런북: `docs/rollback-runbook.md`

## 운영/배포 문서

- 서버 배포 런북: `docs/server-runbook.md`
- 모니터링 기준: `docs/monitoring-setup.md`
- 백업 정책: `docs/backup-policy.md`
- Phase 4 체크리스트: `docs/phases/phase-4-deploy.md`

## 관리자 UI

- `/admin/login` : 관리자 로그인
- `/admin/leads` : 문의 목록/상태 변경/메모 저장/일괄 상태 변경/CSV 다운로드/최근 신규 건수 표시/문의별 상태 변경 이력 조회
- `/admin/leads` : 문의 목록 상단에 통계 카드(전체/신규/진행중/완료/오늘/최근7일) 표시
- `/admin/leads` : 기간 선택(7/30일) 기반 일별 문의 추세 차트 표시
- `/admin/leads` : 최근 상태 변경 활동 피드(최근 20/50/100건) + 변경자/이전상태/변경후상태/기간 필터 + 새로고침
- `/admin/leads` : 활동 피드 CSV 다운로드 (`/api/v1/admin/leads/activity.csv`)
- `/admin/leads` : 필터 프리셋 저장/적용/삭제(브라우저 로컬 스토리지)
- editor: 조회/개별수정/일괄변경/내보내기 가능
- operator: 조회/개별수정 가능, 일괄변경 제한
- viewer: 조회/내보내기/이력 확인만 가능

## 주요 관리자 API

- `GET /healthz`
- `POST /api/v1/admin/auth/login`
- `GET /api/v1/admin/auth/me`
- `GET /api/v1/admin/leads`
- `GET /api/v1/admin/leads/stats`
- `GET /api/v1/admin/leads/stats/trend?days=7|30`
- `GET /api/v1/admin/leads/activity?limit=20&page=1&changedBy=admin&nextStatus=completed&startDate=2026-04-01&endDate=2026-04-30`
- `GET /api/v1/admin/leads/activity.csv?limit=20&changedBy=admin&nextStatus=completed`
- `PATCH /api/v1/admin/leads/:id/status`
- `PATCH /api/v1/admin/leads/:id/memo`
- `PATCH /api/v1/admin/leads/bulk-status`
- `GET /api/v1/admin/leads/:id/status-audits`
- `GET /api/v1/admin/leads/export.csv`

write 계열 레이트리밋:
- `POST /api/v1/leads`: 분당 10회/IP
- `PATCH /api/v1/admin/leads/:id/status`, `PATCH /api/v1/admin/leads/:id/memo`: 분당 30회/관리자
- `PATCH /api/v1/admin/leads/bulk-status`: 분당 10회/관리자
- `RATE_LIMIT_TRUST_PROXY_HEADER=true`는 신뢰 가능한 프록시에서만 사용
- 현재 레이트리밋은 프로세스 메모리 기반(다중 인스턴스 전역 제한 미보장)

## 운영 알림(Email)

- 선택 기능: `LEAD_NOTIFY_EMAIL_ENABLED=true`일 때 아래 이벤트를 이메일로 전송
  - `lead.created`
  - `lead.status_changed`
  - `lead.bulk_status_changed`
- SMTP 설정: `LEAD_NOTIFY_EMAIL_SMTP_HOST/PORT/SECURE/USER/PASS`
- 메일 설정: `LEAD_NOTIFY_EMAIL_FROM`, `LEAD_NOTIFY_EMAIL_TO`, `LEAD_NOTIFY_EMAIL_SUBJECT_PREFIX`
- 타임아웃: `LEAD_NOTIFY_EMAIL_TIMEOUT_MS` (기본 5000ms, 최대 20000ms)
- 메일 포맷: `text + html` 멀티파트로 전송(운영 메일 클라이언트 가독성 강화)
- 메일 전송 실패 시 본문의/상태변경 처리에는 영향을 주지 않음(운영 안정성 우선)

## 기본 계정 (개발용)

- Editor: `admin / change-me-please`
- Operator: `operator / change-me-operator`
- Viewer: `viewer / change-me-viewer`

환경 변수로 계정 분리 가능:
- `ADMIN_EDITOR_USERNAME`, `ADMIN_EDITOR_PASSWORD`
- `ADMIN_OPERATOR_USERNAME`, `ADMIN_OPERATOR_PASSWORD`
- `ADMIN_VIEWER_USERNAME`, `ADMIN_VIEWER_PASSWORD`
