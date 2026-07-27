# 운영 배포 준비 안내

## 현재 상태

- Vercel 웹 프로젝트 `speed-communication-web`은 생성되어 있습니다.
- 웹 확인 주소는 `https://speed-communication-web.vercel.app`입니다.
- Nest API와 PostgreSQL은 아직 운영 서버가 없으므로, 상담 접수 기능은 아직 공개하면 안 됩니다.
- 실제 운영은 **Vercel 웹 + Docker API/PostgreSQL** 구조를 기준으로 합니다.
- Vercel에 `NEXT_PUBLIC_API_ORIGIN`이 없을 때는 상담 폼을 의도적으로 비활성화하므로 전화번호가 저장되지 않은 채 전송되지 않습니다.

## 도메인 구매 전

1. Docker를 실행할 서버를 준비합니다. 공인 HTTPS 주소가 필요하며, Vercel 웹에서 접근할 수 있어야 합니다.
2. 서버의 프로젝트 루트에서 `.env.production.example`을 `.env.production`으로 복사합니다.
3. 모든 `replace-with-...` 값을 길고 무작위인 실제 값으로 교체합니다. `.env.production`은 Git에 올리지 않습니다.
   운영 API 문서는 기본적으로 비활성화되며, 특별히 필요한 경우에만 `ENABLE_SWAGGER=true`으로 설정합니다.
4. GitHub Actions가 만든 이미지의 커밋 SHA를 `IMAGE_TAG`에 넣습니다.
5. `CORS_ALLOWED_ORIGINS`에는 현재 Vercel 주소를 유지합니다.
6. 서버에서 `docker compose --env-file .env.production -f docker-compose.production.yml up -d`를 실행합니다.

`migrate` 컨테이너가 PostgreSQL이 준비된 뒤 `prisma migrate deploy`를 먼저 실행합니다. 성공해야 API 컨테이너가 시작됩니다. 이 명령은 운영용 마이그레이션만 적용하며 DB를 초기화하지 않습니다.

## API를 Vercel 웹에 연결하기

API의 HTTPS 주소가 준비되면 Vercel 프로젝트 `speed-communication-web`에 아래 환경변수를 Production과 Preview 모두에 추가합니다.

```text
NEXT_PUBLIC_API_ORIGIN=https://api.example.com
```

그 다음 Vercel을 다시 배포하고 아래를 확인합니다.

1. `https://speed-communication-web.vercel.app/devices`가 보인다.
2. 상담 신청 1건을 보낸다.
3. API의 `/api/v1/admin/leads`에서 상담 건과 가입 유형·희망 통신사가 보인다.
4. `/admin/devices`에서 기기 초안 공개·비공개를 확인한다.

## 도메인을 구매한 뒤

1. Vercel의 `speed-communication-web` 프로젝트에 루트 도메인과 `www`를 각각 추가합니다.
2. Vercel이 표시하는 DNS 레코드를 도메인 판매처에 등록합니다. 루트 도메인은 일반적으로 A 레코드, `www`는 CNAME을 사용하지만 실제 값은 Vercel 표시값을 따릅니다.
3. `www` 또는 루트 중 하나를 대표 주소로 정하고 나머지는 리디렉션합니다.
4. API는 `api.<도메인>` 같은 별도 HTTPS 주소로 연결합니다.
5. API 서버의 `.env.production`에서 `CORS_ALLOWED_ORIGINS`에 새 웹 주소를 추가하고, Vercel의 `NEXT_PUBLIC_API_ORIGIN`을 API 주소로 바꿉니다.
6. Vercel SSL 발급과 API HTTPS 인증서가 모두 완료된 뒤 상담 접수·관리자 로그인·기기 관리를 다시 점검합니다.

Vercel 도메인 화면은 도메인을 추가한 후 필요한 정확한 DNS 레코드를 보여 줍니다. DNS가 외부 도메인 판매처에 있다면 그 판매처에서 레코드를 추가합니다.
