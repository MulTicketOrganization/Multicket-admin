import { expect, test } from "@playwright/test";

import { mockAuthLoginFailure, mockAuthLoginSuccess } from "./helpers/mock-backend";

test.describe("auth / login", () => {
  test("로그인 페이지가 정상 렌더된다", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Multicket Admin" })).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("잘못된 이메일 형식이면 zod 검증 메시지가 노출된다", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("이메일").fill("not-email");
    await page.getByLabel("비밀번호").fill("password");
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page.getByText("올바른 이메일 형식이 아닙니다.")).toBeVisible();
  });

  test("로그인 성공 시 /dashboard 로 이동한다", async ({ page }) => {
    await mockAuthLoginSuccess(page);

    await page.goto("/login");
    await page.getByLabel("이메일").fill("admin@multicket.com");
    await page.getByLabel("비밀번호").fill("password");
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("로그인 실패 시 에러 toast 가 표시되고 /login 에 머문다", async ({ page }) => {
    await mockAuthLoginFailure(page, "이메일 또는 비밀번호가 잘못되었습니다.");

    await page.goto("/login");
    await page.getByLabel("이메일").fill("admin@multicket.com");
    await page.getByLabel("비밀번호").fill("wrongpass");
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page.getByText("이메일 또는 비밀번호가 잘못되었습니다.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
