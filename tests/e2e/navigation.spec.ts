import { expect, test } from "@playwright/test";

import {
  SAMPLE_MEMBER,
  SAMPLE_REPORT,
  mockInquiryList,
  mockJobInstances,
  mockMe,
  mockMemberList,
  mockMonthlyRevenue,
  mockReportList,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("navigation", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("회원 메뉴가 관객 · 창작자 · 창작자 승인으로 나뉜다", async ({ page }) => {
    await mockMemberList(page, []);

    await page.goto("/members?type=AUDIENCE");
    const sidebar = page.getByRole("complementary");

    await expect(sidebar.getByRole("link", { name: "관객 회원" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(sidebar.getByRole("link", { name: "창작자 회원" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("같은 경로라도 쿼리로 활성 메뉴가 갈린다", async ({ page }) => {
    await mockMemberList(page, []);
    const sidebar = page.getByRole("complementary");

    await page.goto("/members?type=CREATOR");
    await expect(sidebar.getByRole("link", { name: "창작자 회원" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // status 가 붙지 않은 상태에서는 "창작자 승인" 이 활성화되면 안 된다
    await expect(sidebar.getByRole("link", { name: "창작자 승인" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.goto("/members?type=CREATOR&status=PENDING");
    await expect(sidebar.getByRole("link", { name: "창작자 승인" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(sidebar.getByRole("link", { name: "창작자 회원" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("회원 상세에서는 어느 회원 메뉴도 활성화되지 않는다", async ({ page }) => {
    await mockMemberList(page, []);
    await page.goto("/members/1");

    const sidebar = page.getByRole("complementary");
    for (const label of ["관객 회원", "창작자 회원", "창작자 승인"]) {
      await expect(sidebar.getByRole("link", { name: label })).not.toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  test("신고 · 실패 이벤트 메뉴로 이동할 수 있다", async ({ page }) => {
    await mockMemberList(page, []);
    await mockReportList(page, []);

    await page.goto("/members?type=AUDIENCE");
    await page.getByRole("complementary").getByRole("link", { name: "신고 관리" }).click();

    await expect(page).toHaveURL(/\/reports$/);
    await expect(page.getByRole("heading", { name: "신고 관리" })).toBeVisible();
  });

  test("대시보드에 승인 대기 창작자와 미처리 신고 지표가 뜬다", async ({ page }) => {
    // 집계 API 가 없어 목록 첫 페이지로 세므로, hasNext 면 "N+" 로 표기한다
    await mockMemberList(page, [{ ...SAMPLE_MEMBER, memberStatus: "PENDING" }], {
      hasNext: true,
    });
    await mockReportList(page, [SAMPLE_REPORT]);
    await mockInquiryList(page, []);
    await mockJobInstances(page, []);
    await mockMonthlyRevenue(page, []);

    await page.goto("/dashboard");

    const pendingCreators = page.getByRole("link", { name: /승인 대기 창작자/ });
    await expect(pendingCreators).toContainText("1+");

    const pendingReports = page.getByRole("link", { name: /미처리 신고/ });
    await expect(pendingReports).toContainText("1");

    await pendingCreators.click();
    await expect(page).toHaveURL(/type=CREATOR&status=PENDING/);
  });
});
