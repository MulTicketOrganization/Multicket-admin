import { NextResponse } from "next/server";

import { serverEnv } from "@/shared/config/env";
import { applyAuthHeaders, clearSession, readAuthCookie, readRefreshCookie } from "@/shared/api/server";

/**
 * 로그아웃: 백엔드 POST /member/logout 호출 후 httpOnly 쿠키 제거.
 * 로그아웃 범위는 요청 OS(웹) 세션 하나이며 Authorization 헤더만 있으면 된다.
 * 백엔드 응답이 실패해도 클라이언트 쿠키는 무조건 제거한다 (좀비 세션 방지).
 */
export async function POST() {
  const token = await readAuthCookie();
  const refresh = await readRefreshCookie();

  if (token) {
    try {
      await fetch(`${serverEnv.backendBaseUrl}/member/logout`, {
        method: "POST",
        headers: applyAuthHeaders(new Headers(), token, refresh),
        cache: "no-store",
        redirect: "manual",
      });
    } catch {
      // 백엔드 오류는 무시 — 로컬 쿠키는 어차피 제거한다.
    }
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}
