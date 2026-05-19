import { apiFetch } from "@/shared/api";
import type { MemberDetail } from "../model/types";

/**
 * GET /admin/member/detail?memberId={id}
 */
export async function getMemberDetail(memberId: number): Promise<MemberDetail> {
  return apiFetch<MemberDetail>("/admin/member/detail", {
    method: "GET",
    query: { memberId },
  });
}
