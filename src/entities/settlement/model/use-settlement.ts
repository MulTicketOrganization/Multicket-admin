"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getSettlementDetail, getSettlements } from "../api";
import type { SettlementListItem, SettlementStatus } from "./types";

export const SETTLEMENT_QUERY_KEYS = {
  all: () => ["admin", "settlements"] as const,
  list: () => ["admin", "settlements", "list"] as const,
  detail: (id: number) => ["admin", "settlements", "detail", id] as const,
};

export interface SettlementListFilters {
  createDate?: string;
  keyword?: string;
  status?: SettlementStatus;
}

export function useSettlementList(filters: SettlementListFilters) {
  return useInfiniteQuery({
    queryKey: [...SETTLEMENT_QUERY_KEYS.list(), filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getSettlements({ cursorId: pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].id;
    },
  });
}

export function flattenSettlementPages(
  pages: ReadonlyArray<{ data: SettlementListItem[] }>,
): SettlementListItem[] {
  return pages.flatMap((p) => p.data);
}

export function useSettlementDetail(id: number) {
  return useQuery({
    queryKey: SETTLEMENT_QUERY_KEYS.detail(id),
    queryFn: () => getSettlementDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
