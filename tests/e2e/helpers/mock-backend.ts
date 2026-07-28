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
  loginType: "LOCAL" | "GOOGLE" | "KAKAO" | "NAVER";
  deleted: boolean;
  createDate: string;
  lastLoginAt: string | null;
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

export async function mockLatestNotice(page: Page, content: string | null = "환불 규정 본문") {
  await page.route("**/api/backend/notice*", (route) =>
    route.fulfill(
      fulfillJson(200, {
        msg: "OK",
        data: content
          ? {
              id: 1,
              type: "CANCEL_REFUND_PAID",
              content,
              createDate: "2026-05-01T10:00:00",
            }
          : null,
      }),
    ),
  );
}

export async function mockNoticeCreate(
  page: Page,
  onCall?: (body: { type: string; content: string }) => void,
) {
  await page.route("**/api/backend/admin/notice", async (route) => {
    if (onCall) {
      onCall(route.request().postDataJSON() as { type: string; content: string });
    }
    await route.fulfill(fulfillJson(200, { msg: "OK", data: null }));
  });
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
