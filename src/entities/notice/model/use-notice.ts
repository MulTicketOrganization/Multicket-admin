"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getLatestNotice,
  getNoticeDetail,
  getNotices,
  getUrgentNotices,
} from "../api";
import type { NoticeListItem, NoticeType } from "./types";

export const NOTICE_QUERY_KEYS = {
  all: () => ["admin", "notices"] as const,
  list: () => ["admin", "notices", "list"] as const,
  detail: (id: number) => ["admin", "notices", "detail", id] as const,
  latest: (type: NoticeType) => ["admin", "notices", "latest", type] as const,
  urgent: () => ["admin", "notices", "urgent"] as const,
};

export interface NoticeListFilters {
  type?: NoticeType;
  expireDate?: string;
}

export function useNoticeList(filters: NoticeListFilters) {
  return useInfiniteQuery({
    queryKey: [...NOTICE_QUERY_KEYS.list(), filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getNotices({ cursorId: pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].id;
    },
  });
}

export function flattenNoticePages(
  pages: ReadonlyArray<{ data: NoticeListItem[] }>,
): NoticeListItem[] {
  return pages.flatMap((p) => p.data);
}

export function useNoticeDetail(id: number) {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.detail(id),
    queryFn: () => getNoticeDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

/** 타입별 최신 공고. 아직 등록 전이면 data 가 null 이다 (오류 아님). */
export function useLatestNotice(type: NoticeType) {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.latest(type),
    queryFn: () => getLatestNotice(type),
    retry: false,
  });
}

/** 지금 폴링으로 나가고 있는 공고들 (APP_UPDATE / URGENT / MAINTENANCE). */
export function useUrgentNotices() {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.urgent(),
    queryFn: () => getUrgentNotices(),
    retry: false,
  });
}
