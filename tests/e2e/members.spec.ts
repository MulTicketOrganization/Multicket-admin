import { expect, test } from "@playwright/test";

import {
  SAMPLE_MEMBER,
  mockMemberChange,
  mockMemberDetail,
  mockMemberList,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

test.describe("members", () => {
  test.beforeEach(async ({ context }) => {
    await loginAs(context);
  });

  test("목록 → 상세 → 상태 변경 골든패스", async ({ page }) => {
    await mockMemberList(page, [SAMPLE_MEMBER]);
    await mockMemberDetail(page, SAMPLE_MEMBER);

    let changeBody: { memberId: number; memberStatus: string } | null = null;
    await mockMemberChange(page, (body) => {
      changeBody = body;
    });

    // 1. 목록 진입
    await page.goto("/members");
    await expect(page.getByRole("heading", { name: "회원 관리" })).toBeVisible();
    const nickLink = page.getByRole("link", { name: SAMPLE_MEMBER.nickName });
    await expect(nickLink).toBeVisible();

    // 2. 상세 이동
    await nickLink.click();
    await expect(page).toHaveURL(/\/members\/1$/);
    await expect(page.getByText(SAMPLE_MEMBER.email)).toBeVisible();

    // 3. 상태 변경 dialog 오픈
    await page.getByRole("button", { name: "상태 변경" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // 4. "동결" 선택 (radio item label)
    await page.getByRole("dialog").getByText("동결", { exact: true }).click();

    // 5. 변경하기
    await page.getByRole("button", { name: "변경하기" }).click();

    // 6. 토스트 + mock 호출 검증
    await expect(page.getByText(/동결.*변경했습니다/)).toBeVisible();
    expect(changeBody).toEqual({ memberId: 1, memberStatus: "FROZEN" });
  });

  test("키워드 입력 시 URL 에 ?keyword 가 반영된다 (debounced)", async ({ page }) => {
    await mockMemberList(page, []);
    await page.goto("/members");

    await page.getByPlaceholder("이메일 / 닉네임 검색").fill("홍길동");
    await page.waitForURL(/keyword=%ED%99%8D%EA%B8%B8%EB%8F%99/);
  });

  test("빈 결과 시 안내 메시지 노출", async ({ page }) => {
    await mockMemberList(page, []);
    await page.goto("/members");

    await expect(page.getByText("조건에 맞는 회원이 없습니다.")).toBeVisible();
  });
});
