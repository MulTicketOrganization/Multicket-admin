"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getConsentDocumentDetail,
  getConsentDocuments,
  getCurrentConsentDocuments,
} from "../api";
import type { ConsentDocument } from "./types";

export const CONSENT_DOCUMENT_QUERY_KEYS = {
  all: () => ["admin", "consent-documents"] as const,
  list: () => ["admin", "consent-documents", "list"] as const,
  detail: (id: number) => ["admin", "consent-documents", "detail", id] as const,
  current: () => ["admin", "consent-documents", "current"] as const,
};

export function useConsentDocumentList() {
  return useInfiniteQuery({
    queryKey: CONSENT_DOCUMENT_QUERY_KEYS.list(),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getConsentDocuments({ cursorId: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].id;
    },
  });
}

export function flattenConsentDocumentPages(
  pages: ReadonlyArray<{ data: ConsentDocument[] }>,
): ConsentDocument[] {
  return pages.flatMap((p) => p.data);
}

/** 전문(全文) 조회 — 목록이 무거워 표에는 요약만 두고 필요할 때 한 건만 받는다 */
export function useConsentDocumentDetail(id: number, enabled = true) {
  return useQuery({
    queryKey: CONSENT_DOCUMENT_QUERY_KEYS.detail(id),
    queryFn: () => getConsentDocumentDetail(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
  });
}

/** 지금 사용자에게 나가는 타입별 현재 버전 */
export function useCurrentConsentDocuments() {
  return useQuery({
    queryKey: CONSENT_DOCUMENT_QUERY_KEYS.current(),
    queryFn: () => getCurrentConsentDocuments(),
    retry: false,
  });
}
