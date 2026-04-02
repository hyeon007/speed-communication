# Swagger 운영 체크리스트

## 1) 사전 준비

- API 실행: `cd apps/api && npm run start:dev`
- Swagger UI: `http://127.0.0.1:3001/api/docs`
- 인증 토큰 발급: `POST /api/v1/admin/auth/login`

## 2) 권한별 기본 검증

### editor

- `GET /api/v1/admin/auth/me` → role이 `editor`
- `PATCH /api/v1/admin/leads/:id/status` 가능
- `PATCH /api/v1/admin/leads/:id/memo` 가능
- `PATCH /api/v1/admin/leads/bulk-status` 가능

### operator

- `GET /api/v1/admin/auth/me` → role이 `operator`
- `PATCH /api/v1/admin/leads/:id/status` 가능
- `PATCH /api/v1/admin/leads/:id/memo` 가능
- `PATCH /api/v1/admin/leads/bulk-status`는 `403`

### viewer

- 목록/통계/추세/활동/CSV/이력 조회 가능
- 모든 write 계열(`status`, `memo`, `bulk-status`)은 `403`

## 3) 핵심 엔드포인트 확인 순서

1. `POST /api/v1/leads` 문의 생성
2. `GET /api/v1/admin/leads` 목록/필터/정렬/페이지
3. `GET /api/v1/admin/leads/stats` 통계 카드 데이터
4. `GET /api/v1/admin/leads/stats/trend?days=7` 추세
5. `GET /api/v1/admin/leads/activity?limit=20&page=1` 활동 피드 페이지네이션
6. `PATCH /api/v1/admin/leads/:id/status` 상태 변경
7. `PATCH /api/v1/admin/leads/:id/memo` 메모 변경
8. `PATCH /api/v1/admin/leads/bulk-status` 일괄 상태 변경
9. `GET /api/v1/admin/leads/:id/status-audits` 감사 이력
10. CSV 다운로드 (`/export.csv`, `/activity.csv`)

## 4) 레이트리밋 검증

- `POST /api/v1/leads`: 분당 10회/IP, 초과 시 `429`
- 관리자 개별 수정: 분당 30회/관리자
- 관리자 일괄 수정: 분당 10회/관리자

## 5) 마이그레이션/DB 검증

- `npm run prisma:rehearse:prod-like`
- `npm run prisma:migrate:status`가 up-to-date인지 확인

## 6) 실패 시 점검 포인트

- 401: 토큰 만료/누락
- 403: 권한 역할 불일치
- 429: 레이트리밋 정책 충돌
- 500: DB 연결, 환경변수, SMTP 설정 확인
