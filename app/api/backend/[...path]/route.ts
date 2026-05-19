import { NextResponse } from "next/server";

import { serverEnv } from "@/shared/config/env";
import {
  clearAuthCookie,
  extractBearerToken,
  readAuthCookie,
  writeAuthCookie,
} from "@/shared/api/server";

/**
 * Catch-all 백엔드 프록시.
 * - 클라이언트가 `/api/backend/<path>` 로 호출하면 `<BACKEND>/<path>` 로 전달
 * - httpOnly 쿠키에서 토큰을 꺼내 Authorization 헤더 부착
 * - 백엔드가 응답 헤더에 새 Authorization 을 동봉하면 (자동 갱신) 쿠키 재발급
 * - 401 일 때는 쿠키도 제거하여 클라이언트가 /login 으로 이동하도록 유도
 */

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: Request, ctx: Ctx): Promise<Response> {
  const { path } = await ctx.params;
  const segment = path.join("/");

  const incomingUrl = new URL(req.url);
  const target = new URL(`${serverEnv.backendBaseUrl}/${segment}`);
  // query string 그대로 전달
  for (const [k, v] of incomingUrl.searchParams.entries()) {
    target.searchParams.append(k, v);
  }

  const token = await readAuthCookie();

  // 본문은 GET/HEAD 가 아닐 때만 전달
  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const headers = new Headers();
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  if (token) headers.set("authorization", `Bearer ${token}`);

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method: req.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (err) {
    return NextResponse.json(
      {
        msg: "백엔드 연결 실패",
        data: null,
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  // 토큰 자동 갱신: 응답 헤더 Authorization 에 새 토큰이 오면 쿠키 갱신
  const newToken = extractBearerToken(upstream.headers.get("authorization"));
  if (newToken && newToken !== token) {
    await writeAuthCookie(newToken);
  }

  // 401 일 때 쿠키 제거 (Access 만료 + Refresh 없음 케이스)
  if (upstream.status === 401) {
    await clearAuthCookie();
  }

  // 응답 본문 패스스루
  const respHeaders = new Headers();
  const upstreamCt = upstream.headers.get("content-type");
  if (upstreamCt) respHeaders.set("content-type", upstreamCt);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function GET(req: Request, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function POST(req: Request, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function PUT(req: Request, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function PATCH(req: Request, ctx: Ctx) {
  return proxy(req, ctx);
}
export async function DELETE(req: Request, ctx: Ctx) {
  return proxy(req, ctx);
}
