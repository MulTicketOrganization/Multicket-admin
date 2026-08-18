import { expect, test } from "@playwright/test";

import {
  SAMPLE_MEMBER,
  SAMPLE_PERFORMANCE,
  mockMe,
  mockMemberChange,
  mockMemberDetail,
  mockMemberList,
  mockPerformanceList,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("members", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("목록 → 상세 → 상태 변경 골든패스", async ({ page }) => {
    await mockMemberList(page, [SAMPLE_MEMBER]);
    await mockMemberDetail(page, SAMPLE_MEMBER);

    let changeBody: { memberId: number; event: string } | null = null;
    await mockMemberChange(page, (body) => {
      changeBody = body;
    });

    // 1. 목록 진입
    await page.goto("/members");
    await expect(page.getByRole("heading", { name: "회원 관리" })).toBeVisible();
    const nickLink = page.getByRole("link", { name: SAMPLE_MEMBER.nickName });
    await expect(nickLink).toBeVisible();

    // 2. 상세 이동
    await nickLink.click();
    await expect(page).toHaveURL(/\/members\/1$/);
    await expect(page.getByText(SAMPLE_MEMBER.email)).toBeVisible();

    // 3. 상태 변경 dialog 오픈
    await page.getByRole("button", { name: "상태 변경" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // 4. COMPLETE 상태에서 선택 가능한 이벤트 중 "동결" 선택
    await page.getByRole("dialog").getByText("동결", { exact: true }).click();

    // 5. 적용
    await page.getByRole("button", { name: "적용하기" }).click();

    // 6. 토스트 + 전이 이벤트 body 검증 (목표 상태가 아니라 event 를 보낸다)
    await expect(page.getByText(/동결.*적용했습니다/)).toBeVisible();
    expect(changeBody).toEqual({ memberId: 1, event: "FREEZE" });
  });

  test("현재 상태에서 불가능한 전이는 선택지에 없다", async ({ page }) => {
    await mockMemberList(page, [SAMPLE_MEMBER]);
    await mockMemberDetail(page, SAMPLE_MEMBER);

    await page.goto("/members/1");
    await page.getByRole("button", { name: "상태 변경" }).click();

    const dialog = page.getByRole("dialog");
    // COMPLETE → APPROVE(가입 승인) 는 허용되지 않는 전이
    await expect(dialog.getByText("가입 승인", { exact: true })).toHaveCount(0);
    await expect(dialog.getByText("동결", { exact: true })).toBeVisible();
  });

  test("키워드 입력 시 URL 에 ?keyword 가 반영된다 (debounced)", async ({ page }) => {
    await mockMemberList(page, []);
    await page.goto("/members");

    await page.getByPlaceholder("이메일 / 닉네임 검색").fill("홍길동");
    await page.waitForURL(/keyword=%ED%99%8D%EA%B8%B8%EB%8F%99/);
  });

  test("빈 결과 시 안내 메시지 노출", async ({ page }) => {
    await mockMemberList(page, []);
    await page.goto("/members");

    await expect(page.getByText("조건에 맞는 회원이 없습니다.")).toBeVisible();
  });

  test("상세에 연락처와 가입 경로가 표시된다", async ({ page }) => {
    const appleUser = {
      ...SAMPLE_MEMBER,
      memberType: "AUDIENCE" as const,
      loginType: "APPLE" as const,
      phoneNumber: "01012345678",
    };
    await mockMemberDetail(page, appleUser);
    await mockPerformanceList(page, []);

    await page.goto("/members/1");
    await expect(page.getByText("연락처")).toBeVisible();
    // 하이픈 없이 내려와도 화면에서는 포맷해 보여준다
    await expect(page.getByText("010-1234-5678")).toBeVisible();
    await expect(page.getByText("가입 경로")).toBeVisible();
    await expect(page.getByText("Apple", { exact: true })).toBeVisible();
  });

  test("본인인증 전 회원은 연락처가 - 로 표시된다", async ({ page }) => {
    await mockMemberDetail(page, { ...SAMPLE_MEMBER, phoneNumber: null });
    await mockPerformanceList(page, []);

    await page.goto("/members/1");
    const contact = page.locator("dd").filter({ hasText: /^-$/ });
    await expect(contact.first()).toBeVisible();
  });

  test("크리에이터 상세에만 등록 공연 목록이 붙는다", async ({ page }) => {
    await mockMemberDetail(page, SAMPLE_MEMBER); // CREATOR
    await mockPerformanceList(page, [SAMPLE_PERFORMANCE]);

    await page.goto("/members/1");
    await expect(page.getByText("등록 공연")).toBeVisible();
    await expect(
      page.getByRole("link", { name: SAMPLE_PERFORMANCE.title }),
    ).toBeVisible();

    // 공연 관리로 넘어가면 해당 크리에이터 필터가 걸린 채로 열린다
    await page.getByRole("link", { name: "공연 관리에서 보기" }).click();
    await expect(page).toHaveURL(/\/performances\?memberId=1/);
    await expect(page.getByText(/크리에이터.*공연만 표시 중입니다/)).toBeVisible();
  });

  test("관객 상세에는 등록 공연 섹션이 없다", async ({ page }) => {
    await mockMemberDetail(page, { ...SAMPLE_MEMBER, memberType: "AUDIENCE" as const });
    await mockPerformanceList(page, [SAMPLE_PERFORMANCE]);

    await page.goto("/members/1");
    await expect(page.getByText(SAMPLE_MEMBER.email)).toBeVisible();
    await expect(page.getByText("등록 공연")).toHaveCount(0);
  });
});
