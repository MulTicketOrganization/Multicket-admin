import { expect, test } from "@playwright/test";

import {
  SAMPLE_FAILED_EVENT,
  mockFailedEventAction,
  mockFailedEventDetail,
  mockFailedEventList,
  mockMe,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("failed events", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("목록 → 상세 → 재실행 골든패스", async ({ page }) => {
    await mockFailedEventList(page, [SAMPLE_FAILED_EVENT]);
    await mockFailedEventDetail(page, SAMPLE_FAILED_EVENT);

    let retried = false;
    await mockFailedEventAction(page, SAMPLE_FAILED_EVENT.id, "retry", () => {
      retried = true;
    });

    await page.goto("/failed-events");
    await expect(page.getByRole("heading", { name: "실패 이벤트" })).toBeVisible();

    await page.getByRole("link", { name: SAMPLE_FAILED_EVENT.target! }).click();
    await expect(page).toHaveURL(/\/failed-events\/7$/);
    await expect(page.getByText("PG 응답 시간 초과")).toBeVisible();
    // payload 는 객체면 pretty-print 되어 그대로 보인다
    await expect(page.getByText(/"settlementId": 1024/)).toBeVisible();

    await page.getByRole("button", { name: "재실행" }).click();
    await expect(page.getByText(/재실행에 성공/)).toBeVisible();
    expect(retried).toBe(true);
  });

  test("재실행을 지원하지 않는 타입은 버튼이 잠긴다", async ({ page }) => {
    const notRetryable = {
      ...SAMPLE_FAILED_EVENT,
      eventType: "TICKET_NOTIFICATION_ACCEPT",
    };
    await mockFailedEventList(page, [notRetryable]);
    await mockFailedEventDetail(page, notRetryable);

    await page.goto("/failed-events/7");
    await expect(page.getByRole("button", { name: "재실행" })).toBeDisabled();
    await expect(
      page.getByText("이 타입은 재실행을 지원하지 않습니다. 확인 처리만 가능합니다."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "확인 처리" })).toBeEnabled();
  });

  test("확인 완료된 건은 조치 버튼이 사라진다", async ({ page }) => {
    const done = { ...SAMPLE_FAILED_EVENT, status: "COMPLETE" as const };
    await mockFailedEventList(page, [done]);
    await mockFailedEventDetail(page, done);

    await page.goto("/failed-events/7");
    await expect(
      page.getByText("확인 완료된 건은 더 이상 조작할 수 없습니다."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "재실행" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "확인 처리" })).toHaveCount(0);
  });

  test("상태 · 이벤트 타입 필터가 URL 에 반영된다", async ({ page }) => {
    await mockFailedEventList(page, []);
    await page.goto("/failed-events");

    await page.getByLabel("처리 상태 필터").click();
    await page.getByRole("option", { name: "미확인" }).click();
    await page.waitForURL(/status=PENDING/);

    await page.getByLabel("이벤트 타입 필터").click();
    await page.getByRole("option", { name: "정산 이체" }).click();
    await page.waitForURL(/type=SETTLEMENT_TRANSFER/);

    await expect(page.getByText("조건에 맞는 실패 이벤트가 없습니다.")).toBeVisible();
  });
});
