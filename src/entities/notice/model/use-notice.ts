"use client";

import { useQuery } from "@tanstack/react-query";

import { getLatestNotice, getUrgentNotice } from "../api";
import type { NoticeType } from "./types";

export const NOTICE_QUERY_KEYS = {
  all: () => ["admin", "notices"] as const,
  latest: (type: NoticeType) => ["admin", "notices", "latest", type] as const,
  urgent: () => ["admin", "notices", "urgent"] as const,
};

/** 타입별 최신 공고. 아직 등록 전이면 data 가 null 이다 (오류 아님). */
export function useLatestNotice(type: NoticeType) {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.latest(type),
    queryFn: () => getLatestNotice(type),
    retry: false,
  });
}

/**
 * 앱에 실제로 노출 중인 폴링 공고 (APP_UPDATE / URGENT).
 * 만료 전 건이 없으면 null 이다 — 즉 "지금 점검/업데이트 안내가 떠 있는지" 를 뜻한다.
 */
export function useUrgentNotice() {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.urgent(),
    queryFn: () => getUrgentNotice(),
    retry: false,
  });
}
