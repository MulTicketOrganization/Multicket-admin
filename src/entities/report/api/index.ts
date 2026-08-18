import { apiFetch, type PagedResponse } from "@/shared/api";
import type {
  ReportDetail,
  ReportListItem,
  ReportListQuery,
  ReportProcessRequest,
} from "../model/types";

/** GET /admin/report/list — cursor 페이지네이션 */
export async function getReports(
  query: ReportListQuery,
): Promise<PagedResponse<ReportListItem>> {
  return apiFetch<PagedResponse<ReportListItem>>("/admin/report/list", {
    method: "GET",
    query: {
      cursorId: query.cursorId,
      status: query.status,
      createDate: query.createDate,
      performanceId: query.performanceId,
    },
  });
}

/** GET /admin/report/{id} */
export async function getReportDetail(id: number): Promise<ReportDetail> {
  return apiFetch<ReportDetail>(`/admin/report/${id}`, { method: "GET" });
}

/** PATCH /admin/report/{id} — 신고 처리 (PENDING 상태에만 적용 가능) */
export async function processReport(
  id: number,
  body: ReportProcessRequest,
): Promise<void> {
  await apiFetch<void>(`/admin/report/${id}`, { method: "PATCH", body });
}
