import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers/session";

test.describe("route guard (proxy.ts)", () => {
  test("비인증 상태에서 /dashboard 접근 시 /login?from= 으로 리다이렉트", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?from=%2Fdashboard/);
  });

  test("비인증 상태에서 /members 접근 시 /login?from= 으로 리다이렉트", async ({ page }) => {
    await page.goto("/members");
    await expect(page).toHaveURL(/\/login\?from=%2Fmembers/);
  });

  test("비인증 상태에서 /performances 접근 시 /login?from= 으로 리다이렉트", async ({ page }) => {
    await page.goto("/performances");
    await expect(page).toHaveURL(/\/login\?from=%2Fperformances/);
  });

  test("인증 상태에서 /login 접근 시 /dashboard 로 리다이렉트", async ({ page, context }) => {
    await loginAs(context);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
