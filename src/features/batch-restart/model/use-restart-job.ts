"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { BATCH_QUERY_KEYS, restartJobInstance } from "@/entities/batch";

export function useRestartJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "batch", "restart"],
    mutationFn: (jobInstanceId: number) => restartJobInstance(jobInstanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BATCH_QUERY_KEYS.all() });
    },
  });
}
