"use client";

import { useQuery } from "@tanstack/react-query";

import { getKeywords } from "../api";

export const KEYWORD_QUERY_KEYS = {
  all: () => ["admin", "keywords"] as const,
};

export function useKeywords() {
  return useQuery({
    queryKey: KEYWORD_QUERY_KEYS.all(),
    queryFn: getKeywords,
  });
}
