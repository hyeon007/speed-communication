# Phase 4 — 배포 & 운영 (Week 5~6)

## 인프라 개요
- Nginx Reverse Proxy
- Frontend (Next.js)
- Backend (NestJS)
- PostgreSQL

## 운영 항목
1. Docker 기반 실행
2. HTTPS(SSL) 적용
3. CI/CD (lint/test/build/deploy) + Lighthouse 점검
4. 모니터링 (에러/응답시간/가용성)
5. 백업 정책

## 실운영 정보 없이 선행 가능한 항목
- [x] 배포 자동화 워크플로우 초안 작성 (`.github/workflows/deploy.yml`)
- [x] 프로덕션 오버라이드 컴포즈 작성 (`docker-compose.production.yml`)
- [x] HTTPS 리버스 프록시 템플릿 작성 (`infra/nginx/default.prod.conf`)
- [x] 서버 배포 런북 문서화 (`docs/server-runbook.md`)
- [x] 모니터링 기준 문서화 (`docs/monitoring-setup.md`)
- [x] 백업 정책 문서화 (`docs/backup-policy.md`)
- [x] 배포 사전검증 게이트 반영 (`.env` + TLS 인증서 파일 존재 확인)

## 실운영 정보가 있어야 완료되는 항목
- 실제 도메인/인증서 경로 반영
- 배포 서버 SSH 접속 정보 반영
- 실운영 DATABASE_URL 반영
- 실운영 SMTP 계정/수신자 반영

## 완료 기준 (Definition of Done)
- [ ] 운영 서버에서 정상 기동
- [ ] 배포 자동화 파이프라인 동작 (워크플로우 작성 완료, 실서버 시크릿 주입 필요)
- [ ] 문의 플로우 실서버 검증 완료
- [x] 롤백 절차 문서화 (`docs/rollback-runbook.md`)
