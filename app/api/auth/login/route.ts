import { NextResponse } from "next/server";
import { z } from "zod";

import { serverEnv } from "@/shared/config/env";
import { clearAuthCookie, extractBearerToken, writeAuthCookie } from "@/shared/api/server";

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

  const token = extractBearerToken(upstream.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { ok: false, msg: "토큰이 발급되지 않았습니다. (서버 응답 헤더 확인 필요)" },
      { status: 502 },
    );
  }

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
    await clearAuthCookie();
    return NextResponse.json(
      { ok: false, msg: "관리자(MASTER) 권한이 없는 계정입니다." },
      { status: 403 },
    );
  }

  await writeAuthCookie(token);

  return NextResponse.json({ ok: true });
}

/** GET /api/member/me — 로그인 직후 권한(MASTER) 확인용 */
async function fetchProfile(token: string): Promise<{ memberType?: string } | null> {
  try {
    const res = await fetch(`${serverEnv.backendBaseUrl}/api/member/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { memberType?: string } } | null;
    return body?.data ?? null;
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
