# Phase 3 — 백엔드 & 문의 시스템 (Week 3~4)

## 기술 스택
- NestJS (Fastify)
- PostgreSQL
- Prisma ORM

## 핵심 기능
1. 상담 신청 등록 API
2. 관리자 문의 목록 조회 API
3. 문의 상태 변경 API (new/in_progress/completed)
4. 기본 스팸 방지 (rate limit + honeypot)

## DB 초안
- `leads(id, name, phone, interest_device, contact_time, status, created_at)`
- `lead_logs(id, lead_id, action, memo, created_at)`

## 완료 기준 (Definition of Done)
- [x] 문의 등록 API 동작
- [x] 관리자 조회 API 동작
- [x] 상태 업데이트 API 동작
- [x] 기본 검증/스팸 방지 동작
