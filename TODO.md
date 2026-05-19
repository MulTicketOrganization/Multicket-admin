# Multicket Admin TODO

본 문서는 Admin 프론트 개발 중 발생한 **백엔드/인프라 측 요청 사항** 과 **추후 작업 필요 항목** 을 추적한다.
완료된 항목은 체크하고, 새 항목은 카테고리에 맞춰 추가한다.

---

## 1. 백엔드 협의 / 요청 (Multicket-app 백엔드 팀)

### 1.1 CORS Origin 추가 요청 (블로킹)
- 현재 백엔드 CORS Origin: `http://localhost:5173`, `https://localhost:5173`
- Admin 은 Next.js dev 기본 포트인 **`http://localhost:3000`** 으로 띄움
- 또한 배포는 Vercel 예정 → **배포 도메인** 도 함께 추가 필요
- [ ] 백엔드 `application.yml` CORS allowed origins 에 다음 추가 요청:
  - `http://localhost:3000`
  - `https://<vercel-prod-domain>` (확정 후 전달)
  - `https://<vercel-preview-domain>` (선택 — 프리뷰도 호출 필요 시)

### 1.2 대시보드 통계 API 부재
- 현재 백엔드에 대시보드용 KPI/요약 API 가 없음
- 임시로 "최근 회원 N건 / 최근 공연 N건" 카드로 채워둘 예정
- [ ] 추후 추가 요청 후보:
  - `GET /admin/stats/summary` — 총 회원 수, 총 공연 수, 오늘 가입자 수, 활성 공연 수 등
  - `GET /admin/stats/members?from=&to=` — 일별 가입자 추이
  - `GET /admin/stats/performances?from=&to=` — 일별 등록 공연 추이

### 1.3 MemberType 변경 API 부재
- 현재 `AdminMemberChangeRequest` 는 `memberStatus` 만 변경 가능
- MASTER 권한 부여는 DB 수동 변경 (`UPDATE member SET member_type = 'MASTER' ...`)
- [ ] Admin 화면에서 MemberType 변경 필요 여부 확인 → 필요 시 백엔드에 endpoint 추가 요청

### 1.4 Refresh Token 만료 시 별도 처리 없음
- 백엔드는 Access 만료 + Refresh 없음 → 401 반환
- Admin 은 401 받으면 로그인 페이지로 강제 이동 처리 (예정)
- [ ] 추후 명시적 `POST /auth/refresh` endpoint 추가 검토 (현재는 자동 헤더 갱신만 있음)

### 1.5 백엔드 알려진 이슈 (ADMIN_BACKEND.md 부록 B)
- [ ] 회원가입 기본 MemberType 이 `CREATOR` 인 점 정책 확인
- [ ] `PaymentController` 비활성 상태 — 결제 관련 Admin 화면 보류
- [ ] 공연 검색 path 오타 `/api/performances/serach/{keyword}` — Admin 에서는 `/admin/performance/list` 만 사용하므로 직접 영향 없음

---

## 2. 로컬 개발 환경 주의 사항

### 2.1 pnpm 빌드 스크립트 승인 (Fresh clone 시 1회)
- pnpm 11 은 native 빌드 스크립트를 가진 패키지 (sharp, unrs-resolver 등) 의 빌드를 기본 차단함.
- 클론 직후 `pnpm install` 이 `[ERR_PNPM_IGNORED_BUILDS]` 로 실패하므로 다음 명령으로 1회 승인:
  ```bash
  pnpm approve-builds --all
  ```
- 승인은 로컬 `node_modules/.modules.yaml` 에 저장되어 머신별 1회만 필요.

### 2.2 환경변수 설정
- `.env.example` 을 `.env.local` 로 복사 후 값 채우기.
- `BACKEND_API_BASE_URL`, `AUTH_COOKIE_NAME` 필수.

---

## 3. 인프라 / 배포 (Vercel)

- [ ] Vercel 프로젝트 생성 및 도메인 확정
- [ ] Vercel 환경변수 등록:
  - `BACKEND_API_BASE_URL` — 백엔드 API 베이스 (서버 사이드 프록시용, `NEXT_PUBLIC_` 아님)
  - `JWT_COOKIE_NAME` — 토큰 쿠키 이름 (기본 `mc_admin_token`)
  - 기타 OAuth2 관련 키 필요 시 추가
- [ ] 백엔드 prod 도메인 확정 시 CORS 추가 요청 (1.1 항목과 연동)

---

## 4. Admin 프론트 향후 작업

### 3.1 기능
- [ ] OAuth2 로그인 지원 (Google / Kakao / Naver) — 현재는 Local 우선
- [ ] 공연 상세 페이지 (크루, 티켓 정보 포함)
- [ ] 회원 활동 로그 / 감사 로그 화면 (백엔드 API 추가 시)
- [ ] 다크 모드 (현재 라이트만 우선 구현)

### 3.2 UX / 품질
- [ ] 페이지네이션 cursor 기반 무한 스크롤 vs "더보기" 버튼 결정
- [ ] 에러 바운더리 / 토스트 전역 처리
- [ ] 접근성 (a11y) 1차 점검

---

본 문서 갱신 책임: Admin 프론트 작업자.
