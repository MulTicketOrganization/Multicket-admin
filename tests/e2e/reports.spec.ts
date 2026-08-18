import { expect, test } from "@playwright/test";

import {
  SAMPLE_REPORT,
  mockMe,
  mockReportDetail,
  mockReportList,
  mockReportProcess,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("reports", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("목록 → 상세 → 처리 완료 골든패스", async ({ page }) => {
    await mockReportList(page, [SAMPLE_REPORT]);
    await mockReportDetail(page, SAMPLE_REPORT);

    let processBody: {
      event: string;
      opinion: string;
      notifyCreator?: boolean;
    } | null = null;
    await mockReportProcess(page, SAMPLE_REPORT.id, (body) => {
      processBody = body;
    });

    await page.goto("/reports");
    await expect(page.getByRole("heading", { name: "신고 관리" })).toBeVisible();

    await page
      .getByRole("link", { name: SAMPLE_REPORT.performanceTitle, exact: true })
      .click();
    await expect(page).toHaveURL(/\/reports\/1$/);
    await expect(page.getByText("공연 정보가 실제와 다릅니다.")).toBeVisible();

    await page.getByRole("button", { name: "신고 처리" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByText("처리 완료", { exact: true }).click();
    await dialog.getByLabel(/관리자 소견/).fill("확인 결과 사실과 달라 공연을 내렸습니다.");
    await dialog.getByText("창작자에게도 결과 안내").click();
    await dialog.getByRole("button", { name: "처리하기" }).click();

    await expect(page.getByText(/처리 완료.*처리했습니다/)).toBeVisible();
    expect(processBody).toEqual({
      event: "COMPLETE",
      opinion: "확인 결과 사실과 달라 공연을 내렸습니다.",
      notifyCreator: true,
    });
  });

  test("소견을 비우면 처리 버튼이 잠긴다", async ({ page }) => {
    await mockReportList(page, [SAMPLE_REPORT]);
    await mockReportDetail(page, SAMPLE_REPORT);

    await page.goto("/reports/1");
    await page.getByRole("button", { name: "신고 처리" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByText("반려", { exact: true }).click();
    // 이벤트만 고르고 소견이 비어 있으면 아직 제출할 수 없다
    await expect(dialog.getByRole("button", { name: "처리하기" })).toBeDisabled();

    // 공백만 입력해도 여전히 잠겨 있어야 한다
    await dialog.getByLabel(/관리자 소견/).fill("   ");
    await expect(dialog.getByRole("button", { name: "처리하기" })).toBeDisabled();

    await dialog.getByLabel(/관리자 소견/).fill("신고 내용이 사실과 다릅니다.");
    await expect(dialog.getByRole("button", { name: "처리하기" })).toBeEnabled();
  });

  test("이미 종료된 신고는 처리 버튼이 비활성이고 처리 이력이 보인다", async ({ page }) => {
    const completed = { ...SAMPLE_REPORT, status: "COMPLETED" as const };
    await mockReportList(page, [completed]);
    await mockReportDetail(page, completed, {
      handledById: 99,
      handledByNickName: "관리자",
      opinion: "정상 공연으로 확인되어 반려합니다.",
      handledAt: "2026-05-20T09:00:00",
    });

    await page.goto("/reports/1");
    await expect(page.getByRole("button", { name: "신고 처리" })).toBeDisabled();
    await expect(page.getByText("이미 종료된 신고는 다시 처리할 수 없습니다.")).toBeVisible();
    await expect(page.getByText("처리 이력")).toBeVisible();
    await expect(page.getByText("정상 공연으로 확인되어 반려합니다.")).toBeVisible();
  });

  test("상태 · 공연 ID 필터가 URL 에 반영된다", async ({ page }) => {
    await mockReportList(page, []);
    await page.goto("/reports");

    await page.getByLabel("처리 상태 필터").click();
    await page.getByRole("option", { name: "접수" }).click();
    await page.waitForURL(/status=PENDING/);

    await page.getByLabel("공연 ID 필터").fill("42");
    await page.waitForURL(/performanceId=42/);

    await expect(page.getByText("조건에 맞는 신고가 없습니다.")).toBeVisible();
  });
});
