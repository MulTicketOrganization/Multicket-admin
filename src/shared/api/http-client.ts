import { API_PROXY_BASE } from "@/shared/config/constants";
import { ApiError, type ApiResponse } from "./types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function buildQueryString(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * 클라이언트에서 백엔드 호출 시 사용하는 fetch wrapper.
 * 실제 호출은 Next.js Route Handler (`/api/backend/**`) 프록시로 가서
 * httpOnly 쿠키에서 토큰을 꺼내 Authorization 헤더를 붙인다.
 *
 * @param path 백엔드 경로 (예: `/admin/member/list`). 슬래시로 시작해야 함.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, signal, headers } = options;

  const url = `${API_PROXY_BASE}${path}${buildQueryString(query)}`;

  const res = await fetch(url, {
    method,
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 또는 빈 응답
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const parsed: ApiResponse<T> | null = text ? safeParseJson<ApiResponse<T>>(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, parsed?.msg ?? res.statusText);
  }

  // 백엔드 wrapper 가 아니라 raw body 인 경우 (로그인 등) 도 대응
  if (parsed && "msg" in parsed && "data" in parsed) {
    return (parsed.data ?? (undefined as T)) as T;
  }
  return parsed as T;
}

function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
