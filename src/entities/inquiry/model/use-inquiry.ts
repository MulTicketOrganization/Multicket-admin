"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getInquiries, getInquiryDetail } from "../api";
import type { InquiryListItem, InquiryStatus, InquiryType } from "./types";

export const INQUIRY_QUERY_KEYS = {
  all: () => ["admin", "inquiries"] as const,
  list: () => ["admin", "inquiries", "list"] as const,
  detail: (id: number) => ["admin", "inquiries", "detail", id] as const,
};

export interface InquiryListFilters {
  inquiryType?: InquiryType;
  inquiryStatus?: InquiryStatus;
  createDate?: string;
}

export function useInquiryList(filters: InquiryListFilters) {
  return useInfiniteQuery({
    queryKey: [...INQUIRY_QUERY_KEYS.list(), filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getInquiries({ cursorId: pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].id;
    },
  });
}

export function flattenInquiryPages(
  pages: ReadonlyArray<{ data: InquiryListItem[] }>,
): InquiryListItem[] {
  return pages.flatMap((p) => p.data);
}

export function useInquiryDetail(id: number) {
  return useQuery({
    queryKey: INQUIRY_QUERY_KEYS.detail(id),
    queryFn: () => getInquiryDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
