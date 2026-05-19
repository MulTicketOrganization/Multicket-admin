import { NextResponse } from "next/server";
import { z } from "zod";

import { serverEnv } from "@/shared/config/env";
import { extractBearerToken, writeAuthCookie } from "@/shared/api/server";

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
      { ok: false, msg: parseUpstreamMsg(text) ?? "로그인에 실패했습니다." },
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

  await writeAuthCookie(token);

  return NextResponse.json({ ok: true });
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
