"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getPerformances } from "../api/get-performances";
import type { Area, Genre, PerformanceListItem } from "./types";

export interface PerformanceListFilters {
  title?: string;
  genre?: Genre;
  area?: Area;
  deleted?: boolean;
  memberId?: number;
}

/**
 * 공연 목록 cursor 페이지네이션 hook.
 * - pageParam = cursorId (초기값 0)
 * - 다음 cursor 는 현재 페이지 마지막 항목의 id
 */
export function usePerformanceList(filters: PerformanceListFilters) {
  return useInfiniteQuery({
    queryKey: ["admin", "performances", "list", filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getPerformances({
        cursorId: pageParam,
        title: filters.title,
        genre: filters.genre,
        area: filters.area,
        deleted: filters.deleted,
        memberId: filters.memberId,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].id;
    },
  });
}

export function flattenPerformancePages(
  pages: ReadonlyArray<{ data: PerformanceListItem[] }>,
): PerformanceListItem[] {
  return pages.flatMap((p) => p.data);
}
