import { apiFetch, type PagedResponse } from "@/shared/api";
import type { PerformanceListItem, PerformanceListQuery } from "../model/types";

/**
 * GET /admin/performance/list
 * Cursor 페이지네이션 (페이지당 10건, id ASC).
 * 지역 필터는 시/도가 아니라 권역(`region`) 값을 받는다.
 */
export async function getPerformances(
  query: PerformanceListQuery,
): Promise<PagedResponse<PerformanceListItem>> {
  return apiFetch<PagedResponse<PerformanceListItem>>("/admin/performance/list", {
    method: "GET",
    query: {
      cursorId: query.cursorId,
      genre: query.genre,
      region: query.region,
      deleted: query.deleted,
      memberId: query.memberId,
      title: query.title,
    },
  });
}
