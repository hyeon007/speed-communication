# Server Deploy Runbook (No production secrets in repo)

이 문서는 실운영 비밀번호를 저장하지 않고 배포 절차만 표준화합니다.

## 1) 서버 사전 준비

- Docker Engine + Docker Compose plugin 설치
- `/opt/sp` 디렉토리 생성
- 서버 `.env` 파일 준비 (`/opt/sp/.env`)  
  - `DATABASE_URL`, `JWT_SECRET`, `ADMIN_*`, `LEAD_NOTIFY_EMAIL_SMTP_*` 등은 서버에서만 관리
- TLS 파일 준비 (`/opt/sp/infra/nginx/ssl/fullchain.pem`, `/opt/sp/infra/nginx/ssl/privkey.pem`)

GitHub Actions 원격 배포를 사용할 경우 아래 Secrets가 필요합니다.

- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_KEY` (SSH private key)
- `GHCR_USERNAME`
- `GHCR_READ_TOKEN` (GHCR pull 권한)

## 2) 최초 배포

```bash
sudo mkdir -p /opt/sp
sudo chown -R $USER:$USER /opt/sp
cd /opt/sp
```

GitHub Actions `deploy.yml` 또는 수동 복사로 아래 파일이 `/opt/sp`에 있어야 합니다.

- `docker-compose.production.yml`
- `infra/nginx/default.prod.conf`
- `.env`

배포 전 사전검증:

```bash
cd /opt/sp
test -f .env
test -f infra/nginx/ssl/fullchain.pem
test -f infra/nginx/ssl/privkey.pem
```

## 3) 배포 실행

```bash
cd /opt/sp
docker compose -f docker-compose.production.yml pull web api nginx
docker compose -f docker-compose.production.yml up -d --remove-orphans --no-build
```

## 4) 배포 후 점검

```bash
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=200 nginx api web
```

기본 확인 포인트:

- Nginx `/healthz` 응답 200
- API Swagger `/api/docs` 접근 가능
- Web 메인 페이지 렌더링 정상

## 5) DB 마이그레이션 반영

```bash
cd /opt/sp
docker compose -f docker-compose.production.yml exec api npm run prisma:migrate:deploy
```

## 6) 롤백

롤백 기준/절차는 `docs/rollback-runbook.md`를 사용합니다.
