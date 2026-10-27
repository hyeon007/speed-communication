# 배포 (Cloudflare Workers 무료 플랜)

사이트는 `apps/web` 하나만 Cloudflare Workers에 배포합니다. 서버·DB가 없어서 무료 플랜 한도
(하루 10만 요청, Worker 압축 크기 3MB)에 들어갑니다. 현재 Worker 크기는 압축 기준 약 1.15MB입니다.

## 1. 메일 발송 준비 (Resend)

1. [resend.com](https://resend.com)에 **상담 알림을 받을 메일 주소**로 가입합니다.
2. API Keys에서 키를 만듭니다.
3. 도메인이 없으면 발신 주소는 `onboarding@resend.dev`이고, **가입한 본인 메일로만** 보낼 수 있습니다.
   도메인을 연결하면 `LEAD_NOTIFY_EMAIL_FROM`으로 `noreply@도메인` 같은 주소를 쓸 수 있습니다.

## 2. 자동 배포 연결 (Workers Builds)

Cloudflare 대시보드 → Workers & Pages → Create → **Import a repository**에서 이 GitHub 저장소를 선택합니다.

| 항목 | 값 |
|---|---|
| Root directory | `apps/web` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Production branch | `main` |

연결 후에는 `main`에 push할 때마다 자동으로 빌드·배포됩니다.

## 3. 환경변수

**Build variables** (빌드 시 사이트에 들어가는 공개 값, Workers Builds 설정에서 입력):

| 이름 | 설명 |
|---|---|
| `NEXT_PUBLIC_SITE_NAME` | 매장 이름 (없으면 `스피드 통신`) |
| `NEXT_PUBLIC_CONTACT_PHONE` | 매장 전화번호. **없으면 `010-1234-5678`이 표시되므로 반드시 설정** |
| `NEXT_PUBLIC_SITE_URL` | 사이트 주소 (sitemap·robots에 사용) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 사이트 키 (아래 5번) |

**Secrets** (Worker 설정 → Variables and Secrets, 또는 `npx wrangler secret put 이름`):

| 이름 | 설명 |
|---|---|
| `RESEND_API_KEY` | Resend API 키 |
| `LEAD_NOTIFY_EMAIL_TO` | 알림 받을 메일 (여러 개는 쉼표로 구분) |
| `LEAD_NOTIFY_EMAIL_FROM` | 선택. 도메인 인증 후 발신 주소 |
| `TURNSTILE_SECRET_KEY` | Turnstile 비밀 키 (아래 5번) |

메일 설정이 빠져 있거나 발송에 실패하면 고객에게 "전화 주세요" 안내를 보여줍니다.
Turnstile 키가 없으면 봇 확인 없이 접수합니다(로그에 경고). 두 키는 반드시 함께 설정하세요.

## 4. 도메인 연결

도메인을 산 뒤 Worker 설정 → Domains & Routes → **Add Custom Domain**에서 연결합니다.
그 전까지는 `speed-communication.<계정>.workers.dev` 주소로 접속할 수 있습니다.

## 5. 스팸 방지 (Cloudflare Turnstile, 무료)

Cloudflare 대시보드 → Turnstile → **Add widget**에서 사이트 주소(`*.workers.dev` 또는 구매한 도메인)를 등록하고,
Widget mode는 **Managed**로 둡니다. 발급된 Site Key는 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`(빌드 변수),
Secret Key는 `TURNSTILE_SECRET_KEY`(Secret)에 넣습니다. 도메인을 바꾸면 위젯의 호스트 목록에도 추가해야 합니다.

## 6. 상담 신청 백업 확인 (KV)

모든 상담 신청은 메일 발송과 별도로 KV 저장소 `LEADS`에 **30일간** 보관된 뒤 자동 삭제됩니다.
첫 배포 때 저장소가 자동으로 만들어집니다.

메일이 안 왔거나 스팸함을 의심할 때: Cloudflare 대시보드 → Storage & Databases → **KV** → `LEADS` 네임스페이스에서
`lead:<접수시각>:...` 항목을 열어 보면 됩니다. 각 항목의 `emailStatus`가 `sent`가 아니면 메일이 가지 않은 신청입니다.
무료 한도는 하루 쓰기 1,000건입니다.

## 배포 후 확인

- `/`, `/devices`, `/devices/iphone-18-pro`, `/consult`, `/privacy` 가 열리는지
- `/consult`에서 상담 신청 → 알림 메일이 도착하는지
