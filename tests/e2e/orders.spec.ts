import { expect, test } from "@playwright/test";

import {
  SAMPLE_MEMBER,
  SAMPLE_ORDER,
  mockMe,
  mockMemberDetail,
  mockMemberList,
  mockMemberOrders,
  mockOrderDetail,
  mockOrderRefund,
  mockPerformanceList,
  mockRefundPolicy,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

/**
 * 환불 비율 티어를 특정 구간에 고정하려면 회차를 "지금부터 N일 뒤" 로 잡아야 한다.
 * 백엔드는 타임존 없는 LocalDateTime 을 주므로 toISOString(UTC) 을 쓰면 안 된다 —
 * KST 기준 19:30 이 10:30 으로 밀려 남은 일수가 하루 줄어든다.
 */
function enableDateInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  );
}

test.describe("orders", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
    await mockMemberList(page, [SAMPLE_MEMBER]);
    await mockMemberDetail(page, SAMPLE_MEMBER);
    await mockPerformanceList(page, []);
    await mockMemberOrders(page);
  });

  test("회원 상세에서 주문을 열면 금액과 조치 버튼이 뜬다", async ({ page }) => {
    await mockOrderDetail(page, { enableDate: enableDateInDays(5) });

    await page.goto(`/members/${SAMPLE_MEMBER.id}`);
    await expect(page.getByRole("heading", { name: "구매 / 주문 내역" })).toBeVisible();

    await page.getByText(SAMPLE_ORDER.paymentId).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("최종 결제금액")).toBeVisible();
    // SUCCESS 주문이라 환불만 열린다 (취소는 PENDING 전용)
    await expect(dialog.getByRole("button", { name: "환불" })).toBeVisible();
  });

  test("환불 다이얼로그가 남은 일수에 해당하는 환불 비율 구간을 짚어 준다", async ({
    page,
  }) => {
    // 관람일까지 5일 → "관람일 3~6일 전" 70% 구간
    await mockOrderDetail(page, { enableDate: enableDateInDays(5) });
    await mockRefundPolicy(page);

    await page.goto(`/members/${SAMPLE_MEMBER.id}`);
    await page.getByText(SAMPLE_ORDER.paymentId).first().click();
    await page.getByRole("button", { name: "환불" }).click();

    await expect(page.getByText("관람일까지 5일 남음")).toBeVisible();
    await expect(page.getByText("잔액 기준 70% = 35,000원")).toBeVisible();

    // "이 금액 넣기" 로 정책 금액을 그대로 채운다
    await page.getByRole("button", { name: "이 금액 넣기" }).click();
    await expect(page.getByLabel("환불 금액")).toHaveValue("35000");
  });

  test("환불 성공 시 실제 환불액과 취소 수수료를 알려준다", async ({ page }) => {
    await mockOrderDetail(page, { enableDate: enableDateInDays(5) });
    await mockRefundPolicy(page);

    let sent: Record<string, unknown> | null = null;
    await mockOrderRefund(page, SAMPLE_ORDER.orderId, (body) => {
      sent = body;
    });

    await page.goto(`/members/${SAMPLE_MEMBER.id}`);
    await page.getByText(SAMPLE_ORDER.paymentId).first().click();
    await page.getByRole("button", { name: "환불" }).click();

    await page.getByRole("button", { name: "이 금액 넣기" }).click();
    await page.getByLabel("환불 사유").fill("주최자 사정으로 회차 취소");
    await page.getByRole("button", { name: "환불 요청" }).click();

    await expect(page.getByText(/45,000원 환불했습니다/)).toBeVisible();
    await expect(page.getByText(/취소 수수료 5,000원/)).toBeVisible();
    expect(sent).toEqual({ amount: 35000, reason: "주최자 사정으로 회차 취소" });
  });

  test("환불 정책 조회에 실패해도 환불은 진행할 수 있다", async ({ page }) => {
    await mockOrderDetail(page, { enableDate: enableDateInDays(5) });
    await page.route("**/api/backend/notice/refund-policy", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ msg: "서버 오류", data: null }),
      }),
    );

    await page.goto(`/members/${SAMPLE_MEMBER.id}`);
    await page.getByText(SAMPLE_ORDER.paymentId).first().click();
    await page.getByRole("button", { name: "환불" }).click();

    await expect(
      page.getByText("환불 비율 정책을 불러오지 못했습니다. 금액을 직접 확인해 입력하세요."),
    ).toBeVisible();
    await expect(page.getByLabel("환불 금액")).toBeEnabled();
  });
});
