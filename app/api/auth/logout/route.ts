import { NextResponse } from "next/server";

import { serverEnv } from "@/shared/config/env";
import { clearAuthCookie, readAuthCookie } from "@/shared/api/server";

/**
 * 로그아웃: 백엔드 GET /member/logout 호출 후 httpOnly 쿠키 제거.
 * 백엔드 응답이 실패해도 클라이언트 쿠키는 무조건 제거한다 (좀비 세션 방지).
 */
export async function POST() {
  const token = await readAuthCookie();

  if (token) {
    try {
      await fetch(`${serverEnv.backendBaseUrl}/member/logout`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // 백엔드 오류는 무시 — 로컬 쿠키는 어차피 제거한다.
    }
  }

  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
