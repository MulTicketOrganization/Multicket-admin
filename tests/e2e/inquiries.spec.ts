import { expect, test } from "@playwright/test";

import {
  SAMPLE_INQUIRY,
  mockInquiryDetail,
  mockInquiryList,
  mockInquiryUpdate,
  mockMe,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("inquiries", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("목록 → 상세 → 승인 처리 골든패스", async ({ page }) => {
    await mockInquiryList(page, [SAMPLE_INQUIRY]);
    await mockInquiryDetail(page, SAMPLE_INQUIRY);

    let updateBody: { event: string; memberEvent?: string } | null = null;
    await mockInquiryUpdate(page, SAMPLE_INQUIRY.id, (body) => {
      updateBody = body;
    });

    await page.goto("/inquiries");
    await expect(page.getByRole("heading", { name: "문의 관리" })).toBeVisible();

    await page.getByRole("link", { name: SAMPLE_INQUIRY.title }).click();
    await expect(page).toHaveURL(/\/inquiries\/1$/);
    await expect(page.getByText("가입 승인 부탁드립니다.")).toBeVisible();

    await page.getByRole("button", { name: "문의 처리" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // MEMBER_STATUS + 승인 → 회원 이벤트 선택지가 함께 나타난다
    await dialog.getByText("승인 처리", { exact: true }).click();
    await expect(dialog.getByText("적용할 회원 상태 처리")).toBeVisible();

    await dialog.getByRole("button", { name: "처리하기" }).click();

    await expect(page.getByText(/승인 처리.*했습니다/)).toBeVisible();
    expect(updateBody).toEqual({ event: "COMPLETE", memberEvent: "APPROVE" });
  });

  test("이미 종료된 문의는 처리 버튼이 비활성", async ({ page }) => {
    const completed = { ...SAMPLE_INQUIRY, inquiryStatus: "COMPLETED" as const };
    await mockInquiryList(page, [completed]);
    await mockInquiryDetail(page, completed);

    await page.goto("/inquiries/1");
    await expect(page.getByRole("button", { name: "문의 처리" })).toBeDisabled();
    await expect(page.getByText("이미 종료된 문의는 다시 처리할 수 없습니다.")).toBeVisible();
  });

  test("상태 필터가 URL 에 반영된다", async ({ page }) => {
    await mockInquiryList(page, []);
    await page.goto("/inquiries");

    await page.getByLabel("처리 상태 필터").click();
    await page.getByRole("option", { name: "대기" }).click();

    await page.waitForURL(/status=PENDING/);
    await expect(page.getByText("조건에 맞는 문의가 없습니다.")).toBeVisible();
  });
});
