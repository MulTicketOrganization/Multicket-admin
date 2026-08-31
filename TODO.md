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
- [ ] `GET/POST /admin/keyword` 의 응답 스키마가 `{}` 로 비어 있어 계약 검증 불가 —
  공개 `GET /keyword` 는 `{ TYPE: string[] }` 평면 배열을, 관리자 API 설명은
  `{ active, inactive }` 를 말한다. 프론트는 양쪽을 모두 받도록 정규화해 뒀지만 스키마 명시 요청.

### 1.8 백엔드 알려진 이슈
- [ ] 회원가입 기본 MemberType 이 `CREATOR` 인 점 정책 확인
- [ ] `PaymentController` 비활성 상태 — 결제 관련 Admin 화면 보류

### 1.9 스키마 breaking change 반영 (2026-08-27)

새 endpoint 는 없었고, 대신 기존 응답/요청 스키마가 여러 군데 깨지는 방향으로 바뀌어 전부 반영했다.

- **실패 이벤트 → inbox 이벤트 파이프라인 교체.** `/admin/failed-event/**` 는 URL 만 남고
  내용이 완전히 바뀌었다 (outbox → CDC → RabbitMQ → inbox_event).
  - status: `PENDING/COMPLETE` → `RECEIVED/DONE/FAILED/IGNORED`
  - eventType: 10종 → 13종 (`TICKET_NOTIFICATION_*` 4종이 `TICKET_NOTIFICATION` 하나로 통합,
    `REPORT_PROCESSED_MAIL`·`MEMBER_REJECTED_MAIL`·`MAINTENANCE_REDIS_EVICT`·
    `PLATFORM_PARTNER_*`·`INQUIRY_CREATED_SLACK`·`PERFORMANCE_DETAIL_CACHE_EVICT` 신설)
  - 응답 필드: `target`·`originQueue`·`description` 삭제, `eventId`(outbox UUID) 신설
  - retry 는 `FAILED` 상태 + 지정 7종만, complete 는 `FAILED → IGNORED` 만 허용
  - 이제 실패 건만이 아니라 파이프라인 전체 이력이 보이므로 화면 이름을 **"이벤트 이력"** 으로 바꿨다
- **GenreType 이 한글 문자열 → enum 코드**(`PLAY`/`MUSICAL`/`CHILDREN_FAMILY`/`EXPERIMENTAL`/
  `SCHOOL`/`FESTIVAL`)로 바뀌었다. 목록 필터·공연 상세·회원 선호장르 모두 영향.
- **region 필터가 한글 권역명 → enum 코드**(`CAPITAL`/`CHUNGCHEONG`/`YEONGNAM`/`HONAM`/
  `GANGWON`/`JEJU`/`DAEHAKRO`/`ETC`). `area` 도 마찬가지로 코드가 내려온다 (기존 타입이
  한글 라벨을 값으로 쓰고 있어 실제 응답과 어긋나 있었다).
- **KeywordType 이 `GENRE`/`ELSE` → `GENRE`/`ISDAEHAKRO`/`OVERSEA`/`FREE`.**
  네 타입 모두 화이트리스트가 생겨 자유 입력이 불가능해졌고, 편집 UI 를 허용값 토글로 바꿨다.
- **`PATCH /admin/inquiry/{id}` 에 `responseContent` 필수 추가**, `MEMBER_STATUS + REJECT` 에는
  `rejectReason` 도 필수. 상세 응답에 `responderId`·`responderNickName`·`responseContent`·
  `responseDate` 가 생겨 "관리자 응답" 블록으로 노출한다.
- **신고 사유(`reason`) 가 자유 문자열 → enum**(`COPYRIGHT_INFRINGEMENT`/
  `FRAUD_OR_FALSE_INFORMATION`/`INAPPROPRIATE_CONTENT`/`SPAM`/`ETC`).

- [ ] `AdminOrderRefundRequest` 의 `promotionDiscountRetainOption` ·
  `cancelPaymentBodyRefundAccount` (가상계좌 환불 계좌) 는 "당분간 비워두라" 는 설명대로 미배선.
  가상계좌 결제가 열리면 환불 폼에 계좌 입력을 추가해야 한다.
- [ ] `TicketType` 이 스웨거상 `NORMAL` 하나만 남았다. `PREMIUM`/`KID`/`ADULT`/`SENIOR` 가
  폐기된 것인지 확인 (프론트는 기존 라벨을 남겨 둠)

### 1.10 홈 배너 · 약관 본문 API 신설 (2026-08-28)

두 도메인이 새로 생겨 화면을 붙였다.

**홈 배너 (`/banners`)** — `GET/POST /admin/banner`, `GET/PATCH/DELETE /admin/banner/{id}`
- 앱은 `GET /banner` 로 현재 시각이 노출 기간에 걸린 것만 가져가 홈 하단 캐러셀로 돌린다.
- 관리자 목록은 커서 없이 전체를 한 번에 준다.
- `PATCH` 가 전량 교체라 수정 폼도 등록과 같은 필수 항목을 전부 다시 보낸다.
- [ ] **`displayOrder` 를 프론트에서 다룰 수 없다.** 스웨거 설명은 "목록은 displayOrder
  오름차순", "등록 시 displayOrder 필수" 라고 하는데 `BannerResponse`·`BannerCreateRequest`·
  `BannerUpdateRequest` 어디에도 그 필드가 없다. 설명이 낡은 것인지 DTO 가 빠진 것인지
  확인 필요 — 지금은 운영자가 배너 노출 순서를 정할 방법이 없다.
- [ ] `DELETE /admin/banner/{id}` 가 하드 삭제다. 노출만 끊는 용도로는 종료 일시를 과거로
  수정하도록 화면에서 안내하고 있으나, soft delete 지원 여부 확인 요청.
- [ ] 이미지 업로드 경로가 없다. 지금은 CDN URL 을 손으로 붙여 넣는데,
  `POST /s3/presignurl` 를 배너에도 쓸 수 있는지 확인 → 가능하면 업로더를 붙인다.

**약관 본문 (`/consent-documents`)** — `GET/POST /admin/consent-document`,
`GET /admin/consent-document/{id}`
- 등록과 수정을 구분하지 않는 단일 API 다. 저장하면 같은 타입의 현재 버전이 폐기되고
  새 버전(직전 + 0.1, 최초 1.0)으로 교체된다.
- **그 타입에 동의했던 회원 전원의 `agreed` 가 false 로 초기화된다.** 되돌릴 수 없어
  발행 버튼에 확인 다이얼로그를 한 단계 뒀다.
- 타입별 현재 버전은 공개 `GET /consent-document` 에서 읽는다 — 관리자 이력은 커서
  페이지네이션이라 아직 안 불러온 페이지에 최신 버전이 있을 수 있다.
- 폐기본도 `GET /admin/consent-document/{id}` 로 조회 가능해 "전문 보기" 에 연결했다.
- [ ] 잘못 발행한 버전을 되돌릴 방법이 없다 (삭제도, 이전 버전 복구도 불가).
  실수로 전 회원 동의를 날렸을 때의 복구 경로 확인 요청.
- [ ] 약관 본문에 제목·시행일자 필드가 없다. 앱에서 "시행일 2026-09-01" 같은 표기가
  필요하면 추가 요청 필요.

**그 외**
- inbox 이벤트 타입에 `CONSENT_DOCUMENT_CACHE_EVICT` 가 추가돼 라벨을 붙였다 (재실행 미지원).
- `GET /banner`·`GET /consent-document` 는 설명상 "로그인 여부와 무관" 인데 실제로는
  토큰 없이 호출하면 401 이 난다. Admin 은 프록시가 토큰을 붙여 문제없지만 앱 온보딩
  (가입 전 화면)에서는 막힐 수 있다 — [ ] 백엔드에 공지 필요.
- [ ] `PATCH /api/member/email`(이메일 변경) · `GET/POST /api/member/consent`(동의 이력) 는
  사용자용 API 라 미배선. 회원 상세에서 동의 이력을 보여줄 필요가 있는지 검토
  (현재 `/admin/member/detail` 에는 동의 정보가 없다).

### 1.11 스키마 breaking change 반영 (2026-08-29)

`/admin/**` endpoint 목록은 그대로(46개)인데 스키마가 또 여러 군데 바뀌어 전부 반영했다.

- **공고 등록·수정에 `memberType`·`appVersionId` 가 필수로 추가됐다.** 두 값을 안 보내면
  모든 공고 등록/수정이 400 이 난다. 폼에 "공지 대상자"·"연결할 앱 버전" 선택을 붙였고,
  응답의 `memberType`·`appVersion` 을 목록·상세에 노출한다.
  - [ ] `appVersionId` 가 **모든 타입에 필수**다. 환불 규정·정산 안내처럼 앱 버전과
    무관한 공고에도 억지로 한 건을 골라야 하고, 앱 버전이 하나도 등록돼 있지 않으면
    공고를 아예 만들 수 없다. APP_UPDATE 에만 필수로 바꿀 수 있는지 확인 요청.
- **지역 어휘가 두 벌로 갈라졌다.** 뒤섞으면 400 이 나므로 `entities/region` 슬라이스로
  분리하고 공연·회원이 함께 쓰도록 했다.
  - `Area` (공연 상세 `area`): 기존 시/도 코드 — `GWANGJU`·`JEONNAM` 이 별도
  - `Region` (공연 목록 `?region=`, 회원 `region`): **광주·전남이 `GWANGJU_JEONNAM` 으로
    통합**되고 나머지는 시/도 코드. 직전까지 쓰던 권역 코드(`CAPITAL`/`CHUNGCHEONG`/
    `YEONGNAM`/`HONAM`)는 전부 사라졌다 — 8/27 에 붙인 필터가 통째로 무효가 됐다.
  - [ ] 두 벌을 유지할 계획인지 확인. 공연 상세의 `area=GWANGJU`/`JEONNAM` 을 그대로 목록
    필터에 넘기면 거부된다. 지금은 두 값을 섞어 쓰는 화면이 없어 변환 없이 두었지만,
    "이 지역 공연 보기" 같은 동선이 생기면 매핑이 필요하다.
- **회원 응답의 `area` 가 `region` 으로 이름이 바뀌었다** (`AdminMemberResponse`,
  `GET /api/member/me`). 기존 필드명으로는 값이 항상 undefined 였다.
- `GET /api/member/me` 에 `authCheck`·`businessAuthCompleted`·`orderNotificationEnabled`·
  `emailNotificationEnabled`·`consents` 가 추가돼 타입에 반영하고, 내 계정 화면에
  본인인증·계좌 인증 여부를 노출했다.
- **정산 상세: `portoneTransferId` → `transferId` 로 이름이 바뀌고 `pgFeeRatePercent` 가
  추가됐다.** `feeAmount` 의 의미도 "플랫폼 수수료" 에서 "플랫폼 + PG 수수료 합계" 로
  바뀌어 산출 근거 표기를 고쳤다.
- **환불 응답이 `TicketPaymentCancelResponse` → `PaymentCancelResponse` 로 바뀌면서
  `refundAmount`·`cancelFeeAmount`·`refundMethod`·`expectedRefundPeriod`·`cancelledAt` 가
  실려 온다.** 환불 성공 토스트에 실제 환불액과 취소 수수료를 보여준다.
- `DiscountDto.discountName`(할인명) 추가 — 공연 상세 할인 목록에 표기.
- inbox 이벤트 타입에 `PLATFORM_PARTNER_CONTACT_SYNC` 추가 (재실행 미지원).
- 모든 목록 응답에 적용된 필터를 되돌려주는 `applied*` 필드가 붙었다. 프론트가 필터
  상태를 URL 로 관리하고 있어 쓰지 않는다 (여분 필드라 무해).

### 1.12 환불 예상액 — 부분 해결 (2026-08-29)

- `GET /notice/refund-policy` 가 생겼다. 관람일까지 남은 일수별 환불 비율표를 그대로
  주며 로그인 없이 조회 가능해, **환불 다이얼로그에 비율표를 띄우고 해당 구간 금액을
  한 번에 채우는 버튼**을 붙였다. 1.7 의 "환불 예상액 조회 API 부재" 는 이걸로 실무상
  해소된다 (계산 근거를 운영자가 눈으로 확인 가능).
- `GET /order/ticket/{paymentId}/cancel-amount` 도 생겼지만 **본인 주문만 조회 가능**해
  관리자 화면에서는 쓸 수 없다.
  - [ ] MASTER 가 남의 주문에도 이 API 를 쓸 수 있게 열어줄 수 있는지 확인 (1.6 과 동일한
    소유권 제한 이슈). 열리면 예상 환불액을 자동으로 채워 400 위험을 없앨 수 있다.
- 프론트 계산은 어디까지나 참고용이다 — 유예시간 예외(`gracePeriodHours`)와 무료/부분
  취소 케이스는 반영하지 않고 최종 검증은 백엔드에 맡긴다.

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
