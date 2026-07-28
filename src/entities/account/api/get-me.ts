import { apiFetch } from "@/shared/api";
import type { AccountProfile } from "../model/types";

/**
 * GET /api/member/me — 로그인한 본인 정보.
 * `/admin/**` 이 아닌 공용 API 지만, admin 은 권한(MASTER) 확인과
 * 헤더의 계정 표시에 이 응답을 사용한다.
 */
export async function getMe(): Promise<AccountProfile> {
  return apiFetch<AccountProfile>("/api/member/me", { method: "GET" });
}
