import type { BrowserContext } from "@playwright/test";

export const AUTH_COOKIE_NAME = "mc_admin_token";

/**
 * 인증된 세션 시뮬레이션.
 * proxy.ts 는 쿠키 존재 여부만 보고 가드를 통과시키므로
 * 임의의 fake 토큰 값으로 충분하다.
 *
 * 백엔드 호출은 mock-backend 헬퍼로 별도 가로채야 한다.
 */
export async function loginAs(context: BrowserContext, token = "fake-test-token") {
  await context.addCookies([
    {
      name: AUTH_COOKIE_NAME,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
