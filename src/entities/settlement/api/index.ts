import { apiFetch, type PagedResponse } from "@/shared/api";
import type {
  SettlementDetail,
  SettlementListItem,
  SettlementListQuery,
} from "../model/types";

/** GET /admin/settlement/list — cursor 페이지네이션 */
export async function getSettlements(
  query: SettlementListQuery,
): Promise<PagedResponse<SettlementListItem>> {
  return apiFetch<PagedResponse<SettlementListItem>>("/admin/settlement/list", {
    method: "GET",
    query: {
      cursorId: query.cursorId,
      createDate: query.createDate,
      keyword: query.keyword,
      status: query.status,
    },
  });
}

/** GET /admin/settlement/{id} */
export async function getSettlementDetail(id: number): Promise<SettlementDetail> {
  return apiFetch<SettlementDetail>(`/admin/settlement/${id}`, { method: "GET" });
}

/**
 * POST /admin/settlement/{id}/transfer-request — PG사 정산 요청.
 *
 * ⚠️ PG 가 아직 확정되지 않아 백엔드는 실제 이체를 호출하지 않고
 * "이미 이체된 건인지" 상태 확인만 한다 (백엔드 TODO).
 * PG 확정 후 동작이 바뀌면 버튼 문구도 함께 손봐야 한다.
 */
export async function requestSettlementTransfer(id: number): Promise<void> {
  await apiFetch<void>(`/admin/settlement/${id}/transfer-request`, { method: "POST" });
}
