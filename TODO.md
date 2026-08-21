# Multicket Admin TODO

본 문서는 Admin 프론트 개발 중 발생한 **백엔드/인프라 측 요청 사항** 과 **추후 작업 필요 항목** 을 추적한다.
완료된 항목은 체크하고, 새 항목은 카테고리에 맞춰 추가한다.

> API 명세는 별도 문서를 두지 않고 **백엔드 Swagger 를 단일 출처로 삼는다**:
> <https://multicket.duckdns.org/swagger-ui/index.html> (raw: `/v3/api-docs`)

---

## 1. 백엔드 협의 / 요청 (Multicket-app 백엔드 팀)

### 1.1 CORS Origin 추가 요청 (블로킹)
- 현재 백엔드 CORS Origin: `http://localhost:5173`, `https://localhost:5173`
- Admin 은 Next.js dev 기본 포트인 **`http://localhost:3000`** 으로 띄움
- 브라우저는 Next.js 프록시(`/api/backend/**`)만 호출하므로 **dev 에서는 CORS 가 문제되지 않는다** —
  실제 백엔드 호출은 서버 사이드에서 나가기 때문. 다만 향후 클라이언트 직접 호출을 도입하면 필요.
- [ ] 배포 도메인 확정 시 백엔드 `application.yml` allowed origins 에 추가 요청

### 1.2 대시보드 집계 API — 부분 해결 (2026-08-21)
- `GET /admin/dashboard` 가 생겨 **회원 · 공연 · 오늘 매출**은 정확한 총계를 쓴다. 배선 완료.
- 아직 카운트 API 가 없는 지표는 여전히 목록 첫 페이지(10건)로 세고 `10+` 로 표기한다.
- [ ] `GET /admin/report/count?status=` — 미처리 신고 건수
- [ ] `GET /admin/inquiry/count?status=` — 상태별 문의 건수

### 1.3 MemberType 변경 API 부재
- `POST /admin/member/change` 는 상태 전이 이벤트(`APPROVE`/`FREEZE`/`UNFREEZE`/`BAN`/`DELETE`)만 처리한다.
- MASTER 권한 부여는 여전히 DB 수동 변경 (`UPDATE member SET member_type = 'MASTER' ...`)
- [ ] Admin 화면에서 MemberType 변경 필요 여부 확인 → 필요 시 endpoint 추가 요청

### 1.4 Refresh Token 만료 시 별도 처리 없음
- 백엔드는 Access 만료 + Refresh 없음 → 401 반환
- 프록시가 401 을 받으면 쿠키를 지워 다음 네비게이션에서 `/login` 으로 보내고 있다.
- [ ] 명시적 `POST /auth/refresh` endpoint 추가 검토 (현재는 응답 헤더 자동 갱신만 있음)

### 1.5 공고 조회 endpoint — 해결 (2026-08-21)
- `GET /admin/notice` (목록, 작성자 포함) · `GET/PATCH/DELETE /admin/notice/{id}` 가 생겨
  목록 · 상세 · 수정 · 삭제를 모두 붙였다.
- 같은 시점에 스키마가 **깨지는 방향으로 바뀌었다** — `title` 필수 추가, `expireDate` 가
  모든 타입 공통 필수로 변경, `MAINTENANCE` 타입 신설, `APP_UPDATE` 의 `updatePolicy` 와
  폴링 타입의 `targetPlatforms` 필수화, `GET /notice/urgent` 가 단건 → **배열**.
  전부 반영했다.
- [ ] `DELETE /admin/notice/{id}` 가 하드 삭제라 복구 불가 — 의도한 정책인지 확인
- [ ] `GET /notice/list` 의 **관객/창작자 대상 구분 필드** 요청 (앱 시안이 2탭)

### 1.6 크리에이터 통계·정산 API 의 소유권 제한
- `/creator/dashboard/{id}`, `/creator/reservations/**`, `GET /api/business-auth` 는 "본인 것"만 조회 가능.
- MASTER 가 남의 공연/계좌를 조회할 수 있는지 미확인 → 가능하지 않다면 admin 화면에서 쓸 수 없다.
- [ ] MASTER 소유권 우회 가능 여부 확인 → 불가 시 `/admin/**` 에 동일 기능 추가 요청

### 1.7 주문 · 정산 · 앱 버전 API (2026-08-21 신설분 반영)
- `GET /admin/order/list` · `/detail`, `POST /admin/order/{id}/cancel`,
  `PATCH /admin/order/{id}/refund` 배선 완료 (회원 상세의 "구매 / 주문 내역").
- `GET /admin/settlement/list` · `/{id}`, `POST /{id}/transfer-request` 배선 완료 (`/settlements`).
- `GET/POST/PATCH /admin/app-version` 배선 완료 (`/app-versions`).
- `GET /admin/performance/{id}/statistics` 배선 완료 (공연 상세 하단).
- [ ] **환불 예상액 조회 API 부재 (블로킹에 가까움)** — `PATCH /admin/order/{id}/refund` 의
  `amount` 가 "관람일 기준 환불 정책으로 계산된 예상 환불액과 일치해야" 하는데 그 값을
  알려주는 API 가 없다. 현재는 운영자가 손으로 입력하고 틀리면 400 이 난다.
- [ ] `GET /admin/order/list` 의 `memberId` 를 optional 로 — 전역 주문 목록 화면을 만들 수 없다
- [ ] `PATCH /admin/app-version/{id}` 가 `updateNote` 만 수정 가능 — 버전/적용일자 오타를
  고칠 방법도 지울 방법도 없다. `DELETE` 또는 전체 필드 수정 허용 요청
- [ ] `GET /admin/app-version` 응답이 스웨거에는 단건(`AppVersionResponse`)으로 표기돼 있으나
  설명·실제는 배열이다. 스키마 정정 요청 (프론트는 양쪽을 모두 받도록 방어해 둠)
- [ ] `POST /admin/settlement/{id}/transfer-request` 의 PG 확정 일정 — 지금은 실제 이체 없이
  상태 확인만 한다. 실제 이체가 시작되면 버튼 문구·확인 절차를 바꿔야 함
- [ ] `GET/POST /admin/keyword` 의 응답 스키마가 `{}` 로 비어 있어 계약 검증 불가

### 1.8 백엔드 알려진 이슈
- [ ] 회원가입 기본 MemberType 이 `CREATOR` 인 점 정책 확인
- [ ] `PaymentController` 비활성 상태 — 결제 관련 Admin 화면 보류

---

## 2. 로컬 개발 환경 주의 사항

### 2.1 pnpm 빌드 스크립트 승인 (Fresh clone 시 1회)
- pnpm 11 은 native 빌드 스크립트를 가진 패키지 (sharp, unrs-resolver 등) 의 빌드를 기본 차단함.
- 클론 직후 `pnpm install` 이 `[ERR_PNPM_IGNORED_BUILDS]` 로 실패하면 다음 명령으로 1회 승인:
  ```bash
  pnpm approve-builds --all
  ```

### 2.2 환경변수 설정
- `.env.example` 을 `.env.local` 로 복사 후 값 채우기.
- `BACKEND_API_BASE_URL` 기본값은 배포 백엔드(`https://multicket.duckdns.org`).
  로컬 백엔드로 붙일 때만 `http://localhost:8080` 으로 바꾼다.

### 2.3 E2E 실행
```bash
pnpm exec playwright install chromium   # 최초 1회
pnpm test:e2e
```
- 실제 백엔드를 띄우지 않고 `page.route` 로 모두 mock 한다.

---

## 3. 인프라 / 배포 (Vercel)

- [ ] Vercel 프로젝트 생성 및 도메인 확정
- [ ] Vercel 환경변수 등록:
  - `BACKEND_API_BASE_URL` — 백엔드 API 베이스 (서버 사이드 프록시용, `NEXT_PUBLIC_` 아님)
  - `AUTH_COOKIE_NAME` — 토큰 쿠키 이름 (기본 `mc_admin_token`)
  - `COOKIE_SECURE=true`
- [ ] 백엔드 prod 도메인 확정 시 CORS 추가 요청 (1.1 항목과 연동)

---

## 4. Admin 프론트 향후 작업

### 4.1 기능
- [ ] OAuth2 로그인 지원 (Google / Kakao / Naver) — 현재는 Local 만
- [ ] 해외 공연 관리 화면 (admin 전용 endpoint 부재 — 백엔드 확인 필요)
- [ ] 회원 활동 / 감사 로그 화면 (백엔드 API 추가 시)
- [ ] 공연 차단(`/api/blocks`) · 신고 접수 통계 화면 — 앱 쪽 진입점이 생긴 뒤 검토

### 4.2 UX / 품질
- [ ] cursor 페이지네이션을 무한 스크롤로 바꿀지 결정 (현재 "더 보기" 버튼)
- [ ] 에러 바운더리 전역 처리 (현재는 화면별 처리 + 토스트)
- [ ] 접근성 (a11y) 1차 점검
- [ ] 모바일 사이드바 (현재 `md` 미만에서 숨김, 헤더에 현재 위치만 표시)

---

본 문서 갱신 책임: Admin 프론트 작업자.
