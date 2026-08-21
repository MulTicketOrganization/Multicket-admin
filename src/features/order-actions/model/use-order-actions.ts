"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ORDER_QUERY_KEYS,
  cancelOrder,
  refundOrder,
  type OrderRefundRequest,
} from "@/entities/order";

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "orders", "cancel"],
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() }),
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "orders", "refund"],
    mutationFn: ({ orderId, body }: { orderId: number; body: OrderRefundRequest }) =>
      refundOrder(orderId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() }),
  });
}
