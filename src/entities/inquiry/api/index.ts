import { apiFetch, type PagedResponse } from "@/shared/api";
import type {
  InquiryDetail,
  InquiryListItem,
  InquiryListQuery,
  InquiryUpdateRequest,
} from "../model/types";

/** GET /admin/inquiry/list — cursor 페이지네이션 */
export async function getInquiries(
  query: InquiryListQuery,
): Promise<PagedResponse<InquiryListItem>> {
  return apiFetch<PagedResponse<InquiryListItem>>("/admin/inquiry/list", {
    method: "GET",
    query: {
      cursorId: query.cursorId,
      inquiryType: query.inquiryType,
      inquiryStatus: query.inquiryStatus,
      createDate: query.createDate,
    },
  });
}

/** GET /admin/inquiry/{id} */
export async function getInquiryDetail(id: number): Promise<InquiryDetail> {
  return apiFetch<InquiryDetail>(`/admin/inquiry/${id}`, { method: "GET" });
}

/** PATCH /admin/inquiry/{id} — 문의 처리 (PENDING 상태에만 적용 가능) */
export async function updateInquiry(
  id: number,
  body: InquiryUpdateRequest,
): Promise<void> {
  await apiFetch<void>(`/admin/inquiry/${id}`, { method: "PATCH", body });
}
