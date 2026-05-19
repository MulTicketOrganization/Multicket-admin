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
  backendBaseUrl: required("BACKEND_API_BASE_URL", process.env.BACKEND_API_BASE_URL),
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "mc_admin_token",
  cookieSecure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
};
