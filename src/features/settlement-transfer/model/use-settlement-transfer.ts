"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { SETTLEMENT_QUERY_KEYS, requestSettlementTransfer } from "@/entities/settlement";

export function useSettlementTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "settlements", "transfer"],
    mutationFn: (id: number) => requestSettlementTransfer(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_QUERY_KEYS.list() });
    },
  });
}
