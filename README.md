# Multicket Admin

Multicket 서비스의 **관리자 페이지** 단독 프론트엔드.

---

## 스택

| 영역          | 사용 기술                                                               |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router) + React 19 + TypeScript                         |
| 스타일        | Tailwind v4 + shadcn (new-york, 수동 도입) + Pretendard                 |
| 상태관리      | TanStack Query 5 (서버 상태) · react-hook-form + zod (폼)               |
| 아키텍처      | FSD (Feature-Sliced Design) — `src/{shared,entities,features,widgets}/` |
| 인증          | httpOnly 쿠키 + Next Route Handler 프록시                               |
| 패키지 매니저 | pnpm                                                                    |
| 배포          | Vercel                                                                  |

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

### 3) 개발 서버

```bash
pnpm dev
# http://localhost:3000
```

| 작업      | 명령                     |
| --------- | ------------------------ |
| 개발 서버 | `pnpm dev`               |
| 타입체크  | `pnpm exec tsc --noEmit` |
| 린트      | `pnpm lint`              |
| 빌드      | `pnpm build`             |

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
   │                          │                          │
   │                          │ Set-Cookie: mc_admin_token (httpOnly)
   │◄─────────────────────────┤                          │
   │                          │                          │
   │ GET /api/backend/admin/member/list                  │
   ├─────────────────────────►│                          │
   │                          │ Bearer xxx 헤더 부착     │
   │                          ├─────────────────────────►│
   │                          │◄─────────────────────────┤
   │◄─── 응답 바디 (data) ────┤  (Authorization 헤더 갱신 시 쿠키 교체)
```

핵심:

- 토큰은 절대 브라우저 JS 에서 접근 불가 (httpOnly + Secure)
- 클라이언트는 자기 자신의 Next 라우트 (`/api/backend/...`) 만 호출 → CORS 회피 + 토큰 격리
- 백엔드가 응답 헤더 `Authorization` 으로 새 토큰을 주면 (Access 자동 갱신) 프록시가 쿠키 즉시 교체
- 401 응답 시 프록시가 쿠키 제거 → 다음 요청 시 [proxy.ts](proxy.ts) 가 `/login` 으로 리다이렉트

---

## 폴더 구조 (FSD)

```
app/                              # Next.js 라우팅만 (페이지 / 라우트 핸들러 / 레이아웃)
├── layout.tsx                    # 루트 레이아웃 (Pretendard + Providers)
├── page.tsx                      # 랜딩 (/)
├── login/page.tsx                # /login (게스트 전용)
├── (dashboard)/                  # 보호 라우트 그룹
│   ├── layout.tsx                # Sidebar + Header shell
│   ├── dashboard/page.tsx        # /dashboard
│   ├── members/
│   │   ├── page.tsx              # /members (목록)
│   │   └── [id]/page.tsx         # /members/:id (상세)
│   └── performances/
│       ├── page.tsx              # /performances (목록)
│       └── [id]/page.tsx         # /performances/:id (상세)
└── api/
    ├── auth/{login,logout}/      # 쿠키 발급/제거
    └── backend/[...path]/        # catch-all 백엔드 프록시 (자동 토큰 갱신)

proxy.ts                          # Next 16 의 미들웨어 — 라우트 가드

src/
├── shared/                       # 어떤 도메인도 모르는 가장 낮은 레이어
│   ├── api/                      # apiFetch, QueryClient, 서버 쿠키 헬퍼, ApiError
│   ├── config/                   # env, constants
│   ├── hooks/                    # 범용 hooks (use-debounced-value 등)
│   ├── lib/                      # utils (cn), providers, formatDateTime
│   └── ui/                       # shadcn primitives (Button/Input/.../Table/Badge/Select/...)
├── entities/                     # 도메인 모델 (타입 + 라벨 + 기본 API + query hooks)
│   ├── member/
│   │   ├── api/                  # getMembers
│   │   ├── model/                # types, labels, useMemberList
│   │   └── index.ts
│   └── performance/
├── features/                     # 사용자 액션 단위
│   ├── auth-login/               # LoginForm + zod 스키마 + useLogin mutation
│   ├── auth-logout/              # LogoutButton + useLogout mutation
│   ├── member-list-filter/       # URL-backed 회원 필터 폼
│   ├── member-change-status/     # 상태 변경 Dialog + mutation (캐시 invalidate)
│   └── performance-list-filter/  # URL-backed 공연 필터 폼
└── widgets/                      # 큰 UI 블록 (composed)
    ├── admin-sidebar/
    ├── admin-header/
    ├── member-list-table/
    ├── member-detail-card/
    ├── performance-list-table/
    └── performance-detail-card/
```

레이어 의존 방향: `app → widgets → features → entities → shared` (역방향 금지).

---

## 배포 (Vercel)

1. Vercel 프로젝트 연결 (이 저장소 import)
2. Environment Variables 등록:
   - `BACKEND_API_BASE_URL` — prod 백엔드 도메인
   - `AUTH_COOKIE_NAME` (선택)
   - `COOKIE_SECURE=true`
3. Vercel 도메인 확정 후 백엔드 팀에 **CORS Origin 추가 요청** (`Multicket-app` repo) — [TODO.md §1.1](TODO.md)

> Vercel 빌드 환경은 자동으로 `sharp` 등 native 빌드를 처리하므로 `pnpm approve-builds` 가 필요 없음.
