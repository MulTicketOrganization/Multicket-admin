import { defineConfig, devices } from "@playwright/test";

/**
 * Multicket Admin E2E 설정.
 *
 * 전략:
 * - 실제 백엔드 띄우지 않음. 클라이언트 fetch 는 page.route 로 mock.
 * - 인증 시뮬레이션은 page.context().addCookies — proxy.ts 가 쿠키 존재만 보므로 통과.
 * - dev 서버는 자동 기동 (`reuseExistingServer: !CI` 로 로컬 hot iter 친화).
 *
 * BACKEND_API_BASE_URL 은 서버 사이드 env 검증 통과용 dummy.
 * E2E 에서 실제 서버 사이드 fetch 는 발생하지 않음 (모든 호출 mock).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      BACKEND_API_BASE_URL: "http://localhost:9999",
      AUTH_COOKIE_NAME: "mc_admin_token",
    },
  },
});
