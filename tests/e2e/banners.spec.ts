import { expect, test } from "@playwright/test";

import {
  SAMPLE_BANNER,
  mockBannerCreate,
  mockBannerList,
  mockBannerMutation,
  mockMe,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("banners", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("목록에 노출 상태와 노출중 건수가 뜬다", async ({ page }) => {
    await mockBannerList(page, [
      SAMPLE_BANNER,
      {
        ...SAMPLE_BANNER,
        id: 2,
        linkUrl: null,
        exposureStartDate: "2020-01-01T00:00:00",
        exposureEndDate: "2020-02-01T00:00:00",
      },
    ]);

    await page.goto("/banners");
    await expect(page.getByRole("heading", { name: "홈 배너 관리" })).toBeVisible();

    // 기간이 지난 두 번째 배너는 노출중에서 빠진다
    await expect(page.getByText("1건", { exact: true })).toBeVisible();
    await expect(page.getByText("노출중", { exact: true })).toBeVisible();
    await expect(page.getByText("노출 종료", { exact: true })).toBeVisible();
    await expect(page.getByText("링크 없음")).toBeVisible();
  });

  test("등록 폼은 기간이 역전되면 잠긴다", async ({ page }) => {
    await mockBannerList(page, []);
    await page.goto("/banners");

    const submit = page.getByRole("button", { name: "배너 등록" });
    await expect(submit).toBeDisabled();

    await page.getByLabel("이미지 URL").fill("https://cdn.multicket.com/a.png");
    await page.getByLabel("노출 시작").fill("2026-09-01T10:00");
    await page.getByLabel("노출 종료").fill("2026-08-01T10:00");

    await expect(
      page.getByText("노출 종료 일시는 시작 일시보다 뒤여야 합니다."),
    ).toBeVisible();
    await expect(submit).toBeDisabled();
  });

  test("상대 경로 이미지 URL 은 거부된다", async ({ page }) => {
    await mockBannerList(page, []);
    await page.goto("/banners");

    await page.getByLabel("이미지 URL").fill("/banners/a.png");
    await expect(
      page.getByText("이미지 URL 은 http(s) 절대 경로여야 합니다."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "배너 등록" })).toBeDisabled();
  });

  test("등록하면 링크가 비어 있을 때 linkUrl 을 보내지 않는다", async ({ page }) => {
    await mockBannerList(page, []);
    let sent: Record<string, unknown> | null = null;
    await mockBannerCreate(page, (body) => {
      sent = body;
    });

    await page.goto("/banners");
    await page.getByLabel("이미지 URL").fill("https://cdn.multicket.com/a.png");
    await page.getByLabel("노출 시작").fill("2026-08-01T10:00");
    await page.getByLabel("노출 종료").fill("2026-09-01T10:00");
    await page.getByRole("button", { name: "배너 등록" }).click();

    await expect(page.getByText("배너를 등록했습니다.")).toBeVisible();
    expect(sent).toEqual({
      imageUrl: "https://cdn.multicket.com/a.png",
      exposureStartDate: "2026-08-01T10:00:00",
      exposureEndDate: "2026-09-01T10:00:00",
    });
  });

  test("수정은 전량 교체라 모든 필수 필드를 다시 보낸다", async ({ page }) => {
    await mockBannerList(page, [SAMPLE_BANNER]);
    let sent: Record<string, unknown> | null = null;
    await mockBannerMutation(page, SAMPLE_BANNER.id, "PATCH", (body) => {
      sent = body;
    });

    await page.goto("/banners");
    await page.getByRole("button", { name: "수정" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("링크 URL").fill("https://multicket.com/events/winter");
    await dialog.getByRole("button", { name: "수정 저장" }).click();

    await expect(page.getByText("배너를 수정했습니다.")).toBeVisible();
    expect(sent).toEqual({
      imageUrl: SAMPLE_BANNER.imageUrl,
      exposureStartDate: "2020-01-01T00:00:00",
      exposureEndDate: "2099-12-31T23:59:00",
      linkUrl: "https://multicket.com/events/winter",
    });
  });

  test("삭제는 하드 삭제 경고를 거친다", async ({ page }) => {
    await mockBannerList(page, [SAMPLE_BANNER]);
    let deleted = false;
    await mockBannerMutation(page, SAMPLE_BANNER.id, "DELETE", () => {
      deleted = true;
    });

    await page.goto("/banners");
    await page.getByRole("button", { name: "삭제" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/하드 삭제라 되돌릴 수 없습니다/)).toBeVisible();
    await dialog.getByRole("button", { name: "삭제하기" }).click();

    await expect(page.getByText("배너를 삭제했습니다.")).toBeVisible();
    expect(deleted).toBe(true);
  });
});
