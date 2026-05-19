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

## 구현 현황 (Round 단위)

### ✅ Round 1 — Foundation

- pnpm 전환, Tailwind v4 + shadcn (manual) 셋업
- Blue primary + 중성 gray 테마 토큰 (oklch)
- Pretendard 한글 폰트 적용
- FSD 폴더 스캐폴드 + tsconfig path alias (`@/* → src/*`)
- shared 기본 primitive: Button / Input / Label / Card / Separator
- 도메인 enum / 타입: Member / Performance (한글 라벨 맵 포함)
- TanStack Query / Sonner Providers 루트 적용

### ✅ Round 2 — 인증 인프라

- 서버 쿠키 헬퍼 (read/write/clear + extractBearer)
- `POST /api/auth/login` — 백엔드 호출 후 응답 헤더 → httpOnly 쿠키
- `POST /api/auth/logout` — 백엔드 호출 + 쿠키 제거 (좀비 세션 방지)
- `app/api/backend/[...path]` — 모든 admin API catch-all 프록시 (토큰 자동 갱신 / 401 처리)
- `proxy.ts` — `/dashboard|/members|/performances` 가드, 인증 상태 시 `/login` 리다이렉트
- `auth-login` feature (zod + react-hook-form + sonner toast + `?from=` 복귀)
- `auth-logout` feature (캐시 clear + 라우팅)
- `/login` 페이지 + `/dashboard` placeholder

### ✅ Round 3 — 셸 + 회원 관리

- shadcn primitive 추가: Table / Badge / Skeleton / Select / DropdownMenu / PageHeader
- 공용 유틸: `formatDateTime` / `useDebouncedValue`
- `admin-sidebar` widget (고정 너비 240px, lucide 아이콘, active state)
- `admin-header` widget (sticky, LogoutButton)
- `(dashboard)/layout.tsx` — 실제 셸로 교체
- `/dashboard` — Shortcut 카드 (회원/공연) + 통계 placeholder
- 회원 목록 query (cursor 페이지네이션, `useInfiniteQuery`)
- `member-list-filter` feature (URL search params source-of-truth, 키워드 디바운스)
- `member-list-table` widget (badge 색상, skeleton, "더 보기" 버튼)
- `/members` 페이지

### ✅ Round 4 — 회원 상세 + 상태 변경

- shadcn primitive 추가: Dialog / RadioGroup / Avatar
- `entities/member`: `getMemberDetail` / `changeMemberStatus` API + `useMemberDetail` hook + `MEMBER_QUERY_KEYS` 키 레지스트리
- `member-change-status` feature — Dialog 안에서 RadioGroup 으로 상태 선택, 성공 시 상세/목록 캐시 invalidate
- `member-detail-card` widget — Avatar + Badge + 정보 dl + "상태 변경" 버튼, skeleton / 에러 상태 포함
- `/members/[id]` 동적 라우트 페이지 — 잘못된 id 는 `notFound()` → 404
- 회원 목록 row 클릭 → 상세 페이지 이동 (닉네임 셀은 진짜 Link 라 새 탭 가능)

### ✅ Round 5 — 공연 목록 + 상세

- `entities/performance`: `getPerformances` / `getPerformanceDetail` API + `usePerformanceList` (useInfiniteQuery) / `usePerformanceDetail` hooks + `PERFORMANCE_QUERY_KEYS`
- 공용 유틸: `formatPrice` (ko-KR + "원")
- `performance-list-filter` feature — title 검색 (디바운스) + genre / area / deleted 3-way Select, URL-backed
- `performance-list-table` widget — 7-컬럼, 작성자는 회원 상세로 직접 link, 활성/삭제 Badge
- `performance-detail-card` widget — 4개 sub-Card (메인 / 작성자 / 크루 / 티켓 정보) 로 분리, 포스터 + 시놉시스 + 가격/회차/좌석 표시
- `/performances`, `/performances/[id]` 페이지

### 🚧 다음 단계 (후보)

- 대시보드 KPI 카드 (백엔드 통계 API 협의 필요 — [TODO.md §1.2](TODO.md))
- 다크 모드 토글
- E2E 테스트 (Playwright)

> 본 섹션은 라운드가 진행될 때마다 갱신됨.

---

## 배포 (Vercel)

1. Vercel 프로젝트 연결 (이 저장소 import)
2. Environment Variables 등록:
   - `BACKEND_API_BASE_URL` — prod 백엔드 도메인
   - `AUTH_COOKIE_NAME` (선택)
   - `COOKIE_SECURE=true`
3. Vercel 도메인 확정 후 백엔드 팀에 **CORS Origin 추가 요청** (`Multicket-app` repo) — [TODO.md §1.1](TODO.md)

> Vercel 빌드 환경은 자동으로 `sharp` 등 native 빌드를 처리하므로 `pnpm approve-builds` 가 필요 없음.

---

## 라이선스

비공개 (Multicket Organization 내부 사용).
