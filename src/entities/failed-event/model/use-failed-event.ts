"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getFailedEventDetail, getFailedEvents } from "../api";
import type {
  FailedEventListItem,
  FailedEventStatus,
  FailedEventType,
} from "./types";

export const FAILED_EVENT_QUERY_KEYS = {
  all: () => ["admin", "failed-events"] as const,
  list: () => ["admin", "failed-events", "list"] as const,
  detail: (id: number) => ["admin", "failed-events", "detail", id] as const,
};

export interface FailedEventListFilters {
  status?: FailedEventStatus;
  eventType?: FailedEventType;
}

export function useFailedEventList(filters: FailedEventListFilters) {
  return useInfiniteQuery({
    queryKey: [...FAILED_EVENT_QUERY_KEYS.list(), filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getFailedEvents({ cursorId: pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].id;
    },
  });
}

export function flattenFailedEventPages(
  pages: ReadonlyArray<{ data: FailedEventListItem[] }>,
): FailedEventListItem[] {
  return pages.flatMap((p) => p.data);
}

export function useFailedEventDetail(id: number) {
  return useQuery({
    queryKey: FAILED_EVENT_QUERY_KEYS.detail(id),
    queryFn: () => getFailedEventDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
