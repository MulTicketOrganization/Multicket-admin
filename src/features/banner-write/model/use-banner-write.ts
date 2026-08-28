"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  BANNER_QUERY_KEYS,
  createBanner,
  deleteBanner,
  updateBanner,
  type BannerWriteRequest,
} from "@/entities/banner";

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "banners", "create"],
    mutationFn: (body: BannerWriteRequest) => createBanner(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.all() }),
  });
}

export function useUpdateBanner(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "banners", "update", id],
    mutationFn: (body: BannerWriteRequest) => updateBanner(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.all() }),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "banners", "delete"],
    mutationFn: (id: number) => deleteBanner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.all() }),
  });
}
