/**
 * 백엔드 공통 응답 래퍼.
 * 백엔드 명세: { msg: string, data: T | null }
 */
export interface ApiResponse<T> {
  msg: string;
  data: T | null;
}

/**
 * Cursor 기반 페이지네이션 응답.
 * 백엔드 명세: { data: T[], hasNext: boolean }
 */
export interface PagedResponse<T> {
  data: T[];
  hasNext: boolean;
}

/**
 * 프록시 / fetch wrapper 에서 던지는 에러.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly serverMsg: string,
    message?: string,
  ) {
    super(message ?? `[${status}] ${serverMsg}`);
    this.name = "ApiError";
  }
}
