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
  mockNoticeList,
  mockUrgentNotices,
  SAMPLE_NOTICE,
  SAMPLE_APP_VERSION,
  mockAppVersions,
  mockAppVersionCreate,
  SAMPLE_SETTLEMENT,
  mockSettlementList,
  mockSettlementDetail,
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

  test("공고: 목록에서 타입·노출 상태를 확인한다", async ({ page }) => {
    await mockNoticeList(page, [
      SAMPLE_NOTICE,
      {
        id: 2,
        type: "MAINTENANCE",
        title: "정기 점검 안내",
        writerEmail: "admin@multicket.com",
        createDate: "2026-05-02T10:00:00",
        // 이미 지난 만료 시각 — "만료" 로 표기돼야 한다
        expireDate: "2020-01-01T00:00:00",
      },
    ]);
    await mockLatestNotice(page, SAMPLE_NOTICE);
    await mockUrgentNotices(page, []);

    await page.goto("/notices");
    await expect(page.getByRole("heading", { name: "공고 관리" })).toBeVisible();

    // 헤더에도 "만료" 라는 글자가 있어 본문(tbody)으로 좁혀서 본다
    const body = page.getByRole("table").first().locator("tbody");
    await expect(body.getByRole("link", { name: SAMPLE_NOTICE.title })).toBeVisible();
    await expect(body.getByText("서버 점검 안내")).toBeVisible();
    await expect(body.getByText("노출 중")).toBeVisible();
    await expect(body.getByText("만료", { exact: true })).toBeVisible();
  });

  test("공고: 제목·내용·만료 시각이 모두 있어야 등록된다", async ({ page }) => {
    let created: Record<string, unknown> | null = null;
    await mockNoticeCreate(page, (body) => {
      created = body;
    });

    await page.goto("/notices/new");

    const submit = page.getByRole("button", { name: "공고 등록" });
    await expect(submit).toBeDisabled();

    await page.getByLabel("제목").fill("유료 공연 환불 규정");
    await page.getByLabel("내용").fill("새 환불 규정 본문");
    await expect(submit).toBeDisabled();

    await page.getByLabel("만료 시각").fill("2026-09-01T03:00");
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByText(/공고를 등록했습니다/)).toBeVisible();
    // datetime-local 은 초가 없어 LocalDateTime 포맷으로 보정해 보낸다
    expect(created).toEqual({
      type: "CANCEL_REFUND_PAID",
      title: "유료 공연 환불 규정",
      content: "새 환불 규정 본문",
      expireDate: "2026-09-01T03:00:00",
    });
  });

  test("공고: 앱 업데이트는 강제 여부와 대상 플랫폼을 요구한다", async ({ page }) => {
    let created: Record<string, unknown> | null = null;
    await mockNoticeCreate(page, (body) => {
      created = body;
    });

    await page.goto("/notices/new");
    await page.getByLabel("공고 타입").click();
    await page.getByRole("option", { name: "앱 업데이트 안내" }).click();

    await page.getByLabel("제목").fill("업데이트 안내");
    await page.getByLabel("내용").fill("최신 버전으로 업데이트해 주세요.");
    await page.getByLabel("만료 시각").fill("2026-09-01T03:00");

    const submit = page.getByRole("button", { name: "공고 등록" });
    // 강제 여부를 고르기 전까지는 잠겨 있다
    await expect(submit).toBeDisabled();

    await page.getByLabel("업데이트 강제 여부").click();
    await page.getByRole("option", { name: "강제 업데이트" }).click();
    // 플랫폼도 골라야 한다
    await expect(submit).toBeDisabled();

    await page.getByRole("button", { name: "iOS", exact: true }).click();
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByText(/공고를 등록했습니다/)).toBeVisible();
    expect(created).toEqual({
      type: "APP_UPDATE",
      title: "업데이트 안내",
      content: "최신 버전으로 업데이트해 주세요.",
      expireDate: "2026-09-01T03:00:00",
      updatePolicy: "FORCED",
      targetPlatforms: ["IOS"],
    });
  });

  test("공고: 지금 앱에 나가는 폴링 공고를 같은 화면에서 확인한다", async ({ page }) => {
    await mockNoticeList(page, [SAMPLE_NOTICE]);
    await mockLatestNotice(page, SAMPLE_NOTICE);
    await mockUrgentNotices(page, [
      {
        id: 9,
        type: "APP_UPDATE",
        title: "업데이트 안내",
        content: "최신 버전으로 업데이트해 주세요.",
        createDate: "2026-05-01T10:00:00",
        expireDate: "2099-01-01T00:00:00",
        updatePolicy: "FORCED",
        targetPlatforms: ["ALL"],
      },
    ]);

    await page.goto("/notices");
    await expect(page.getByText("1건 노출 중")).toBeVisible();
    await expect(page.getByText("최신 버전으로 업데이트해 주세요.")).toBeVisible();
    await expect(page.getByText("강제 업데이트")).toBeVisible();
  });

  test("공고: 폴링 공고가 없으면 플랫폼 한계를 안내한다", async ({ page }) => {
    await mockNoticeList(page, []);
    await mockLatestNotice(page, null);
    await mockUrgentNotices(page, []);

    await page.goto("/notices");
    await expect(
      page.getByText(/이 브라우저\(WEB\) 대상으로 나가는 안내가 없습니다/),
    ).toBeVisible();
  });

  test("앱 버전: 플랫폼별 현재 버전과 이력을 보여준다", async ({ page }) => {
    await mockAppVersions(page, [
      SAMPLE_APP_VERSION,
      {
        id: 2,
        platform: "ANDROID",
        version: "1.1.0",
        appliedDate: "2026-04-01",
        updateNote: null,
        createDate: "2026-04-01T10:00:00",
      },
    ]);

    await page.goto("/app-versions");
    await expect(page.getByRole("heading", { name: "앱 버전 관리" })).toBeVisible();
    await expect(page.getByText("1.2.0").first()).toBeVisible();
    await expect(page.getByText("1.1.0").first()).toBeVisible();
    await expect(page.getByText("예매 취소 화면 개선")).toBeVisible();
  });

  test("앱 버전: 형식이 맞아야 등록된다", async ({ page }) => {
    await mockAppVersions(page, []);
    let created: Record<string, unknown> | null = null;
    await mockAppVersionCreate(page, (body) => {
      created = body;
    });

    await page.goto("/app-versions");

    const submit = page.getByRole("button", { name: "버전 등록" });
    await expect(submit).toBeDisabled();

    await page.getByLabel("버전").fill("일이삼");
    await expect(page.getByText("1.2.3 형식으로 입력하세요.")).toBeVisible();
    await expect(submit).toBeDisabled();

    await page.getByLabel("버전").fill("2.0.0");
    await page.getByLabel("적용일자").fill("2026-09-01");
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByText(/버전을 등록했습니다/)).toBeVisible();
    expect(created).toEqual({
      platform: "IOS",
      version: "2.0.0",
      appliedDate: "2026-09-01",
    });
  });

  test("정산: 목록에서 상세로 들어가 산출 근거를 본다", async ({ page }) => {
    await mockSettlementList(page, [SAMPLE_SETTLEMENT]);
    await mockSettlementDetail(page);

    await page.goto("/settlements");
    await expect(page.getByRole("heading", { name: "정산 관리" })).toBeVisible();
    await expect(page.getByText("정산 대기")).toBeVisible();

    await page.getByRole("link", { name: SAMPLE_SETTLEMENT.performanceTitle }).click();
    await expect(page).toHaveURL(new RegExp(`/settlements/${SAMPLE_SETTLEMENT.id}$`));

    await expect(page.getByText("플랫폼 수수료 (10%)")).toBeVisible();
    await expect(page.getByText("최종 정산금액")).toBeVisible();
    await expect(page.getByText("아직 이체 전 (null)")).toBeVisible();
  });

  test("정산: 이미 완료된 건은 PG사 정산요청을 막는다", async ({ page }) => {
    await mockSettlementDetail(page, {
      status: "SUCCESS",
      successAt: "2026-06-30T10:00:00",
      portoneTransferId: "tr_123",
    });

    await page.goto(`/settlements/${SAMPLE_SETTLEMENT.id}`);
    await expect(page.getByRole("button", { name: "PG사 정산요청" })).toBeDisabled();
    await expect(page.getByText("tr_123")).toBeVisible();
  });

  test("내 계정: 로그인한 관리자 정보를 보여준다", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByRole("heading", { name: "내 계정" })).toBeVisible();
    await expect(page.getByText("admin@multicket.com").first()).toBeVisible();
    await expect(page.getByText("관리자", { exact: true }).first()).toBeVisible();
  });
});
