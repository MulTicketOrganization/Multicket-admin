import "server-only";

import { cookies } from "next/headers";

import { serverEnv } from "@/shared/config/env";

/**
 * Authorization 헤더 값 (예: "Bearer abc...") 에서 토큰만 추출.
 * 헤더가 비어있거나 형식이 맞지 않으면 null.
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  const trimmed = authHeader.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim() || null;
  }
  return trimmed || null;
}

/**
 * 현재 요청의 httpOnly 쿠키에서 access token 조회.
 */
export async function readAuthCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(serverEnv.authCookieName)?.value ?? null;
}

/**
 * httpOnly 쿠키에 access token 저장.
 * - Access 만료 1d, Refresh 30d 인 백엔드 정책에 맞춰 maxAge 1d 로 설정.
 * - 토큰 자동 갱신 시 동일 옵션으로 덮어쓴다.
 */
export async function writeAuthCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(serverEnv.authCookieName, token, {
    httpOnly: true,
    secure: serverEnv.cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day (Access 토큰 수명과 일치)
  });
}

/**
 * 쿠키 제거 (로그아웃).
 */
export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(serverEnv.authCookieName);
}

/* ------------------------------------------------------------------ *
 * refresh token
 *
 * 백엔드 웹 플로우(Swagger): 로그인 성공 시 access 는 `Authorization`
 * 응답 헤더로, refresh 는 `refresh_token` httpOnly 쿠키(Max-Age 30d)로 온다.
 * 그 쿠키는 백엔드 도메인용이라 브라우저 → admin 도메인으로는 전달되지 않으므로,
 * Next 서버가 값만 꺼내 자기 쿠키에 보관했다가 업스트림 호출 때 되돌려 보낸다.
 * ------------------------------------------------------------------ */

export async function readRefreshCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(serverEnv.refreshCookieName)?.value ?? null;
}

export async function writeRefreshCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(serverEnv.refreshCookieName, token, {
    httpOnly: true,
    secure: serverEnv.cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days (Refresh 토큰 수명과 일치)
  });
}

/** access + refresh 동시 제거 (로그아웃 / 세션 만료). */
export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(serverEnv.authCookieName);
  jar.delete(serverEnv.refreshCookieName);
}

/**
 * 업스트림 응답의 `Set-Cookie` 들에서 refresh_token 값만 추출.
 * 백엔드 쿠키는 `Secure; SameSite=None` 이라 속성은 버리고 값만 재사용한다.
 */
export function extractRefreshToken(headers: Headers): string | null {
  const setCookies = headers.getSetCookie();
  for (const raw of setCookies) {
    const [pair] = raw.split(";");
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    if (pair.slice(0, idx).trim() !== serverEnv.refreshCookieName) continue;
    const value = pair.slice(idx + 1).trim();
    if (value) return value;
  }
  return null;
}

/**
 * 업스트림으로 보낼 인증 헤더 구성.
 * - access 는 `Authorization: Bearer ...`
 * - refresh 는 `Cookie: refresh_token=...` (백엔드가 웹 자동 갱신에 사용)
 */
export function applyAuthHeaders(
  headers: Headers,
  token: string | null,
  refresh: string | null,
): Headers {
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (refresh) headers.set("cookie", `${serverEnv.refreshCookieName}=${refresh}`);
  return headers;
}
