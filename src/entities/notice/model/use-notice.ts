"use client";

import { useQuery } from "@tanstack/react-query";

import { getLatestNotice } from "../api";
import type { NoticeType } from "./types";

export const NOTICE_QUERY_KEYS = {
  all: () => ["admin", "notices"] as const,
  latest: (type: NoticeType) => ["admin", "notices", "latest", type] as const,
};

/** 타입별 최신 공고. 아직 등록 전이면 data 가 null 이다 (오류 아님). */
export function useLatestNotice(type: NoticeType) {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.latest(type),
    queryFn: () => getLatestNotice(type),
    retry: false,
  });
}
