"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  FAILED_EVENT_QUERY_KEYS,
  completeFailedEvent,
  retryFailedEvent,
} from "@/entities/failed-event";

/** 재실행 — payload 로 원래 처리를 다시 수행하고 성공하면 COMPLETE 가 된다. */
export function useRetryFailedEvent(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "failed-events", "retry", id],
    mutationFn: () => retryFailedEvent(id),
    onSuccess: () => invalidate(queryClient, id),
  });
}

/** 확인 처리 — 재실행 없이 COMPLETE 로 종료한다. 되돌릴 수 없다. */
export function useCompleteFailedEvent(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "failed-events", "complete", id],
    mutationFn: () => completeFailedEvent(id),
    onSuccess: () => invalidate(queryClient, id),
  });
}

function invalidate(
  queryClient: ReturnType<typeof useQueryClient>,
  id: number,
): void {
  queryClient.invalidateQueries({ queryKey: FAILED_EVENT_QUERY_KEYS.detail(id) });
  queryClient.invalidateQueries({ queryKey: FAILED_EVENT_QUERY_KEYS.list() });
}
