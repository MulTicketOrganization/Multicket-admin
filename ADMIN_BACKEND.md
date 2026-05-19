# Multicket Admin Backend API 명세

> Next.js 로 만들 **Admin 전용 웹** 작업자에게 전달하는 백엔드 문서.
> 본 문서는 Multicket-app 의 `backendRepository/` (Spring Boot) 를 기준으로 자동 추출/정리되었다.
> 백엔드 변경 시 본 문서도 갱신해야 한다.

---

## 0. TL;DR (먼저 확인)

| 항목 | 값 |
|---|---|
| Base URL (개발) | `http://localhost:8080` |
| Auth | JWT Bearer (Access 1d / Refresh 30d, Refresh 는 서버 Redis 보관) |
| 권한 | `/admin/**` 는 `MemberType.MASTER` 필요 |
| 응답 wrapper | `{ "msg": string, "data": T \| null }` |
| 페이지네이션 | Cursor 기반 (`cursorId` 쿼리, 응답 `hasNext`) |
| CORS Origin | `http://localhost:5173`, `https://localhost:5173` (변경 협의 필요) |
| 토큰 응답 위치 | 로그인 응답 **헤더** `Authorization: Bearer {token}` |

---

## 1. AdminController 엔드포인트

기본 경로 prefix: `/admin`

| HTTP | Path | Method 명 | Request | Response | 페이지네이션 |
|---|---|---|---|---|---|
| GET | `/admin/performance/list` | searchPerformanceList | `AdminPerformanceListRequest` (Query) | `AdminPerformanceListResponse` | Cursor |
| GET | `/admin/performance/detail` | getPerformanceDetail | `performanceId` (Query) | `AdminPerformanceDetailResponse` | - |
| GET | `/admin/member/list` | getMemberList | `AdminMemberListRequest` (Query) | `AdminMemberListResponse` | Cursor |
| GET | `/admin/member/detail` | memberDetail | `memberId` (Query) | `AdminMemberResponse` | - |
| POST | `/admin/member/change` | changeMember | `AdminMemberChangeRequest` (Body) | Void (200 OK) | - |

---

## 2. Request / Response DTO

### 2.1 AdminPerformanceListRequest (Query)

| 필드 | 타입 | Nullable | 비고 |
|---|---|---|---|
| cursorId | Long | N | 기본 0 |
| genre | String | Y | 한글 값 (예: "연극") |
| area | Area enum | Y | 지역 필터 |
| deleted | Boolean | Y | true → 삭제된 항목 포함 |
| memberId | Long | Y | 작성자(크리에이터) ID |
| title | String | Y | 제목 contains 검색 |

### 2.2 AdminPerformanceListResponse

| 필드 | 타입 | Nullable |
|---|---|---|
| data | `List<AdminPerformanceListDto>` | N |
| hasNext | Boolean | N |

**AdminPerformanceListDto**

| 필드 | 타입 | Nullable |
|---|---|---|
| id | Long | N |
| title | String | N |
| venueName | String | N |
| startDate | LocalDateTime | N |
| endDate | LocalDateTime | N |
| genre | String | Y |
| deleted | Boolean | N |
| memberId | Long | Y |
| memberNickname | String | Y |

### 2.3 AdminPerformanceDetailResponse

| 그룹 | 필드 | 타입 | Nullable |
|---|---|---|---|
| 공연 | performanceId | Long | N |
| 공연 | kopisId | String | Y |
| 공연 | title | String | N |
| 공연 | venueName | String | N |
| 공연 | startDate | LocalDateTime | N |
| 공연 | endDate | LocalDateTime | N |
| 공연 | runTime | String | Y |
| 공연 | ageLimit | Integer | Y |
| 공연 | price | Long | Y |
| 공연 | posterUrl | String | Y |
| 공연 | synopsis | String | Y |
| 공연 | area | Area | Y |
| 공연 | genre | String | Y |
| 공연 | isOpenRun | Boolean | Y |
| 공연 | isDaeHakRo | Boolean | Y |
| 공연 | ticketLink | String | Y |
| 공연 | deleted | Boolean | N |
| 공연 | syncedAt | LocalDateTime | Y |
| 공연 | createDate | LocalDateTime | N |
| 공연 | updateDate | LocalDateTime | N |
| 공연 | crewInfos | `List<CrewInfoDto>` | Y |
| 티켓 | ticketAccountId | Long | Y |
| 티켓 | amount | Long | Y |
| 티켓 | amountLeft | Long | Y |
| 티켓 | ticketDates | `List<TicketDateDto>` | Y |
| 티켓 | ticketInfos | `List<TicketInfoDto>` | Y |
| 작성자 | memberId | Long | Y |
| 작성자 | memberNickname | String | Y |
| 작성자 | memberEmail | String | Y |
| 작성자 | memberType | MemberType | Y |
| 작성자 | memberStatus | MemberStatus | Y |

`CrewInfoDto`, `TicketDateDto`, `TicketInfoDto` 의 스키마는 본 문서 부록 §A 참고.

### 2.4 AdminMemberListRequest (Query)

| 필드 | 타입 | Nullable | 비고 |
|---|---|---|---|
| cursorId | Long | N | 기본 0 |
| memberType | MemberType | Y | 회원 타입 필터 |
| memberStatus | MemberStatus | Y | 회원 상태 필터 |
| keyword | String | Y | 이메일/닉네임 contains |

### 2.5 AdminMemberListResponse

| 필드 | 타입 | Nullable |
|---|---|---|
| data | `List<AdminMemberListDto>` | N |
| hasNext | Boolean | N |

**AdminMemberListDto**

| 필드 | 타입 | Nullable |
|---|---|---|
| id | Long | N |
| nickName | String | N |
| email | String | N |
| memberType | MemberType | N |
| memberStatus | MemberStatus | N |
| loginType | LoginType | N |
| deleted | Boolean | N |
| createDate | LocalDateTime | N |
| lastLoginAt | LocalDateTime | Y |

### 2.6 AdminMemberResponse (회원 상세)

| 필드 | 타입 | Nullable |
|---|---|---|
| id | Long | N |
| nickName | String | N |
| email | String | N |
| profileUrl | String | Y |
| gender | Gender | Y |
| loginType | LoginType | N |
| memberType | MemberType | N |
| memberStatus | MemberStatus | N |
| year | Integer | Y |
| month | Integer | Y |
| day | Integer | Y |
| deleted | Boolean | N |
| lastLoginAt | LocalDateTime | Y |
| createDate | LocalDateTime | N |
| updateDate | LocalDateTime | N |

### 2.7 AdminMemberChangeRequest (Body)

| 필드 | 타입 | Nullable | 설명 |
|---|---|---|---|
| memberId | Long | N | 변경할 회원 ID |
| memberStatus | MemberStatus | N | 새 상태 (`PENDING`/`COMPLETE`/`FROZEN`) |

> ⚠️ 현재 API 는 `memberStatus` 만 변경 가능. `memberType` 변경(예: 일반 → MASTER 승격) 은 별도 endpoint 가 없어 DB 수동 변경 필요.

---

## 3. Enum 값

### MemberType
| 값 | 설명 |
|---|---|
| `AUDIENCE` | 관객 |
| `CREATOR` | 크리에이터 |
| `MASTER` | 관리자 (admin 접근 권한) |

### MemberStatus
| 값 | 설명 |
|---|---|
| `PENDING` | 가입 대기 (이메일 인증 전) |
| `COMPLETE` | 가입 완료 |
| `FROZEN` | 동결 |

### Gender
| 값 |
|---|
| `MALE` |
| `FEMALE` |
| `NONE` |

### LoginType
| 값 |
|---|
| `LOCAL` |
| `GOOGLE` |
| `KAKAO` |
| `NAVER` |

### Area
서울특별시 / 인천광역시 / 대전광역시 / 대구광역시 / 광주광역시 / 부산광역시 / 울산광역시 / 세종특별자치시 / 경기도 / 충청북도 / 충청남도 / 경상북도 / 경상남도 / 전북특별자치도 / 전라남도 / 강원특별자치도 / 제주특별자치도 / 대학로 / 기타

### Genre (한글 표시 값)
연극 / 뮤지컬 / 서양음악(클래식) / 한국음악(국악) / 대중음악 / 무용(서양/한국무용) / 대중무용 / 서커스/마술 / 복합 / 아동 / 오픈런 / 기타

---

## 4. 인증 / 권한

### 4.1 권한 매핑

| 경로 | 필요 권한 |
|---|---|
| `/admin/**` | `MemberType.MASTER` |
| `/docs/**` | `MemberType.MASTER` |
| `/creator/**` | `MemberType.CREATOR` 또는 `MASTER` |
| 그 외 | 회원 로그인 (`isAuthenticated`) |

### 4.2 JWT 토큰
- Access: 1일, Refresh: 30일 (서버 Redis 보관)
- Payload: `id`(Long), `category`("ACCESS"/"REFRESH"), `iss`("test"), `iat`, `exp`
- 권한(authority)은 JWT 가 아닌 서버의 `CustomUserDetail` 에서 `MemberType` 으로 판단

### 4.3 인증 흐름 (요약)
1. 클라이언트 → `Authorization: Bearer {accessToken}` 헤더로 요청
2. 서버 `JwtAuthFilter` 가 토큰 검증
3. Access 만료 시:
   - Redis 에 Refresh 가 있으면 새 Access 자동 발급 → 응답 헤더 `Authorization` 으로 반환
   - Refresh 없으면 401 반환
4. `MemberType` 권한 부족 시 403 반환

### 4.4 상태 코드 가이드

| 코드 | 의미 |
|---|---|
| 200 | 성공 |
| 400 | 토큰 파싱 실패 / 회원 미존재 / Validation 실패 |
| 401 | 토큰 없음 / 무효 / 만료 + Refresh 없음 |
| 403 | 권한 부족 (예: 일반 회원이 `/admin` 호출) |
| 500 | 서버 내부 오류 |

---

## 5. 공통 응답 Wrapper

### 5.1 성공
```json
{
  "msg": "OK",
  "data": { "...": "..." }
}
```

### 5.2 실패
```json
{
  "msg": "Access Denied",
  "data": null
}
```

### 5.3 페이지네이션 응답 예시
`GET /admin/performance/list?cursorId=0`
```json
{
  "msg": "OK",
  "data": {
    "data": [
      {
        "id": 1,
        "title": "샘플 공연",
        "venueName": "홍대 씨어터",
        "startDate": "2026-06-01T19:00:00",
        "endDate": "2026-06-30T23:00:00",
        "genre": "연극",
        "deleted": false,
        "memberId": 10,
        "memberNickname": "크리에이터123"
      }
    ],
    "hasNext": false
  }
}
```

---

## 6. 로그인 / 토큰 관리

### 6.1 Local 로그인
- **Endpoint**: `POST /member/request/login`
- **Body**:
  ```json
  { "mail": "user@example.com", "password": "password123" }
  ```
- **Response Header**: `Authorization: Bearer {accessToken}`
- **Response Body**: 비어있음 (헤더에서 추출)
- **응답 헤더 노출**: 서버 CORS 설정에서 `Authorization` 을 `exposedHeaders` 로 노출 중 → 브라우저 fetch 의 `response.headers.get('Authorization')` 으로 접근 가능

### 6.2 OAuth2 로그인 (Google / Kakao / Naver)
- **Endpoint**: `GET /oauth2/authorization/{registrationId}` (Spring Security 기본 경로)
  - `google`, `kakao`, `naver`
- **콜백**: 서버가 토큰 발급 후 프론트로 리다이렉트
  - `http://localhost:5173/oauth2/callback?token={accessToken}`
- Admin 은 일반적으로 Local 로그인을 쓰지만 OAuth2 도 동일하게 동작

### 6.3 자동 토큰 갱신
- 클라이언트가 만료된 Access Token 을 보내도 서버가 Redis 의 Refresh Token 으로 자동 갱신 → 응답 헤더에 새 Access Token 동봉
- **권장 구현**: Next.js fetch wrapper 에서 응답 헤더에 `Authorization` 가 오면 로컬 토큰 교체

```ts
// 의사 코드 (axios)
api.interceptors.response.use((res) => {
  const newToken = res.headers['authorization'];
  if (newToken) saveAccessToken(newToken.replace('Bearer ', ''));
  return res;
});
```

### 6.4 로그아웃
- **Endpoint**: `GET /member/logout`
- Redis 에서 해당 회원의 Refresh Token / 캐시 삭제

---

## 7. 서버 / 인프라 설정

| 항목 | 값 |
|---|---|
| 서버 포트 | `8080` (yaml 에 명시 X → Spring Boot 기본값) |
| OAuth2 Redirect URL (prod) | `http://localhost:5173/oauth2/callback` |
| OAuth2 Redirect URL (dev) | `http://localhost:8080/test/callback` |
| Session Policy | `STATELESS` (JWT) |
| CORS Origin | `http://localhost:5173`, `https://localhost:5173` |
| CORS Allowed Methods | `*` |
| CORS Allowed Headers | `*` |
| CORS Exposed Headers | `Authorization` |
| CORS Credentials | `true` |
| JWT Secret | env `JWT_SECRET_KEY` |
| JWT Issuer | `test` |

> ⚠️ Next.js admin 을 다른 포트(예: 3000) 로 띄울 거면 백엔드 CORS Origin 에 추가 요청 필요.

---

## 8. Cursor 페이지네이션 사용법

```
GET /admin/performance/list?cursorId=0
→ data[0..9], hasNext=true 라면
GET /admin/performance/list?cursorId={data[9].id}
→ data[10..19], ...
```

- 페이지 크기: 10 고정 (서버에서 11개 조회 후 `hasNext` 판단)
- 정렬: `id ASC`
- 응답 `data` 가 비어있고 `hasNext=false` 면 끝.

---

## 9. Admin 사용자 만들기

회원가입은 기본적으로 `MemberType.CREATOR` (DB default) 로 생성된다. Admin 권한을 부여하려면 DB 에서 직접 변경:

```sql
UPDATE member SET member_type = 'MASTER' WHERE id = {memberId};
```

API 로 `MemberType` 을 바꾸는 endpoint 는 현재 없음 (보안상 의도).

---

## 10. Next.js 구현 체크리스트

- [ ] `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` 로 .env 설정
- [ ] fetch/axios 인스턴스에 `Authorization` 헤더 자동 부착
- [ ] 응답 인터셉터로 새 `Authorization` 헤더 자동 캐치 (자동 갱신 대응)
- [ ] 401 → 로그인 페이지로 redirect, 403 → "권한 없음" 안내
- [ ] 페이지네이션 컴포넌트는 cursor 기반으로 구현 (offset 아님)
- [ ] CORS Origin 합의 (백엔드 yaml 갱신 요청)
- [ ] LocalDateTime 응답은 ISO 8601 (`2026-06-01T19:00:00`) — `new Date()` 직접 파싱 가능
- [ ] Enum 값은 문자열 그대로 비교 (`MemberType` 등)

---

## 부록 A. 공통 DTO 정의

### CrewInfoDto
| 필드 | 타입 | Nullable |
|---|---|---|
| name | String | N |
| imgUrl | String | Y |
| castStaff | CastStaff (`CAST` / `STAFF`) | N |

### TicketDateDto
| 필드 | 타입 | Nullable |
|---|---|---|
| id | Long | N |
| enableDate | LocalDateTime | N |

### TicketInfoDto
| 필드 | 타입 | Nullable |
|---|---|---|
| id | Long | N |
| ticketType | TicketType | N |
| price | Long | N |

### TicketType
`NORMAL` / `PREMIUM` / `KID` / `ADULT` / `SENIOR`

---

## 부록 B. 참고: 백엔드의 알려진 이슈

1. **회원가입 기본 MemberType 이 CREATOR**: 신규 가입자가 자동으로 크리에이터가 되어 `/creator/**` 접근 가능. 정책 확인 필요.
2. **PaymentController 비활성**: `@RestController` 가 주석 처리되어 결제 endpoint 미동작.
3. **공연 검색 path 오타**: `/api/performances/serach/{keyword}` (search 아님). 추후 수정될 수 있음.
4. **Refresh Token 만료 시 별도 endpoint 없음**: 클라이언트는 401 받으면 로그인 페이지로 보내야 함.

---

본 문서 갱신 책임: Flutter app 작업자 (백엔드 변경 시 Multicket-app 의 본 문서도 동기 업데이트).
