import { expect, test } from "@playwright/test";

import {
  SAMPLE_PERFORMANCE,
  mockPerformanceDetail,
  mockPerformanceList,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("performances", () => {
  test.beforeEach(async ({ context }) => {
    await loginAs(context);
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
});
