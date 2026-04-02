# Next Steps (실행 가이드)

## 1) 로컬 실행

### Web
```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev -- --port 3000
```

### API
```bash
cd apps/api
npm install
cp .env.example .env
PORT=3001 npm run start:dev
```

### Swagger 문서 확인

```bash
open http://127.0.0.1:3001/api/docs
curl -I http://127.0.0.1:3001/api/docs
```

> API 문서는 Web 앱(3000)이 아니라 API 서버(3001)에서 제공됩니다.

## 2) API 스모크 테스트

```bash
curl -X POST http://127.0.0.1:3001/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","phone":"01012345678","interestDevice":"iPhone 17 Pro","contactTime":"19:00~20:00"}'

TOKEN=$(curl -s -X POST http://127.0.0.1:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"change-me-please"}' | jq -r '.accessToken')

VIEWER_TOKEN=$(curl -s -X POST http://127.0.0.1:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer","password":"change-me-viewer"}' | jq -r '.accessToken')

OPERATOR_TOKEN=$(curl -s -X POST http://127.0.0.1:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"change-me-operator"}' | jq -r '.accessToken')

curl http://127.0.0.1:3001/api/v1/admin/leads \
  -H "Authorization: Bearer $TOKEN"

curl http://127.0.0.1:3001/api/v1/admin/leads/stats \
  -H "Authorization: Bearer $TOKEN"

curl "http://127.0.0.1:3001/api/v1/admin/leads/stats/trend?days=7" \
  -H "Authorization: Bearer $TOKEN"

curl "http://127.0.0.1:3001/api/v1/admin/leads/activity?limit=20" \
  -H "Authorization: Bearer $TOKEN"

curl "http://127.0.0.1:3001/api/v1/admin/leads/activity?limit=50&changedBy=admin&nextStatus=completed" \
  -H "Authorization: Bearer $TOKEN"

curl "http://127.0.0.1:3001/api/v1/admin/leads/activity.csv?limit=50&changedBy=admin" \
  -H "Authorization: Bearer $TOKEN"

curl http://127.0.0.1:3001/api/v1/admin/auth/me \
  -H "Authorization: Bearer $VIEWER_TOKEN"

curl -X PATCH http://127.0.0.1:3001/api/v1/admin/leads/bulk-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ids":[1,2],"status":"in_progress"}'

curl "http://127.0.0.1:3001/api/v1/admin/leads/1/status-audits?limit=10" \
  -H "Authorization: Bearer $TOKEN"

curl "http://127.0.0.1:3001/api/v1/admin/leads/export.csv?sortBy=createdAt&sortDirection=desc" \
  -H "Authorization: Bearer $TOKEN"

# viewer는 수정 액션 불가(403)
curl -X PATCH http://127.0.0.1:3001/api/v1/admin/leads/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -d '{"status":"completed"}'

# operator는 개별 수정 가능
curl -X PATCH http://127.0.0.1:3001/api/v1/admin/leads/1/memo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -d '{"memo":"operator memo"}'

# operator의 일괄 변경은 제한(403)
curl -X PATCH http://127.0.0.1:3001/api/v1/admin/leads/bulk-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -d '{"ids":[1,2],"status":"completed"}'
```

### (선택) 이메일 알림 테스트

```bash
# apps/api/.env
# LEAD_NOTIFY_EMAIL_ENABLED=true
# LEAD_NOTIFY_EMAIL_SMTP_HOST=smtp.example.com
# LEAD_NOTIFY_EMAIL_SMTP_PORT=587
# LEAD_NOTIFY_EMAIL_SMTP_SECURE=false
# LEAD_NOTIFY_EMAIL_SMTP_USER=...
# LEAD_NOTIFY_EMAIL_SMTP_PASS=...
# LEAD_NOTIFY_EMAIL_FROM=noreply@example.com
# LEAD_NOTIFY_EMAIL_TO=ops@example.com

curl -X POST http://127.0.0.1:3001/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"알림테스트","phone":"01033334444","interestDevice":"iPhone 16 Pro","contactTime":"저녁"}'

# lead.created 이메일 전송됨
```

## 3) 관리자 웹 UI

- 로그인 페이지: `http://127.0.0.1:3000/admin/login`
- 문의 목록 페이지: `http://127.0.0.1:3000/admin/leads`
- 문의 목록 기능: 검색, 상태/기간 필터, 정렬, 페이지 번호 네비게이션, 상세 메모 저장, 일괄 상태 변경, CSV 다운로드, 최근 24시간 신규 건수
- 상단 통계 카드: 전체/신규/진행중/완료/오늘/최근7일 (`GET /api/v1/admin/leads/stats`)
- 추세 차트: 기간 선택(최근 7일/30일) 일별 문의 건수 (`GET /api/v1/admin/leads/stats/trend`)
- 최근 활동 패널: 상태 변경 최근 20/50/100건 조회 + 변경자/이전상태/변경후상태/기간 필터 (`GET /api/v1/admin/leads/activity`)
- 최근 활동 내보내기: 활동 피드 CSV 다운로드 (`GET /api/v1/admin/leads/activity.csv`)
- 필터 프리셋: 현재 검색/필터/정렬 조건을 저장/적용/삭제 (브라우저 로컬 스토리지)
- 감사 로그 API/UI: 상태 변경 시 `changedBy`, `changedAt` 기록 조회 가능(문의 카드에서 이력 불러오기)
- 권한 분리: editor(수정 가능), viewer(조회/다운로드/이력만 가능)
- 권한 분리: editor(전체 수정/일괄변경), operator(개별 수정), viewer(조회/다운로드/이력)
- 운영 알림: 이메일 설정 시 신규 문의/상태 변경 이벤트 전송
- 이메일 본문: text + html 멀티파트로 전송

기본 관리자 계정(.env.example 기준):
- `username`: `admin`
- `password`: `change-me-please`
- `username`: `operator`
- `password`: `change-me-operator`

## 4) 다음 구현 우선순위
1. Prisma 마이그레이션 실행 후 `LEAD_STORAGE=prisma`로 운영 전환 (`apps/api/.env.production.example` 기준)
2. Nginx + HTTPS 실서버 구성
3. 문의 완료 알림(Slack/문자) 연동
4. 관리자 감사 로그 내보내기/고급 검색(누가/언제 상태 변경했는지) 추가
5. 관리자 권한 세분화(예: 조회/편집/운영) 확장

## 5) PostgreSQL 전환 절차 (권장)

```bash
cd apps/api
cp .env.production.example .env

# .env 수정
# LEAD_STORAGE=prisma (운영 기본값)
# DATABASE_URL=postgresql://...

npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate:status

# 운영 반영(권장): migrations 기반
npm run prisma:migrate:deploy

# 개발 빠른 반영(주의): schema 직접 push
# npm run prisma:push
```

> MCP(Context7) 기준: 운영/스테이징은 `migrate deploy`를 권장하고,
> `db push`는 개발/프로토타이핑에서 사용하는 것이 안전합니다.

> 운영 안전장치: `NODE_ENV=production`에서
> `LEAD_STORAGE!=prisma` 또는 기본 `JWT_SECRET` 사용 시 API가 부팅 실패하도록 구성되어 있습니다.

## 6) 배포 전 체크
- [x] Web lint/build 통과
- [x] API lint/test/build 통과
- [x] Lighthouse 자동 점검 통과 (`cd apps/web && npm run lighthouse:check`)
- [x] 문의 등록/조회/통계/추세/활동피드/상태변경/일괄변경/감사로그/CSV 동작 확인
- [x] 개인정보 처리방침/이용약관 페이지 추가
- [ ] 실운영 전화번호 반영

## 7) 다음 작업 백로그(저장용)

### P0 (바로 진행 가능)
- [x] 관리자 활동 피드 API 페이징 추가 (`cursor` 또는 `page` 기반)
- [x] 활동 피드 필터 조합별 API 통합 테스트 케이스 확장
- [x] 권한별 정책 테스트 보강(editor/operator/viewer) + 회귀 테스트 정리

### P1 (운영 안정성 강화)
- [x] 관리자 API 요청 로깅/감사로그 확장(요청자/엔드포인트/결과 코드)
- [x] 관리자 write 계열 API 레이트리밋 적용(브루트포스/오남용 방지)
  - `POST /api/v1/leads`: 1분 10회/IP
  - `PATCH /api/v1/admin/leads/:id/status`, `/memo`: 1분 30회/관리자 계정
  - `PATCH /api/v1/admin/leads/bulk-status`: 1분 10회/관리자 계정
  - `RATE_LIMIT_TRUST_PROXY_HEADER=true`는 신뢰 가능한 프록시 환경에서만 사용
  - 현재 구현은 프로세스 메모리 기반이며, 다중 인스턴스 전역 제한은 보장하지 않음
- [x] 이메일 알림 실패율/재시도 정책(선택) 추가

### P2 (운영 전환 직전)
- [x] `LEAD_STORAGE=prisma` 기준 데이터 마이그레이션 리허설
  - 자동화 스크립트: `cd apps/api && npm run prisma:rehearse:prod-like`
- [x] PostgreSQL 인덱스 점검(조회 필드: status, createdAt, changedAt)
- [x] Swagger 운영 체크리스트 문서화(권한별 호출 예시 포함)
  - 문서: `docs/swagger-ops-checklist.md`

### P3 (운영 반영 시, 사용자 정보 필요)
- [ ] 실운영 DB 접속정보 반영 (`DATABASE_URL`)
- [ ] 실운영 SMTP 계정/수신자 반영
- [ ] 도메인/HTTPS/Nginx 배포 설정
  - [x] 템플릿 선반영: `infra/nginx/default.prod.conf`, `infra/nginx/ssl/README.md`

### Phase 4 선행 작업 (실운영 정보 제외)
- [x] 배포 자동화 워크플로우 초안 작성 (`.github/workflows/deploy.yml`)
- [x] 프로덕션 컴포즈 오버라이드 작성 (`docker-compose.production.yml`)
- [x] Nginx HTTPS 템플릿 작성 (`infra/nginx/default.prod.conf`)
- [x] 서버 배포 런북 문서화 (`docs/server-runbook.md`)
- [x] 모니터링 기준 문서화 (`docs/monitoring-setup.md`)
- [x] 백업 정책 문서화 (`docs/backup-policy.md`)
