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

    let updateBody: Record<string, unknown> | null = null;
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

    // responseContent 는 COMPLETE/REJECT 공통 필수라 비어 있으면 제출이 막힌다
    await expect(dialog.getByRole("button", { name: "처리하기" })).toBeDisabled();
    await dialog.getByLabel("응답 내용").fill("확인 후 승인합니다.");

    await dialog.getByRole("button", { name: "처리하기" }).click();

    await expect(page.getByText(/승인 처리.*했습니다/)).toBeVisible();
    expect(updateBody).toEqual({
      event: "COMPLETE",
      responseContent: "확인 후 승인합니다.",
      memberEvent: "APPROVE",
    });
  });

  test("MEMBER_STATUS 반려는 거절 사유까지 채워야 제출된다", async ({ page }) => {
    await mockInquiryList(page, [SAMPLE_INQUIRY]);
    await mockInquiryDetail(page, SAMPLE_INQUIRY);

    let updateBody: Record<string, unknown> | null = null;
    await mockInquiryUpdate(page, SAMPLE_INQUIRY.id, (body) => {
      updateBody = body;
    });

    await page.goto("/inquiries/1");
    await page.getByRole("button", { name: "문의 처리" }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByText("반려", { exact: true }).click();
    await dialog.getByLabel("응답 내용").fill("요건을 충족하지 못했습니다.");

    // rejectReason 은 MEMBER_STATUS + REJECT 에서만 필수로 나타난다
    await expect(dialog.getByRole("button", { name: "처리하기" })).toBeDisabled();
    await dialog.getByLabel("거절 사유").fill("사업자 정보 불일치");

    await dialog.getByRole("button", { name: "처리하기" }).click();

    expect(updateBody).toEqual({
      event: "REJECT",
      responseContent: "요건을 충족하지 못했습니다.",
      rejectReason: "사업자 정보 불일치",
    });
  });

  test("처리된 문의는 관리자 응답이 표시된다", async ({ page }) => {
    const answered = {
      ...SAMPLE_INQUIRY,
      inquiryStatus: "COMPLETED" as const,
      responderId: 1,
      responderNickName: "관리자",
      responseContent: "승인 완료했습니다.",
      responseDate: "2026-05-20T10:00:00",
    };
    await mockInquiryList(page, [answered]);
    await mockInquiryDetail(page, answered);

    await page.goto("/inquiries/1");
    await expect(page.getByRole("heading", { name: "관리자 응답" })).toBeVisible();
    await expect(page.getByText("승인 완료했습니다.")).toBeVisible();
    await expect(page.getByRole("link", { name: "관리자", exact: true })).toBeVisible();
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
