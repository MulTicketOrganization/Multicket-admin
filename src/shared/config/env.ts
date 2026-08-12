/**
 * 서버 사이드 전용 환경변수 (NEXT_PUBLIC_ 아님).
 * 브라우저에서 import 시 빌드 타임에 검출되어 에러를 던지기 위해 모듈 가드 추가.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Environment variable "${name}" is required but not set.`);
  }
  return value;
}

export const serverEnv = {
  /** 끝 슬래시 없이 설정할 것 — `${base}/member/...` 형태로 이어붙인다. */
  backendBaseUrl: required("BACKEND_API_BASE_URL", process.env.BACKEND_API_BASE_URL),
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "mc_admin_token",
  /** 백엔드가 웹 로그인 시 내려주는 refresh 쿠키 이름 (그대로 보관했다가 되돌려 보낸다) */
  refreshCookieName: "refresh_token",
  cookieSecure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
};
