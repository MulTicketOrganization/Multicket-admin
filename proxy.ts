import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "mc_admin_token";

/**
 * 보호 경로 (인증 필요).
 * /dashboard, /members, /performances 등 admin 페이지는 모두 (dashboard) 그룹 아래에 둠.
 * 그룹은 URL 에 영향 없으므로 실제 path 기준으로 매칭.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/members", "/performances"];

/** 토큰이 있으면 접근시 /dashboard 로 보내야 하는 페이지들 */
const GUEST_ONLY_PREFIXES = ["/login"];

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  if (isGuestOnly && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로 매칭:
     * - api: 라우트 핸들러 (자체 인증 로직)
     * - _next/static, _next/image: Next 정적 자산
     * - favicon, robots, sitemap, *.png/svg/ico/jpg/jpeg/gif: 파일 자산
     */
    "/((?!api/|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|svg|ico|jpg|jpeg|gif|webp)).*)",
  ],
};
