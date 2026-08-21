import type { Page } from "@playwright/test";

type Json = unknown;

function fulfillJson(status: number, body: Json) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

/* ============================== Auth ============================== */

/**
 * /api/auth/login 응답을 mock. 성공 시 Set-Cookie 로 쿠키도 발급하여
 * 후속 navigation 의 proxy.ts 가드를 통과하게 한다.
 */
export async function mockAuthLoginSuccess(page: Page) {
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 200,
      headers: {
        "set-cookie": "mc_admin_token=fake-test-token; Path=/; HttpOnly; SameSite=Lax",
      },
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );
}

export async function mockAuthLoginFailure(
  page: Page,
  msg = "이메일 또는 비밀번호가 잘못되었습니다.",
) {
  await page.route("**/api/auth/login", (route) =>
    route.fulfill(fulfillJson(401, { ok: false, msg })),
  );
}

/**
 * GET /api/member/me — 헤더의 계정 배지가 모든 admin 페이지에서 호출한다.
 */
export async function mockMe(page: Page, overrides: Record<string, unknown> = {}) {
  await page.route("**/api/backend/api/member/me", (route) =>
    route.fulfill(
      fulfillJson(200, {
        msg: "OK",
        data: {
          nickName: "관리자",
          email: "admin@multicket.com",
          profileUrl: null,
          gender: "NONE",
          loginType: "LOCAL",
          memberType: "MASTER",
          memberStatus: "COMPLETE",
          year: 1990,
          month: 1,
          day: 1,
          deleted: false,
          lastLoginAt: "2026-05-15T18:00:00",
          createDate: "2026-01-01T09:00:00",
          updateDate: "2026-05-15T18:00:00",
          genres: [],
          area: null,
          ...overrides,
        },
      }),
    ),
  );
}

/* ============================== Members ============================== */

export interface MockMember {
  id: number;
  nickName: string;
  email: string;
  memberType: "AUDIENCE" | "CREATOR" | "MASTER";
  memberStatus: "PENDING" | "COMPLETE" | "FROZEN" | "BANNED" | "DELETED";
  loginType: "LOCAL" | "GOOGLE" | "KAKAO" | "NAVER" | "APPLE";
  deleted: boolean;
  createDate: string;
  lastLoginAt: string | null;
  phoneNumber?: string | null;
}

export const SAMPLE_MEMBER: MockMember = {
  id: 1,
  nickName: "테스터",
  email: "tester@multicket.com",
  memberType: "CREATOR",
  memberStatus: "COMPLETE",
  loginType: "LOCAL",
  deleted: false,
  createDate: "2026-01-01T09:00:00",
  lastLoginAt: "2026-05-15T18:00:00",
};

export async function mockMemberList(
  page: Page,
  members: MockMember[],
  { hasNext = false }: { hasNext?: boolean } = {},
) {
  await page.route("**/api/backend/admin/member/list*", (route) =>
    route.fulfill(
      fulfillJson(200, {
        msg: "OK",
        data: { data: members, hasNext },
      }),
    ),
  );
}

export async function mockMemberDetail(page: Page, member: MockMember) {
  const detail = {
    ...member,
    profileUrl: null,
    gender: null,
    year: 1990,
    month: 5,
    day: 19,
    updateDate: member.createDate,
    genres: [],
    area: null,
    phoneNumber: member.phoneNumber ?? null,
  };
  await page.route("**/api/backend/admin/member/detail*", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: detail })),
  );
}

/**
 * 회원 상태 변경 mock.
 * 백엔드는 목표 상태가 아니라 전이 이벤트(`event`) 를 받는다.
 */
export async function mockMemberChange(
  page: Page,
  onCall?: (body: { memberId: number; event: string }) => void,
) {
  await page.route("**/api/backend/admin/member/change", async (route) => {
    if (onCall) {
      const body = route.request().postDataJSON() as {
        memberId: number;
        event: string;
      };
      onCall(body);
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
  });
}

/* ============================== Performances ============================== */

export interface MockPerformanceListItem {
  id: number;
  title: string;
  venueName: string;
  startDate: string;
  endDate: string;
  genres: string[] | null;
  deleted: boolean;
  memberId: number | null;
  memberNickname: string | null;
}

export const SAMPLE_PERFORMANCE: MockPerformanceListItem = {
  id: 1,
  title: "테스트 공연",
  venueName: "테스트 극장",
  startDate: "2026-06-01T19:00:00",
  endDate: "2026-06-30T22:00:00",
  genres: ["연극"],
  deleted: false,
  memberId: 1,
  memberNickname: "테스터",
};

export async function mockPerformanceList(
  page: Page,
  performances: MockPerformanceListItem[],
  { hasNext = false }: { hasNext?: boolean } = {},
) {
  await page.route("**/api/backend/admin/performance/list*", (route) =>
    route.fulfill(
      fulfillJson(200, {
        msg: "OK",
        data: { data: performances, hasNext },
      }),
    ),
  );
}

export async function mockPerformanceDetail(
  page: Page,
  performance: MockPerformanceListItem,
) {
  const detail = {
    performanceId: performance.id,
    kopisId: "PF000001",
    title: performance.title,
    venueName: performance.venueName,
    startDate: performance.startDate,
    endDate: performance.endDate,
    runTime: "100분",
    ageLimit: 12,
    price: 50000,
    posterUrl: null,
    synopsis: "테스트용 시놉시스입니다.",
    area: "서울특별시",
    genres: performance.genres,
    isOpenRun: false,
    isDaeHakRo: false,
    ticketLink: null,
    limitTime: 2,
    deleted: performance.deleted,
    syncedAt: null,
    createDate: "2026-01-01T09:00:00",
    updateDate: "2026-01-01T09:00:00",
    crewInfos: [],
    amount: 100,
    amountLeft: 50,
    ticketDates: [],
    ticketInfos: [],
    discounts: [],
    memberId: performance.memberId,
    memberNickname: performance.memberNickname,
    memberEmail: "tester@multicket.com",
    memberType: "CREATOR",
    memberStatus: "COMPLETE",
  };
  await page.route("**/api/backend/admin/performance/detail*", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: detail })),
  );
}

/** DELETE /admin/performance/{id} */
export async function mockPerformanceDelete(page: Page, onCall?: (id: string) => void) {
  await page.route("**/api/backend/admin/performance/*", async (route) => {
    if (route.request().method() !== "DELETE") {
      await route.fallback();
      return;
    }
    if (onCall) {
      const segments = new URL(route.request().url()).pathname.split("/");
      onCall(segments[segments.length - 1]);
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
  });
}

/* ============================== Inquiries ============================== */

export interface MockInquiry {
  id: number;
  writerNickName: string;
  title: string;
  inquiryStatus: "PENDING" | "COMPLETED" | "REJECTED";
  inquiryType: "MEMBER_STATUS" | "PERFORMANCE_CHECK" | "PERFORMANCE_DUPLICATE" | "GENERAL";
  inquiryRefId: number | null;
  createDate: string;
}

export const SAMPLE_INQUIRY: MockInquiry = {
  id: 1,
  writerNickName: "테스터",
  title: "가입 승인 요청합니다",
  inquiryStatus: "PENDING",
  inquiryType: "MEMBER_STATUS",
  inquiryRefId: 1,
  createDate: "2026-05-19T13:00:00",
};

export async function mockInquiryList(
  page: Page,
  inquiries: MockInquiry[],
  { hasNext = false }: { hasNext?: boolean } = {},
) {
  await page.route("**/api/backend/admin/inquiry/list*", (route) =>
    route.fulfill(
      fulfillJson(200, {
        msg: "OK",
        data: { data: inquiries, hasNext },
      }),
    ),
  );
}

export async function mockInquiryDetail(page: Page, inquiry: MockInquiry) {
  const detail = {
    ...inquiry,
    writerId: 1,
    writerEmail: "tester@multicket.com",
    description: "가입 승인 부탁드립니다.",
    updateDate: inquiry.createDate,
    refDetail: null,
  };
  await page.route(`**/api/backend/admin/inquiry/${inquiry.id}`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: detail }));
  });
}

/** PATCH /admin/inquiry/{id} */
export async function mockInquiryUpdate(
  page: Page,
  inquiryId: number,
  onCall?: (body: { event: string; memberEvent?: string }) => void,
) {
  await page.route(`**/api/backend/admin/inquiry/${inquiryId}`, async (route) => {
    if (route.request().method() !== "PATCH") {
      await route.fallback();
      return;
    }
    if (onCall) {
      onCall(route.request().postDataJSON() as { event: string; memberEvent?: string });
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
  });
}

/* ============================== Keywords / Notices / Batch / Revenue ====== */

export async function mockKeywords(
  page: Page,
  keywords: Record<string, { active: string[]; inactive: string[] }> = {
    GENRE: { active: ["연극"], inactive: ["아동가족극"] },
    ELSE: { active: ["추천"], inactive: [] },
  },
) {
  await page.route("**/api/backend/admin/keyword", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: keywords }));
  });
}

export async function mockKeywordUpdate(
  page: Page,
  onCall?: (body: { keywords: Record<string, string[]> }) => void,
) {
  await page.route("**/api/backend/admin/keyword", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    if (onCall) {
      onCall(route.request().postDataJSON() as { keywords: Record<string, string[]> });
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
  });
}

/* ============================== Dashboard ============================== */

export interface MockDashboardSummary {
  todaySalesCount: number;
  todayRevenue: number;
  activeAudienceCount: number;
  activeCreatorCount: number;
  pendingCreatorCount: number;
  onSalePerformanceCount: number;
}

export const SAMPLE_DASHBOARD: MockDashboardSummary = {
  todaySalesCount: 12,
  todayRevenue: 480000,
  activeAudienceCount: 340,
  activeCreatorCount: 27,
  pendingCreatorCount: 3,
  onSalePerformanceCount: 15,
};

/** GET /admin/dashboard — 대시보드 집계 */
export async function mockDashboardSummary(
  page: Page,
  summary: MockDashboardSummary = SAMPLE_DASHBOARD,
) {
  await page.route("**/api/backend/admin/dashboard", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: summary })),
  );
}

/* ============================== Notice ============================== */

export interface MockNotice {
  id: number;
  type: string;
  title: string;
  content?: string;
  writerId?: number | null;
  writerEmail?: string | null;
  createDate: string;
  expireDate: string | null;
  maintenanceStartDate?: string | null;
  updatePolicy?: string | null;
  targetPlatforms?: string[] | null;
}

export const SAMPLE_NOTICE: MockNotice = {
  id: 1,
  type: "CANCEL_REFUND_PAID",
  title: "유료 공연 취소·환불 규정",
  content: "환불 규정 본문",
  writerId: 1,
  writerEmail: "admin@multicket.com",
  createDate: "2026-05-01T10:00:00",
  expireDate: "2099-01-01T00:00:00",
};

/**
 * GET /notice/urgent — 앱 폴링 공고 (APP_UPDATE / URGENT / MAINTENANCE).
 * 백엔드가 **배열**을 돌려주며, 빈 배열이면 노출 중인 안내가 없다는 뜻이다.
 */
export async function mockUrgentNotices(page: Page, notices: MockNotice[] = []) {
  await page.route("**/api/backend/notice/urgent", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: notices })),
  );
}

/** GET /notice?type= — 타입별 최신 공고 (사용자 노출 미리보기) */
export async function mockLatestNotice(page: Page, notice: MockNotice | null = SAMPLE_NOTICE) {
  await page.route("**/api/backend/notice*", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: notice })),
  );
}

/** GET /admin/notice — 관리자 공고 목록 (cursor) */
export async function mockNoticeList(
  page: Page,
  notices: MockNotice[] = [SAMPLE_NOTICE],
  { hasNext = false }: { hasNext?: boolean } = {},
) {
  await page.route("**/api/backend/admin/notice?**", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: { data: notices, hasNext } })),
  );
}

/** GET /admin/notice/{id} — 관리자 공고 상세 */
export async function mockNoticeDetail(page: Page, notice: MockNotice = SAMPLE_NOTICE) {
  await page.route(`**/api/backend/admin/notice/${notice.id}`, (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    return route.fulfill(fulfillJson(200, { msg: "OK", data: notice }));
  });
}

/** POST /admin/notice — 공고 등록 */
export async function mockNoticeCreate(
  page: Page,
  onCall?: (body: Record<string, unknown>) => void,
) {
  await page.route("**/api/backend/admin/notice", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    if (onCall) onCall(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
  });
}

/* ============================== App version ============================== */

export interface MockAppVersion {
  id: number;
  platform: "IOS" | "ANDROID";
  version: string;
  appliedDate: string;
  updateNote: string | null;
  createDate: string;
}

export const SAMPLE_APP_VERSION: MockAppVersion = {
  id: 1,
  platform: "IOS",
  version: "1.2.0",
  appliedDate: "2026-05-01",
  updateNote: "예매 취소 화면 개선",
  createDate: "2026-05-01T10:00:00",
};

/** GET /admin/app-version — 버전 이력 (배열) */
export async function mockAppVersions(
  page: Page,
  versions: MockAppVersion[] = [SAMPLE_APP_VERSION],
) {
  await page.route("**/api/backend/admin/app-version**", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    await route.fulfill(fulfillJson(200, { msg: "OK", data: versions }));
  });
}

/** POST /admin/app-version — 버전 등록 */
export async function mockAppVersionCreate(
  page: Page,
  onCall?: (body: Record<string, unknown>) => void,
) {
  await page.route("**/api/backend/admin/app-version", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    if (onCall) onCall(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
  });
}

/* ============================== Settlement ============================== */

export interface MockSettlement {
  id: number;
  performanceId: number;
  performanceTitle: string;
  creatorId: number;
  creatorNickName: string;
  status: "PENDING" | "SUCCESS" | "FAIL";
  createDate: string;
}

export const SAMPLE_SETTLEMENT: MockSettlement = {
  id: 7,
  performanceId: 3,
  performanceTitle: "레미제라블",
  creatorId: 5,
  creatorNickName: "창작자A",
  status: "PENDING",
  createDate: "2026-06-01T09:00:00",
};

/** GET /admin/settlement/list — cursor 목록 */
export async function mockSettlementList(
  page: Page,
  settlements: MockSettlement[] = [SAMPLE_SETTLEMENT],
  { hasNext = false }: { hasNext?: boolean } = {},
) {
  await page.route("**/api/backend/admin/settlement/list**", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: { data: settlements, hasNext } })),
  );
}

/** GET /admin/settlement/{id} — 상세 */
export async function mockSettlementDetail(
  page: Page,
  overrides: Record<string, unknown> = {},
) {
  await page.route(`**/api/backend/admin/settlement/${SAMPLE_SETTLEMENT.id}`, (route) =>
    route.fulfill(
      fulfillJson(200, {
        msg: "OK",
        data: {
          ...SAMPLE_SETTLEMENT,
          venueName: "블루스퀘어",
          enableDate: "2026-06-20T19:30:00",
          creatorEmail: "creator@multicket.com",
          settlementAmount: 900000,
          settlementDate: "2026-06-30T00:00:00",
          totalSuccessAmount: 1000000,
          totalCancelAmount: 0,
          feeRatePercent: 10,
          feeAmount: 100000,
          finalAmount: 900000,
          portoneTransferId: null,
          successAt: null,
          ...overrides,
        },
      }),
    ),
  );
}

export interface MockJobInstance {
  jobInstanceId: number;
  jobName: string;
  status: string;
  jobExecutionId: number | null;
  startTime: string | null;
  endTime: string | null;
}

export const SAMPLE_JOB: MockJobInstance = {
  jobInstanceId: 12,
  jobName: "kopisSyncJob",
  status: "FAILED",
  jobExecutionId: 34,
  startTime: "2026-05-19T02:00:00",
  endTime: "2026-05-19T02:04:00",
};

export async function mockJobInstances(page: Page, jobs: MockJobInstance[]) {
  await page.route("**/api/backend/admin/batch/job-instances?*", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: jobs })),
  );
}

export async function mockJobRestart(page: Page, job: MockJobInstance) {
  await page.route(
    `**/api/backend/admin/batch/job-instances/${job.jobInstanceId}/restart`,
    (route) =>
      route.fulfill(
        fulfillJson(200, {
          msg: "OK",
          data: {
            jobInstanceId: job.jobInstanceId,
            jobName: job.jobName,
            jobExecutionId: 35,
          },
        }),
      ),
  );
}

export interface MockCreatorRevenue {
  creatorId: number;
  creatorEmail: string | null;
  creatorPhone: string | null;
  creatorNickName: string | null;
  totalPaymentAmount: number;
  totalCancelAmount: number;
  performances:
    | Array<{
        performanceId: number;
        performanceTitle: string;
        paymentAmount: number;
        cancelAmount: number;
      }>
    | null;
}

export const SAMPLE_REVENUE: MockCreatorRevenue = {
  creatorId: 1,
  creatorEmail: "tester@multicket.com",
  creatorPhone: "010-0000-0000",
  creatorNickName: "테스터",
  totalPaymentAmount: 1_000_000,
  totalCancelAmount: 200_000,
  performances: [
    {
      performanceId: 1,
      performanceTitle: "테스트 공연",
      paymentAmount: 1_000_000,
      cancelAmount: 200_000,
    },
  ],
};

export async function mockMonthlyRevenue(page: Page, rows: MockCreatorRevenue[]) {
  await page.route("**/api/backend/admin/revenue/monthly*", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: rows })),
  );
}

/* ============================== Reports ============================== */

export interface MockReport {
  id: number;
  performanceId: number;
  performanceTitle: string;
  reporterNickName: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  createDate: string;
}

export const SAMPLE_REPORT: MockReport = {
  id: 1,
  performanceId: 1,
  performanceTitle: "테스트 공연",
  reporterNickName: "신고자",
  status: "PENDING",
  createDate: "2026-05-19T13:00:00",
};

export async function mockReportList(
  page: Page,
  reports: MockReport[],
  { hasNext = false }: { hasNext?: boolean } = {},
) {
  await page.route("**/api/backend/admin/report/list*", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: { data: reports, hasNext } })),
  );
}

export async function mockReportDetail(
  page: Page,
  report: MockReport,
  overrides: Record<string, unknown> = {},
) {
  const detail = {
    ...report,
    reporterId: 2,
    reporterEmail: "reporter@multicket.com",
    reason: "공연 정보가 실제와 다릅니다.",
    creatorId: 1,
    creatorNickName: "테스터",
    handledById: null,
    handledByNickName: null,
    opinion: null,
    handledAt: null,
    ...overrides,
  };
  await page.route(`**/api/backend/admin/report/${report.id}`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: detail }));
  });
}

/** PATCH /admin/report/{id} */
export async function mockReportProcess(
  page: Page,
  reportId: number,
  onCall?: (body: { event: string; opinion: string; notifyCreator?: boolean }) => void,
) {
  await page.route(`**/api/backend/admin/report/${reportId}`, async (route) => {
    if (route.request().method() !== "PATCH") {
      await route.fallback();
      return;
    }
    if (onCall) {
      onCall(
        route.request().postDataJSON() as {
          event: string;
          opinion: string;
          notifyCreator?: boolean;
        },
      );
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
  });
}

/* ============================== Failed events ============================== */

export interface MockFailedEvent {
  id: number;
  eventType: string;
  target: string | null;
  originQueue: string | null;
  status: "PENDING" | "COMPLETE";
  occurredAt: string | null;
}

export const SAMPLE_FAILED_EVENT: MockFailedEvent = {
  id: 7,
  eventType: "SETTLEMENT_TRANSFER",
  target: "settlement:1024",
  originQueue: "settlement.transfer.q",
  status: "PENDING",
  occurredAt: "2026-05-19T02:10:00",
};

export async function mockFailedEventList(
  page: Page,
  events: MockFailedEvent[],
  { hasNext = false }: { hasNext?: boolean } = {},
) {
  await page.route("**/api/backend/admin/failed-event/list*", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: { data: events, hasNext } })),
  );
}

export async function mockFailedEventDetail(page: Page, event: MockFailedEvent) {
  const detail = {
    ...event,
    description: "정산 이체 처리 실패",
    failureReason: "PG 응답 시간 초과",
    createDate: "2026-05-19T02:10:05",
    payload: { settlementId: 1024, amount: 350000 },
  };
  await page.route(`**/api/backend/admin/failed-event/${event.id}`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: detail }));
  });
}

/** PATCH /admin/failed-event/{id}/retry · /complete */
export async function mockFailedEventAction(
  page: Page,
  eventId: number,
  action: "retry" | "complete",
  onCall?: () => void,
) {
  await page.route(
    `**/api/backend/admin/failed-event/${eventId}/${action}`,
    async (route) => {
      if (onCall) onCall();
      await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
    },
  );
}
