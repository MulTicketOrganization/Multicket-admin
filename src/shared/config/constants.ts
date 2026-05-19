/**
 * 클라이언트/서버 공용 상수.
 * 비밀이 아닌 값만 둔다 (브라우저 번들 가능).
 */

export const APP_NAME = "Multicket Admin";

/** 클라이언트가 Next.js 프록시로 호출할 베이스 경로 */
export const API_PROXY_BASE = "/api/backend";

/** Cursor 페이지네이션 기본 페이지 크기 (서버 고정 10) */
export const PAGE_SIZE = 10;
