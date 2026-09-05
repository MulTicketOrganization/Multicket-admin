# Multicket Admin

Multicket 서비스의 **관리자 페이지** 단독 프론트엔드.

---

## 스택

| 영역          | 사용 기술                                                               |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router) + React 19 + TypeScript 5                       |
| 스타일        | Tailwind v4 + shadcn (new-york, 수동 도입) + Pretendard                 |
| 상태관리      | TanStack Query 5 (서버 상태) · react-hook-form + zod 4 (폼)             |
| 아키텍처      | FSD (Feature-Sliced Design) — `src/{shared,entities,features,widgets}/` |
| 인증          | httpOnly 쿠키 + Next Route Handler 프록시 (access/refresh 이중 쿠키)    |
| 테스트        | Playwright E2E (백엔드 없이 `page.route` 전량 mock) — 13 스펙 · 71 케이스 |
| 패키지 매니저 | pnpm                                                                    |
| 배포          | Vercel                                                                  |

규모: 앱 코드 약 **18,400 LOC** / TS·TSX 파일 **288개** (entities 17 · features 24 · widgets 28 슬라이스).

---

## 빠른 시작

### 1) 의존성 설치 & 빌드 스크립트 승인 (fresh clone 시 1회)

```bash
pnpm install
pnpm approve-builds --all   # sharp, unrs-resolver 등 native 빌드 승인
```

### 2) 환경변수

```bash
cp .env.example .env.local
# .env.local 열어서 BACKEND_API_BASE_URL 을 실제 백엔드 주소로 수정
```

| 변수                   | 설명                                            | 예시                    |
| ---------------------- | ----------------------------------------------- | ----------------------- |
| `BACKEND_API_BASE_URL` | Multicket-app 백엔드 베이스 URL (서버 전용)     | `http://localhost:8080` |
| `AUTH_COOKIE_NAME`     | httpOnly 토큰 쿠키 이름 (기본 `mc_admin_token`) | `mc_admin_token`        |
| `COOKIE_SECURE`        | prod 에서 `true` (HTTPS 강제)                   | `true`                  |

> ⚠️ `NEXT_PUBLIC_*` 접두사는 사용하지 않음 — 토큰/백엔드 URL 등이 브라우저 번들에 노출되지 않도록 의도적으로 분리.
> `BACKEND_API_BASE_URL` 은 [src/shared/config/env.ts](src/shared/config/env.ts) 에서 필수값으로 검증하며, 없으면 서버 부팅 시 즉시 throw 한다.

### 3) 개발 서버

```bash
pnpm dev
# http://localhost:3000
```

| 작업          | 명령                                    |
| ------------- | --------------------------------------- |
| 개발 서버     | `pnpm dev`                              |
| 타입체크      | `pnpm exec tsc --noEmit`                |
| 린트          | `pnpm lint`                             |
| 빌드          | `pnpm build`                            |
| E2E (최초 1회)| `pnpm exec playwright install chromium` |
| E2E 실행      | `pnpm test:e2e`                         |
| E2E UI 모드   | `pnpm test:e2e:ui`                      |
| E2E 리포트    | `pnpm test:e2e:report`                  |

E2E 는 실제 백엔드를 띄우지 않는다. dev 서버는 Playwright 가 자동 기동하며(`reuseExistingServer: !CI`),
모든 백엔드 호출은 [tests/e2e/helpers/mock-backend.ts](tests/e2e/helpers/mock-backend.ts) 의
`page.route` mock 으로 대체된다. 인증은 [tests/e2e/helpers/session.ts](tests/e2e/helpers/session.ts) 가
쿠키를 직접 심어 시뮬레이션한다 ([proxy.ts](proxy.ts) 가 쿠키 존재 여부만 보기 때문).

---

## 인증 흐름

```
브라우저                Next.js (Node)              Spring 백엔드
   │                          │                          │
   │ POST /api/auth/login     │                          │
   ├─────────────────────────►│                          │
   │                          │ POST /member/request/login│
   │                          ├─────────────────────────►│
   │                          │                          │
   │                          │◄─── Authorization: Bearer xxx
   │                          │◄─── Set-Cookie: refresh_token
   │                          │                          │
   │                          │ Set-Cookie: mc_admin_token  (httpOnly, 1d)
   │                          │ Set-Cookie: refresh_token   (httpOnly, 30d)
   │◄─────────────────────────┤                          │
   │                          │                          │
   │ GET /api/backend/admin/member/list                  │
   ├─────────────────────────►│                          │
   │                          │ Bearer xxx 헤더 부착      │
   │                          │ Cookie: refresh_token 동봉│
   │                          ├─────────────────────────►│
   │                          │◄─────────────────────────┤
   │◄─── 응답 바디 (data) ────┤  (Authorization 헤더 갱신 시 쿠키 교체)
```

핵심:

- 토큰은 절대 브라우저 JS 에서 접근 불가 (httpOnly + Secure)
- 클라이언트는 자기 자신의 Next 라우트 (`/api/backend/...`) 만 호출 → CORS 회피 + 토큰 격리
- **access 쿠키(1d)만 먼저 만료된 경우** 프록시가 `POST /api/member/token/refresh` 로 선재발급을 시도한 뒤 원 요청을 보낸다
- 백엔드가 응답 헤더 `Authorization` 으로 새 토큰을 주면 (Access 자동 갱신) 프록시가 쿠키 즉시 교체
- 백엔드의 `refresh_token` 쿠키는 백엔드 도메인용이라 브라우저 → admin 도메인으로 전달되지 않는다.
  Next 서버가 `Set-Cookie` 에서 값만 꺼내 자기 쿠키에 보관했다가 업스트림 호출 때 `Cookie` 헤더로 되돌려 보낸다
- 401 응답 시 프록시가 access + refresh 쿠키를 모두 제거 → 다음 네비게이션에서 [proxy.ts](proxy.ts) 가 `/login` 으로 리다이렉트

관련 파일: [app/api/backend/[...path]/route.ts](app/api/backend/%5B...path%5D/route.ts) ·
[src/shared/api/server.ts](src/shared/api/server.ts) · [proxy.ts](proxy.ts)

---

## 화면 / 라우트

| 경로                  | 화면            | 주요 백엔드 API                                                     |
| --------------------- | --------------- | ------------------------------------------------------------------- |
| `/`                   | 랜딩            | —                                                                   |
| `/login`              | 로그인 (게스트) | `POST /member/request/login`                                        |
| `/dashboard`          | 대시보드        | `GET /admin/dashboard`                                              |
| `/members`            | 회원 관리       | `GET /admin/member/list`                                            |
| `/members/[id]`       | 회원 상세       | `GET /admin/member/detail` · `POST /admin/member/change` · `GET /admin/order/list` |
| `/performances`       | 공연 관리       | `GET /admin/performance/list`                                       |
| `/performances/[id]`  | 공연 상세       | `GET /admin/performance/{id}` · `/statistics` · `DELETE`            |
| `/reports`            | 신고 관리       | `GET /admin/report/list`                                            |
| `/reports/[id]`       | 신고 상세       | `GET/PATCH /admin/report/{id}`                                      |
| `/inquiries`          | 문의 관리       | `GET /admin/inquiry/list`                                           |
| `/inquiries/[id]`     | 문의 상세       | `GET/PATCH /admin/inquiry/{id}`                                     |
| `/revenue`            | 매출 조회       | `GET /admin/revenue/monthly`                                        |
| `/settlements`        | 정산 관리       | `GET /admin/settlement/list`                                        |
| `/settlements/[id]`   | 정산 상세       | `GET /admin/settlement/{id}` · `POST /{id}/transfer-request`        |
| `/notices`            | 공고 관리       | `GET /admin/notice` · `GET /notice/urgent`                          |
| `/notices/new`        | 공고 등록       | `POST /admin/notice`                                                |
| `/notices/[id]`       | 공고 상세       | `GET/PATCH/DELETE /admin/notice/{id}`                               |
| `/banners`            | 홈 배너         | `GET/POST /admin/banner` · `GET/PATCH/DELETE /admin/banner/{id}`    |
| `/consent-documents`  | 약관 관리       | `GET/POST /admin/consent-document` · `GET /{id}` · `GET /consent-document` |
| `/keywords`           | 검색 키워드     | `GET/POST /admin/keyword`                                           |
| `/app-versions`       | 앱 버전         | `GET/POST /admin/app-version` · `PATCH /{id}`                       |
| `/batch`              | 배치 관리       | `GET /admin/batch/job-instances` · `POST /{id}/restart`             |
| `/failed-events`      | 이벤트 이력     | `GET /admin/failed-event/list`                                      |
| `/failed-events/[id]` | 이벤트 상세     | `GET /admin/failed-event/{id}` · `/retry` · `/complete`             |
| `/account`            | 내 계정         | `GET /api/member/me`                                                |

주문 취소/환불(`POST /admin/order/{id}/cancel`, `PATCH /{id}/refund`, `GET /notice/refund-policy`)은
전역 화면 없이 **회원 상세의 주문 내역**에서 수행한다 — `GET /admin/order/list` 가 `memberId` 를 필수로
받기 때문 ([TODO §1.7](TODO.md)).

---

## 폴더 구조 (FSD)

```
app/                              # Next.js 라우팅만 (페이지 / 라우트 핸들러 / 레이아웃)
├── layout.tsx                    # 루트 레이아웃 (Pretendard + Providers)
├── page.tsx                      # 랜딩 (/)
├── login/page.tsx                # /login (게스트 전용)
├── (dashboard)/                  # 보호 라우트 그룹 (URL 에는 나타나지 않음)
│   ├── layout.tsx                # Sidebar + Header shell
│   └── {dashboard,members,performances,reports,inquiries,revenue,settlements,
│        notices,banners,consent-documents,keywords,app-versions,batch,
│        failed-events,account}/  # 위 "화면 / 라우트" 표 참고
└── api/
    ├── auth/{login,logout}/      # 쿠키 발급/제거
    └── backend/[...path]/        # catch-all 백엔드 프록시 (토큰 선재발급 + 자동 갱신)

proxy.ts                          # Next 16 미들웨어 — 라우트 가드 (보호 / 게스트 전용 경로)

src/
├── shared/                       # 어떤 도메인도 모르는 가장 낮은 레이어
│   ├── api/                      # apiFetch, QueryClient, 서버 쿠키/토큰 헬퍼, ApiError
│   ├── config/                   # env (서버 전용), constants
│   ├── hooks/                    # use-debounced-value, use-synced-state
│   ├── lib/                      # utils(cn), providers, format
│   └── ui/                       # shadcn primitives + PageHeader/StatCard/EmptyState/ThemeToggle
│
├── entities/                     # 도메인 모델 (types + labels + API + query hooks) — 17
│   account · app-version · banner · batch · consent-document · dashboard ·
│   failed-event · inquiry · keyword · member · notice · order · performance ·
│   region · report · revenue · settlement
│
├── features/                     # 사용자 액션 단위 (mutation + 폼/버튼/다이얼로그) — 24
│   auth-login · auth-logout ·
│   member-list-filter · member-change-status ·
│   performance-list-filter · performance-delete ·
│   report-list-filter · report-process ·
│   inquiry-list-filter · inquiry-process ·
│   failed-event-list-filter · failed-event-resolve ·
│   settlement-list-filter · settlement-transfer · revenue-period-filter ·
│   notice-list-filter · notice-write ·
│   banner-write · consent-document-write · consent-document-view ·
│   keyword-edit · app-version-write · batch-restart · order-actions
│
└── widgets/                      # 큰 UI 블록 (entities + features 조합) — 28
    admin-sidebar · admin-header · account-card · dashboard-overview ·
    member-list-table · member-detail-card · member-orders · member-performances ·
    performance-list-table · performance-detail-card · performance-statistics ·
    report-list-table · report-detail-card ·
    inquiry-list-table · inquiry-detail-card ·
    failed-event-list-table · failed-event-detail-card ·
    settlement-list-table · settlement-detail-card · revenue-table ·
    notice-list-table · notice-detail-card · notice-live-status ·
    banner-manager · consent-document-manager · keyword-manager ·
    app-version-manager · batch-table
```

### 레이어 규칙

의존 방향: `app → widgets → features → entities → shared` (역방향 금지).

- 슬라이스는 **`index.ts` public API 로만** 참조한다 (`@/entities/member/model/types` 같은 내부 경로 import 금지).
- 세그먼트 관례: `api/` (fetch 함수) · `model/` (types, labels, hooks, zod 스키마) · `ui/` (컴포넌트).
- 페이지(`app/**/page.tsx`)는 전부 서버 컴포넌트이며 metadata + 위젯 조립만 한다. `"use client"` 는
  widgets/features 의 `ui/` 아래에서 시작한다.
- `src/shared/config/env.ts` 와 `src/shared/api/server.ts` 는 `server-only` 로 클라이언트 유입을 차단한다.
- FSD 의 `pages` 레이어는 두지 않는다 — Next.js App Router 의 `app/` 이 그 역할을 겸한다.

현재 상태: 레이어 역방향 의존 **0건**, public API 우회 import **0건**.
같은 레이어 내 교차 참조가 일부 남아 있다 (entities 6건은 타입 전용, widgets 1건은 값 참조) —
[TODO §5](TODO.md) 에서 추적한다.

---

## 배포 (Vercel)

1. Vercel 프로젝트 연결 (이 저장소 import)
2. Environment Variables 등록:
   - `BACKEND_API_BASE_URL` — prod 백엔드 도메인
   - `AUTH_COOKIE_NAME` (선택)
   - `COOKIE_SECURE=true`
3. Vercel 도메인 확정 후 백엔드 팀에 **CORS Origin 추가 요청** (`Multicket-app` repo) — [TODO §1.1](TODO.md)

> Vercel 빌드 환경은 자동으로 `sharp` 등 native 빌드를 처리하므로 `pnpm approve-builds` 가 필요 없음.

---

## 관련 문서

- [TODO.md](TODO.md) — 백엔드 협의 사항 · 스키마 변경 이력 · 향후 작업
- 백엔드 API 명세: <https://multicket.duckdns.org/swagger-ui/index.html> (raw: `/v3/api-docs`)
