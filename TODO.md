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

### 1.2 대시보드 집계 API 부재
- 대시보드 KPI 를 목록 API 의 첫 페이지(10건 고정)로 대신하고 있어 정확한 총계를 표시할 수 없다.
  현재는 10건을 채우면 `10+` 로 표기한다.
- [ ] 추가 요청 후보:
  - `GET /admin/stats/summary` — 총 회원 수, 총 공연 수, 대기 문의 수 등
  - `GET /admin/inquiry/count?status=` — 상태별 문의 건수

### 1.3 MemberType 변경 API 부재
- `POST /admin/member/change` 는 상태 전이 이벤트(`APPROVE`/`FREEZE`/`UNFREEZE`/`BAN`/`DELETE`)만 처리한다.
- MASTER 권한 부여는 여전히 DB 수동 변경 (`UPDATE member SET member_type = 'MASTER' ...`)
- [ ] Admin 화면에서 MemberType 변경 필요 여부 확인 → 필요 시 endpoint 추가 요청

### 1.4 Refresh Token 만료 시 별도 처리 없음
- 백엔드는 Access 만료 + Refresh 없음 → 401 반환
- 프록시가 401 을 받으면 쿠키를 지워 다음 네비게이션에서 `/login` 으로 보내고 있다.
- [ ] 명시적 `POST /auth/refresh` endpoint 추가 검토 (현재는 응답 헤더 자동 갱신만 있음)

### 1.5 공고 조회 endpoint 부재 (admin)
- `POST /admin/notice` 로 등록만 가능하고 admin 전용 조회가 없어, 현재 게시 중인 공고는
  공용 `GET /notice` 로 확인한다. 취소·환불 공고는 `performanceId` 기준 분기라 타입만으로는 비어 올 수 있다.
- [ ] `GET /admin/notice?type=` (또는 이력 목록) 추가 요청

### 1.6 크리에이터 통계·정산 API 의 소유권 제한
- `/creator/dashboard/{id}`, `/creator/reservations/**`, `GET /api/business-auth` 는 "본인 것"만 조회 가능.
- MASTER 가 남의 공연/계좌를 조회할 수 있는지 미확인 → 가능하지 않다면 admin 화면에서 쓸 수 없다.
- [ ] MASTER 소유권 우회 가능 여부 확인 → 불가 시 `/admin/**` 에 동일 기능 추가 요청

### 1.7 백엔드 알려진 이슈
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
- [ ] 공고 이력 목록 (백엔드 조회 API 추가 시, 1.5 연동)

### 4.2 UX / 품질
- [ ] cursor 페이지네이션을 무한 스크롤로 바꿀지 결정 (현재 "더 보기" 버튼)
- [ ] 에러 바운더리 전역 처리 (현재는 화면별 처리 + 토스트)
- [ ] 접근성 (a11y) 1차 점검
- [ ] 모바일 사이드바 (현재 `md` 미만에서 숨김, 헤더에 현재 위치만 표시)

---

본 문서 갱신 책임: Admin 프론트 작업자.
