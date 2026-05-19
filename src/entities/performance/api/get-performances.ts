import { apiFetch, type PagedResponse } from "@/shared/api";
import type { PerformanceListItem, PerformanceListQuery } from "../model/types";

/**
 * GET /admin/performance/list
 * Cursor 페이지네이션 (페이지당 10건, id ASC).
 */
export async function getPerformances(
  query: PerformanceListQuery,
): Promise<PagedResponse<PerformanceListItem>> {
  return apiFetch<PagedResponse<PerformanceListItem>>("/admin/performance/list", {
    method: "GET",
    query: {
      cursorId: query.cursorId,
      genre: query.genre,
      area: query.area,
      deleted: query.deleted,
      memberId: query.memberId,
      title: query.title,
    },
  });
}
