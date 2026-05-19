import type { Page } from "@playwright/test";

type Json = unknown;

interface RoutePayload {
  status?: number;
  body: Json;
}

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

export async function mockAuthLoginFailure(page: Page, msg = "이메일 또는 비밀번호가 잘못되었습니다.") {
  await page.route("**/api/auth/login", (route) =>
    route.fulfill(fulfillJson(401, { ok: false, msg })),
  );
}

/* ============================== Members ============================== */

export interface MockMember {
  id: number;
  nickName: string;
  email: string;
  memberType: "AUDIENCE" | "CREATOR" | "MASTER";
  memberStatus: "PENDING" | "COMPLETE" | "FROZEN";
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
  };
  await page.route("**/api/backend/admin/member/detail*", (route) =>
    route.fulfill(fulfillJson(200, { msg: "OK", data: detail })),
  );
}

/**
 * 회원 상태 변경 mock. onCall 콜백으로 요청 body 검증 가능.
 */
export async function mockMemberChange(
  page: Page,
  onCall?: (body: { memberId: number; memberStatus: string }) => void,
) {
  await page.route("**/api/backend/admin/member/change", async (route) => {
    if (onCall) {
      const body = route.request().postDataJSON() as {
        memberId: number;
        memberStatus: string;
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
  genre: string | null;
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
  genre: "연극",
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

export async function mockPerformanceDetail(page: Page, performance: MockPerformanceListItem) {
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
    genre: performance.genre,
    isOpenRun: false,
    isDaeHakRo: false,
    ticketLink: null,
    deleted: performance.deleted,
    syncedAt: null,
    createDate: "2026-01-01T09:00:00",
    updateDate: "2026-01-01T09:00:00",
    crewInfos: [],
    ticketAccountId: null,
    amount: 100,
    amountLeft: 50,
    ticketDates: [],
    ticketInfos: [],
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
