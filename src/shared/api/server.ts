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
