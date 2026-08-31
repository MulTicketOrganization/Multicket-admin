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

/** 성공 응답에 실제 환불액·취소 수수료·환불 예상 기간이 실려 온다 */
export function useRefundOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "orders", "refund"],
    mutationFn: ({ orderId, body }: { orderId: number; body: OrderRefundRequest }) =>
      refundOrder(orderId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() }),
  });
}
