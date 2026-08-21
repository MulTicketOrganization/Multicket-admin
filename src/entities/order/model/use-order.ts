"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getMemberOrders, getOrderDetail } from "../api";
import type { OrderListItem } from "./types";

export const ORDER_QUERY_KEYS = {
  all: () => ["admin", "orders"] as const,
  list: (memberId: number) => ["admin", "orders", "list", memberId] as const,
  detail: (orderId: number) => ["admin", "orders", "detail", orderId] as const,
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
