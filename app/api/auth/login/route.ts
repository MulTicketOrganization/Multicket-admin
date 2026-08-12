import { NextResponse } from "next/server";
import { z } from "zod";

import { serverEnv } from "@/shared/config/env";
import {
  clearSession,
  extractBearerToken,
  extractRefreshToken,
  writeAuthCookie,
  writeRefreshCookie,
} from "@/shared/api/server";

const LoginBodySchema = z.object({
  mail: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let payload: z.infer<typeof LoginBodySchema>;
  try {
    payload = LoginBodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, msg: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${serverEnv.backendBaseUrl}/member/request/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      // 인증 실패 시 백엔드가 /login 으로 302 를 주는데, 따라가면 200 HTML 을
      // 성공으로 오인한다. 리다이렉트는 그대로 실패로 취급한다.
      redirect: "manual",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        msg: "백엔드에 연결할 수 없습니다.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { ok: false, msg: parseUpstreamMsg(text) ?? "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: upstream.status },
    );
  }

  // 웹(User-Agent 로 서버가 자동 판별)은 body 없이
  // access = Authorization 응답 헤더, refresh = refresh_token 쿠키로 내려온다.
  const token = extractBearerToken(upstream.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { ok: false, msg: "토큰이 발급되지 않았습니다. (서버 응답 헤더 확인 필요)" },
      { status: 502 },
    );
  }
  const refresh = extractRefreshToken(upstream.headers);

  // 로그인 자체는 통과했어도 MASTER 가 아니면 admin 에 들일 수 없다.
  // 백엔드는 /admin/** 을 실제로 호출하는 시점에만 403 을 주므로 여기서 미리 걸러 쿠키를 발급하지 않는다.
  const profile = await fetchProfile(token);
  if (!profile) {
    return NextResponse.json(
      { ok: false, msg: "회원 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
  if (profile.memberType !== "MASTER") {
    await clearSession();
    return NextResponse.json(
      { ok: false, msg: "관리자(MASTER) 권한이 없는 계정입니다." },
      { status: 403 },
    );
  }

  await writeAuthCookie(token);
  if (refresh) await writeRefreshCookie(refresh);

  return NextResponse.json({ ok: true });
}

/**
 * GET /api/member/me — 로그인 직후 권한(MASTER) 확인용.
 * 이 엔드포인트는 MemberResponse 를 그대로 내려준다 (`{msg, data}` 래퍼 없음).
 * 다른 admin API 처럼 래핑되어 오는 경우도 있어 양쪽 모두 받아준다.
 */
async function fetchProfile(token: string): Promise<{ memberType?: string } | null> {
  try {
    const res = await fetch(`${serverEnv.backendBaseUrl}/api/member/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "manual",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as
      | { memberType?: string; data?: { memberType?: string } }
      | null;
    if (!body) return null;
    return body.data ?? body;
  } catch {
    return null;
  }
}

function parseUpstreamMsg(text: string): string | null {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as { msg?: unknown };
    return typeof parsed.msg === "string" ? parsed.msg : null;
  } catch {
    return null;
  }
}
