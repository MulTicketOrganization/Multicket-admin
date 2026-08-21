import { expect, test } from "@playwright/test";

import {
  SAMPLE_PERFORMANCE,
  mockMe,
  mockPerformanceDelete,
  mockPerformanceDetail,
  mockPerformanceList,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("performances", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("목록 → 상세 골든패스", async ({ page }) => {
    await mockPerformanceList(page, [SAMPLE_PERFORMANCE]);
    await mockPerformanceDetail(page, SAMPLE_PERFORMANCE);

    await page.goto("/performances");
    await expect(page.getByRole("heading", { name: "공연 관리" })).toBeVisible();

    const titleLink = page.getByRole("link", { name: SAMPLE_PERFORMANCE.title });
    await expect(titleLink).toBeVisible();

    await titleLink.click();
    await expect(page).toHaveURL(/\/performances\/1$/);
    await expect(page.getByRole("heading", { name: "공연 상세" })).toBeVisible();
    await expect(page.getByText("테스트용 시놉시스입니다.")).toBeVisible();
  });

  test("제목을 정확히 입력해야 공연 삭제가 실행된다", async ({ page }) => {
    await mockPerformanceDetail(page, SAMPLE_PERFORMANCE);
    let deletedId: string | null = null;
    await mockPerformanceDelete(page, (id) => {
      deletedId = id;
    });

    await page.goto("/performances/1");
    await page.getByRole("button", { name: "삭제", exact: true }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // 제목이 틀리면 삭제 버튼이 비활성
    await dialog.getByPlaceholder("공연 제목 입력").fill("틀린 제목");
    await expect(dialog.getByRole("button", { name: "삭제하기" })).toBeDisabled();

    await dialog.getByPlaceholder("공연 제목 입력").fill(SAMPLE_PERFORMANCE.title);
    await dialog.getByRole("button", { name: "삭제하기" }).click();

    await expect(page.getByText("공연을 삭제했습니다.")).toBeVisible();
    expect(deletedId).toBe("1");
  });

  test("제목 입력 시 URL 에 ?title 이 반영된다 (debounced)", async ({ page }) => {
    await mockPerformanceList(page, []);
    await page.goto("/performances");

    await page.getByPlaceholder("공연 제목 검색").fill("뮤지컬");
    await page.waitForURL(/title=%EB%AE%A4%EC%A7%80%EC%BB%AC/);
  });

  test("빈 결과 시 안내 메시지 노출", async ({ page }) => {
    await mockPerformanceList(page, []);
    await page.goto("/performances");

    await expect(page.getByText("조건에 맞는 공연이 없습니다.")).toBeVisible();
  });

  test("공연 기간으로 공연 상태를 계산해 보여준다", async ({ page }) => {
    // 백엔드에 상태 필드가 없어 기간으로 파생한다 — 실행 시점 기준으로 날짜를 만든다
    const day = 24 * 60 * 60 * 1000;
    const iso = (offsetDays: number) =>
      new Date(Date.now() + offsetDays * day).toISOString().slice(0, 19);

    await mockPerformanceList(page, [
      { ...SAMPLE_PERFORMANCE, id: 1, title: "지난 공연", startDate: iso(-30), endDate: iso(-10) },
      { ...SAMPLE_PERFORMANCE, id: 2, title: "하는 공연", startDate: iso(-3), endDate: iso(3) },
      { ...SAMPLE_PERFORMANCE, id: 3, title: "올 공연", startDate: iso(10), endDate: iso(20) },
    ]);

    await page.goto("/performances");

    const row = (title: string) => page.getByRole("row").filter({ hasText: title });
    await expect(row("지난 공연").getByText("공연 종료")).toBeVisible();
    await expect(row("하는 공연").getByText("공연중")).toBeVisible();
    await expect(row("올 공연").getByText("공연 예정")).toBeVisible();
  });

  test("크리에이터 필터를 해제하면 URL 에서 memberId 가 빠진다", async ({ page }) => {
    await mockPerformanceList(page, []);
    await page.goto("/performances?memberId=1");

    await expect(page.getByText(/크리에이터.*공연만 표시 중입니다/)).toBeVisible();
    await page.getByRole("button", { name: "해제" }).click();

    await page.waitForURL((url) => !url.searchParams.has("memberId"));
    await expect(page.getByText(/공연만 표시 중입니다/)).toHaveCount(0);
  });
});
