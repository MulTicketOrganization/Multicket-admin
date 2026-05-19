import { expect, test } from "@playwright/test";

import { mockMemberList } from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("theme toggle", () => {
  test("다크 모드 선택 시 html 에 .dark 클래스가 적용된다", async ({ page, context }) => {
    await loginAs(context);
    await mockMemberList(page, []);

    await page.goto("/dashboard");

    const toggle = page.getByRole("button", { name: "테마 전환" });
    await expect(toggle).toBeEnabled();
    await toggle.click();

    await page.getByRole("menuitem", { name: "다크" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("라이트 모드 선택 시 html 에서 .dark 클래스가 제거된다", async ({ page, context }) => {
    await loginAs(context);
    await mockMemberList(page, []);

    await page.goto("/dashboard");

    const toggle = page.getByRole("button", { name: "테마 전환" });
    await expect(toggle).toBeEnabled();

    // 다크로 한 번 켰다가
    await toggle.click();
    await page.getByRole("menuitem", { name: "다크" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 라이트로 끄기
    await toggle.click();
    await page.getByRole("menuitem", { name: "라이트" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
