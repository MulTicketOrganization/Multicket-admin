import { expect, test } from "@playwright/test";

import {
  SAMPLE_CONSENT_DOCUMENT,
  mockConsentDocumentCreate,
  mockConsentDocumentDetail,
  mockConsentDocumentList,
  mockCurrentConsentDocuments,
  mockMe,
} from "./helpers/mock-backend";
import { loginAs } from "./helpers/session";

const OLD_VERSION = {
  ...SAMPLE_CONSENT_DOCUMENT,
  id: 1,
  version: 1.0,
  deleted: true,
  content: "구버전 약관 본문입니다.",
};

test.describe("consent documents", () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context);
    await mockMe(page);
  });

  test("타입별 현재 버전과 폐기 이력이 함께 보인다", async ({ page }) => {
    await mockCurrentConsentDocuments(page, [SAMPLE_CONSENT_DOCUMENT]);
    await mockConsentDocumentList(page, [SAMPLE_CONSENT_DOCUMENT, OLD_VERSION]);

    await page.goto("/consent-documents");
    await expect(page.getByRole("heading", { name: "약관 관리" })).toBeVisible();

    // 현재 버전 카드 — 발행된 것은 v1.1, 나머지 세 타입은 미발행
    await expect(page.getByText("v1.1", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("미발행")).toHaveCount(3);

    // 이력에는 폐기본도 남는다
    await expect(page.getByText("현재 버전", { exact: true })).toBeVisible();
    await expect(page.getByText("폐기됨", { exact: true })).toBeVisible();
  });

  test("전문 보기는 문서 ID 로 다시 조회한다", async ({ page }) => {
    await mockCurrentConsentDocuments(page, [SAMPLE_CONSENT_DOCUMENT]);
    await mockConsentDocumentList(page, [OLD_VERSION]);
    await mockConsentDocumentDetail(page, OLD_VERSION);

    await page.goto("/consent-documents");
    await page.getByRole("button", { name: "전문 보기" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("구버전 약관 본문입니다.")).toBeVisible();
    await expect(dialog.getByText(/감사 목적의 조회입니다/)).toBeVisible();
  });

  test("발행은 다음 버전을 계산하고 동의 해제 경고를 거친다", async ({ page }) => {
    await mockCurrentConsentDocuments(page, [SAMPLE_CONSENT_DOCUMENT]);
    await mockConsentDocumentList(page, [SAMPLE_CONSENT_DOCUMENT]);

    let sent: Record<string, unknown> | null = null;
    await mockConsentDocumentCreate(page, (body) => {
      sent = body;
    });

    await page.goto("/consent-documents");

    // 현재가 v1.1 이므로 버튼은 v1.2 를 가리킨다
    const submit = page.getByRole("button", { name: "v1.2 발행" });
    await expect(submit).toBeDisabled();

    await page.getByLabel("약관 본문").fill("제1조(목적) 개정된 약관 본문입니다.");
    await submit.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/동의했던 회원 전원의 동의가 해제됩니다/)).toBeVisible();
    await dialog.getByRole("button", { name: "발행하기" }).click();

    await expect(page.getByText(/v1.2 을 발행했습니다/)).toBeVisible();
    expect(sent).toEqual({
      type: "SERVICE_TERMS",
      content: "제1조(목적) 개정된 약관 본문입니다.",
    });
  });

  test("미발행 타입은 v1.0 으로 발행한다", async ({ page }) => {
    await mockCurrentConsentDocuments(page, []);
    await mockConsentDocumentList(page, []);

    await page.goto("/consent-documents");
    await expect(page.getByRole("button", { name: "v1.0 발행" })).toBeVisible();
    await expect(page.getByText("발행된 약관이 없습니다.")).toBeVisible();
  });
});
