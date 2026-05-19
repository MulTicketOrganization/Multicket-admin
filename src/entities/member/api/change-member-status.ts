import { apiFetch } from "@/shared/api";
import type { MemberChangeRequest } from "../model/types";

/**
 * POST /admin/member/change — 회원 상태 변경.
 * 백엔드는 200 OK 만 반환 (data 없음).
 */
export async function changeMemberStatus(body: MemberChangeRequest): Promise<void> {
  await apiFetch<void>("/admin/member/change", {
    method: "POST",
    body,
  });
}
