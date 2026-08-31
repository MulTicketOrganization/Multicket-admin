"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getMemberOrders, getOrderDetail, getRefundPolicy } from "../api";
import type { OrderListItem } from "./types";

export const ORDER_QUERY_KEYS = {
  all: () => ["admin", "orders"] as const,
  list: (memberId: number) => ["admin", "orders", "list", memberId] as const,
  detail: (orderId: number) => ["admin", "orders", "detail", orderId] as const,
  refundPolicy: () => ["admin", "orders", "refund-policy"] as const,
};

export function useMemberOrderList(memberId: number) {
  return useInfiniteQuery({
    queryKey: ORDER_QUERY_KEYS.list(memberId),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getMemberOrders({ memberId, cursorId: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].orderId;
    },
    enabled: Number.isFinite(memberId) && memberId > 0,
  });
}

export function flattenOrderPages(
  pages: ReadonlyArray<{ data: OrderListItem[] }>,
): OrderListItem[] {
  return pages.flatMap((p) => p.data);
}

export function useOrderDetail(orderId: number | null) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId ?? 0),
    queryFn: () => getOrderDetail(orderId!),
    enabled: orderId != null && Number.isFinite(orderId) && orderId > 0,
  });
}

/**
 * 환불 비율 정책. 서버 상수라 자주 바뀌지 않으므로 세션 동안 캐시해 둔다.
 * 조회에 실패해도 환불 자체는 진행할 수 있어야 하므로 재시도하지 않는다.
 */
export function useRefundPolicy(enabled = true) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.refundPolicy(),
    queryFn: () => getRefundPolicy(),
    enabled,
    retry: false,
    staleTime: Infinity,
  });
}
