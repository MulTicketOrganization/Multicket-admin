"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getReportDetail, getReports } from "../api";
import type { ReportListItem, ReportStatus } from "./types";

export const REPORT_QUERY_KEYS = {
  all: () => ["admin", "reports"] as const,
  list: () => ["admin", "reports", "list"] as const,
  detail: (id: number) => ["admin", "reports", "detail", id] as const,
};

export interface ReportListFilters {
  status?: ReportStatus;
  createDate?: string;
  performanceId?: number;
}

export function useReportList(filters: ReportListFilters) {
  return useInfiniteQuery({
    queryKey: [...REPORT_QUERY_KEYS.list(), filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getReports({ cursorId: pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].id;
    },
  });
}

export function flattenReportPages(
  pages: ReadonlyArray<{ data: ReportListItem[] }>,
): ReportListItem[] {
  return pages.flatMap((p) => p.data);
}

export function useReportDetail(id: number) {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.detail(id),
    queryFn: () => getReportDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
