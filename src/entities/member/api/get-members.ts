import { apiFetch, type PagedResponse } from "@/shared/api";
import type { MemberListItem, MemberListQuery } from "../model/types";

/**
 * GET /admin/member/list
 * 백엔드 cursor 페이지네이션 (페이지당 10건, id ASC 정렬).
 */
export async function getMembers(
  query: MemberListQuery,
): Promise<PagedResponse<MemberListItem>> {
  return apiFetch<PagedResponse<MemberListItem>>("/admin/member/list", {
    method: "GET",
    query: {
      cursorId: query.cursorId,
      memberType: query.memberType,
      memberStatus: query.memberStatus,
      keyword: query.keyword,
    },
  });
}
