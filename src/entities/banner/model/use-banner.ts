"use client";

import { useQuery } from "@tanstack/react-query";

import { getBannerDetail, getBanners } from "../api";

export const BANNER_QUERY_KEYS = {
  all: () => ["admin", "banners"] as const,
  list: () => ["admin", "banners", "list"] as const,
  detail: (id: number) => ["admin", "banners", "detail", id] as const,
};

export function useBanners() {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.list(),
    queryFn: () => getBanners(),
  });
}

export function useBannerDetail(id: number) {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.detail(id),
    queryFn: () => getBannerDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
