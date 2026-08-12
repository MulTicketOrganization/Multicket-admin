import { NextResponse } from "next/server";

import { serverEnv } from "@/shared/config/env";
import {
  applyAuthHeaders,
  clearSession,
  extractBearerToken,
  extractRefreshToken,
  readAuthCookie,
  readRefreshCookie,
  writeAuthCookie,
  writeRefreshCookie,
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

  const refresh = await readRefreshCookie();
  let token = await readAuthCookie();

  // Access 쿠키만 먼저 만료된 경우(1d) refresh 로 선재발급.
  // 백엔드 웹 플로우는 refresh_token 쿠키를 보고 새 access 를 Authorization 헤더로 준다.
  if (!token && refresh) {
    token = await renewAccessToken(refresh);
    if (token) await writeAuthCookie(token);
  }

  // 본문은 GET/HEAD 가 아닐 때만 전달
  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const headers = new Headers();
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  applyAuthHeaders(headers, token, refresh);

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

  // refresh 는 회전하지 않는 게 원칙이지만, 새로 내려오면 그대로 반영한다.
  const newRefresh = extractRefreshToken(upstream.headers);
  if (newRefresh && newRefresh !== refresh) {
    await writeRefreshCookie(newRefresh);
  }

  // 401 일 때 세션 제거 (Access 만료 + Refresh 도 무효 케이스)
  if (upstream.status === 401) {
    await clearSession();
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

/**
 * POST /api/member/token/refresh — 웹은 refresh_token 쿠키를 읽어
 * 새 access 를 Authorization 응답 헤더로 돌려준다 (body 없음).
 */
async function renewAccessToken(refresh: string): Promise<string | null> {
  try {
    const res = await fetch(`${serverEnv.backendBaseUrl}/api/member/token/refresh`, {
      method: "POST",
      headers: applyAuthHeaders(new Headers(), null, refresh),
      cache: "no-store",
      redirect: "manual",
    });
    if (!res.ok) return null;
    return extractBearerToken(res.headers.get("authorization"));
  } catch {
    return null;
  }
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
