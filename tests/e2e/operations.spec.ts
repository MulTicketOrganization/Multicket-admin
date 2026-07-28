import { expect, test } from "@playwright/test";

import {
  SAMPLE_JOB,
  SAMPLE_REVENUE,
  mockJobInstances,
  mockJobRestart,
  mockKeywordUpdate,
  mockKeywords,
  mockLatestNotice,
  mockMe,
  mockMonthlyRevenue,
  mockNoticeCreate,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("operations", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("매출: 합계와 공연별 내역을 보여준다", async ({ page }) => {
    await mockMonthlyRevenue(page, [SAMPLE_REVENUE]);

    await page.goto("/revenue?year=2026&month=5");
    await expect(page.getByRole("heading", { name: "매출 조회" })).toBeVisible();

    // 결제 1,000,000 - 취소 200,000 = 순매출 800,000
    await expect(page.getByText("800,000원")).toBeVisible();

    // 크리에이터 행을 펼치면 공연별 내역이 나온다
    await page.getByRole("button", { name: "공연별 내역 펼치기" }).click();
    await expect(page.getByRole("link", { name: "테스트 공연" })).toBeVisible();
  });

  test("배치: 실패한 Job 을 재실행한다", async ({ page }) => {
    await mockJobInstances(page, [SAMPLE_JOB]);
    await mockJobRestart(page, SAMPLE_JOB);

    await page.goto("/batch");
    await expect(page.getByText(SAMPLE_JOB.jobName)).toBeVisible();

    await page.getByRole("button", { name: "재실행" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "재실행" }).click();

    await expect(page.getByText(/재실행을 시작했습니다/)).toBeVisible();
  });

  test("배치: 완료된 Job 은 재실행 버튼이 비활성", async ({ page }) => {
    await mockJobInstances(page, [{ ...SAMPLE_JOB, status: "COMPLETED" }]);

    await page.goto("/batch");
    await expect(page.getByRole("button", { name: "재실행" })).toBeDisabled();
  });

  test("키워드: 삭제 후 저장하면 남은 목록 전체를 전송한다", async ({ page }) => {
    await mockKeywords(page, {
      GENRE: { active: ["연극", "뮤지컬"], inactive: [] },
      ELSE: { active: ["추천"], inactive: [] },
    });

    let sent: { keywords: Record<string, string[]> } | null = null;
    await mockKeywordUpdate(page, (body) => {
      sent = body;
    });

    await page.goto("/keywords");
    await expect(page.getByRole("heading", { name: "검색 키워드" })).toBeVisible();

    await page.getByRole("button", { name: "뮤지컬 제거" }).click();
    await page
      .locator("form, div")
      .filter({ hasText: "장르 키워드" })
      .getByRole("button", { name: "저장" })
      .first()
      .click();

    await expect(page.getByText(/장르 키워드.*저장했습니다/)).toBeVisible();
    expect(sent).toEqual({ keywords: { GENRE: ["연극"] } });
  });

  test("공고: 내용을 입력해야 등록 버튼이 활성화된다", async ({ page }) => {
    await mockLatestNotice(page, "기존 환불 규정");

    let created: { type: string; content: string } | null = null;
    await mockNoticeCreate(page, (body) => {
      created = body;
    });

    await page.goto("/notices");
    await expect(page.getByRole("heading", { name: "공고 관리" })).toBeVisible();

    const submit = page.getByRole("button", { name: "공고 등록" });
    await expect(submit).toBeDisabled();

    await page.getByLabel("내용").fill("새 환불 규정 본문");
    await submit.click();

    await expect(page.getByText(/공고를 등록했습니다/)).toBeVisible();
    expect(created).toEqual({
      type: "CANCEL_REFUND_PAID",
      content: "새 환불 규정 본문",
    });
  });

  test("내 계정: 로그인한 관리자 정보를 보여준다", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByRole("heading", { name: "내 계정" })).toBeVisible();
    await expect(page.getByText("admin@multicket.com").first()).toBeVisible();
    await expect(page.getByText("관리자", { exact: true }).first()).toBeVisible();
  });
});
