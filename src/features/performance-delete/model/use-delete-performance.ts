"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PERFORMANCE_QUERY_KEYS, deletePerformance } from "@/entities/performance";

export function useDeletePerformance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "performances", "delete"],
    mutationFn: (id: number) => deletePerformance(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.list() });
    },
  });
}
