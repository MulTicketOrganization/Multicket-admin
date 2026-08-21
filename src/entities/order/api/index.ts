import { apiFetch, type PagedResponse } from "@/shared/api";
import type { OrderDetail, OrderListItem, OrderListQuery, OrderRefundRequest } from "../model/types";

/** GET /admin/order/list — 회원 단위 cursor 페이지네이션 */
export async function getMemberOrders(
  query: OrderListQuery,
): Promise<PagedResponse<OrderListItem>> {
  return apiFetch<PagedResponse<OrderListItem>>("/admin/order/list", {
    method: "GET",
    query: { memberId: query.memberId, cursorId: query.cursorId },
  });
}

/** GET /admin/order/detail */
export async function getOrderDetail(orderId: number): Promise<OrderDetail> {
  return apiFetch<OrderDetail>("/admin/order/detail", {
    method: "GET",
    query: { orderId },
  });
}

/**
 * POST /admin/order/{orderId}/cancel — PENDING 주문 취소.
 * PortOne 결제 기록이 있으면 PortOne 취소 후 웹훅이 DB 를 확정하고,
 * 없으면 즉시 FAIL 로 확정한다. PENDING 이 아니면 400.
 */
export async function cancelOrder(orderId: number): Promise<void> {
  await apiFetch<void>(`/admin/order/${orderId}/cancel`, { method: "POST" });
}

/**
 * PATCH /admin/order/{orderId}/refund — SUCCESS 주문 환불.
 * PortOne 취소 요청까지만 처리하며, 주문 상태(CANCEL) 확정은 뒤이어 오는 웹훅에서 이뤄진다.
 */
export async function refundOrder(
  orderId: number,
  body: OrderRefundRequest,
): Promise<void> {
  await apiFetch<void>(`/admin/order/${orderId}/refund`, { method: "PATCH", body });
}
